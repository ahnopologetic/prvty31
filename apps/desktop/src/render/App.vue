<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { apiLogin, apiGetTimer, connectTimerWs, type TimerState } from './api/index'

const username = ref('demo')
const password = ref('demo')
const token = ref<string | null>(null)
const userId = ref<string | null>(null)
const timerId = ref<string>('demo-timer')
const status = ref<'running' | 'stopped'>('stopped')
const startedAt = ref<string | null>(null)
const updatedAt = ref<string | null>(null)
let ws: ReturnType<typeof connectTimerWs> | null = null

async function login() {
  const auth = await apiLogin(username.value, password.value)
  token.value = auth.token
  userId.value = auth.user_id
  await fetchState()
  connectWs()
}

async function fetchState() {
  if (!token.value) return
  const state: TimerState = await apiGetTimer(token.value)
  if (state) {
    status.value = state.status
    startedAt.value = state.started_at
    updatedAt.value = state.updated_at
    if (state.id) timerId.value = state.id
  }
}

function connectWs() {
  if (!token.value) return
  ws = connectTimerWs(token.value, (data) => {
    if (data?.event === 'timer_updated') {
      const p = data.payload
      status.value = p.status
      startedAt.value = p.started_at ?? null
      updatedAt.value = p.updated_at
      if (p.id) timerId.value = p.id
    }
  })
}

function startTimer() {
  if (!ws || !userId.value) return
  ws.sendStart(timerId.value, userId.value, new Date().toISOString())
}

function stopTimer() {
  if (!ws || !userId.value) return
  ws.sendStop(timerId.value, userId.value)
}

onBeforeUnmount(() => {
  if (ws?.socket?.readyState === WebSocket.OPEN) ws.socket.close()
})
</script>

<template>
  <div id="app">
    <h1>Timer (Electron)</h1>
    <div v-if="!token">
      <input v-model="username" placeholder="username" />
      <input v-model="password" placeholder="password" type="password" />
      <button @click="login">Login</button>
    </div>
    <div v-else>
      <p><strong>User:</strong> {{ userId }}</p>
      <p><strong>Timer ID:</strong> {{ timerId }}</p>
      <p><strong>Status:</strong> {{ status }}</p>
      <p><strong>Started:</strong> {{ startedAt ?? '-' }}</p>
      <p><strong>Updated:</strong> {{ updatedAt ?? '-' }}</p>
      <div>
        <button @click="startTimer">Start</button>
        <button @click="stopTimer">Stop</button>
        <button @click="fetchState">Refresh</button>
      </div>
    </div>
  </div>
</template>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
button { margin: 0 6px; }
</style>
