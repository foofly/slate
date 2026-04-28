import os
from pathlib import Path


def _require_env(name: str) -> str:
    val = os.environ.get(name)
    if not val:
        raise RuntimeError(f"Environment variable {name} is required")
    return val


vault_path = Path(os.environ.get("SLATE_VAULT_PATH", "/vault"))
host = os.environ.get("SLATE_HOST", "0.0.0.0")
port = int(os.environ.get("SLATE_PORT", "5147"))
readonly = os.environ.get("SLATE_READONLY", "false").lower() == "true"
auth_mode = os.environ.get("SLATE_AUTH", "none")  # none | password
password = os.environ.get("SLATE_PASSWORD", "")
