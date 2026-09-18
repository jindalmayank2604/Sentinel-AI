from __future__ import annotations

import csv
import tkinter as tk
from pathlib import Path
from tkinter import filedialog, messagebox, simpledialog, ttk

import numpy as np
from matplotlib.backends.backend_tkagg import FigureCanvasTkAgg
from matplotlib.figure import Figure

from sentinel_ai.domain.models import AnalysisRun, Signal
from sentinel_ai.dsp.core import spectrum
from sentinel_ai.dsp.generators import generate
from sentinel_ai.io.project_store import ProjectStore
from sentinel_ai.io.cmapss import load_cmapss_trajectory
from sentinel_ai.ml.diagnosis import diagnose
from sentinel_ai.ml.cmapss_rul import train_and_evaluate
from sentinel_ai.reliability.models import weibull_reliability
from sentinel_ai.simulation.rlc import SeriesRLC


class SentinelApp(tk.Tk):
    def __init__(self) -> None:
        super().__init__(); self.title("SentinelAI — Engineering Intelligence"); self.geometry("1300x800")
        self.configure(bg="#141a22"); self.signal = generate("Sine"); self.diagnosis = diagnose(self.signal)
        self.store = ProjectStore(Path.home() / ".sentinel_ai" / "project_history.json")
        self._theme(); self._build(); self.refresh()

    def _theme(self) -> None:
        style = ttk.Style(self); style.theme_use("clam")
        style.configure("TFrame", background="#141a22"); style.configure("TLabel", background="#141a22", foreground="#dce7f5")
        style.configure("TButton", padding=7, background="#264c71", foreground="white")
        style.configure("TNotebook", background="#141a22"); style.configure("TNotebook.Tab", padding=(16, 9), background="#1c2734", foreground="#dce7f5")

    def _build(self) -> None:
        bar = ttk.Frame(self); bar.pack(fill="x", padx=14, pady=12)
        ttk.Label(bar, text="SENTINELAI", font=("Segoe UI", 18, "bold")).pack(side="left")
        ttk.Label(bar, text="Local-first • physics-aware • explainable", foreground="#78b7ed").pack(side="left", padx=16)
        self.tabs = ttk.Notebook(self); self.tabs.pack(expand=True, fill="both", padx=14, pady=(0,14))
        self.signal_page = ttk.Frame(self.tabs); self.twin_page = ttk.Frame(self.tabs); self.rel_page = ttk.Frame(self.tabs); self.history_page = ttk.Frame(self.tabs)
        self.tabs.add(self.signal_page, text="Signal Lab"); self.tabs.add(self.twin_page, text="Digital Twin"); self.tabs.add(self.rel_page, text="Reliability Lab"); self.tabs.add(self.history_page, text="Project History")
        self._signal_tab(); self._twin_tab(); self._reliability_tab(); self._history_tab()

    def _signal_tab(self) -> None:
        controls = ttk.Frame(self.signal_page); controls.pack(fill="x", padx=12, pady=10)
        self.generator = tk.StringVar(value="Sine"); self.frequency = tk.StringVar(value="82"); self.rate = tk.StringVar(value="2000")
        for label, variable in [("Generator", self.generator), ("Frequency (Hz)", self.frequency), ("Sample rate (Hz)", self.rate)]:
            ttk.Label(controls, text=label).pack(side="left", padx=(0,5))
            if label == "Generator": ttk.Combobox(controls, textvariable=variable, values=["Sine","Multi-sine","Chirp","Step","Impulse","Noise"], width=12, state="readonly").pack(side="left", padx=(0,12))
            else: ttk.Entry(controls, textvariable=variable, width=10).pack(side="left", padx=(0,12))
        ttk.Button(controls, text="Generate", command=self.make_signal).pack(side="left", padx=4)
        ttk.Button(controls, text="Import CSV", command=self.import_csv).pack(side="left", padx=4)
        ttk.Button(controls, text="Import NASA C-MAPSS", command=self.import_cmapss).pack(side="left", padx=4)
        ttk.Button(controls, text="Train NASA RUL model", command=self.train_nasa_rul).pack(side="left", padx=4)
        ttk.Button(controls, text="Save analysis", command=self.save_run).pack(side="left", padx=4)
        body = ttk.Frame(self.signal_page); body.pack(expand=True, fill="both", padx=12, pady=(0,12))
        self.fig = Figure(facecolor="#141a22", tight_layout=True); self.ax1 = self.fig.add_subplot(211); self.ax2 = self.fig.add_subplot(212)
        self.canvas = FigureCanvasTkAgg(self.fig, body); self.canvas.get_tk_widget().pack(side="left", expand=True, fill="both")
        self.report = tk.Text(body, width=47, bg="#0e141c", fg="#dce7f5", insertbackground="white", wrap="word", relief="flat", padx=12, pady=12)
        self.report.pack(side="right", fill="y", padx=(12,0))

    def _twin_tab(self) -> None:
        frame = ttk.Frame(self.twin_page); frame.pack(anchor="nw", padx=24, pady=24)
        ttk.Label(frame, text="Series RLC digital twin", font=("Segoe UI", 15, "bold")).grid(row=0, column=0, columnspan=2, sticky="w", pady=(0,12))
        self.r_val, self.l_val, self.c_val = tk.StringVar(value="10"), tk.StringVar(value="0.05"), tk.StringVar(value="0.0001")
        for row, (name, var) in enumerate([( "Resistance (Ω)",self.r_val),("Inductance (H)",self.l_val),("Capacitance (F)",self.c_val)], 1):
            ttk.Label(frame, text=name).grid(row=row,column=0, sticky="w", pady=4); ttk.Entry(frame,textvariable=var,width=16).grid(row=row,column=1,pady=4)
        ttk.Button(frame,text="Simulate impulse response",command=self.simulate_twin).grid(row=4,column=0,columnspan=2,pady=14,sticky="ew")
        self.twin_output = ttk.Label(frame, text="Build uses a documented forward-Euler state integrator. Keep dt small relative to the natural period.", wraplength=500, justify="left")
        self.twin_output.grid(row=5,column=0,columnspan=2,sticky="w")

    def _reliability_tab(self) -> None:
        frame = ttk.Frame(self.rel_page); frame.pack(anchor="nw", padx=24, pady=24)
        self.age, self.scale, self.shape = tk.StringVar(value="300"), tk.StringVar(value="1000"), tk.StringVar(value="2")
        for row, (label,var) in enumerate([("Age / hours",self.age),("Weibull scale η / hours",self.scale),("Shape β",self.shape)]):
            ttk.Label(frame,text=label).grid(row=row,column=0,sticky="w",pady=5); ttk.Entry(frame,textvariable=var,width=18).grid(row=row,column=1,pady=5)
        ttk.Button(frame,text="Estimate reliability",command=self.calc_reliability).grid(row=3,column=0,columnspan=2,pady=14,sticky="ew")
        self.rel_output=ttk.Label(frame,text="",justify="left",wraplength=580); self.rel_output.grid(row=4,column=0,columnspan=2,sticky="w")

    def _history_tab(self) -> None:
        self.history = tk.Text(self.history_page, bg="#0e141c", fg="#dce7f5", relief="flat", padx=14,pady=14); self.history.pack(expand=True,fill="both",padx=12,pady=12)
        ttk.Button(self.history_page,text="Refresh saved analyses",command=self.refresh_history).pack(pady=(0,12))

    def make_signal(self) -> None:
        try: self.signal=generate(self.generator.get(),float(self.rate.get()),3,float(self.frequency.get())); self.refresh()
        except ValueError as exc: messagebox.showerror("Invalid signal settings",str(exc))

    def import_csv(self) -> None:
        path=filedialog.askopenfilename(filetypes=[("CSV files","*.csv")]);
        if not path: return
        try:
            values=[]
            with open(path,newline="",encoding="utf-8-sig") as file:
                for row in csv.reader(file):
                    try: values.append(float(row[-1]))
                    except (ValueError, IndexError): pass
            self.signal=Signal(np.array(values),float(self.rate.get()),Path(path).name,"CSV import"); self.refresh()
        except (OSError, ValueError) as exc: messagebox.showerror("Import failed",str(exc))

    def import_cmapss(self) -> None:
        path = filedialog.askopenfilename(title="Choose train_FD*.txt or test_FD*.txt", filetypes=[("C-MAPSS text files", "*.txt"), ("All files", "*.*")])
        if not path: return
        unit = simpledialog.askinteger("C-MAPSS unit", "Engine unit number:", initialvalue=1, minvalue=1, parent=self)
        if unit is None: return
        sensor = simpledialog.askinteger("C-MAPSS sensor", "Sensor channel (1–21):", initialvalue=2, minvalue=1, maxvalue=21, parent=self)
        if sensor is None: return
        try:
            record = load_cmapss_trajectory(path, unit, sensor)
            self.signal = Signal(record.sensor_values, 1.0, f"C-MAPSS unit {unit}, sensor {sensor}", "NASA C-MAPSS", "sensor value")
            self.refresh()
            known = f"This TRAIN trajectory ends at failure: known remaining life begins at {record.known_remaining_cycles[0]:.0f} cycles and ends at 0." if record.known_remaining_cycles is not None else "This TEST trajectory stops before failure; its remaining life is intentionally unknown here."
            self.report.insert("end", "\n\nNASA C-MAPSS CONTEXT\n" + known + "\nThis view is an imported sensor trajectory, not an RUL prediction model.")
        except (OSError, ValueError) as exc:
            messagebox.showerror("NASA import failed", str(exc))

    def train_nasa_rul(self) -> None:
        """Train/evaluate a baseline with the shipped FD001 train/test/RUL split."""
        try:
            folder = Path(__file__).resolve().parents[3] / "data" / "cmapss"
            result = train_and_evaluate(folder, "FD001")
            examples = "\n".join(f"Engine {unit}: predicted {pred:.1f}, actual {actual:.1f} cycles" for unit, pred, actual in result.sample_predictions)
            self.report.delete("1.0", "end")
            self.report.insert("1.0", f"NASA C-MAPSS RUL BASELINE — {result.subset}\n\nTrained examples: {result.train_examples}\nUnseen test engines: {result.test_engines}\nMean absolute error: {result.mae_cycles:.1f} cycles\nRMSE: {result.rmse_cycles:.1f} cycles\n\nSample held-out predictions\n{examples}\n\nThis is a transparent ridge-regression baseline using 30-cycle sensor windows and capped RUL (125 cycles). It is a benchmark model, not a flight-safety or maintenance decision.")
            self.tabs.select(self.signal_page)
        except (OSError, ValueError, np.linalg.LinAlgError) as exc:
            messagebox.showerror("NASA RUL training failed", str(exc))

    def refresh(self) -> None:
        self.diagnosis=diagnose(self.signal); spec=spectrum(self.signal); self.ax1.clear(); self.ax2.clear()
        is_cmapss = self.signal.source == "NASA C-MAPSS"
        time_axis = np.arange(self.signal.samples.size) if is_cmapss else self.signal.time_s
        time_label = "Engine cycle" if is_cmapss else "Time (s)"
        frequency_label = "Variation per cycle" if is_cmapss else "Frequency (Hz)"
        self.ax1.plot(time_axis,self.signal.samples,color="#66c2ff",label=self.signal.name); self.ax1.set(xlabel=time_label,ylabel=self.signal.units,title="Sensor trajectory" if is_cmapss else "Waveform"); self.ax1.legend(); self.ax1.grid(alpha=.25)
        self.ax2.plot(spec.frequency_hz,spec.amplitude,color="#ffb86b"); self.ax2.set(xlim=(0,self.signal.sample_rate_hz/2),xlabel=frequency_label,ylabel="Amplitude",title=f"{spec.window} spectrum — resolution {spec.resolution_hz:.3f} {'cycles⁻¹' if is_cmapss else 'Hz'}"); self.ax2.grid(alpha=.25)
        for ax in (self.ax1,self.ax2): ax.set_facecolor("#101820"); ax.tick_params(colors="#dce7f5"); ax.xaxis.label.set_color("#dce7f5"); ax.yaxis.label.set_color("#dce7f5"); ax.title.set_color("#dce7f5")
        self.canvas.draw(); d=self.diagnosis
        text=f"AI HEALTH REPORT\n\nConclusion: {d.label}\nConfidence: {d.confidence:.0%}\n\nEvidence\n"+"\n".join("• "+x for x in d.evidence)+"\n\nUncertainty\n"+d.uncertainty+"\n\nNext useful experiment\n"+"\n".join("• "+x for x in d.recommendations)
        self.report.delete("1.0","end"); self.report.insert("1.0",text)

    def save_run(self) -> None:
        self.store.append(AnalysisRun(self.signal.name,self.diagnosis,source=self.signal.source)); self.refresh_history(); messagebox.showinfo("Saved","Analysis saved to your local SentinelAI history.")
    def refresh_history(self) -> None:
        records=self.store.load(); self.history.delete("1.0","end"); self.history.insert("1.0","\n\n".join(f"{x['created_at']}\n{x['signal_name']} — {x['diagnosis']['label']} ({x['diagnosis']['confidence']:.0%})" for x in records) or "No saved analyses yet.")
    def simulate_twin(self) -> None:
        try:
            model=SeriesRLC(float(self.r_val.get()),float(self.l_val.get()),float(self.c_val.get())); self.signal=model.simulate_impulse(); self.generator.set("Impulse"); self.rate.set(str(self.signal.sample_rate_hz)); self.refresh()
            self.twin_output.config(text=f"Natural frequency: {model.natural_frequency_hz:.2f} Hz\nDamping ratio: {model.damping_ratio:.4f}\nSimulation loaded into Signal Lab. Numerical assumptions: forward Euler, dt={1/self.signal.sample_rate_hz:.6f} s.")
        except ValueError as exc: messagebox.showerror("Invalid circuit",str(exc))
    def calc_reliability(self) -> None:
        try:
            r=weibull_reliability(float(self.age.get()),float(self.scale.get()),float(self.shape.get()))
            self.rel_output.config(text=f"Survival at current age: {r.survival:.2%}\nFailure probability: {r.failure_probability:.2%}\nExpected lifetime: {r.expected_life:.1f} hours\nInstantaneous hazard: {r.hazard:.5g}/hour\nWarranty-risk scenario: {r.warranty_risk.upper()}\n\nThis is a Weibull model estimate, not a real-world failure guarantee.")
        except ValueError as exc: messagebox.showerror("Invalid reliability parameters",str(exc))


def main() -> None: SentinelApp().mainloop()

if __name__ == "__main__": main()
