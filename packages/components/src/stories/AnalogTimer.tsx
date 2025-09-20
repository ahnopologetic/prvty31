import React, { useState, useEffect, useCallback, useRef } from 'react';
import './analog-timer.css';

export interface AnalogTimerProps {
  /** Initial duration in minutes (1-60) */
  initialMinutes?: number;
  /** Timer size in pixels */
  size?: number;
  /** Primary color for the timer face */
  primaryColor?: string;
  /** Secondary color for elapsed time */
  secondaryColor?: string;
  /** Background color for the timer face */
  backgroundColor?: string;
  /** Border color for the timer rim */
  borderColor?: string;
  /** Whether to show digital time display */
  showDigitalTime?: boolean;
  /** Whether to enable sound notifications */
  enableSound?: boolean;
  /** Progress display mode: 'sector' (filled pie slice) or 'arc' (outline only) */
  progressMode?: 'sector' | 'arc';
  /** Callback when timer completes */
  onComplete?: () => void;
  /** Callback when timer starts */
  onStart?: () => void;
  /** Callback when timer pauses */
  onPause?: () => void;
  /** Callback when timer resets */
  onReset?: () => void;
  /** Callback for time updates (called every second) */
  onTimeUpdate?: (remainingSeconds: number) => void;
  /** Whether the timer is controlled externally */
  controlled?: boolean;
  /** External control for starting/pausing */
  isRunning?: boolean;
  /** External control for resetting */
  shouldReset?: boolean;
}

export type TimerState = 'idle' | 'running' | 'paused' | 'completed';

export interface AnalogTimerRef {
  start: () => void;
  pause: () => void;
  reset: () => void;
  setTime: (minutes: number) => void;
  getState: () => TimerState;
  getRemainingTime: () => number;
}

