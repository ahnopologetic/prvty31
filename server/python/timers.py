from __future__ import annotations

from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from .auth import AuthenticatedUser, get_current_user_creds
from .db import SessionLocal
from .models import Timer
from .schemas import TimerStateResponse

router = APIRouter(prefix="", tags=["timers"])


def get_db() -> Session:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/timers", response_model=Optional[TimerStateResponse])
def get_timer_state(
    current_user: AuthenticatedUser = Depends(get_current_user_creds),
    db: Session = Depends(get_db),
):
    stmt = (
        select(Timer)
        .where(Timer.user_id == current_user.user_id)
        .order_by(Timer.updated_at.desc())
        .limit(1)
    )
    row = db.execute(stmt).scalars().first()
    if not row:
        return None
    return TimerStateResponse(
        id=row.id,
        status=row.status,  # type: ignore[arg-type]
        started_at=row.started_at,
        updated_at=row.updated_at,
    )


def upsert_timer(
    db: Session,
    *,
    timer_id: str,
    user_id: str,
    status: str,
    started_at: Optional[str],
) -> Timer:
    existing = db.get(Timer, timer_id)
    now_iso = datetime.now(tz=timezone.utc).isoformat()
    if existing:
        existing.status = status
        existing.started_at = started_at
        existing.updated_at = now_iso
        db.add(existing)
        return existing
    timer = Timer(
        id=timer_id,
        user_id=user_id,
        status=status,
        started_at=started_at,
        updated_at=now_iso,
    )
    db.add(timer)
    return timer
