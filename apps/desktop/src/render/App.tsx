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

  const login = async () => {
    const auth = await apiLogin(username, password)
    setToken(auth.token)
    setUserId(auth.user_id)
    await fetchState()
    connectWs()
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
    <div className="font-sans antialiased text-center text-slate-700 pt-16 md:pt-16 pt-5 min-h-screen bg-gradient-main p-5 md:p-5 p-2.5">
      <h1 className="text-slate-700 font-light text-4xl md:text-4xl text-3xl mb-8 drop-shadow-sm">Timer (Electron)</h1>
      {!token
        ? (
            <div className="space-y-4">
              <input
                className="input-field"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="username"
              />
              <input
                className="input-field"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="password"
                type="password"
              />
              <div className="mt-4">
                <button className="primary-btn" onClick={login}>Login</button>
              </div>
            </div>
          )
        : (
            <div>
              <div className="flex md:flex-row flex-col justify-center items-center gap-4 mb-8">
                <button
                  className={`nav-btn md:w-auto w-48 ${currentView === 'dashboard' ? 'active' : ''}`}
                  onClick={() => setCurrentView('dashboard')}
                >
                  Dashboard
                </button>
                <button
                  className={`nav-btn md:w-auto w-48 ${currentView === 'timer' ? 'active' : ''}`}
                  onClick={() => setCurrentView('timer')}
                >
                  Analog Timer
                </button>
              </div>

              <div className="dashboard-card md:p-8 p-5">
                <p className="dashboard-text">
                  <span className="dashboard-label">User:</span>
                  {' '}
                  {userId}
                </p>
                <p className="dashboard-text">
                  <span className="dashboard-label">Timer ID:</span>
                  {' '}
                  {timerId}
                </p>
                <p className="dashboard-text">
                  <span className="dashboard-label">Status:</span>
                  {' '}
                  {status}
                </p>
                <p className="dashboard-text">
                  <span className="dashboard-label">Started:</span>
                  {' '}
                  {startedAt ?? '-'}
                </p>
                <p className="dashboard-text">
                  <span className="dashboard-label">Updated:</span>
                  {' '}
                  {updatedAt ?? '-'}
                </p>
                <div className="mt-6">
                  <button className="primary-btn" onClick={startTimer}>Start</button>
                  <button className="primary-btn" onClick={stopTimer}>Stop</button>
                  <button className="primary-btn" onClick={fetchState}>Refresh</button>
                </div>

                <div className="quick-access-card">
                  <p>
                    Try the new
                    <button className="link-btn ml-1 mr-1" onClick={() => setCurrentView('timer')}>Analog Timer</button>
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
