from __future__ import annotations

import json
import uuid
from typing import Annotated, Optional

from fastapi import Depends, FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy import text

from auth import AuthenticatedUser, create_access_token, decode_token, get_current_user_creds
from db import engine
from models import Base
from schemas import ClientMessage, LoginRequest, LoginResponse, TimerMessage, TimerPayload
from timers import router as timers_router, upsert_timer
from ws import manager
from db import SessionLocal

app = FastAPI(title="Timer Sync API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"]
    ,
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup() -> None:
    Base.metadata.create_all(bind=engine)


@app.post("/login", response_model=LoginResponse)
async def login(body: LoginRequest) -> LoginResponse:
    # Dummy auth: accept any username/password, derive a deterministic user_id for MVP
    username = body.username.strip() or "user"
    user_id = str(uuid.uuid5(uuid.NAMESPACE_DNS, f"timerapp:{username}"))
    token = create_access_token(user_id=user_id, username=username)
    return LoginResponse(token=token, user_id=user_id)  # type: ignore[arg-type]


app.include_router(timers_router)


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket, token: Optional[str] = None) -> None:
    # Expect token as query param ?token=... per PRD auth via JWT
    if not token:
        await websocket.close(code=4401)
        return
    try:
        data = decode_token(token)
        user_id = data.get("sub")
        username = data.get("username")
        if not user_id:
            await websocket.close(code=4401)
            return
    except HTTPException:
        await websocket.close(code=4401)
        return

    await manager.connect(user_id, websocket)
    try:
        while True:
            text_data = await websocket.receive_text()
            parsed = json.loads(text_data)
            msg = ClientMessage(**parsed)

            # Persist then broadcast per PRD
            with SessionLocal() as db:
                if msg.action == "timer_start":
                    saved = upsert_timer(
                        db,
                        timer_id=msg.id,
                        user_id=msg.user_id,
                        status="running",
                        started_at=msg.started_at,
                    )
                elif msg.action == "timer_stop":
                    saved = upsert_timer(
                        db,
                        timer_id=msg.id,
                        user_id=msg.user_id,
                        status="stopped",
                        started_at=None,
                    )
                else:
                    continue
                db.commit()
                payload = TimerPayload(
                    id=saved.id,
                    status=saved.status,  # type: ignore[arg-type]
                    started_at=saved.started_at,
                    updated_at=saved.updated_at,
                )
                server_msg = TimerMessage(event="timer_updated", payload=payload)
                await manager.broadcast_to_user(user_id, server_msg.model_dump_json(by_alias=True))
    except WebSocketDisconnect:
        manager.disconnect(user_id, websocket)
    except Exception:
        manager.disconnect(user_id, websocket)
        await websocket.close(code=1011)
