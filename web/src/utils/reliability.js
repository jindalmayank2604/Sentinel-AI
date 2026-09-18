/**
 * Reliability and Weibull Analysis Library
 * Mirrors Python sentinel_ai.reliability.models equations.
 */

// Lanczos approximation for the Gamma function
export function gamma(z) {
  const g = 7;
  const c = [
    0.99999999999980993,
    676.5203681218851,
    -1259.1392167224028,
    771.32342877765313,
    -176.61502916214059,
    12.507343278686905,
    -0.13857109585620512,
    9.9843695780195716e-6,
    1.5056327351493116e-7
  ];

  if (z < 0.5) {
    return Math.PI / (Math.sin(Math.PI * z) * gamma(1 - z));
  }

  z -= 1;
  let x = c[0];
  for (let i = 1; i < g + 2; i++) {
    x += c[i] / (z + i);
  }

  const t = z + g + 0.5;
  return Math.sqrt(2 * Math.PI) * Math.pow(t, z + 0.5) * Math.exp(-t) * x;
}

export function calculateWeibull(age, eta, beta) {
  const safeAge = Math.max(0, Number(age) || 0);
  const safeEta = Math.max(0.0001, Number(eta) || 1000);
  const safeBeta = Math.max(0.0001, Number(beta) || 2);

  const survival = Math.exp(-Math.pow(safeAge / safeEta, safeBeta));
  const failureProb = 1 - survival;
  const hazard = safeAge > 0 
    ? (safeBeta / safeEta) * Math.pow(safeAge / safeEta, safeBeta - 1)
    : (safeBeta === 1 ? 1 / safeEta : 0);

  const expectedLife = safeEta * gamma(1 + 1 / safeBeta);
  const risk = failureProb > 0.25 ? "critical" : failureProb > 0.10 ? "warning" : "healthy";

  return {
    survival,
    failureProb,
    hazard,
    expectedLife,
    risk,
    age: safeAge,
    eta: safeEta,
    beta: safeBeta
  };
}

export function generateWeibullCurve(eta, beta, maxHours = null, steps = 100) {
  const safeEta = Math.max(0.0001, Number(eta) || 1000);
  const safeBeta = Math.max(0.0001, Number(beta) || 2);
  const maxT = maxHours || safeEta * 2.2;
  const stepSize = maxT / steps;

  const points = [];
  for (let i = 0; i <= steps; i++) {
    const t = i * stepSize;
    const r = Math.exp(-Math.pow(t / safeEta, safeBeta));
    const f = 1 - r;
    const h = t > 0 ? (safeBeta / safeEta) * Math.pow(t / safeEta, safeBeta - 1) : 0;
    points.push({ t, r, f, h });
  }

  return points;
}

export function topologyReliability(values, mode = "series") {
  if (!values || values.length === 0) return 1.0;
  if (mode === "series") {
    return values.reduce((acc, v) => acc * Math.max(0, Math.min(1, v)), 1.0);
  } else {
    // Parallel
    const unreliability = values.reduce((acc, v) => acc * (1 - Math.max(0, Math.min(1, v))), 1.0);
    return 1.0 - unreliability;
  }
}
