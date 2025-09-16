"use client";

import { useEffect, useMemo, useRef, useState } from "react";

const BASE_URL = "http://localhost:8000";

type LoginResponse = { token: string; token_type: string; user_id: string };

type TimerState =
  | {
      id: string;
      status: "running" | "stopped";
      started_at: string | null;
      updated_at: string;
    }
  | null;

export default function Home() {
  const [username, setUsername] = useState("demo");
  const [password, setPassword] = useState("demo");
  const [token, setToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [timerId, setTimerId] = useState<string>("demo-timer");
  const [status, setStatus] = useState<"running" | "stopped">("stopped");
  const [startedAt, setStartedAt] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  async function login() {
    const res = await fetch(`${BASE_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) throw new Error("Login failed");
    const data: LoginResponse = await res.json();
    setToken(data.token);
    setUserId(data.user_id);
  }

  async function fetchState(tok: string) {
    const res = await fetch(`${BASE_URL}/timers`, {
      headers: { Authorization: `Bearer ${tok}` },
    });
    if (!res.ok) throw new Error("Fetch timer failed");
    const data: TimerState = await res.json();
    if (data) {
      setStatus(data.status);
      setStartedAt(data.started_at);
      setUpdatedAt(data.updated_at);
      if (data.id) setTimerId(data.id);
    }
  }

  function connectWs(tok: string) {
    const ws = new WebSocket(`ws://localhost:8000/ws?token=${encodeURIComponent(tok)}`);
    ws.onmessage = (ev) => {
      try {
        const data = JSON.parse(ev.data);
        if (data?.event === "timer_updated") {
          const p = data.payload;
          setStatus(p.status);
          setStartedAt(p.started_at ?? null);
          setUpdatedAt(p.updated_at);
          if (p.id) setTimerId(p.id);
        }
      } catch {}
    };
    wsRef.current = ws;
  }

  function startTimer() {
    if (!wsRef.current || !userId) return;
    wsRef.current.send(
      JSON.stringify({ action: "timer_start", id: timerId, user_id: userId, started_at: new Date().toISOString() })
    );
  }

  function stopTimer() {
    if (!wsRef.current || !userId) return;
    wsRef.current.send(JSON.stringify({ action: "timer_stop", id: timerId, user_id: userId }));
  }

  useEffect(() => {
    if (!token) return;
    fetchState(token).catch(() => {});
    connectWs(token);
    return () => {
      if (wsRef.current?.readyState === WebSocket.OPEN) wsRef.current.close();
    };
  }, [token]);

  return (
    <div style={{ fontFamily: "sans-serif", maxWidth: 560, margin: "40px auto" }}>
      <h1>Timer (Web)</h1>
      {!token ? (
        <div style={{ display: "flex", gap: 8 }}>
          <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="username" />
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="password"
            type="password"
          />
          <button onClick={login}>Login</button>
        </div>
      ) : (
        <div>
          <p>
            <strong>User:</strong> {userId}
          </p>
          <p>
            <strong>Timer ID:</strong> {timerId}
          </p>
          <p>
            <strong>Status:</strong> {status}
          </p>
          <p>
            <strong>Started:</strong> {startedAt ?? "-"}
          </p>
          <p>
            <strong>Updated:</strong> {updatedAt ?? "-"}
          </p>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={startTimer}>Start</button>
            <button onClick={stopTimer}>Stop</button>
            <button onClick={() => token && fetchState(token)}>Refresh</button>
          </div>
        </div>
      )}
    </div>
  );
}
