import asyncio
import shutil
from pathlib import Path

from .models import TreeItem


class Vault:
    def __init__(self, root: Path):
        self.root = root.resolve()
        self.root.mkdir(parents=True, exist_ok=True)

    def get_tree(self) -> list[TreeItem]:
        return self._walk(self.root)

    def _walk(self, path: Path) -> list[TreeItem]:
        items: list[TreeItem] = []
        try:
            entries = sorted(path.iterdir(), key=lambda e: (e.is_file(), e.name.lower()))
        except PermissionError:
            return []
        for entry in entries:
            if entry.name.startswith("."):
                continue
            if entry.is_dir():
                children = self._walk(entry)
                items.append(TreeItem(
                    name=entry.name,
                    path=str(entry.relative_to(self.root)),
                    type="folder",
                    children=children,
                ))
            elif entry.is_file() and entry.suffix.lower() == ".md":
                items.append(TreeItem(
                    name=entry.name,
                    path=str(entry.relative_to(self.root)),
                    type="file",
                    children=None,
                ))
        return items

    async def read_note(self, path: Path) -> str:
        return await asyncio.to_thread(path.read_text, "utf-8")

    async def write_note(self, path: Path, content: str) -> None:
        def _write():
            path.parent.mkdir(parents=True, exist_ok=True)
            tmp = path.with_suffix(".md.tmp")
            tmp.write_text(content, encoding="utf-8")
            tmp.replace(path)
        await asyncio.to_thread(_write)

    async def create_folder(self, path: Path) -> None:
        def _mkdir():
            if path.exists():
                raise FileExistsError
            path.mkdir(parents=True, exist_ok=False)
        await asyncio.to_thread(_mkdir)

    async def move_folder(self, src: Path, dst: Path) -> None:
        def _move():
            dst.parent.mkdir(parents=True, exist_ok=True)
            shutil.move(str(src), str(dst))
        await asyncio.to_thread(_move)

    async def delete_note(self, path: Path) -> None:
        await asyncio.to_thread(path.unlink)

    async def move_note(self, src: Path, dst: Path) -> None:
        def _move():
            dst.parent.mkdir(parents=True, exist_ok=True)
            shutil.move(str(src), str(dst))
        await asyncio.to_thread(_move)
