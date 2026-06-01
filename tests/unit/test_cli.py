import importlib.machinery
import importlib.util
import os
import sqlite3
import sys
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[2]


def load_cli():
    loader = importlib.machinery.SourceFileLoader("llmwiki_cli_under_test", str(REPO_ROOT / "llmwiki"))
    spec = importlib.util.spec_from_loader(loader.name, loader)
    module = importlib.util.module_from_spec(spec)
    loader.exec_module(module)
    return module


def test_cmd_init_creates_local_workspace(tmp_path):
    cli = load_cli()
    workspace = tmp_path / "research"

    cli.cmd_init(str(workspace))

    db_path = workspace / ".llmwiki" / "index.db"
    assert db_path.is_file()
    assert (workspace / "wiki" / "overview.md").is_file()
    assert (workspace / "wiki" / "log.md").is_file()

    conn = sqlite3.connect(str(db_path))
    try:
        table_names = {
            row[0]
            for row in conn.execute(
                "SELECT name FROM sqlite_master WHERE type IN ('table', 'view')"
            )
        }
        assert "document_references" in table_names
        paths = {
            row[0]
            for row in conn.execute(
                "SELECT relative_path FROM documents ORDER BY relative_path"
            )
        }
        assert {"wiki/overview.md", "wiki/log.md"} <= paths
    finally:
        conn.close()


def test_cmd_mcp_execs_local_server_from_mcp_dir(tmp_path, monkeypatch):
    cli = load_cli()
    workspace = tmp_path / "research"
    (workspace / ".llmwiki").mkdir(parents=True)
    (workspace / ".llmwiki" / "index.db").touch()
    monkeypatch.setenv("LLMWIKI_TEST_ENV", "preserved")

    calls = {}

    def fake_chdir(path):
        calls["cwd"] = Path(path)

    def fake_execvpe(executable, args, env):
        calls["executable"] = executable
        calls["args"] = args
        calls["env"] = env

    monkeypatch.setattr(cli.os, "chdir", fake_chdir)
    monkeypatch.setattr(cli.os, "execvpe", fake_execvpe)

    cli.cmd_mcp(str(workspace))

    assert calls["cwd"] == cli.MCP_DIR
    assert calls["executable"] == sys.executable
    assert calls["args"] == [
        sys.executable,
        "-m",
        "local_server",
        "--workspace",
        str(workspace.resolve()),
    ]
    assert calls["env"]["LLMWIKI_TEST_ENV"] == "preserved"
    assert os.environ["LLMWIKI_TEST_ENV"] == "preserved"
