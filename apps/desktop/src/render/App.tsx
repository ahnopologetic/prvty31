import type { AnalogTimerRef } from '@prvty31/components'
import { AnalogTimer } from '@prvty31/components'
import React, { useRef, useState } from 'react'
import './App.css'
import '@prvty31/components/styles'

const App: React.FC = () => {
  const [selectedMinutes, setSelectedMinutes] = useState(25)
  const [progressMode, setProgressMode] = useState<'sector' | 'arc'>('sector')
  const timerRef = useRef<AnalogTimerRef>(null)
  const handleTimerComplete = () => {
    console.log('Timer completed')
  }
  const handleTimeUpdate = (remainingSeconds: number) => {
    console.log('Time updated', remainingSeconds)
  }
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedMinutes(Number(e.target.value))
    timerRef.current?.setTime(Number(e.target.value))
  }
  const handleStart = () => {
    console.log('Timer started')
  }
  const handlePause = () => {
    console.log('Timer paused')
  }
  const handleReset = () => {
    console.log('Timer reset')
  }

  return (
    <div className="font-sans antialiased">
      <div className="grid gap-4 grid-cols-1 grid-rows-2 items-center justify-center py-10 h-screen">
        <div className="timer-display flex justify-center items-center py-10">
          <AnalogTimer
            initialMinutes={selectedMinutes}
            ref={timerRef}
            size={360}
          />
        </div>
        <div className="controls-container flex flex-col items-center justify-center">
          <label htmlFor="minutes" className="text-center text-xs font-bold">Minutes</label>
          <input
            type="number"
            className="w-24 my-4 text-center text-md font-bold bg-white/10 border rounded-lg p-2 max-w-md mx-auto"
            value={selectedMinutes}
            onChange={handleInputChange}
          />
        </div>
      </div>
    </div>
  )
}

export default App
