"""Sync status endpoint for local mode startup reconcile."""

from fastapi import APIRouter

from config import settings

router = APIRouter(tags=["sync"])


@router.get("/v1/sync-status")
async def sync_status():
    """Return current reconcile sync status. Local mode only."""
    if settings.MODE != "local":
        return {"syncing": False, "new": 0, "modified": 0, "deleted": 0, "scanned": 0, "total": 0}

    from domain.watcher import get_sync_status
    return get_sync_status()
