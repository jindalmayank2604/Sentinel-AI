/**
 * DSP and Spectral Analysis Library
 * Mirrors Python sentinel_ai.dsp.core algorithms (FFT, Hann windowing, spectral & time features).
 */

export function computeFFT(samples, sampleRateHz = 2000, useHann = true) {
  const n = samples.length;
  if (n === 0) return { frequencies: [], amplitudes: [], resolutionHz: 0, peakFreq: 0, peakAmp: 0 };

  // Calculate mean for DC removal
  const mean = samples.reduce((acc, v) => acc + v, 0) / n;
  const x = samples.map(v => v - mean);

  // Next power of 2 for FFT
  const nfft = Math.pow(2, Math.ceil(Math.log2(Math.max(n, 64))));
  const window = new Float64Array(n);
  let coherentGain = 1.0;

  if (useHann) {
    let sum = 0;
    for (let i = 0; i < n; i++) {
      window[i] = 0.5 * (1 - Math.cos((2 * Math.PI * i) / (n - 1)));
      sum += window[i];
    }
    coherentGain = sum / n;
  } else {
    window.fill(1.0);
  }

  // Zero-padded complex arrays
  const real = new Float64Array(nfft);
  const imag = new Float64Array(nfft);

  for (let i = 0; i < n; i++) {
    real[i] = x[i] * window[i];
  }

  // Radix-2 Cooley-Tukey FFT
  transformRadix2(real, imag);

  // Single-sided amplitude spectrum
  const halfN = nfft / 2;
  const frequencies = new Float64Array(halfN);
  const amplitudes = new Float64Array(halfN);
  const resolutionHz = sampleRateHz / nfft;

  let peakFreq = 0;
  let peakAmp = -Infinity;

  for (let i = 0; i < halfN; i++) {
    frequencies[i] = i * resolutionHz;
    const mag = Math.sqrt(real[i] * real[i] + imag[i] * imag[i]);
    let amp = (mag * 2) / (n * coherentGain);
    if (i === 0 || i === halfN - 1) amp /= 2;
    amplitudes[i] = amp;

    if (i > 0 && amp > peakAmp) {
      peakAmp = amp;
      peakFreq = frequencies[i];
    }
  }

  return {
    frequencies: Array.from(frequencies),
    amplitudes: Array.from(amplitudes),
    resolutionHz,
    peakFreq: peakAmp > -Infinity ? peakFreq : 0,
    peakAmp: Math.max(0, peakAmp)
  };
}

function transformRadix2(real, imag) {
  const n = real.length;
  // Bit-reversal permutation
  let j = 0;
  for (let i = 0; i < n - 1; i++) {
    if (i < j) {
      const tempR = real[i]; real[i] = real[j]; real[j] = tempR;
      const tempI = imag[i]; imag[i] = imag[j]; imag[j] = tempI;
    }
    let k = n >> 1;
    while (k <= j) {
      j -= k;
      k >>= 1;
    }
    j += k;
  }

  // Butterfly updates
  for (let len = 2; len <= n; len <<= 1) {
    const halfLen = len >> 1;
    const angle = (-2 * Math.PI) / len;
    const wStepR = Math.cos(angle);
    const wStepI = Math.sin(angle);

    for (let i = 0; i < n; i += len) {
      let wR = 1.0;
      let wI = 0.0;
      for (let k = 0; k < halfLen; k++) {
        const uR = real[i + k];
        const uI = imag[i + k];
        const vR = real[i + k + halfLen] * wR - imag[i + k + halfLen] * wI;
        const vI = real[i + k + halfLen] * wI + imag[i + k + halfLen] * wR;

        real[i + k] = uR + vR;
        imag[i + k] = uI + vI;
        real[i + k + halfLen] = uR - vR;
        imag[i + k + halfLen] = uI - vI;

        const nextWR = wR * wStepR - wI * wStepI;
        const nextWI = wR * wStepI + wI * wStepR;
        wR = nextWR;
        wI = nextWI;
      }
    }
  }
}

