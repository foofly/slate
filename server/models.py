from __future__ import annotations
from typing import Literal, Optional
from pydantic import BaseModel


class TreeItem(BaseModel):
    name: str
    path: str
    type: Literal["file", "folder"]
    children: Optional[list[TreeItem]] = None


TreeItem.model_rebuild()


class NoteRead(BaseModel):
    path: str
    content: str
    last_modified: float


class NoteWrite(BaseModel):
    content: str


class NoteCreate(BaseModel):
    content: str = ""


class NoteMove(BaseModel):
    new_path: str


class FolderMove(BaseModel):
    new_path: str


class SearchResult(BaseModel):
    path: str
    title: str
    snippet: str
    last_modified: float
