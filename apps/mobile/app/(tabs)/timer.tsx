import React, { useEffect, useRef, useState } from 'react'
import { Platform, StyleSheet, Text, TextInput, View, Button } from 'react-native'

const BASE_HOST = Platform.OS === 'android' ? '10.0.2.2' : 'localhost'
// const BASE_URL = `http://${BASE_HOST}:8000`
const BASE_URL = `https://prvty31-production.up.railway.app`
const BASE_WS_URL = `wss://prvty31-production.up.railway.app`

type LoginResponse = { token: string; token_type: string; user_id: string }

type TimerState =
  | {
      id: string
      status: 'running' | 'stopped'
      started_at: string | null
      updated_at: string
    }
  | null

export default function TimerScreen() {
  const [username, setUsername] = useState('demo')
  const [password, setPassword] = useState('demo')
  const [token, setToken] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [timerId, setTimerId] = useState<string>('demo-timer')
  const [status, setStatus] = useState<'running' | 'stopped'>('stopped')
  const [startedAt, setStartedAt] = useState<string | null>(null)
  const [updatedAt, setUpdatedAt] = useState<string | null>(null)
  const wsRef = useRef<WebSocket | null>(null)

  async function login() {
    const res = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })
    if (!res.ok) throw new Error('Login failed')
    const data: LoginResponse = await res.json()
    setToken(data.token)
    setUserId(data.user_id)
  }

  async function fetchState(tok: string) {
    const res = await fetch(`${BASE_URL}/timers`, {
      headers: { Authorization: `Bearer ${tok}` },
    })
    if (!res.ok) throw new Error('Fetch timer failed')
    const data: TimerState = await res.json()
    if (data) {
      setStatus(data.status)
      setStartedAt(data.started_at)
      setUpdatedAt(data.updated_at)
      if (data.id) setTimerId(data.id)
    }
  }

  function connectWs(tok: string) {
    const ws = new WebSocket(`${BASE_WS_URL}/ws?token=${encodeURIComponent(tok)}`)
    ws.onmessage = (ev) => {
      try {
        const data = JSON.parse(ev.data)
        if (data?.event === 'timer_updated') {
          const p = data.payload
          setStatus(p.status)
          setStartedAt(p.started_at ?? null)
          setUpdatedAt(p.updated_at)
          if (p.id) setTimerId(p.id)
        }
      } catch {}
    }
    wsRef.current = ws
  }

  function startTimer() {
    if (!wsRef.current || !userId) return
    wsRef.current.send(
      JSON.stringify({ action: 'timer_start', id: timerId, user_id: userId, started_at: new Date().toISOString() })
    )
  }

  function stopTimer() {
    if (!wsRef.current || !userId) return
    wsRef.current.send(JSON.stringify({ action: 'timer_stop', id: timerId, user_id: userId }))
  }

  useEffect(() => {
    if (!token) return
    fetchState(token).catch(() => {})
    connectWs(token)
    return () => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) wsRef.current.close()
    }
  }, [token])

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Timer (Mobile)</Text>
      {!token ? (
        <View style={styles.row}>
          <TextInput style={styles.input} value={username} onChangeText={setUsername} placeholder="username" />
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="password"
            secureTextEntry
          />
          <Button title="Login" onPress={login} />
        </View>
      ) : (
        <View style={{ gap: 8 }}>
          <Text>
            <Text style={styles.bold}>User:</Text> {userId}
          </Text>
          <Text>
            <Text style={styles.bold}>Timer ID:</Text> {timerId}
          </Text>
          <Text>
            <Text style={styles.bold}>Status:</Text> {status}
          </Text>
          <Text>
            <Text style={styles.bold}>Started:</Text> {startedAt ?? '-'}
          </Text>
          <Text>
            <Text style={styles.bold}>Updated:</Text> {updatedAt ?? '-'}
          </Text>
          <View style={styles.row}>
            <Button title="Start" onPress={startTimer} />
            <Button title="Stop" onPress={stopTimer} />
            <Button title="Refresh" onPress={() => token && fetchState(token)} />
          </View>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, paddingTop: 48 },
  title: { fontSize: 24, fontWeight: '600', marginBottom: 12 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 6, padding: 8, flex: 1 },
  bold: { fontWeight: '600' },
})
