from __future__ import annotations
import json
from pathlib import Path
from sentinel_ai.domain.models import AnalysisRun


class ProjectStore:
    def __init__(self, path: str | Path) -> None: self.path = Path(path)
    def load(self) -> list[dict]:
        if not self.path.exists(): return []
        return json.loads(self.path.read_text(encoding="utf-8"))
    def append(self, run: AnalysisRun) -> None:
        records = self.load(); records.append(run.to_dict())
        self.path.parent.mkdir(parents=True, exist_ok=True)
        self.path.write_text(json.dumps(records, indent=2), encoding="utf-8")
