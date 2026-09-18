from __future__ import annotations
from dataclasses import dataclass
import numpy as np
from sentinel_ai.domain.models import Signal


@dataclass(slots=True)
class SeriesRLC:
    resistance_ohm: float = 10.0
    inductance_h: float = 0.05
    capacitance_f: float = 100e-6

    def __post_init__(self) -> None:
        if self.resistance_ohm < 0 or self.inductance_h <= 0 or self.capacitance_f <= 0:
            raise ValueError("R must be non-negative; L and C must be positive.")

    @property
    def natural_frequency_hz(self) -> float:
        return 1 / (2 * np.pi * np.sqrt(self.inductance_h * self.capacitance_f))

    @property
    def damping_ratio(self) -> float:
        return self.resistance_ohm / 2 * np.sqrt(self.capacitance_f / self.inductance_h)

    def simulate_impulse(self, sample_rate_hz: float = 4000, duration_s: float = 2) -> Signal:
        """Forward-Euler state update, suitable only when dt is small relative to natural period."""
        n = int(sample_rate_hz * duration_s); dt = 1 / sample_rate_hz
        current = np.zeros(n); charge = np.zeros(n); current[0] = 1 / self.inductance_h
        for k in range(n - 1):
            di = (-self.resistance_ohm * current[k] - charge[k] / self.capacitance_f) / self.inductance_h
            current[k + 1] = current[k] + dt * di
            charge[k + 1] = charge[k] + dt * current[k]
        return Signal(current, sample_rate_hz, "RLC impulse current", "simulation", "A")
