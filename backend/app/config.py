from __future__ import annotations

import os
from pathlib import Path

BACKEND_ROOT = Path(__file__).resolve().parents[1]


def storage_path(env_name: str, default: str) -> Path:
    configured = Path(os.getenv(env_name, default)).expanduser()
    if configured.is_absolute():
        return configured
    return BACKEND_ROOT / configured
