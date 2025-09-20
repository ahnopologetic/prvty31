import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { AnalogTimer, type AnalogTimerRef } from './AnalogTimer';
import { createRef } from 'react';

// Mock audio
const mockAudio = {
    play: vi.fn().mockImplementation(() => Promise.resolve()),
    pause: vi.fn(),
    currentTime: 0,
    duration: 0,
};

beforeEach(() => {
    vi.useFakeTimers();
    mockAudio.play.mockClear();
    // Mock HTMLAudioElement constructor
    global.HTMLAudioElement = vi.fn().mockImplementation(() => mockAudio);
});

afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
    vi.clearAllMocks();
});

describe('AnalogTimer', () => {
    describe('Basic Rendering', () => {
        it('renders with default props', () => {
            render(<AnalogTimer />);

            expect(screen.getByRole('timer')).toBeInTheDocument();
            expect(screen.getByText('25:00')).toBeInTheDocument();
            expect(screen.getByLabelText('Start timer')).toBeInTheDocument();
            expect(screen.getByLabelText('Reset timer')).toBeInTheDocument();
        });

        it('renders with custom initial minutes', () => {
            render(<AnalogTimer initialMinutes={10} />);

            expect(screen.getByText('10:00')).toBeInTheDocument();
        });

        it('clamps initial minutes to valid range', () => {
            render(<AnalogTimer initialMinutes={100} />);
            expect(screen.getByText('60:00')).toBeInTheDocument();

            render(<AnalogTimer initialMinutes={0} />);
            expect(screen.getByText('01:00')).toBeInTheDocument();
        });

        it('hides digital time when showDigitalTime is false', () => {
            render(<AnalogTimer showDigitalTime={false} />);

            expect(screen.queryByText('25:00')).not.toBeInTheDocument();
        });

        it('applies custom size', () => {
            render(<AnalogTimer size={300} />);

            const timerElement = screen.getByRole('timer');
            expect(timerElement).toHaveStyle({ width: '300px', height: '300px' });
        });
    });

    describe('Timer Functionality', () => {
        it('starts timer when start button is clicked', async () => {
            const onStart = vi.fn();
            render(<AnalogTimer initialMinutes={1} onStart={onStart} />);

            const startButton = screen.getByLabelText('Start timer');
            fireEvent.click(startButton);

            expect(onStart).toHaveBeenCalledOnce();
            expect(screen.getByLabelText('Pause timer')).toBeInTheDocument();
        });

        it('pauses timer when pause button is clicked', async () => {
            const onPause = vi.fn();
            render(<AnalogTimer initialMinutes={1} onPause={onPause} />);

            // Start timer
            fireEvent.click(screen.getByLabelText('Start timer'));

            // Pause timer
            const pauseButton = screen.getByLabelText('Pause timer');
            fireEvent.click(pauseButton);

            expect(onPause).toHaveBeenCalledOnce();
            expect(screen.getByLabelText('Start timer')).toBeInTheDocument();
        });

        it('resets timer when reset button is clicked', async () => {
            const onReset = vi.fn();
            render(<AnalogTimer initialMinutes={1} onReset={onReset} />);

            // Start timer
            fireEvent.click(screen.getByLabelText('Start timer'));

            // Let some time pass
            act(() => {
                vi.advanceTimersByTime(5000);
            });

            // Reset timer
            fireEvent.click(screen.getByLabelText('Reset timer'));

            expect(onReset).toHaveBeenCalledOnce();
            expect(screen.getByText('01:00')).toBeInTheDocument();
        });

        it('counts down correctly', async () => {
            const onTimeUpdate = vi.fn();
            render(<AnalogTimer initialMinutes={1} onTimeUpdate={onTimeUpdate} />);

            // Start timer
            fireEvent.click(screen.getByLabelText('Start timer'));

            // Advance time by 1 second
            act(() => {
                vi.advanceTimersByTime(1000);
            });

            expect(onTimeUpdate).toHaveBeenCalledWith(59);
            expect(screen.getByText('00:59')).toBeInTheDocument();
        });

        it('completes timer and calls onComplete', async () => {
            const onComplete = vi.fn();
            render(<AnalogTimer initialMinutes={1} onComplete={onComplete} />);

            // Start timer
            fireEvent.click(screen.getByLabelText('Start timer'));

            // Advance time to completion
            act(() => {
                vi.advanceTimersByTime(60000);
            });

            expect(onComplete).toHaveBeenCalledOnce();
            expect(screen.getByText('00:00')).toBeInTheDocument();
        });

        it.skip('plays sound on completion when enabled', async () => {
            render(<AnalogTimer initialMinutes={1} enableSound={true} />);

            // Verify HTMLAudioElement was created
            expect(global.HTMLAudioElement).toHaveBeenCalled();

            // Start timer
            fireEvent.click(screen.getByLabelText('Start timer'));

            // Advance time to completion
            act(() => {
                vi.advanceTimersByTime(60000);
            });

            // Wait a bit for async operations
            await vi.waitFor(() => {
                expect(mockAudio.play).toHaveBeenCalled();
            });
        });

        it('does not play sound when disabled', async () => {
            render(<AnalogTimer initialMinutes={1} enableSound={false} />);

            // Start timer
            fireEvent.click(screen.getByLabelText('Start timer'));

            // Advance time to completion
            act(() => {
                vi.advanceTimersByTime(60000);
            });

            expect(mockAudio.play).not.toHaveBeenCalled();
        });
    });

    describe('Controlled Mode', () => {
        it('hides control buttons in controlled mode', () => {
            render(<AnalogTimer controlled={true} />);

            expect(screen.queryByLabelText('Start timer')).not.toBeInTheDocument();
            expect(screen.queryByLabelText('Reset timer')).not.toBeInTheDocument();
        });

        it('starts when isRunning becomes true', async () => {
            const onStart = vi.fn();
            const { rerender } = render(
                <AnalogTimer controlled={true} isRunning={false} onStart={onStart} />
            );

            rerender(<AnalogTimer controlled={true} isRunning={true} onStart={onStart} />);

            expect(onStart).toHaveBeenCalledOnce();
        });

        it('pauses when isRunning becomes false', async () => {
            const onPause = vi.fn();
            const { rerender } = render(
                <AnalogTimer controlled={true} isRunning={true} onPause={onPause} />
            );

            rerender(<AnalogTimer controlled={true} isRunning={false} onPause={onPause} />);

            expect(onPause).toHaveBeenCalledOnce();
        });

        it('resets when shouldReset becomes true', async () => {
            const onReset = vi.fn();
            const { rerender } = render(
                <AnalogTimer controlled={true} shouldReset={false} onReset={onReset} />
            );

            rerender(<AnalogTimer controlled={true} shouldReset={true} onReset={onReset} />);

            expect(onReset).toHaveBeenCalledOnce();
        });
    });

    describe('Ref API', () => {
        it('exposes start method', () => {
            const ref = createRef<AnalogTimerRef>();
            const onStart = vi.fn();

            render(<AnalogTimer ref={ref} onStart={onStart} />);

            act(() => {
                ref.current?.start();
            });

            expect(onStart).toHaveBeenCalledOnce();
        });

        it('exposes pause method', () => {
            const ref = createRef<AnalogTimerRef>();
            const onPause = vi.fn();

            render(<AnalogTimer ref={ref} onPause={onPause} />);

            act(() => {
                ref.current?.start();
                ref.current?.pause();
            });

            expect(onPause).toHaveBeenCalledOnce();
        });

        it('exposes reset method', () => {
            const ref = createRef<AnalogTimerRef>();
            const onReset = vi.fn();

            render(<AnalogTimer ref={ref} onReset={onReset} />);

            act(() => {
                ref.current?.reset();
            });

            expect(onReset).toHaveBeenCalledOnce();
        });

        it('exposes setTime method', () => {
            const ref = createRef<AnalogTimerRef>();

            render(<AnalogTimer ref={ref} />);

            act(() => {
                ref.current?.setTime(15);
            });

            expect(screen.getByText('15:00')).toBeInTheDocument();
        });

        it('exposes getState method', () => {
            const ref = createRef<AnalogTimerRef>();

            render(<AnalogTimer ref={ref} />);

            expect(ref.current?.getState()).toBe('idle');

            act(() => {
                ref.current?.start();
            });

            expect(ref.current?.getState()).toBe('running');
        });

        it('exposes getRemainingTime method', () => {
            const ref = createRef<AnalogTimerRef>();

            render(<AnalogTimer ref={ref} initialMinutes={5} />);

            expect(ref.current?.getRemainingTime()).toBe(300);
        });
    });

    describe('Accessibility', () => {
        it('has proper ARIA labels', () => {
            render(<AnalogTimer initialMinutes={10} />);

            const timer = screen.getByRole('timer');
            expect(timer).toHaveAttribute('aria-label', 'Timer set for 10 minutes, 600 seconds remaining');
        });

        it('updates ARIA label as time changes', async () => {
            render(<AnalogTimer initialMinutes={1} />);

            // Start timer
            fireEvent.click(screen.getByLabelText('Start timer'));

            // Advance time
            act(() => {
                vi.advanceTimersByTime(1000);
            });

            const timer = screen.getByRole('timer');
            expect(timer).toHaveAttribute('aria-label', 'Timer set for 1 minutes, 59 seconds remaining');
        });

        it('has accessible control buttons', () => {
            render(<AnalogTimer />);

            expect(screen.getByLabelText('Start timer')).toBeInTheDocument();
            expect(screen.getByLabelText('Reset timer')).toBeInTheDocument();
        });
    });

  describe('Custom Colors', () => {
    it('applies custom colors via CSS custom properties', () => {
      render(
        <AnalogTimer
          primaryColor="#ff0000"
          secondaryColor="#00ff00"
          backgroundColor="#0000ff"
          borderColor="#ffff00"
        />
      );
      
      const timer = screen.getByRole('timer');
      expect(timer).toHaveStyle({
        '--primary-color': '#ff0000',
        '--secondary-color': '#00ff00',
        '--background-color': '#0000ff',
        '--border-color': '#ffff00',
      });
    });
  });

  describe('Progress Modes', () => {
    it('defaults to sector mode', () => {
      render(<AnalogTimer initialMinutes={10} />);
      
      const svg = document.querySelector('.timer-svg');
      const sectorPath = svg?.querySelector('.progress-indicator.sector');
      const arcPath = svg?.querySelector('.progress-indicator.arc');
      
      expect(sectorPath).toBeInTheDocument();
      expect(arcPath).not.toBeInTheDocument();
    });

    it('renders arc mode when specified', () => {
      render(<AnalogTimer initialMinutes={10} progressMode="arc" />);
      
      const svg = document.querySelector('.timer-svg');
      const sectorPath = svg?.querySelector('.progress-indicator.sector');
      const arcPath = svg?.querySelector('.progress-indicator.arc');
      
      expect(sectorPath).not.toBeInTheDocument();
      expect(arcPath).toBeInTheDocument();
    });

    it('renders sector mode when specified', () => {
      render(<AnalogTimer initialMinutes={10} progressMode="sector" />);
      
      const svg = document.querySelector('.timer-svg');
      const sectorPath = svg?.querySelector('.progress-indicator.sector');
      const arcPath = svg?.querySelector('.progress-indicator.arc');
      
      expect(sectorPath).toBeInTheDocument();
      expect(arcPath).not.toBeInTheDocument();
    });
  });

    describe('Edge Cases', () => {
        it.skip('disables start button when timer is at 0', () => {
            const ref = createRef<AnalogTimerRef>();
            render(<AnalogTimer ref={ref} initialMinutes={1} />);

            // Start timer and let it complete
            act(() => {
                ref.current?.start();
            });

            // Advance time to completion
            act(() => {
                vi.advanceTimersByTime(60000);
            });

            // After completion, reset to get back to idle state with 0 time
            act(() => {
                ref.current?.reset();
                ref.current?.setTime(0);
            });

            const startButton = screen.getByLabelText('Start timer');
            expect(startButton).toBeDisabled();
        });

        it('handles rapid start/pause clicks', () => {
            const onStart = vi.fn();
            const onPause = vi.fn();

            render(<AnalogTimer onStart={onStart} onPause={onPause} />);

            const startButton = screen.getByLabelText('Start timer');

            // Rapid clicks
            fireEvent.click(startButton);
            fireEvent.click(screen.getByLabelText('Pause timer'));
            fireEvent.click(screen.getByLabelText('Start timer'));

            expect(onStart).toHaveBeenCalledTimes(2);
            expect(onPause).toHaveBeenCalledTimes(1);
        });

        it('clamps setTime values to valid range', () => {
            const ref = createRef<AnalogTimerRef>();
            render(<AnalogTimer ref={ref} />);

            act(() => {
                ref.current?.setTime(100);
            });

            expect(screen.getByText('60:00')).toBeInTheDocument();

            act(() => {
                ref.current?.setTime(0);
            });

            expect(screen.getByText('01:00')).toBeInTheDocument();
        });
    });
});
