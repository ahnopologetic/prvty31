import React from 'react'
import { AnalogTimer, type AnalogTimerRef } from '@prvty31/components'
import '@prvty31/components/styles'

// Simple test component to verify imports work
export const ComponentTest: React.FC = () => {
  const timerRef = React.useRef<AnalogTimerRef>(null)

  const handleStart = () => {
    timerRef.current?.start()
  }

  const handleReset = () => {
    timerRef.current?.reset()
  }

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h2>Component Test</h2>
      <p>Testing AnalogTimer import and basic functionality</p>
      
      <div style={{ margin: '20px 0' }}>
        <AnalogTimer
          ref={timerRef}
          initialMinutes={5}
          size={200}
          progressMode="sector"
          onComplete={() => alert('Test timer completed!')}
        />
      </div>
      
      <div>
        <button onClick={handleStart} style={{ margin: '5px' }}>
          Start Test Timer
        </button>
        <button onClick={handleReset} style={{ margin: '5px' }}>
          Reset Test Timer
        </button>
      </div>
    </div>
  )
}

export default ComponentTest
