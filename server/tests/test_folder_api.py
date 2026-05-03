"""Tests for issue #3 — Cannot delete files (folders specifically)."""


async def test_delete_folder_returns_204(client):
    await client.post("/api/folders/my-folder")
    r = await client.delete("/api/folders/my-folder")
    assert r.status_code == 204


async def test_delete_folder_removes_it_from_tree(client):
    await client.post("/api/folders/my-folder")
    await client.delete("/api/folders/my-folder")
    tree = (await client.get("/api/tree")).json()
    assert not any(n["name"] == "my-folder" for n in tree)


async def test_delete_folder_removes_nested_notes(client):
    await client.post("/api/folders/parent")
    await client.post("/api/notes/parent/note.md", json={"content": "hello"})
    await client.delete("/api/folders/parent")
    tree = (await client.get("/api/tree")).json()
    assert tree == []


async def test_delete_folder_not_found_returns_404(client):
    r = await client.delete("/api/folders/nonexistent")
    assert r.status_code == 404


async def test_delete_folder_readonly_returns_403(client):
    from server import config
    await client.post("/api/folders/locked")
    config.readonly = True
    try:
        r = await client.delete("/api/folders/locked")
        assert r.status_code == 403
    finally:
        config.readonly = False


async def test_delete_folder_removes_notes_from_search_index(client):
    await client.post("/api/folders/searchable")
    await client.post("/api/notes/searchable/note.md", json={"content": "xyzuniquecontent123"})

    results = (await client.get("/api/search?q=xyzuniquecontent123")).json()
    assert len(results) > 0

    await client.delete("/api/folders/searchable")

    results = (await client.get("/api/search?q=xyzuniquecontent123")).json()
    assert len(results) == 0