export function extractSignalFeatures(samples, sampleRateHz = 2000) {
  const n = samples.length;
  if (n === 0) return { rms: 0, peak: 0, crestFactor: 0, mean: 0, variance: 0, dominantFreq: 0, spectralEntropy: 0, highFreqRatio: 0 };

  const sum = samples.reduce((acc, v) => acc + v, 0);
  const mean = sum / n;
  const sqSum = samples.reduce((acc, v) => acc + v * v, 0);
  const rms = Math.sqrt(sqSum / n);
  const peak = Math.max(...samples.map(Math.abs));
  const crestFactor = peak / Math.max(rms, 1e-6);
  const variance = samples.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / n;

  // Spectrum extraction
  const spec = computeFFT(samples, sampleRateHz, true);
  const f = spec.frequencies.slice(1);
  const a = spec.amplitudes.slice(1);
  const power = a.map(v => v * v);
  const totalPower = power.reduce((acc, v) => acc + v, 0) || 1e-12;
  const p = power.map(v => v / totalPower);

  let spectralEntropy = 0;
  let highFreqPower = 0;
  const nyquistThreshold = sampleRateHz * 0.2;

  for (let i = 0; i < p.length; i++) {
    if (p[i] > 1e-15) {
      spectralEntropy -= p[i] * Math.log2(p[i]);
    }
    if (f[i] > nyquistThreshold) {
      highFreqPower += power[i];
    }
  }
  const normalizedEntropy = p.length > 1 ? spectralEntropy / Math.log2(p.length) : 0;
  const highFreqRatio = highFreqPower / totalPower;

  return {
    rms,
    peak,
    crestFactor,
    mean,
    variance,
    dominantFreq: spec.peakFreq,
    dominantAmp: spec.peakAmp,
    spectralEntropy: normalizedEntropy,
    highFreqRatio,
    resolutionHz: spec.resolutionHz
  };
}

export function diagnoseSignal(features, sampleRateHz = 2000, durationS = 1) {
  const { crestFactor, highFreqRatio, dominantFreq, dominantAmp, spectralEntropy } = features;
  const evidence = [];
  const recommendations = [];
  let confidence = 0.55;
  let label = "Normal operation / no strong rule-based concern";
  let status = "healthy"; // 'healthy' | 'warning' | 'critical'
  let uncertainty = "Rule-based screening only; add labelled healthy history for calibrated anomaly confidence.";

  const nyquistMargin = sampleRateHz / 2 - dominantFreq;

  if (highFreqRatio > 0.18 && crestFactor > 3.5) {
    label = "Bearing-like high-frequency anomaly";
    status = "critical";
    confidence = Math.min(0.88, 0.55 + highFreqRatio);
    evidence.push(`High-frequency energy ratio is ${(highFreqRatio * 100).toFixed(1)}%; crest factor is ${crestFactor.toFixed(2)}.`);
    recommendations.push("Inspect bearing lubrication, mechanical mounting, and repeat with an accelerometer reference.");
  } else if (crestFactor > 3.5) {
    label = "Impact-like transient anomaly";
    status = "warning";
    confidence = Math.min(0.85, 0.55 + crestFactor / 12);
    evidence.push(`Elevated crest factor (${crestFactor.toFixed(2)}) indicates intermittent shock or impulse events.`);
    recommendations.push("Check mechanical clearances and isolation pads for intermittent contact.");
  } else if (dominantAmp > 0.25 && spectralEntropy < 0.45) {
    label = `Resonance-like narrowband response near ${dominantFreq.toFixed(1)} Hz`;
    status = "warning";
    confidence = 0.72;
    evidence.push(`Dominant component: ${dominantFreq.toFixed(2)} Hz at amplitude ${dominantAmp.toFixed(3)}.`);
    recommendations.push("Run a chirp or swept-sine test around the peak to estimate damping and transfer-function confidence.");
  } else {
    evidence.push(`Spectrum is diffuse (entropy ${spectralEntropy.toFixed(2)}) with dominant frequency ${dominantFreq.toFixed(1)} Hz.`);
    recommendations.push("Record a known-good baseline before relying on automated fault classification.");
  }

  if (nyquistMargin < sampleRateHz * 0.08) {
    evidence.push("Dominant energy lies near Nyquist limit; aliasing risk makes this conclusion less certain.");
    confidence *= 0.75;
  }

  if (durationS < 0.5) {
    uncertainty = "Short recording: frequency resolution and repeatability are limited. " + uncertainty;
    confidence *= 0.8;
  }

  return {
    label,
    status,
    confidence,
    uncertainty,
    evidence,
    recommendations
  };
}
