# **PRD: Real-Time Timer Sync MVP (Electron + Next.js + FastAPI)**

## 1. **Objective**

Enable real-time synchronization of a timer state across an Electron desktop app (macOS) and a Next.js web app. When a user starts/stops a timer on one client, the other client should reflect the update in under 5 seconds.

---

## 2. **Scope**

* Platforms: **Electron app** (macOS), **Next.js web app**.
* Features:

  1. Start a timer.
  2. Stop a timer.
  3. Sync timer state across clients in real-time.
* Out of Scope:

  * Offline mode.
  * Push notifications for backgrounded devices.
  * Multi-user collaboration (single user only).
  * Complex conflict resolution (use **last-write-wins**).

---

## 3. **Technical Requirements**

### **3.1 Server (FastAPI)**

* **Stack**: Python 3.11, FastAPI, Uvicorn, SQLite (for MVP).

* **Modules**:

  * `auth.py`: Dummy login endpoint, return JWT.
  * `timers.py`: REST + WebSocket endpoints.

* **Endpoints**:

  * `POST /login`: Accepts `{ username, password }`, returns JWT.
  * `GET /timers`: Returns current timer state from DB.
  * `WS /ws`: WebSocket connection authenticated with JWT.

* **WebSocket handling**:

  * Maintain `user_id → list of connected sockets`.
  * On `timer_start`/`timer_stop`:

    1. Persist state in DB.
    2. Broadcast updated timer to all connections of that `user_id`.

* **DB Schema** (SQLite MVP):

  ```sql
  CREATE TABLE timers (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    status TEXT NOT NULL,
    started_at TEXT,
    updated_at TEXT NOT NULL
  );
  ```

* **Message Contract**:

  * **Client → Server**:

    ```json
    {
      "action": "timer_start",
      "id": "uuid",
      "user_id": "u123",
      "started_at": "2025-09-15T20:15:00Z"
    }
    ```
  * **Server → Client** (broadcast):

    ```json
    {
      "event": "timer_updated",
      "payload": {
        "id": "uuid",
        "status": "running",
        "started_at": "2025-09-15T20:15:00Z",
        "updated_at": "2025-09-15T20:15:01Z"
      }
    }
    ```

---

### **3.2 Electron App (macOS)**

* **Stack**: Electron + React (for UI) + WebSocket client.
* **Features**:

  * Login → obtain JWT.
  * Connect to `/ws` with JWT.
  * Start/stop timer → send event to server.
  * Listen for broadcast → update UI.
  * On reconnect, call `GET /timers` to fetch state.

---

### **3.3 Web App (Next.js App Router)**

* **Stack**: Next.js (TypeScript, App Router), native WebSocket API.
* **Features**: same as Electron client.
* **Auth**: JWT stored in memory (not localStorage, for MVP simplicity).
* **Hooks**:

  * `useWebSocket(userId, token)` → manages socket connection & messages.
  * `useTimerState()` → provides state & actions (start, stop).

---

## 4. **Constraints**

* Latency: < 2s when clients connected.
* Scale: Single user, up to 2 clients.
* Persistence: SQLite local DB (replaceable later).
* No Kafka/Redis/infra beyond FastAPI + SQLite.

---

## 5. **Future Considerations**

* Add multi-user channels.
* Replace SQLite with Postgres for durability.
* Add background sync for iOS (via push notifications).
* Add conflict resolution beyond last-write-wins.
* Add pub/sub layer (Redis/Kafka) for horizontal scaling.

