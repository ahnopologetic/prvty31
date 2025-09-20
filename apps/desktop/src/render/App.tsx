import type { TimerState } from './api/index'
import React, { useEffect, useRef, useState } from 'react'
import { apiGetTimer, apiLogin, connectTimerWs } from './api/index'
import TimerPage from './components/TimerPage'
import './App.css'

const App: React.FC = () => {
  const [username, setUsername] = useState('demo')
  const [password, setPassword] = useState('demo')
  const [token, setToken] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [timerId, setTimerId] = useState('demo-timer')
  const [status, setStatus] = useState<'running' | 'stopped'>('stopped')
  const [startedAt, setStartedAt] = useState<string | null>(null)
  const [updatedAt, setUpdatedAt] = useState<string | null>(null)
  const [currentView, setCurrentView] = useState<'dashboard' | 'timer'>('dashboard')

  const wsRef = useRef<ReturnType<typeof connectTimerWs> | null>(null)

  const login = async () => {
    const auth = await apiLogin(username, password)
    setToken(auth.token)
    setUserId(auth.user_id)
    await fetchState()
    connectWs()
  }

  const fetchState = async () => {
    if (!token)
      return
    const state: TimerState = await apiGetTimer(token)
    if (state) {
      setStatus(state.status)
      setStartedAt(state.started_at)
      setUpdatedAt(state.updated_at)
      if (state.id)
        setTimerId(state.id)
    }
  }

  const connectWs = () => {
    if (!token)
      return
    wsRef.current = connectTimerWs(token, (data) => {
      if (data?.event === 'timer_updated') {
        const p = data.payload
        setStatus(p.status)
        setStartedAt(p.started_at ?? null)
        setUpdatedAt(p.updated_at)
        if (p.id)
          setTimerId(p.id)
      }
    })
  }

  const startTimer = () => {
    if (!wsRef.current || !userId)
      return
    wsRef.current.sendStart(timerId, userId, new Date().toISOString())
  }

  const stopTimer = () => {
    if (!wsRef.current || !userId)
      return
    wsRef.current.sendStop(timerId, userId)
  }

  useEffect(() => {
    return () => {
      if (wsRef.current?.socket?.readyState === WebSocket.OPEN) {
        wsRef.current.socket.close()
      }
    }
  }, [])

  // Show timer page if user is logged in and selected timer view
  if (token && userId && currentView === 'timer') {
    return (
      <TimerPage
        token={token}
        userId={userId}
        onBack={() => setCurrentView('dashboard')}
      />
    )
  }

  return (
    <div id="app">
      <h1>Timer (Electron)</h1>
      {!token
        ? (
            <div>
              <input
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="username"
              />
              <input
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="password"
                type="password"
              />
              <button onClick={login}>Login</button>
            </div>
          )
        : (
            <div>
              <div className="navigation">
                <button
                  className={`nav-btn ${currentView === 'dashboard' ? 'active' : ''}`}
                  onClick={() => setCurrentView('dashboard')}
                >
                  Dashboard
                </button>
                <button
                  className={`nav-btn ${currentView === 'timer' ? 'active' : ''}`}
                  onClick={() => setCurrentView('timer')}
                >
                  Analog Timer
                </button>
              </div>

              <div className="dashboard-content">
                <p>
                  <strong>User:</strong>
                  {' '}
                  {userId}
                </p>
                <p>
                  <strong>Timer ID:</strong>
                  {' '}
                  {timerId}
                </p>
                <p>
                  <strong>Status:</strong>
                  {' '}
                  {status}
                </p>
                <p>
                  <strong>Started:</strong>
                  {' '}
                  {startedAt ?? '-'}
                </p>
                <p>
                  <strong>Updated:</strong>
                  {' '}
                  {updatedAt ?? '-'}
                </p>
                <div>
                  <button onClick={startTimer}>Start</button>
                  <button onClick={stopTimer}>Stop</button>
                  <button onClick={fetchState}>Refresh</button>
                </div>

                <div className="quick-access">
                  <p>
                    Try the new
                    <button className="link-btn" onClick={() => setCurrentView('timer')}>Analog Timer</button>
                    {' '}
                    for a better visual experience!
                  </p>
                </div>
              </div>
            </div>
          )}
    </div>
  )
}

export default App
