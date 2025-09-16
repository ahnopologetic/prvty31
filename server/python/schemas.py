from __future__ import annotations

from typing import Literal, Optional

from pydantic import BaseModel, Field


class LoginRequest(BaseModel):
    username: str
    password: str


class LoginResponse(BaseModel):
    token: str = Field(..., alias="token")
    token_type: str = "bearer"
    user_id: str


class TimerPayload(BaseModel):
    id: str
    status: Literal["running", "stopped"]
    started_at: Optional[str] = None
    updated_at: str


class TimerMessage(BaseModel):
    event: Literal["timer_updated"]
    payload: TimerPayload


class ClientMessage(BaseModel):
    action: Literal["timer_start", "timer_stop"]
    id: str
    user_id: str
    started_at: Optional[str] = None


class TimerStateResponse(BaseModel):
    id: str
    status: Literal["running", "stopped"]
    started_at: Optional[str] = None
    updated_at: str
