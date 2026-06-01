"""Filesystem watcher for local mode.

Watches the workspace for file changes and updates the SQLite index.
Uses watchfiles for efficient cross-platform filesystem monitoring.

Key design rules:
- App-initiated writes register in _recently_written to prevent re-indexing loops
- Hidden dirs (.llmwiki, .git, node_modules, etc.) are ignored
- File identity is by path — rename = delete old + create new
"""

import asyncio
import hashlib
import json
import logging
import os
import time
import uuid
from pathlib import Path

import aiosqlite

logger = logging.getLogger(__name__)

IGNORE_DIRS = frozenset({
    ".llmwiki", ".git", "node_modules", "__pycache__", ".venv", "venv",
    ".idea", ".vscode", ".DS_Store",
})

TEXT_EXTENSIONS = frozenset({
    "md", "txt", "csv", "html", "svg", "json", "xml", "yaml", "yml",
    "toml", "ini", "cfg", "rst", "tex", "latex",
})

COOLDOWN_SECONDS = 2.0

_ignore_patterns: list[str] | None = None
_file_locks: dict[str, asyncio.Lock] = {}

# Module-level sync status for the /v1/sync-status endpoint
_sync_status: dict = {
    "syncing": False,
    "new": 0,
    "modified": 0,
    "deleted": 0,
    "scanned": 0,
    "total": 0,
}


def _to_virtual(relative: str) -> str:
    return relative.replace("\\", "/")


def get_sync_status() -> dict:
    """Return a copy of the current sync status."""
    return dict(_sync_status)


def _load_ignore_patterns(workspace: Path) -> list[str]:
    """Load ignore patterns from .llmwikiignore, falling back to .gitignore."""
    global _ignore_patterns
    if _ignore_patterns is not None:
        return _ignore_patterns

    patterns = []
    for ignore_file in (".llmwikiignore", ".gitignore"):
        p = workspace / ignore_file
        if p.is_file():
            for line in p.read_text().splitlines():
                line = line.strip()
                if line and not line.startswith("#"):
                    patterns.append(line)
            break  # Use first found, don't merge
    _ignore_patterns = patterns
    return patterns


def _matches_ignore_pattern(relative: str, patterns: list[str]) -> bool:
    """Simple gitignore-style matching (directory and glob patterns)."""
    from fnmatch import fnmatch
    for pattern in patterns:
        pattern = pattern.rstrip("/")
        if fnmatch(relative, pattern):
            return True
        if fnmatch(relative, f"**/{pattern}"):
            return True
        # Check if any path component matches a directory pattern
        for part in relative.split("/"):
            if fnmatch(part, pattern):
                return True
    return False

# Paths written by the app — skip re-indexing for these
_recently_written: dict[str, float] = {}


def mark_written(path: str) -> None:
    """Mark a path as recently written by the app. Watcher will skip it."""
    _recently_written[str(Path(path).resolve())] = time.monotonic()


def _is_recently_written(path: str) -> bool:
    resolved = str(Path(path).resolve())
    ts = _recently_written.get(resolved)
    if ts and (time.monotonic() - ts) < COOLDOWN_SECONDS:
        return True
    _recently_written.pop(resolved, None)
    return False


def _should_ignore(path: Path, workspace: Path) -> bool:
    """Check if a path should be ignored based on directory rules + ignore files."""
    try:
        relative = path.relative_to(workspace)
    except ValueError:
        return True

    relative_str = _to_virtual(str(relative))
    parts = relative.parts

    # Built-in ignores
    for part in parts:
        if part in IGNORE_DIRS or part.startswith("."):
            return True

    # User-configured ignore patterns
    patterns = _load_ignore_patterns(workspace)
    if patterns and _matches_ignore_pattern(relative_str, patterns):
        return True

    return False


def _get_source_kind(relative_path: str) -> str:
    if relative_path.startswith("wiki/"):
        return "wiki"
    return "source"


def _file_lock_key(workspace: Path, file_path: Path) -> str:
    try:
        return _to_virtual(str(file_path.relative_to(workspace)))
    except ValueError:
        return str(file_path.resolve())


def _get_file_lock(workspace: Path, file_path: Path) -> asyncio.Lock:
    key = _file_lock_key(workspace, file_path)
    lock = _file_locks.get(key)
    if lock is None:
        lock = asyncio.Lock()
        _file_locks[key] = lock
    return lock


async def _index_file(db: aiosqlite.Connection, workspace: Path, file_path: Path) -> None:
    """Index or re-index a single file."""
    async with _get_file_lock(workspace, file_path):
        await _index_file_locked(db, workspace, file_path)


