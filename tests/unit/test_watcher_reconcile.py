"""Unit tests for local watcher reconcile behavior."""

from __future__ import annotations

import asyncio
import os
import tempfile
from pathlib import Path

import pytest

from domain import watcher
from infra.db.sqlite import create_pool


@pytest.fixture
async def db_workspace():
    fd, path = tempfile.mkstemp(suffix=".db")
    os.close(fd)
    db = await create_pool(path)
    workspace = Path(tempfile.mkdtemp())
    await db.execute(
        "INSERT INTO workspace (id, name, user_id) VALUES ('w1', 'Test', 'u1')",
    )
    await db.commit()
    try:
        yield db, workspace
    finally:
        await db.close()
        try:
            os.unlink(path)
        except OSError:
            pass


@pytest.mark.asyncio
async def test_reconcile_treats_null_hash_as_existing_file(db_workspace, monkeypatch):
    db, workspace = db_workspace
    file_path = workspace / "wiki" / "note.md"
    file_path.parent.mkdir(parents=True, exist_ok=True)
    file_path.write_text("hello world v2", encoding="utf-8")

    await db.execute(
        "INSERT INTO documents (id, user_id, filename, title, path, relative_path, "
        "source_kind, file_type, file_size, status, content, tags, version, "
        "content_hash, mtime_ns, last_indexed_at, document_number) "
        "VALUES ('d1', 'u1', 'note.md', 'Note', '/wiki/', 'wiki/note.md', "
        "'wiki', 'md', 11, 'ready', 'hello world', '[]', 0, NULL, 1, datetime('now'), 1)",
    )
    await db.commit()

    called = 0

    async def fake_index(_db, _workspace, path):
        nonlocal called
        called += 1
        assert path == file_path

    monkeypatch.setattr(watcher, "_index_file", fake_index)

    await watcher.reconcile(db, workspace)

    assert called == 1
    status = watcher.get_sync_status()
    assert status["modified"] == 1


@pytest.mark.asyncio
async def test_index_file_uses_per_path_lock(db_workspace, monkeypatch):
    db, workspace = db_workspace
    file_path = workspace / "wiki" / "locked.md"
    file_path.parent.mkdir(parents=True, exist_ok=True)
    file_path.write_text("content", encoding="utf-8")

    entered = 0
    max_entered = 0

    async def fake_locked(_db, _workspace, path):
        nonlocal entered, max_entered
        assert path == file_path
        entered += 1
        max_entered = max(max_entered, entered)
        await asyncio.sleep(0.05)
        entered -= 1

    monkeypatch.setattr(watcher, "_index_file_locked", fake_locked)

    await asyncio.gather(
        watcher._index_file(db, workspace, file_path),
        watcher._index_file(db, workspace, file_path),
    )

    assert max_entered == 1

