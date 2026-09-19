# SentinelAI

SentinelAI is a local-first engineering intelligence desktop application. It imports or generates time-series signals, quantifies spectral/dynamic behaviour, applies transparent rules for a health diagnosis, and preserves results as portable JSON projects.

## Quick start

```powershell
cd sentinel_ai
python -m pip install -e .
sentinel-ai
```

## React workbench

For the React interface and its local AI API, use one command from the `sentinel_ai` folder:

```powershell
.\run_web.ps1
```

It opens two PowerShell windows: one runs the Python API at `127.0.0.1:8000`; the other runs the React app and prints its browser URL. Both need to remain open while using the **Train NASA RUL Model** button.

## GitHub Pages

The workflow at `.github/workflows/deploy-pages.yml` publishes the React workbench whenever changes are pushed to `main`. In GitHub, open **Settings → Pages**, set **Source** to **GitHub Actions**, then push the repository to GitHub.

GitHub Pages hosts static files only. The circuit workbench, CSV signal analysis, and reliability calculator work in the browser; the NASA RUL training action requires the local Python API and therefore is available only when running SentinelAI locally until a separate backend is deployed.

The application works without scikit-learn; when installed, Isolation Forest can be added as an optional learned anomaly model. The included diagnosis always shows evidence and uncertainty rather than presenting a simulated result as a guarantee.

## Included first release

- Synthetic sine, multi-sine, chirp, step, impulse and noise signals
- CSV import, waveform, window-compensated FFT, spectrogram, and transfer estimate
- Resonance, damping, phase-lag, anomaly, and insufficient-data conclusions
- Series/parallel exponential and Weibull reliability calculations
- RLC analytical digital-twin simulator and measurement comparison
- JSON project persistence and CSV feature export

## Circuit workbench controls

The Circuit Workbench has both a 2D schematic view and an interactive Three.js 3D view.

### 3D workspace

- Drag a component to move it across the workbench plane.
- Drag empty space to orbit the camera.
- Use the mouse wheel or the `+` / `−` controls to zoom. Wheel input is captured by the canvas and does not scroll the page.
- Select a component with the **SELECT** tool or by clicking it.
- The 3D scene uses the supplied resistor, battery, and stepper-motor GLB assets when those component types are used.
- Component proportions are intentional: resistor and battery are compact; AC source is medium; power supply and motors are larger.
- DC circuits animate conventional current along one calculated loop: `+ terminal → circuit → − terminal`. AC source circuits instead use a gentle source vibration and oscillating charge markers.

### Keyboard shortcuts

| Key | Action |
| --- | --- |
| `V` | Select / move mode |
| `W` | Toggle wire mode |
| `1` | Switch to the 2D schematic |
| `2` | Switch to the 3D workspace |
| `Delete` or `Backspace` | Delete the selected component |
| `Esc` | Exit wire mode |

### 2D workspace

- Use the mouse wheel or the `+` / `−` controls to zoom the schematic.
- Drag a component-library item onto the canvas to place it, drag an existing component to reposition it, and use **CONNECT WIRE** to create links.

## NASA C-MAPSS workflow

Download `CMAPSSData.zip` from the official NASA C-MAPSS page, extract it, and choose **Signal Lab → Import NASA C-MAPSS**. Select a `train_FD*.txt` or `test_FD*.txt` file, an engine unit, and a sensor channel (1–21). Training trajectories end at failure and can provide remaining-useful-life labels; test trajectories stop before failure and must not be treated as labelled failures.
#   
#
