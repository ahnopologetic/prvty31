import type { AnalogTimerRef } from '@prvty31/components'
import type { TimerState } from '../api/index'
import { AnalogTimer } from '@prvty31/components'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { apiGetTimer, connectTimerWs } from '../api/index'
import '@prvty31/components/styles'

interface TimerPageProps {
  token: string
  userId: string
  onBack: () => void
}

export const TimerPage: React.FC<TimerPageProps> = ({ token, userId, onBack }) => {
  const [timerId, setTimerId] = useState('demo-timer')
  const [status, setStatus] = useState<'running' | 'stopped'>('stopped')
  const [startedAt, setStartedAt] = useState<string | null>(null)
  const [updatedAt, setUpdatedAt] = useState<string | null>(null)
  const [selectedMinutes, setSelectedMinutes] = useState(25)
  const [currentSessionMinutes, setCurrentSessionMinutes] = useState(25)
  const [remainingSeconds, setRemainingSeconds] = useState(0)
  const [progressMode, setProgressMode] = useState<'sector' | 'arc'>('sector')

  const timerRef = useRef<AnalogTimerRef>(null)
  const wsRef = useRef<ReturnType<typeof connectTimerWs> | null>(null)
  const sessionStartTime = useRef<number>(0)

  // Fetch initial timer state
  const fetchState = useCallback(async () => {
    try {
      const state: TimerState = await apiGetTimer(token)
      if (state) {
        setStatus(state.status)
        setStartedAt(state.started_at)
        setUpdatedAt(state.updated_at)
        if (state.id)
          setTimerId(state.id)

        // If timer is running, calculate remaining time
        if (state.status === 'running' && state.started_at) {
          const startTime = new Date(state.started_at).getTime()
          const now = Date.now()
          const elapsedSeconds = Math.floor((now - startTime) / 1000)
          const remaining = Math.max(0, currentSessionMinutes * 60 - elapsedSeconds)
          setRemainingSeconds(remaining)
        }
      }
    }
    catch (error) {
      console.error('Failed to fetch timer state:', error)
    }
  }, [token, currentSessionMinutes])

  // Connect to WebSocket
  const connectWs = useCallback(() => {
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

        // Update timer display based on backend state
        if (p.status === 'running' && p.started_at) {
          const startTime = new Date(p.started_at).getTime()
          sessionStartTime.current = startTime
        }
        else if (p.status === 'stopped') {
          // Reset timer when stopped from backend
          timerRef.current?.reset()
        }
      }
    })
  }, [token])

  // Initialize connection
  useEffect(() => {
    fetchState()
    connectWs()

    return () => {
      if (wsRef.current?.socket?.readyState === WebSocket.OPEN) {
        wsRef.current.socket.close()
      }
    }
  }, [fetchState, connectWs])

  const handleStopTimer = () => {
    if (!wsRef.current || !userId)
      return

    // Stop the analog timer
    timerRef.current?.pause()

    // Notify backend
    wsRef.current.sendStop(timerId, userId)
  }

  const stopTimer = handleStopTimer

  // Sync with backend timer when running
  useEffect(() => {
    if (status === 'running' && startedAt && sessionStartTime.current > 0) {
      const interval = setInterval(() => {
        const now = Date.now()
        const elapsedSeconds = Math.floor((now - sessionStartTime.current) / 1000)
        const remaining = Math.max(0, currentSessionMinutes * 60 - elapsedSeconds)

        if (remaining === 0) {
          // Timer completed
          handleStopTimer()
        }
      }, 1000)

      return () => clearInterval(interval)
    }
  }, [status, startedAt, currentSessionMinutes])

  const startTimer = () => {
    if (!wsRef.current || !userId)
      return

    // Set the timer duration and start it
    setCurrentSessionMinutes(selectedMinutes)
    sessionStartTime.current = Date.now()

    // Start the analog timer
    timerRef.current?.setTime(selectedMinutes)
    timerRef.current?.start()

    // Notify backend
    wsRef.current.sendStart(timerId, userId, new Date().toISOString())
  }

  const resetTimer = () => {
    // Reset the analog timer
    timerRef.current?.reset()
    timerRef.current?.setTime(selectedMinutes)

    // Stop backend timer if running
    if (status === 'running') {
      stopTimer()
    }
  }

  const handleTimerComplete = () => {
    // Timer completed naturally
    stopTimer()
    // You could add notification, sound, etc. here
    // eslint-disable-next-line no-alert
    alert('Timer completed! Take a break.')
  }

  const handleTimeUpdate = (seconds: number) => {
    setRemainingSeconds(seconds)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const presetMinutes = [5, 15, 25, 30, 45, 60]

  return (
    <div className="timer-page">
      <div className="timer-header">
        <button className="back-button" onClick={onBack}>
          ← Back
        </button>
        <h1 className="timer-header-title">Productivity Timer</h1>
      </div>

      <div className="timer-container">
        <div className="timer-display">
          <AnalogTimer
            ref={timerRef}
            initialMinutes={selectedMinutes}
            size={280}
            primaryColor="#ff6b35"
            secondaryColor="#f0f0f0"
            backgroundColor="#ffffff"
            borderColor="#333333"
            showDigitalTime={true}
            progressMode={progressMode}
            controlled={true}
            isRunning={status === 'running'}
            onComplete={handleTimerComplete}
            onTimeUpdate={handleTimeUpdate}
          />
        </div>

        <div className="timer-info">
          <div className="timer-card">
            <h3 className="timer-card-title">Current Session</h3>
            <p className="session-text">
              <span className="session-label">Duration:</span>
              {' '}
              {currentSessionMinutes}
              {' '}
              minutes
            </p>
            <p className="session-text">
              <span className="session-label">Status:</span>
              {' '}
              {status}
            </p>
            {remainingSeconds > 0 && (
              <p className="session-text">
                <span className="session-label">Remaining:</span>
                {' '}
                {formatTime(remainingSeconds)}
              </p>
            )}
            {startedAt && (
              <p className="session-text">
                <span className="session-label">Started:</span>
                {' '}
                {new Date(startedAt).toLocaleTimeString()}
              </p>
            )}
          </div>

          <div className="timer-card">
            <h3 className="timer-card-title">Quick Presets</h3>
            <div className="preset-buttons">
              {presetMinutes.map(minutes => (
                <button
                  key={minutes}
                  className={`preset-button ${selectedMinutes === minutes ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedMinutes(minutes)
                    if (status === 'stopped') {
                      timerRef.current?.setTime(minutes)
                    }
                  }}
                  disabled={status === 'running'}
                >
                  {minutes}
                  m
                </button>
              ))}
            </div>
          </div>

          <div className="timer-card">
            <div className="control-group">
              <h3 className="timer-card-title">Controls</h3>
              <div className="control-buttons">
                {status === 'stopped'
                  ? (
                      <button
                        className="control-btn start-btn"
                        onClick={startTimer}
                        disabled={selectedMinutes === 0}
                      >
                        Start Timer
                      </button>
                    )
                  : (
                      <button className="control-btn stop-btn" onClick={stopTimer}>
                        Stop Timer
                      </button>
                    )}
                <button className="control-btn reset-btn" onClick={resetTimer}>
                  Reset
                </button>
              </div>
            </div>

            <div className="control-group">
              <h3 className="timer-card-title">Display Mode</h3>
              <div className="mode-selector">
                <button
                  className={`mode-btn ${progressMode === 'sector' ? 'active' : ''}`}
                  onClick={() => setProgressMode('sector')}
                >
                  Sector
                </button>
                <button
                  className={`mode-btn ${progressMode === 'arc' ? 'active' : ''}`}
                  onClick={() => setProgressMode('arc')}
                >
                  Arc
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="timer-footer">
        <p>
          Timer ID:
          {' '}
          {timerId}
        </p>
        {updatedAt && (
          <p>
            Last updated:
            {' '}
            {new Date(updatedAt).toLocaleString()}
          </p>
        )}
      </div>
    </div>
  )
}

export default TimerPage
