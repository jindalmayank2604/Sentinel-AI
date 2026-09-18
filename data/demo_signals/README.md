# SentinelAI demo signals

All files contain one amplitude column sampled at **2,000 Hz**. In Signal Lab, set **Sample rate (Hz)** to `2000`, click **Import CSV**, then select a file.

- `normal_motor_baseline.csv`: 50 Hz motor-like baseline; should normally produce no strong concern.
- `rlc_resonance_82hz.csv`: narrowband 82 Hz ring-down response; should flag a resonance-like response near 82 Hz.
- `bearing_like_anomaly.csv`: repeated sharp high-frequency impacts; should flag a bearing-like high-frequency anomaly.

These are synthetic teaching examples. They are not recordings of real machinery and their resulting diagnosis is not a safety or maintenance guarantee.
