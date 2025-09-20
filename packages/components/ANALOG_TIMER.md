# AnalogTimer Component

A highly customizable analog timer component built with React and TypeScript. This component provides a visual countdown timer with a classic analog design, perfect for productivity apps, cooking timers, or any application requiring time-based functionality.

## Features

- ⏰ **Visual Countdown**: Analog display with decremental progress indication (starts at set time and decrements)
- 🎨 **Fully Customizable**: Colors, sizes, and visual elements can be themed
- ♿ **Accessible**: ARIA labels, keyboard navigation, and screen reader support
- 📱 **Responsive**: Works seamlessly across desktop, tablet, and mobile
- 🔊 **Audio Notifications**: Optional sound alerts on completion
- ⚙️ **Controlled & Uncontrolled**: Supports both internal state management and external control
- 🎯 **TypeScript**: Full type safety and excellent developer experience
- 🧪 **Well Tested**: Comprehensive test suite with high coverage

## Installation

```bash
npm install @prvty31/components
```

## Basic Usage

```tsx
import { AnalogTimer } from '@prvty31/components';

function App() {
  return (
    <AnalogTimer
      initialMinutes={25}
      onComplete={() => console.log('Timer completed!')}
    />
  );
}
```

## Props API

### Core Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `initialMinutes` | `number` | `25` | Initial duration in minutes (1-60) |
| `size` | `number` | `200` | Timer size in pixels |
| `showDigitalTime` | `boolean` | `true` | Whether to show digital time display |
| `enableSound` | `boolean` | `true` | Whether to enable sound notifications |
| `progressMode` | `'sector' \| 'arc'` | `'sector'` | Progress display mode |

### Styling Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `primaryColor` | `string` | `#ff4757` | Primary color for progress indicator |
| `secondaryColor` | `string` | `#ffffff` | Secondary color for elapsed time background |
| `backgroundColor` | `string` | `#f8f9fa` | Background color for timer face |
| `borderColor` | `string` | `#2c3e50` | Border color for rim and text |

### Callback Props

| Prop | Type | Description |
|------|------|-------------|
| `onComplete` | `() => void` | Called when timer reaches zero |
| `onStart` | `() => void` | Called when timer starts |
| `onPause` | `() => void` | Called when timer pauses |
| `onReset` | `() => void` | Called when timer resets |
| `onTimeUpdate` | `(remainingSeconds: number) => void` | Called every second with remaining time |

### Controlled Mode Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `controlled` | `boolean` | `false` | Whether timer is controlled externally |
| `isRunning` | `boolean` | `false` | External control for start/pause |
| `shouldReset` | `boolean` | `false` | External control for reset |

## Examples

### Basic Pomodoro Timer

```tsx
import { AnalogTimer } from '@prvty31/components';

function PomodoroTimer() {
  return (
    <AnalogTimer
      initialMinutes={25}
      primaryColor="#e74c3c"
      onComplete={() => alert('Time for a break!')}
    />
  );
}
```

### Custom Styled Timer

```tsx
import { AnalogTimer } from '@prvty31/components';

function CustomTimer() {
  return (
    <AnalogTimer
      initialMinutes={15}
      size={300}
      primaryColor="#9b59b6"
      secondaryColor="#f3e5f5"
      backgroundColor="#faf5ff"
      borderColor="#8e44ad"
      showDigitalTime={true}
      progressMode="sector"
    />
  );
}
```

### Progress Modes

```tsx
import { AnalogTimer } from '@prvty31/components';

function ProgressModeExample() {
  return (
    <div>
      {/* Sector mode (default) - filled pie slice */}
      <AnalogTimer
        initialMinutes={25}
        progressMode="sector"
        primaryColor="#ff6b35"
      />
      
      {/* Arc mode - outline only */}
      <AnalogTimer
        initialMinutes={25}
        progressMode="arc"
        primaryColor="#ff6b35"
      />
    </div>
  );
}
```

### Controlled Timer

```tsx
import { useState } from 'react';
import { AnalogTimer } from '@prvty31/components';

function ControlledTimer() {
  const [isRunning, setIsRunning] = useState(false);
  const [shouldReset, setShouldReset] = useState(false);

  return (
    <div>
      <AnalogTimer
        initialMinutes={10}
        controlled={true}
        isRunning={isRunning}
        shouldReset={shouldReset}
        onStart={() => console.log('Timer started')}
        onPause={() => console.log('Timer paused')}
        onReset={() => setShouldReset(false)}
      />
      
      <button onClick={() => setIsRunning(!isRunning)}>
        {isRunning ? 'Pause' : 'Start'}
      </button>
      
      <button onClick={() => setShouldReset(true)}>
        Reset
      </button>
    </div>
  );
}
```

### Using Ref API

```tsx
import { useRef } from 'react';
import { AnalogTimer, AnalogTimerRef } from '@prvty31/components';

function RefTimer() {
  const timerRef = useRef<AnalogTimerRef>(null);

  const handleCustomStart = () => {
    timerRef.current?.start();
  };

  const handleSetCustomTime = () => {
    timerRef.current?.setTime(30); // Set to 30 minutes
  };

  return (
    <div>
      <AnalogTimer ref={timerRef} initialMinutes={20} />
      
      <button onClick={handleCustomStart}>Start Timer</button>
      <button onClick={handleSetCustomTime}>Set 30 Minutes</button>
    </div>
  );
}
```

## Ref API

When using a ref, the following methods are available:

| Method | Type | Description |
|--------|------|-------------|
| `start()` | `() => void` | Start the timer |
| `pause()` | `() => void` | Pause the timer |
| `reset()` | `() => void` | Reset the timer |
| `setTime(minutes)` | `(minutes: number) => void` | Set timer duration |
| `getState()` | `() => TimerState` | Get current timer state |
| `getRemainingTime()` | `() => number` | Get remaining seconds |

## Timer States

The timer can be in one of four states:

- `idle`: Timer is set but not running
- `running`: Timer is actively counting down
- `paused`: Timer is paused
- `completed`: Timer has reached zero

## Accessibility Features

- **ARIA Labels**: Proper labeling for screen readers
- **Keyboard Navigation**: Full keyboard support for controls
- **High Contrast**: Supports high contrast mode
- **Reduced Motion**: Respects user's motion preferences
- **Focus Management**: Proper focus indicators and management

## Platform Compatibility

### Desktop Applications (Electron)
Perfect for productivity apps, time tracking, and focus applications.

### Web Applications
Responsive design works great in modern browsers with full touch support.

### Mobile Applications (React Native)
The component structure is designed to be easily adapted for React Native.

## Theming

The component uses CSS custom properties for easy theming:

```css
.analog-timer {
  --primary-color: #your-color;
  --secondary-color: #your-color;
  --background-color: #your-color;
  --border-color: #your-color;
}
```

## Performance

- **Optimized Rendering**: Uses React.memo and useCallback for performance
- **Efficient Updates**: Only re-renders when necessary
- **Small Bundle Size**: Minimal dependencies and tree-shakable
- **Memory Efficient**: Proper cleanup of timers and event listeners

## Browser Support

- Chrome/Chromium 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Contributing

See the main repository README for contribution guidelines.

## License

MIT License - see LICENSE file for details.
