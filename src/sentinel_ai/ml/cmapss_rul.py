"""Small, transparent C-MAPSS remaining-useful-life baseline.

This is deliberately a ridge-regression baseline rather than a black box.  It
uses rolling sensor summaries so its errors and limitations remain inspectable.
"""
from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
import numpy as np


@dataclass(slots=True)
class RulEvaluation:
    subset: str
    train_examples: int
    test_engines: int
    mae_cycles: float
    rmse_cycles: float
    sample_predictions: list[tuple[int, float, float]]


def _features(segment: np.ndarray) -> np.ndarray:
    sensors = segment[:, 5:26]
    x = np.arange(sensors.shape[0], dtype=float)
    slopes = np.polyfit(x, sensors, 1)[0] if sensors.shape[0] > 1 else np.zeros(21)
    return np.concatenate([sensors.mean(axis=0), sensors.std(axis=0), slopes])


def _file(folder: Path, prefix: str, subset: str) -> Path:
    path = folder / f"{prefix}_{subset}.txt"
    if not path.exists(): raise FileNotFoundError(f"Missing {path.name} in {folder}.")
    return path


def train_and_evaluate(folder: str | Path, subset: str = "FD001", window: int = 30) -> RulEvaluation:
    """Train on historic cycles and test once per unseen engine endpoint.

    RUL is capped at 125 cycles, a common benchmark convention that prevents
    the healthy early-life region from dominating this simple baseline.
    """
    root = Path(folder)
    train = np.loadtxt(_file(root, "train", subset)); test = np.loadtxt(_file(root, "test", subset))
    truth = np.loadtxt(_file(root, "RUL", subset)).reshape(-1)
    rows: list[np.ndarray] = []; targets: list[float] = []
    for unit in np.unique(train[:, 0]).astype(int):
        trace = train[train[:, 0].astype(int) == unit]; end = trace[-1, 1]
        for finish in range(window, trace.shape[0] + 1, 10):
            rows.append(_features(trace[finish-window:finish])); targets.append(min(125.0, end - trace[finish-1, 1]))
    x_train = np.vstack(rows); y_train = np.asarray(targets)
    mean = x_train.mean(axis=0); scale = x_train.std(axis=0); scale[scale < 1e-10] = 1
    x_norm = (x_train - mean) / scale
    # Ridge solution with an unpenalised intercept.
    design = np.column_stack([np.ones(x_norm.shape[0]), x_norm]); penalty = np.eye(design.shape[1]) * 2.0; penalty[0, 0] = 0
    weights = np.linalg.solve(design.T @ design + penalty, design.T @ y_train)
    predictions: list[float] = []; units = np.unique(test[:, 0]).astype(int)
    for unit in units:
        trace = test[test[:, 0].astype(int) == unit]; segment = trace[-window:] if len(trace) >= window else trace
        vector = (_features(segment) - mean) / scale
        predictions.append(float(np.clip(np.r_[1.0, vector] @ weights, 0, 125)))
    predicted = np.asarray(predictions); actual = np.minimum(truth, 125)
    if actual.size != predicted.size: raise ValueError("RUL answer count does not match test-engine count.")
    error = predicted - actual
    examples = [(int(unit), float(pred), float(real)) for unit, pred, real in zip(units[:5], predicted[:5], actual[:5])]
    return RulEvaluation(subset, len(targets), len(units), float(np.mean(np.abs(error))), float(np.sqrt(np.mean(error**2))), examples)
