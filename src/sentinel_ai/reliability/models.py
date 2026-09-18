from __future__ import annotations
from math import exp, gamma
from sentinel_ai.domain.models import ReliabilityResult


def weibull_reliability(age: float, scale: float, shape: float) -> ReliabilityResult:
    if age < 0 or scale <= 0 or shape <= 0: raise ValueError("Age must be non-negative; scale and shape must be positive.")
    survival = exp(- (age / scale) ** shape)
    hazard = (shape / scale) * (age / scale) ** (shape - 1) if age else 0.0
    expected = scale * gamma(1 + 1 / shape)
    risk = "high" if 1-survival > .25 else "moderate" if 1-survival > .1 else "low"
    return ReliabilityResult(survival, 1-survival, expected, hazard, risk)


def topology_reliability(values: list[float], mode: str) -> float:
    if not values or any(not 0 <= x <= 1 for x in values): raise ValueError("Reliabilities must be in [0, 1].")
    return float(__import__('math').prod(values)) if mode == "series" else float(1 - __import__('math').prod(1-x for x in values))