async def _index_file_locked(db: aiosqlite.Connection, workspace: Path, file_path: Path) -> None:
    relative = _to_virtual(str(file_path.relative_to(workspace)))
    filename = file_path.name
    ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""

    parts = relative.split("/")
    if len(parts) > 1:
        dir_path = "/" + "/".join(parts[:-1]) + "/"
    else:
        dir_path = "/"

    source_kind = _get_source_kind(relative)
    stat = file_path.stat()

    # Derive title
    stem = filename.rsplit(".", 1)[0] if "." in filename else filename
    title = stem.replace("-", " ").replace("_", " ").strip().title()

    # Read content for text files
    content = None
    if ext in TEXT_EXTENSIONS:
        try:
            content = file_path.read_text(encoding="utf-8", errors="replace")
        except Exception:
            pass

    content_hash = None
    if stat.st_size < 100_000_000:
        try:
            content_hash = hashlib.sha256(file_path.read_bytes()).hexdigest()
        except Exception:
            pass

    # Check if document already exists at this path
    cursor = await db.execute(
        "SELECT id, content_hash, file_size, mtime_ns FROM documents WHERE relative_path = ?",
        (relative,),
    )
    existing = await cursor.fetchone()

    if existing:
        doc_id, old_hash, old_size, old_mtime_ns = existing
        unchanged = (
            old_hash == content_hash
            if old_hash is not None and content_hash is not None
            else old_size == stat.st_size and old_mtime_ns == int(stat.st_mtime_ns)
        )
        if unchanged:
            return  # No change
        # Update existing
        await db.execute(
            "UPDATE documents SET content = ?, file_size = ?, content_hash = ?, "
            "mtime_ns = ?, last_indexed_at = datetime('now'), "
            "updated_at = datetime('now'), version = version + 1 "
            "WHERE id = ?",
            (content, stat.st_size, content_hash, int(stat.st_mtime_ns), doc_id),
        )
        await db.commit()
        logger.info("Re-indexed (modified): %s", relative)
        # Re-process non-text files
        if ext not in TEXT_EXTENSIONS and ext:
            from domain.local_processor import process_document as _process
            import asyncio
            asyncio.create_task(_process(db, doc_id, workspace))
        return
    else:
        # Create new
        doc_id = str(uuid.uuid4())
        cursor = await db.execute(
            "SELECT COALESCE(MAX(document_number), 0) + 1 FROM documents",
        )
        row = await cursor.fetchone()
        doc_number = row[0]

        status = "ready" if content is not None else "pending"
        await db.execute(
            "INSERT INTO documents (id, user_id, filename, title, path, relative_path, "
            "source_kind, file_type, file_size, status, content, tags, version, "
            "content_hash, mtime_ns, last_indexed_at, document_number) "
            "VALUES (?, (SELECT user_id FROM workspace LIMIT 1), ?, ?, ?, ?, ?, ?, ?, "
            "?, ?, '[]', 0, ?, ?, datetime('now'), ?)",
            (doc_id, filename, title, dir_path, relative, source_kind,
             ext or "bin", stat.st_size, status, content, content_hash,
             int(stat.st_mtime_ns), doc_number),
        )
        logger.info("Indexed (new): %s", relative)
        # Process non-text files (PDFs, spreadsheets, images, HTML)
        if status == "pending":
            from domain.local_processor import process_document as _process
            import asyncio
            asyncio.create_task(_process(db, doc_id, workspace))

    await db.commit()


async def _remove_file(db: aiosqlite.Connection, workspace: Path, file_path: Path) -> None:
    """Remove a file from the index."""
    async with _get_file_lock(workspace, file_path):
        await _remove_file_locked(db, workspace, file_path)


async def _remove_file_locked(db: aiosqlite.Connection, workspace: Path, file_path: Path) -> None:
    try:
        relative = _to_virtual(str(file_path.relative_to(workspace)))
    except ValueError:
        return

    cursor = await db.execute(
        "DELETE FROM documents WHERE relative_path = ?", (relative,),
    )
    if cursor.rowcount > 0:
        await db.commit()
        logger.info("Removed from index: %s", relative)


