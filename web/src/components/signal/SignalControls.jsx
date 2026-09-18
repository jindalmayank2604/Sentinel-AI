import React from "react";
import { Upload, Play, RefreshCw, AudioWaveform } from "lucide-react";

export function SignalControls({
  kind,
  setKind,
  rate,
  setRate,
  base,
  setBase,
  onGenerate,
  onUpload
}) {
  const signalTypes = ["Sine", "Multi-sine", "Chirp", "Step", "Impulse", "Noise"];

  return (
    <div className="bg-[#0D141C] border border-[#1D2B35] p-4 sm:p-5">
      <div className="text-[10px] font-mono tracking-widest text-[#48E6D2] uppercase mb-3 flex items-center gap-1.5">
        <AudioWaveform className="w-3.5 h-3.5" />
        <span>SIGNAL ACQUISITION & SYNTHESIS</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 items-end">
        {/* CSV / WAV Upload */}
        <div>
          <label className="text-[10px] font-mono text-[#8A98A6] uppercase block mb-1">
            IMPORT DATA (CSV / WAV)
          </label>
          <div className="relative">
            <input
              type="file"
              accept=".csv,.wav,text/csv,audio/wav"
              onChange={onUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <div className="w-full bg-[#111A23] border border-[#1D2B35] hover:border-[#48E6D2]/60 text-[#E6EDF3] text-xs px-3 py-2 font-mono flex items-center justify-between cursor-pointer transition-colors">
              <span className="truncate">Choose file...</span>
              <Upload className="w-3.5 h-3.5 text-[#48E6D2] shrink-0" />
            </div>
          </div>
        </div>

        {/* Generator Type */}
        <div>
          <label className="text-[10px] font-mono text-[#8A98A6] uppercase block mb-1">
            WAVEFORM GENERATOR
          </label>
          <select
            value={kind}
            onChange={e => setKind(e.target.value)}
            className="w-full bg-[#111A23] border border-[#1D2B35] focus:border-[#48E6D2] text-[#E6EDF3] text-xs px-2.5 py-2 font-mono outline-none"
          >
            {signalTypes.map(t => (
              <option key={t} value={t}>
                {t} Wave
              </option>
            ))}
          </select>
        </div>

        {/* Sample Rate */}
        <div>
          <label className="text-[10px] font-mono text-[#8A98A6] uppercase block mb-1">
            SAMPLE RATE (Hz)
          </label>
          <input
            type="number"
            min="100"
            max="100000"
            step="100"
            value={rate}
            onChange={e => setRate(Number(e.target.value))}
            className="w-full bg-[#111A23] border border-[#1D2B35] focus:border-[#48E6D2] text-[#E6EDF3] text-xs px-2.5 py-2 font-mono outline-none"
          />
        </div>

        {/* Base Frequency */}
        <div>
          <label className="text-[10px] font-mono text-[#8A98A6] uppercase block mb-1">
            BASE FREQUENCY (Hz)
          </label>
          <input
            type="number"
            min="1"
            max="50000"
            step="1"
            value={base}
            onChange={e => setBase(Number(e.target.value))}
            className="w-full bg-[#111A23] border border-[#1D2B35] focus:border-[#48E6D2] text-[#E6EDF3] text-xs px-2.5 py-2 font-mono outline-none"
          />
        </div>

        {/* Generate Button */}
        <div>
          <button
            onClick={onGenerate}
            className="w-full py-2 bg-[#48E6D2] hover:bg-[#3cd3bf] text-[#070B11] font-mono text-xs font-semibold tracking-wider flex items-center justify-center gap-1.5 transition-colors shadow-[0_0_12px_rgba(72,230,210,0.2)]"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>SYNTHESIZE</span>
          </button>
        </div>
      </div>
    </div>
  );
}
