from __future__ import annotations

from sentinel_ai.domain.models import Diagnosis, Signal
from sentinel_ai.dsp.core import all_features


def diagnose(signal: Signal) -> Diagnosis:
    """Physics-aware fallback used whenever no validated local ML baseline exists."""
    f = all_features(signal)
    evidence: list[str] = []
    recommendations: list[str] = []
    confidence = 0.55
    label = "Normal operation / no strong rule-based concern"
    uncertainty = "Rule-based screening only; add labelled healthy history for calibrated anomaly confidence."
    nyquist_margin = signal.sample_rate_hz / 2 - f["dominant_frequency_hz"]
    if f["high_frequency_ratio"] > 0.18 and f["crest_factor"] > 3.5:
        label = "Bearing-like high-frequency anomaly"
        confidence = min(.88, .55 + f["high_frequency_ratio"])
        evidence.append(f"High-frequency energy ratio is {f['high_frequency_ratio']:.1%}; crest factor is {f['crest_factor']:.2f}.")
        recommendations.append("Inspect bearing lubrication, mounting, and repeat with an accelerometer reference.")
    elif f["dominant_amplitude"] > 0.25 and f["spectral_entropy"] < .45:
        label = f"Resonance-like narrowband response near {f['dominant_frequency_hz']:.1f} Hz"
        confidence = .72
        evidence.append(f"Dominant component: {f['dominant_frequency_hz']:.2f} Hz at amplitude {f['dominant_amplitude']:.3g}.")
        recommendations.append("Run a chirp or swept-sine test around the peak to estimate damping and transfer-function confidence.")
    else:
        evidence.append(f"Spectrum is diffuse (entropy {f['spectral_entropy']:.2f}) with dominant frequency {f['dominant_frequency_hz']:.1f} Hz.")
        recommendations.append("Record a known-good baseline before relying on automated fault classification.")
    if nyquist_margin < signal.sample_rate_hz * .08:
        evidence.append("Dominant energy lies near Nyquist; aliasing risk makes this conclusion less certain.")
        confidence *= .75
    if signal.duration_s < .5:
        uncertainty = "Short recording: frequency resolution and repeatability are limited. " + uncertainty
        confidence *= .8
    return Diagnosis(label, confidence, uncertainty, evidence, recommendations, f)
