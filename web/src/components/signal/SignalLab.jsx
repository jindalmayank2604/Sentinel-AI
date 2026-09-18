import React, { useState, useMemo } from "react";
import { SignalControls } from "./SignalControls";
import { WaveformChart } from "./WaveformChart";
import { SpectrumChart } from "./SpectrumChart";
import { AiHealthReport } from "./AiHealthReport";
import { MetricCard } from "../common/MetricCard";
import { SectionHeader } from "../common/SectionHeader";
import { computeFFT, extractSignalFeatures, diagnoseSignal } from "../../utils/dsp";
import { ArrowRight, Cpu, Layers, Activity, GitFork } from "lucide-react";

export function SignalLab({ frequency, onNavigate }) {
  const [rate, setRate] = useState(2000);
  const [kind, setKind] = useState("Sine");
  const [base, setBase] = useState(82);
  const [samples, setSamples] = useState(() =>
    Array.from({ length: 600 }, (_, i) => Math.sin((2 * Math.PI * 82 * i) / 2000))
  );
  const [source, setSource] = useState("Synthetic sine @ 82 Hz");
  const [message, setMessage] = useState("Generate a signal or upload a one-column CSV/WAV.");
  const [domainTab, setDomainTab] = useState("both"); // 'both' | 'time' | 'frequency'

  // Extract features & diagnose signal
  const features = useMemo(() => extractSignalFeatures(samples, rate), [samples, rate]);
  const fftData = useMemo(() => computeFFT(samples, rate, true), [samples, rate]);
  const diagnosis = useMemo(
    () => diagnoseSignal(features, rate, samples.length / rate),
    [features, rate, samples.length]
  );

  // Sync to local storage for reliability coupling
  React.useEffect(() => {
    const health = {
      label: diagnosis.label,
      confidence: diagnosis.confidence,
      crest: features.crestFactor,
      rms: features.rms,
      status: diagnosis.status,
      source: source,
      updated: new Date().toLocaleString()
    };
    localStorage.setItem("sentinelSignalHealth", JSON.stringify(health));
  }, [diagnosis, features, source]);

  const handleGenerate = () => {
    const duration = 0.5; // 0.5s for crisp responsive visualization
    const length = Math.floor(rate * duration);
    const x = Array.from({ length }, (_, i) => {
      const t = i / rate;
      if (kind === "Noise") return (Math.random() - 0.5) * 1.4;
      if (kind === "Step") return i > length * 0.25 ? 1 : 0;
      if (kind === "Impulse") return i === Math.floor(length * 0.2) ? 1 : 0;
      if (kind === "Chirp") return Math.sin(2 * Math.PI * (10 * t + ((0.5 * base) / 3) * t * t));
      if (kind === "Multi-sine") return Math.sin(2 * Math.PI * base * t) + 0.4 * Math.sin(2 * Math.PI * base * 2.5 * t);
      return Math.sin(2 * Math.PI * base * t);
    });

    setSamples(x);
    setSource(`${kind} @ ${base} Hz`);
    setMessage(`Generated ${x.length} samples locally.`);
  };

  const handleUpload = e => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.name.toLowerCase().endsWith(".wav")) {
      setSource(file.name);
      setMessage("WAV file selected. Full audio decoding available.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const rows = String(reader.result)
        .split(/\r?\n/)
        .map(row => Number(row.split(",").at(-1)))
        .filter(Number.isFinite);

      if (rows.length < 8) {
        setMessage("CSV needs at least 8 numeric values.");
        return;
      }

      setSamples(rows.slice(0, 3000));
      setSource(file.name);
      setMessage(`Imported ${rows.length} samples. AI health report updated.`);
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      <SectionHeader
        eyebrow="DIGITAL SIGNAL PROCESSING & TELEMETRY"
        title="Signal Processing & AI Anomaly Lab"
        description="Analyze time-domain oscillograms, compute Radix-2 single-sided Hann FFT amplitude spectra, and run physics-informed AI anomaly diagnostics."
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate("WORKBENCH")}
              className="px-3 py-1.5 bg-[#111A23] border border-[#1D2B35] hover:border-[#48E6D2]/40 text-[#E6EDF3] text-xs font-mono flex items-center gap-1.5 transition-colors"
            >
              <Cpu className="w-3.5 h-3.5 text-[#48E6D2]" />
              <span>RETURN TO WORKBENCH</span>
            </button>
          </div>
        }
      />

      {/* Signal Controls (Generation / Upload) */}
      <SignalControls
        kind={kind}
        setKind={setKind}
        rate={rate}
        setRate={setRate}
        base={base}
        setBase={setBase}
        onGenerate={handleGenerate}
        onUpload={handleUpload}
      />

      {/* Domain Segmented View Toggle */}
      <div className="flex items-center justify-between border-b border-[#1D2B35] pb-2">
        <div className="flex items-center gap-1 bg-[#0D141C] border border-[#1D2B35] p-0.5">
          <button
            onClick={() => setDomainTab("both")}
            className={`px-3 py-1 text-xs font-mono transition-colors ${
              domainTab === "both"
                ? "bg-[#111A23] text-[#48E6D2] border border-[#1D2B35]"
                : "text-[#8A98A6] hover:text-[#E6EDF3]"
            }`}
          >
            DUAL OSCILLOSCOPE & FFT
          </button>
          <button
            onClick={() => setDomainTab("time")}
            className={`px-3 py-1 text-xs font-mono transition-colors ${
              domainTab === "time"
                ? "bg-[#111A23] text-[#48E6D2] border border-[#1D2B35]"
                : "text-[#8A98A6] hover:text-[#E6EDF3]"
            }`}
          >
            TIME DOMAIN ONLY
          </button>
          <button
            onClick={() => setDomainTab("frequency")}
            className={`px-3 py-1 text-xs font-mono transition-colors ${
              domainTab === "frequency"
                ? "bg-[#111A23] text-[#48E6D2] border border-[#1D2B35]"
                : "text-[#8A98A6] hover:text-[#E6EDF3]"
            }`}
          >
            FFT SPECTRUM ONLY
          </button>
        </div>

        <span className="text-[10px] font-mono text-[#8A98A6] hidden sm:inline-block">
          STATUS: {message}
        </span>
      </div>

      {/* Oscilloscope and FFT Charts */}
      <div className="grid grid-cols-1 gap-6">
        {(domainTab === "both" || domainTab === "time") && (
          <WaveformChart
            samples={samples}
            source={source}
            sampleRateHz={rate}
          />
        )}

        {(domainTab === "both" || domainTab === "frequency") && (
          <SpectrumChart
            fftData={fftData}
            sampleRateHz={rate}
          />
        )}
      </div>

      {/* Extracted Feature Readout Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <MetricCard
          label="SAMPLES LOADED"
          value={samples.length}
          note={`Sampling frequency ${rate} Hz`}
          status="neutral"
        />
        <MetricCard
          label="RMS ENERGY"
          value={features.rms.toFixed(4)}
          note="Quadratic mean magnitude"
          status="neutral"
        />
        <MetricCard
          label="CREST FACTOR"
          value={features.crestFactor.toFixed(2)}
          note="Peak / RMS (impulse metric)"
          status={features.crestFactor > 3.5 ? "warning" : "healthy"}
        />
        <MetricCard
          label="DOMINANT FREQUENCY"
          value={features.dominantFreq.toFixed(1)}
          unit="Hz"
          note={`Spectral resolution ${features.resolutionHz?.toFixed(1)} Hz`}
          status="cyan"
        />
      </div>

      {/* AI Health Report */}
      <AiHealthReport
        diagnosis={diagnosis}
        features={features}
        onSendToReliability={() => onNavigate("RELIABILITY")}
      />

      {/* Digital Twin Link Context Box */}
      <div className="bg-[#0D141C] border border-[#1D2B35] p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-[#111A23] border border-[#1D2B35] text-[#48E6D2]">
            <GitFork className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-[#48E6D2] uppercase tracking-widest block">
              DIGITAL TWIN RESIDUAL LINK
            </span>
            <div className="text-sm font-semibold text-[#E6EDF3] mt-0.5">
              Active RLC Workbench Natural Frequency: {frequency.toFixed(2)} Hz
            </div>
            <p className="text-xs text-[#8A98A6] mt-1">
              Compare actual spectral peaks against the theoretical resonance frequency calculated in the Circuit Workbench.
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigate("WORKBENCH")}
          className="px-4 py-2 bg-[#111A23] hover:bg-[#152330] border border-[#1D2B35] hover:border-[#48E6D2]/50 text-[#E6EDF3] text-xs font-mono tracking-wider shrink-0 transition-colors"
        >
          OPEN RLC WORKBENCH →
        </button>
      </div>
    </div>
  );
}
