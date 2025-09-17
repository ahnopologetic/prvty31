import { ipcInstance } from '@render/plugins'

export function sendMsgToMainProcess(msg: string) {
  return ipcInstance.send<string>('send-msg', msg)
}

const BASE_HTTP_URL = process.env.BASE_URL ?? 'http://localhost:8000'
const BASE_WS_URL = process.env.BASE_WS_URL ?? 'ws://localhost:8000'

export type LoginResponse = {
  token: string
  token_type: string
  user_id: string
}

export type TimerState = {
  id: string
  status: 'running' | 'stopped'
  started_at: string | null
  updated_at: string
} | null

export async function apiLogin(username: string, password: string): Promise<LoginResponse> {
  const res = await fetch(`${BASE_HTTP_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  })
  if (!res.ok) throw new Error('Login failed')
  return res.json()
}

export async function apiGetTimer(token: string): Promise<TimerState> {
  const res = await fetch(`${BASE_HTTP_URL}/timers`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error('Fetch timer failed')
  return res.json()
}

export type TimerWs = {
  socket: WebSocket
  sendStart: (id: string, userId: string, startedAtISO: string) => void
  sendStop: (id: string, userId: string) => void
}

export function connectTimerWs(token: string, onMessage: (data: any) => void): TimerWs {
  const ws = new WebSocket(`${BASE_WS_URL}/ws?token=${encodeURIComponent(token)}`)
  ws.onmessage = (ev) => {
    try {
      const data = JSON.parse(ev.data)
      onMessage(data)
    } catch (_) {
      // ignore
    }
  }
  return {
    socket: ws,
    sendStart: (id: string, userId: string, startedAtISO: string) => {
      ws.send(JSON.stringify({ action: 'timer_start', id, user_id: userId, started_at: startedAtISO }))
    },
    sendStop: (id: string, userId: string) => {
      ws.send(JSON.stringify({ action: 'timer_stop', id, user_id: userId }))
    },
  }
}
