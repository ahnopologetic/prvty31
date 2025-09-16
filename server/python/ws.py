from __future__ import annotations

from collections import defaultdict
from typing import Dict, List

from fastapi import WebSocket


class ConnectionManager:
    def __init__(self) -> None:
        self.user_connections: Dict[str, List[WebSocket]] = defaultdict(list)

    async def connect(self, user_id: str, websocket: WebSocket) -> None:
        await websocket.accept()
        self.user_connections[user_id].append(websocket)

    def disconnect(self, user_id: str, websocket: WebSocket) -> None:
        if user_id in self.user_connections and websocket in self.user_connections[user_id]:
            self.user_connections[user_id].remove(websocket)
            if not self.user_connections[user_id]:
                del self.user_connections[user_id]

    async def broadcast_to_user(self, user_id: str, message_text: str) -> None:
        connections = list(self.user_connections.get(user_id, []))
        for ws in connections:
            try:
                await ws.send_text(message_text)
            except Exception:
                # Best-effort cleanup on failed send
                self.disconnect(user_id, ws)


manager = ConnectionManager()
