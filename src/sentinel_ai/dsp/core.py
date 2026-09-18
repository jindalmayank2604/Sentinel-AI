from __future__ import annotations

from dataclasses import dataclass
import numpy as np

from sentinel_ai.domain.models import Signal


@dataclass(slots=True)
class Spectrum:
    frequency_hz: np.ndarray
    amplitude: np.ndarray
    phase_rad: np.ndarray
    resolution_hz: float
    window: str


def spectrum(signal: Signal, use_hann: bool = True, zero_pad_factor: int = 1) -> Spectrum:
    """Single-sided amplitude spectrum with coherent-gain compensation."""
    x = signal.samples - np.mean(signal.samples)
    n = x.size
    window = np.hanning(n) if use_hann else np.ones(n)
    coherent_gain = window.mean()
    nfft = int(2 ** np.ceil(np.log2(n * max(1, zero_pad_factor))))
    bins = np.fft.rfft(x * window, n=nfft)
    amplitude = np.abs(bins) * 2 / (n * coherent_gain)
    amplitude[0] /= 2
    if nfft % 2 == 0:
        amplitude[-1] /= 2
    return Spectrum(np.fft.rfftfreq(nfft, 1 / signal.sample_rate_hz), amplitude,
                    np.unwrap(np.angle(bins)), signal.sample_rate_hz / nfft,
                    "Hann" if use_hann else "rectangular")


def time_features(signal: Signal) -> dict[str, float]:
    x = signal.samples
    rms = float(np.sqrt(np.mean(x**2)))
    centered = x - x.mean()
    std = float(np.std(centered)) or 1e-12
    return {
        "rms": rms,
        "peak": float(np.max(np.abs(x))),
        "crest_factor": float(np.max(np.abs(x)) / max(rms, 1e-12)),
        "skewness": float(np.mean((centered / std) ** 3)),
        "kurtosis": float(np.mean((centered / std) ** 4)),
    }


def spectral_features(signal: Signal) -> dict[str, float]:
    spec = spectrum(signal)
    f, a = spec.frequency_hz[1:], spec.amplitude[1:]
    power = a**2
    total = float(power.sum()) or 1e-12
    p = power / total
    dominant = int(np.argmax(a))
    centroid = float(np.sum(f * p))
    return {
        "dominant_frequency_hz": float(f[dominant]),
        "dominant_amplitude": float(a[dominant]),
        "spectral_centroid_hz": centroid,
        "spectral_bandwidth_hz": float(np.sqrt(np.sum(((f - centroid) ** 2) * p))),
        "spectral_entropy": float(-np.sum(p * np.log2(p + 1e-15)) / np.log2(p.size)),
        "high_frequency_ratio": float(power[f > signal.sample_rate_hz * 0.2].sum() / total),
        "frequency_resolution_hz": spec.resolution_hz,
    }


def all_features(signal: Signal) -> dict[str, float]:
    return time_features(signal) | spectral_features(signal)


def estimate_delay(reference: Signal, response: Signal) -> tuple[float, float]:
    if reference.sample_rate_hz != response.sample_rate_hz:
        raise ValueError("Signals must share a sample rate for correlation.")
    corr = np.correlate(response.samples - response.samples.mean(), reference.samples - reference.samples.mean(), "full")
    lag = int(np.argmax(corr) - (reference.samples.size - 1))
    return lag / reference.sample_rate_hz, float(corr.max() / (np.linalg.norm(reference.samples) * np.linalg.norm(response.samples)))
