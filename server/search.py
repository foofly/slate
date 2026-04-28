import re
import time
from pathlib import Path

from whoosh import index
from whoosh.fields import ID, KEYWORD, STORED, TEXT, Schema
from whoosh.qparser import MultifieldParser, OrGroup
from whoosh.writing import AsyncWriter

from .models import SearchResult

_TAG_RE = re.compile(r"(?<!\w)#([A-Za-z][A-Za-z0-9_/-]*)")
_CODE_BLOCK_RE = re.compile(r"```.*?```", re.DOTALL)


def _extract_tags(content: str) -> str:
    stripped = _CODE_BLOCK_RE.sub("", content)
    return ",".join(set(m.group(1) for m in _TAG_RE.finditer(stripped)))


def _note_title(path_str: str) -> str:
    return Path(path_str).stem


class SearchIndex:
    _schema = Schema(
        path=ID(stored=True, unique=True),
        title=TEXT(stored=True),
        content=TEXT(stored=False),
        tags=KEYWORD(stored=True, commas=True),
        last_modified=STORED,
    )

    def __init__(self, vault_root: Path):
        self.vault_root = vault_root.resolve()
        self.index_dir = vault_root / ".slate_index"
        self.index_dir.mkdir(exist_ok=True)
        if index.exists_in(str(self.index_dir)):
            self._ix = index.open_dir(str(self.index_dir))
        else:
            self._ix = index.create_in(str(self.index_dir), self._schema)

    def sync(self) -> None:
        # Build set of current .md files
        current: dict[str, float] = {}
        for f in self.vault_root.rglob("*.md"):
            if any(p.startswith(".") for p in f.relative_to(self.vault_root).parts):
                continue
            rel = str(f.relative_to(self.vault_root))
            current[rel] = f.stat().st_mtime

        writer = self._ix.writer()
        try:
            # Find indexed paths and their mtimes
            indexed: dict[str, float] = {}
            with self._ix.searcher() as s:
                for fields in s.all_stored_fields():
                    indexed[fields["path"]] = fields.get("last_modified", 0.0)

            # Delete removed or outdated
            for path, mtime in indexed.items():
                if path not in current or current[path] > mtime:
                    writer.delete_by_term("path", path)

            # Add/update
            for path, mtime in current.items():
                if path not in indexed or mtime > indexed.get(path, 0.0):
                    full = self.vault_root / path
                    try:
                        content = full.read_text("utf-8")
                    except Exception:
                        continue
                    writer.add_document(
                        path=path,
                        title=_note_title(path),
                        content=content,
                        tags=_extract_tags(content),
                        last_modified=mtime,
                    )
            writer.commit()
        except Exception:
            writer.cancel()
            raise

    def index_note(self, path_str: str, content: str) -> None:
        full = self.vault_root / path_str
        mtime = full.stat().st_mtime if full.exists() else time.time()
        writer = AsyncWriter(self._ix)
        writer.update_document(
            path=path_str,
            title=_note_title(path_str),
            content=content,
            tags=_extract_tags(content),
            last_modified=mtime,
        )
        writer.commit()

    def delete_note(self, path_str: str) -> None:
        writer = AsyncWriter(self._ix)
        writer.delete_by_term("path", path_str)
        writer.commit()

    def search(self, term: str, limit: int = 20) -> list[SearchResult]:
        results: list[SearchResult] = []
        with self._ix.searcher() as s:
            parser = MultifieldParser(["title", "content", "tags"], self._ix.schema, group=OrGroup)
            query = parser.parse(term)
            hits = s.search(query, limit=limit)
            hits.fragmenter.maxchars = 200
            hits.fragmenter.surround = 40
            for hit in hits:
                snippet = hit.highlights("content", text=hit.get("content", "")) or ""
                results.append(SearchResult(
                    path=hit["path"],
                    title=hit["title"],
                    snippet=snippet,
                    last_modified=hit.get("last_modified", 0.0),
                ))
        return results
