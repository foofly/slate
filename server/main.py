import mimetypes
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles

from . import config
from .helpers import sanitize_attachment_path, sanitize_folder_path, sanitize_note_path
from .models import FolderMove, NoteCreate, NoteMove, NoteRead, NoteWrite, SearchResult, TreeItem
from .search import SearchIndex
from .vault import Vault

app = FastAPI(title="Slate")
vault = Vault(config.vault_path)
search_index = SearchIndex(config.vault_path)

_static_dir = Path(__file__).parent.parent / "client" / "dist"


@app.on_event("startup")
async def startup():
    try:
        search_index.sync()
    except Exception as e:
        print(f"Search index sync failed: {e}")


# --- Health ---

@app.get("/health")
def health():
    return {"status": "ok"}


# --- Tree ---

@app.get("/api/tree", response_model=list[TreeItem])
def get_tree():
    return vault.get_tree()


# --- Notes CRUD ---

@app.get("/api/notes/{note_path:path}", response_model=NoteRead)
async def get_note(note_path: str):
    safe = sanitize_note_path(config.vault_path, note_path)
    if not safe.exists():
        raise HTTPException(404, "Note not found")
    content = await vault.read_note(safe)
    return NoteRead(
        path=note_path,
        content=content,
        last_modified=safe.stat().st_mtime,
    )


@app.put("/api/notes/{note_path:path}", response_model=NoteRead)
async def save_note(note_path: str, body: NoteWrite):
    if config.readonly:
        raise HTTPException(403, "Vault is read-only")
    safe = sanitize_note_path(config.vault_path, note_path)
    await vault.write_note(safe, body.content)
    search_index.index_note(note_path, body.content)
    return NoteRead(
        path=note_path,
        content=body.content,
        last_modified=safe.stat().st_mtime,
    )


@app.post("/api/notes/{note_path:path}", response_model=NoteRead, status_code=201)
async def create_note(note_path: str, body: NoteCreate):
    if config.readonly:
        raise HTTPException(403, "Vault is read-only")
    safe = sanitize_note_path(config.vault_path, note_path)
    if safe.exists():
        raise HTTPException(409, "Note already exists")
    await vault.write_note(safe, body.content)
    search_index.index_note(note_path, body.content)
    return NoteRead(
        path=note_path,
        content=body.content,
        last_modified=safe.stat().st_mtime,
    )


@app.delete("/api/notes/{note_path:path}", status_code=204)
async def delete_note(note_path: str):
    if config.readonly:
        raise HTTPException(403, "Vault is read-only")
    safe = sanitize_note_path(config.vault_path, note_path)
    if not safe.exists():
        raise HTTPException(404, "Note not found")
    await vault.delete_note(safe)
    search_index.delete_note(note_path)


@app.patch("/api/notes/{note_path:path}", response_model=NoteRead)
async def move_note(note_path: str, body: NoteMove):
    if config.readonly:
        raise HTTPException(403, "Vault is read-only")
    src = sanitize_note_path(config.vault_path, note_path)
    dst = sanitize_note_path(config.vault_path, body.new_path)
    if not src.exists():
        raise HTTPException(404, "Note not found")
    if dst.exists():
        raise HTTPException(409, "Destination already exists")
    await vault.move_note(src, dst)
    search_index.delete_note(note_path)
    content = await vault.read_note(dst)
    search_index.index_note(body.new_path, content)
    return NoteRead(
        path=body.new_path,
        content=content,
        last_modified=dst.stat().st_mtime,
    )


# --- Folders ---

@app.post("/api/folders/{folder_path:path}", status_code=201)
async def create_folder(folder_path: str):
    if config.readonly:
        raise HTTPException(403, "Vault is read-only")
    safe = sanitize_folder_path(config.vault_path, folder_path)
    try:
        await vault.create_folder(safe)
    except FileExistsError:
        raise HTTPException(409, "Folder already exists")
    return {"path": folder_path}


@app.delete("/api/folders/{folder_path:path}", status_code=204)
async def delete_folder(folder_path: str):
    if config.readonly:
        raise HTTPException(403, "Vault is read-only")
    safe = sanitize_folder_path(config.vault_path, folder_path)
    if not safe.exists() or not safe.is_dir():
        raise HTTPException(404, "Folder not found")
    await vault.delete_folder(safe)
    search_index.sync()


@app.patch("/api/folders/{folder_path:path}")
async def move_folder(folder_path: str, body: FolderMove):
    if config.readonly:
        raise HTTPException(403, "Vault is read-only")
    src = sanitize_folder_path(config.vault_path, folder_path)
    dst = sanitize_folder_path(config.vault_path, body.new_path)
    if not src.exists() or not src.is_dir():
        raise HTTPException(404, "Folder not found")
    if dst.exists():
        raise HTTPException(409, "Destination already exists")
    try:
        dst.relative_to(src)
        raise HTTPException(400, "Cannot move a folder into itself or a descendant")
    except ValueError:
        pass
    await vault.move_folder(src, dst)
    search_index.sync()
    return {"path": body.new_path}


# --- Search ---

@app.get("/api/search", response_model=list[SearchResult])
def search(q: str = "", limit: int = 20):
    if not q.strip():
        return []
    return search_index.search(q.strip(), limit=limit)


# --- Attachments (images) ---

@app.get("/api/attachments/{file_path:path}")
async def get_attachment(file_path: str):
    safe = sanitize_attachment_path(config.vault_path, file_path)
    if not safe.exists() or not safe.is_file():
        raise HTTPException(404, "Attachment not found")
    media_type, _ = mimetypes.guess_type(str(safe))
    return FileResponse(str(safe), media_type=media_type or "application/octet-stream")


# --- SPA static files (must be last) ---

if _static_dir.exists():
    app.mount("/", StaticFiles(directory=str(_static_dir), html=True), name="spa")
