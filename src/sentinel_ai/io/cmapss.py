"""Import helpers for the NASA C-MAPSS turbofan run-to-failure data format."""
from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
import numpy as np


@dataclass(frozen=True, slots=True)
class CmapssTrajectory:
    unit_id: int
    cycles: np.ndarray
    sensor_values: np.ndarray
    sensor_number: int
    known_remaining_cycles: np.ndarray | None


def load_cmapss_trajectory(path: str | Path, unit_id: int, sensor_number: int) -> CmapssTrajectory:
    """Read a C-MAPSS train_FD*.txt / test_FD*.txt file."""
    if not 1 <= sensor_number <= 21:
        raise ValueError("C-MAPSS sensor number must be from 1 to 21.")
    raw = np.loadtxt(Path(path), dtype=float)
    if raw.ndim != 2 or raw.shape[1] < 26:
        raise ValueError("Expected a C-MAPSS text file with at least 26 columns.")
    unit = raw[raw[:, 0].astype(int) == unit_id]
    if unit.size == 0:
        choices = ", ".join(map(str, np.unique(raw[:, 0]).astype(int)[:10]))
        raise ValueError(f"Unit {unit_id} was not found. Example available units: {choices}.")
    cycles = unit[:, 1]
    values = unit[:, 4 + sensor_number]  # 3 settings follow unit/cycle; sensor 1 starts at index 5.
    remaining = cycles[-1] - cycles if Path(path).name.lower().startswith("train_") else None
    return CmapssTrajectory(unit_id, cycles, values, sensor_number, remaining)
