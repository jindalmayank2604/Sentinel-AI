from __future__ import annotations

from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone
from typing import Any

import numpy as np


@dataclass(slots=True)
class Signal:
    samples: np.ndarray
    sample_rate_hz: float
    name: str = "Untitled signal"
    source: str = "synthetic"
    units: str = "amplitude"

    def __post_init__(self) -> None:
        self.samples = np.asarray(self.samples, dtype=float).reshape(-1)
        if self.samples.size < 8:
            raise ValueError("A signal needs at least 8 samples.")
        if not np.isfinite(self.samples).all():
            raise ValueError("Signal contains non-finite samples.")
        if self.sample_rate_hz <= 0:
            raise ValueError("Sample rate must be positive.")

    @property
    def duration_s(self) -> float:
        return self.samples.size / self.sample_rate_hz

    @property
    def time_s(self) -> np.ndarray:
        return np.arange(self.samples.size) / self.sample_rate_hz


@dataclass(slots=True)
class Diagnosis:
    label: str
    confidence: float
    uncertainty: str
    evidence: list[str]
    recommendations: list[str]
    features: dict[str, float]


@dataclass(slots=True)
class AnalysisRun:
    signal_name: str
    diagnosis: Diagnosis
    created_at: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    source: str = "synthetic"

    def to_dict(self) -> dict[str, Any]:
        data = asdict(self)
        return data


@dataclass(slots=True)
class ReliabilityResult:
    survival: float
    failure_probability: float
    expected_life: float
    hazard: float
    warranty_risk: str
