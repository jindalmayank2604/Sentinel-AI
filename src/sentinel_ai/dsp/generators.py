from __future__ import annotations
import numpy as np
from sentinel_ai.domain.models import Signal


def generate(kind: str, sample_rate_hz: float = 2000, duration_s: float = 3, frequency_hz: float = 82) -> Signal:
    n = max(8, int(sample_rate_hz * duration_s)); t = np.arange(n) / sample_rate_hz
    if frequency_hz >= sample_rate_hz / 2:
        raise ValueError("Frequency must be below Nyquist (sample rate / 2).")
    rng = np.random.default_rng(17)
    if kind == "Sine": x = np.sin(2 * np.pi * frequency_hz * t)
    elif kind == "Multi-sine": x = np.sin(2*np.pi*frequency_hz*t) + .45*np.sin(2*np.pi*2.7*frequency_hz*t)
    elif kind == "Chirp": x = np.sin(2*np.pi*(10*t + 0.5*frequency_hz/duration_s*t**2))
    elif kind == "Step": x = (t > duration_s*.25).astype(float)
    elif kind == "Impulse": x = np.zeros(n); x[n//4] = 1
    elif kind == "Noise": x = rng.normal(0, 0.35, n)
    else: raise ValueError(f"Unknown generator: {kind}")
    return Signal(x, sample_rate_hz, f"{kind} @ {frequency_hz:g} Hz")
