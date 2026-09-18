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

## NASA C-MAPSS workflow

Download `CMAPSSData.zip` from the official NASA C-MAPSS page, extract it, and choose **Signal Lab → Import NASA C-MAPSS**. Select a `train_FD*.txt` or `test_FD*.txt` file, an engine unit, and a sensor channel (1–21). Training trajectories end at failure and can provide remaining-useful-life labels; test trajectories stop before failure and must not be treated as labelled failures.
#   
#