/** A customizable analog timer component that counts down up to 60 minutes */
export const AnalogTimer = React.forwardRef<AnalogTimerRef, AnalogTimerProps>(({
  initialMinutes = 25,
  size = 200,
  primaryColor = '#ff4757',
  secondaryColor = '#ffffff',
  backgroundColor = '#f8f9fa',
  borderColor = '#2c3e50',
  showDigitalTime = true,
  enableSound = true,
  progressMode = 'sector',
  onComplete,
  onStart,
  onPause,
  onReset,
  onTimeUpdate,
  controlled = false,
  isRunning = false,
  shouldReset = false,
}, ref) => {
  const [totalSeconds, setTotalSeconds] = useState(Math.min(Math.max(initialMinutes, 1), 60) * 60);
  const [remainingSeconds, setRemainingSeconds] = useState(totalSeconds);
  const [state, setState] = useState<TimerState>('idle');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const previousResetRef = useRef(shouldReset);

  // Initialize audio for completion sound
  useEffect(() => {
    if (enableSound) {
      audioRef.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmAaBTuS2fLNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmAaBTuS2fLNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmAaBTuS2fLNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmAaBTuS2fLNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmAaBTuS2fLNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmAaBTuS2fLNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmAaBTuS2fLNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmAaBTuS2fLNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmAaBTuS2fLNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmAaBTuS2fLNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmAaBTuS2fLNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmAaBTuS2fLNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmAaBTuS2fLNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmAaBTuS2fLNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmAaBTuS2fLNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmAaBTuS2fLNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmAaBTuS2fLNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmAaBTuS2fLNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmAaBTuS2fLNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmAaBTuS2fLNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmAaBTuS2fLNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmAaBTuS2fLNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmAaBTuS2fLNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmAaBTuS2fLNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmAaBTuS2fLNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmAaBTuS2fLNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmAaBQ==');
    }
  }, [enableSound]);

  // Handle controlled mode
  useEffect(() => {
    if (!controlled) return;

    if (isRunning && state === 'idle') {
      handleStart();
    } else if (isRunning && state === 'paused') {
      handleStart();
    } else if (!isRunning && state === 'running') {
      handlePause();
    }
  }, [controlled, isRunning, state]);

  useEffect(() => {
    if (!controlled) return;

    if (shouldReset && !previousResetRef.current) {
      handleReset();
    }
    previousResetRef.current = shouldReset;
  }, [controlled, shouldReset]);

  // Timer logic
  useEffect(() => {
    if (state === 'running' && remainingSeconds > 0) {
      intervalRef.current = setInterval(() => {
        setRemainingSeconds((prev) => {
          const newTime = prev - 1;
          onTimeUpdate?.(newTime);

          if (newTime <= 0) {
            setState('completed');
            if (enableSound && audioRef.current && typeof audioRef.current.play === 'function') {
              try {
                const playPromise = audioRef.current.play();
                if (playPromise && typeof playPromise.catch === 'function') {
                  playPromise.catch(() => {
                    // Ignore audio play errors (browser restrictions)
                  });
                }
              } catch (error) {
                // Ignore audio play errors
              }
            }
            onComplete?.();
            return 0;
          }
          return newTime;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [state, remainingSeconds, enableSound, onComplete, onTimeUpdate]);

  const handleStart = useCallback(() => {
    if (remainingSeconds > 0) {
      setState('running');
      onStart?.();
    }
  }, [remainingSeconds, onStart]);

  const handlePause = useCallback(() => {
    setState('paused');
    onPause?.();
  }, [onPause]);

  const handleReset = useCallback(() => {
    setState('idle');
    setRemainingSeconds(totalSeconds);
    onReset?.();
  }, [totalSeconds, onReset]);

  const setTime = useCallback((minutes: number) => {
    const clampedMinutes = Math.min(Math.max(minutes, 1), 60);
    const seconds = clampedMinutes * 60;
    setTotalSeconds(seconds);
    setRemainingSeconds(seconds);
    setState('idle');
  }, []);

  // Expose methods via ref
  React.useImperativeHandle(ref, () => ({
    start: handleStart,
    pause: handlePause,
    reset: handleReset,
    setTime,
    getState: () => state,
    getRemainingTime: () => remainingSeconds,
  }), [handleStart, handlePause, handleReset, setTime, state, remainingSeconds]);

  // Calculate angles and positions
  const centerX = size / 2;
  const centerY = size / 2;
  const radius = (size - 40) / 2; // Leave space for border
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;

  // Calculate progress: start at initial time position and decrement
  // For a 25min timer: should start at 25/60 * 360° = 150° from 12 o'clock
  // As time decreases, the arc should shrink back toward 12 o'clock
  const remainingProgress = remainingSeconds / totalSeconds;

  // Calculate the arc for remaining time
  // Arc always starts at 12 o'clock (-90°) and ends at the remaining time position
  const startAngle = -90; // Always start at 12 o'clock (top)
  const remainingAngle = (remainingSeconds / 3600) * 360; // Convert remaining seconds to degrees (max 60min = 3600sec)
  const endAngle = startAngle + remainingAngle;

  // Convert to radians for calculations
  const startRadian = (startAngle * Math.PI) / 180;
  const endRadian = (endAngle * Math.PI) / 180;

  // Calculate arc path coordinates
  const arcRadius = radius - strokeWidth / 2;
  const startX = centerX + arcRadius * Math.cos(startRadian);
  const startY = centerY + arcRadius * Math.sin(startRadian);
  const endX = centerX + arcRadius * Math.cos(endRadian);
  const endY = centerY + arcRadius * Math.sin(endRadian);

  // Determine if arc should be large (> 180 degrees)
  const largeArcFlag = remainingAngle > 180 ? 1 : 0;

  // Create SVG path for the remaining time arc
  const arcPath = remainingSeconds > 0
    ? `M ${startX} ${startY} A ${arcRadius} ${arcRadius} 0 ${largeArcFlag} 1 ${endX} ${endY}`
    : '';

  // Create SVG path for the remaining time sector (filled pie slice)
  // This creates a sector from the center to the arc, showing filled remaining time
  const sectorPath = remainingSeconds > 0
    ? `M ${centerX} ${centerY} L ${startX} ${startY} A ${arcRadius} ${arcRadius} 0 ${largeArcFlag} 1 ${endX} ${endY} Z`
    : '';

  // Generate tick marks for minutes
  const generateTicks = () => {
    const ticks = [];
    for (let i = 0; i < 60; i += 5) {
      const angle = (i / 60) * 360 - 90; // Start from top
      const radian = (angle * Math.PI) / 180;
      const tickLength = i % 15 === 0 ? 15 : 10; // Longer ticks for quarters

      const x1 = centerX + (radius - 5) * Math.cos(radian);
      const y1 = centerY + (radius - 5) * Math.sin(radian);
      const x2 = centerX + (radius - 5 - tickLength) * Math.cos(radian);
      const y2 = centerY + (radius - 5 - tickLength) * Math.sin(radian);

      ticks.push(
        <line
          key={i}
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke={borderColor}
          strokeWidth={i % 15 === 0 ? 2 : 1}
        />
      );

      // Add numbers for major ticks
      if (i % 15 === 0) {
        const textX = centerX + (radius - 25) * Math.cos(radian);
        const textY = centerY + (radius - 25) * Math.sin(radian);

        ticks.push(
          <text
            key={`text-${i}`}
            x={textX}
            y={textY}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="14"
            fontWeight="bold"
            fill={borderColor}
          >
            {i}
          </text>
        );
      }
    }
    return ticks;
  };

  // Format time display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div
      className="analog-timer"
      style={{
        width: size,
        height: size,
        '--primary-color': primaryColor,
        '--secondary-color': secondaryColor,
        '--background-color': backgroundColor,
        '--border-color': borderColor,
      } as React.CSSProperties}
      role="timer"
      aria-label={`Timer set for ${Math.floor(totalSeconds / 60)} minutes, ${remainingSeconds} seconds remaining`}
    >
      <svg width={size} height={size} className="timer-svg">
        {/* Outer rim */}
        <circle
          cx={centerX}
          cy={centerY}
          r={radius + 10}
          fill="none"
          stroke={borderColor}
          strokeWidth="4"
          className="timer-rim"
        />

        {/* Timer face background */}
        <circle
          cx={centerX}
          cy={centerY}
          r={radius}
          fill={backgroundColor}
          className="timer-face"
        />

        {/* Progress background */}
        <circle
          cx={centerX}
          cy={centerY}
          r={radius - strokeWidth / 2}
          fill="none"
          stroke={secondaryColor}
          strokeWidth={strokeWidth}
          className="progress-background"
        />

        {/* Progress indicator */}
        {progressMode === 'sector' ? (
          // Filled sector (pie slice) mode
          sectorPath && (
            <path
              d={sectorPath}
              fill={primaryColor}
              fillOpacity={0.8}
              stroke={primaryColor}
              strokeWidth={2}
              className={`progress-indicator sector ${state}`}
            />
          )
        ) : (
          // Arc outline mode
          arcPath && (
            <path
              d={arcPath}
              fill="none"
              stroke={primaryColor}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              className={`progress-indicator arc ${state}`}
            />
          )
        )}

        {/* Tick marks and numbers */}
        {generateTicks()}

        {/* Center dot */}
        <circle
          cx={centerX}
          cy={centerY}
          r="4"
          fill={borderColor}
          className="center-dot"
        />
      </svg>

      {/* Digital time display */}
      {showDigitalTime && (
        <div className="digital-display">
          <span className="time-text">{formatTime(remainingSeconds)}</span>
        </div>
      )}

      {/* Control buttons (only in non-controlled mode) */}
      {!controlled && (
        <div className="timer-controls">
          {state === 'idle' || state === 'paused' ? (
            <button
              className="control-button start-button"
              onClick={handleStart}
              disabled={remainingSeconds === 0}
              aria-label="Start timer"
            >
              ▶
            </button>
          ) : (
            <button
              className="control-button pause-button"
              onClick={handlePause}
              aria-label="Pause timer"
            >
              ⏸
            </button>
          )}

          <button
            className="control-button reset-button"
            onClick={handleReset}
            aria-label="Reset timer"
          >
            ⏹
          </button>
        </div>
      )}

      {/* State indicator */}
      <div className={`state-indicator ${state}`} aria-hidden="true" />
    </div>
  );
});

AnalogTimer.displayName = 'AnalogTimer';
