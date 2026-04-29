from pathlib import Path
from fastapi import HTTPException


def sanitize_note_path(vault_root: Path, raw: str) -> Path:
    clean = raw.lstrip("/").lstrip("\\")
    if not clean:
        raise HTTPException(400, "Empty path")
    for part in Path(clean).parts:
        if part.startswith(".") or part in ("..", "."):
            raise HTTPException(400, "Invalid path component")
    resolved = (vault_root / clean).resolve()
    vault_resolved = vault_root.resolve()
    # Ensure the resolved path is inside the vault
    try:
        resolved.relative_to(vault_resolved)
    except ValueError:
        raise HTTPException(400, "Path outside vault")
    if resolved.suffix.lower() != ".md":
        raise HTTPException(400, "Only .md files are accessible")
    return resolved


def sanitize_folder_path(vault_root: Path, raw: str) -> Path:
    clean = raw.lstrip("/").lstrip("\\")
    if not clean:
        raise HTTPException(400, "Empty path")
    for part in Path(clean).parts:
        if part.startswith(".") or part in ("..", "."):
            raise HTTPException(400, "Invalid path component")
    resolved = (vault_root / clean).resolve()
    try:
        resolved.relative_to(vault_root.resolve())
    except ValueError:
        raise HTTPException(400, "Path outside vault")
    if resolved.suffix:
        raise HTTPException(400, "Folder name must not have a file extension")
    return resolved
