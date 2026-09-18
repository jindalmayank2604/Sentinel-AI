"""Local HTTP bridge between the React workbench and SentinelAI's Python model."""
from __future__ import annotations

import json
import sys
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "src"))
from sentinel_ai.ml.cmapss_rul import train_and_evaluate  # noqa: E402


class Api(BaseHTTPRequestHandler):
    def _send(self, status: int, payload: dict) -> None:
        encoded = json.dumps(payload).encode()
        self.send_response(status); self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(encoded))); self.end_headers(); self.wfile.write(encoded)
    def do_GET(self) -> None:
        self._send(200, {"status": "ready"}) if self.path == "/api/health" else self._send(404, {"error": "Not found"})
    def do_POST(self) -> None:
        if self.path != "/api/train/nasa": self._send(404, {"error": "Not found"}); return
        try:
            result = train_and_evaluate(ROOT / "data" / "cmapss")
            self._send(200, {"subset": result.subset, "train_examples": result.train_examples, "test_engines": result.test_engines, "mae_cycles": result.mae_cycles, "rmse_cycles": result.rmse_cycles, "sample_predictions": result.sample_predictions})
        except Exception as exc: self._send(500, {"error": str(exc)})
    def log_message(self, *_: object) -> None: pass


if __name__ == "__main__":
    print("SentinelAI API: http://127.0.0.1:8000")
    ThreadingHTTPServer(("127.0.0.1", 8000), Api).serve_forever()