async def watch_workspace(db: aiosqlite.Connection, workspace: Path) -> None:
    """Watch the workspace for file changes and update the SQLite index.

    Runs indefinitely as an async task. Cancel to stop.
    """
    from watchfiles import awatch, Change

    logger.info("File watcher started: %s", workspace)

    async for changes in awatch(
        str(workspace),
        watch_filter=lambda change, path: not _should_ignore(Path(path), workspace),
        debounce=500,
        step=200,
    ):
        for change_type, path_str in changes:
            path = Path(path_str)

            if _should_ignore(path, workspace):
                continue

            if _is_recently_written(path_str):
                continue

            try:
                if change_type == Change.added or change_type == Change.modified:
                    if path.is_file():
                        await _index_file(db, workspace, path)
                elif change_type == Change.deleted:
                    await _remove_file(db, workspace, path)
            except Exception as e:
                logger.warning("Watcher error for %s: %s", path_str, e)

        # Clean up expired entries from _recently_written
        now = time.monotonic()
        expired = [k for k, v in _recently_written.items() if now - v > COOLDOWN_SECONDS * 2]
        for k in expired:
            _recently_written.pop(k, None)


async def reconcile(db: aiosqlite.Connection, workspace: Path) -> None:
    """Startup reconcile: compare disk to DB for wiki/ and sources/ dirs.

    Detects new files, modified files (by content_hash), and deleted files.
    Runs once at startup, in parallel with the watchfiles watcher.
    """
    global _sync_status
    _sync_status = {
        "syncing": True,
        "new": 0,
        "modified": 0,
        "deleted": 0,
        "scanned": 0,
        "total": 0,
    }

    try:
        # 1. Load all tracked files from DB
        cursor = await db.execute(
            "SELECT relative_path, content_hash, file_size, mtime_ns FROM documents"
        )
        rows = await cursor.fetchall()
        db_files: dict[str, tuple[str | None, int | None, int | None]] = {
            row[0]: (row[1], row[2], row[3]) for row in rows
        }

        # 2. Collect all files on disk under wiki/ and sources/
        disk_files: dict[str, Path] = {}
        for scan_dir in ("wiki", "sources"):
            dir_path = workspace / scan_dir
            if not dir_path.is_dir():
                continue
            for root, dirs, files in os.walk(dir_path):
                # Apply same ignore filtering as watcher
                rel_root = Path(root).relative_to(workspace)
                if any(p in IGNORE_DIRS or p.startswith(".") for p in rel_root.parts):
                    dirs.clear()
                    continue
                dirs[:] = [d for d in dirs if d not in IGNORE_DIRS and not d.startswith(".")]

                for fname in files:
                    if fname.startswith("."):
                        continue
                    full_path = Path(root) / fname
                    if _should_ignore(full_path, workspace):
                        continue
                    relative = _to_virtual(str(full_path.relative_to(workspace)))
                    disk_files[relative] = full_path

        _sync_status["total"] = len(disk_files)

        # 3. Detect deleted files (in DB but not on disk)
        disk_relative = set(disk_files.keys())
        for relative in set(db_files.keys()) - disk_relative:
            if not (relative.startswith("wiki/") or relative.startswith("sources/")):
                continue
            try:
                await _remove_file(db, workspace, workspace / relative)
                _sync_status["deleted"] += 1
            except Exception as e:
                logger.warning("Reconcile: failed to remove %s: %s", relative, e)

        # 4. Process all files on disk (new + modified)
        for relative, full_path in disk_files.items():
            _sync_status["scanned"] += 1
            try:
                if not full_path.is_file():
                    continue

                # Check if file is new or modified
                if relative not in db_files:
                    # New file
                    await _index_file(db, workspace, full_path)
                    _sync_status["new"] += 1
                else:
                    # Existing file — check hash, falling back to stat metadata
                    old_hash, old_size, old_mtime_ns = db_files[relative]
                    current_hash = None
                    stat = full_path.stat()
                    if stat.st_size < 100_000_000:
                        try:
                            current_hash = hashlib.sha256(full_path.read_bytes()).hexdigest()
                        except Exception:
                            pass
                    changed = (
                        current_hash != old_hash
                        if current_hash is not None and old_hash is not None
                        else old_size != stat.st_size or old_mtime_ns != int(stat.st_mtime_ns)
                    )
                    if changed:
                        await _index_file(db, workspace, full_path)
                        _sync_status["modified"] += 1
            except Exception as e:
                logger.warning("Reconcile: failed to index %s: %s", relative, e)

        logger.info(
            "Reconcile complete: %d new, %d modified, %d deleted, %d scanned",
            _sync_status["new"], _sync_status["modified"],
            _sync_status["deleted"], _sync_status["scanned"],
        )
    finally:
        _sync_status["syncing"] = False
