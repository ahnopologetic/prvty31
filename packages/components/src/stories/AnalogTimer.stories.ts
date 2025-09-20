import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { AnalogTimer } from './AnalogTimer';

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta = {
  title: 'Components/AnalogTimer',
  component: AnalogTimer,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
    layout: 'centered',
    docs: {
      description: {
        component: 'A customizable analog timer component that counts down up to 60 minutes. Features include visual progress indication, digital time display, audio notifications, and both controlled and uncontrolled modes for maximum flexibility across different platforms.',
      },
    },
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ['autodocs'],
  // More on argTypes: https://storybook.js.org/docs/api/argtypes
  argTypes: {
    initialMinutes: {
      control: { type: 'range', min: 1, max: 60, step: 1 },
      description: 'Initial duration in minutes (1-60)',
    },
    size: {
      control: { type: 'range', min: 100, max: 400, step: 10 },
      description: 'Timer size in pixels',
    },
    primaryColor: {
      control: 'color',
      description: 'Primary color for the timer progress indicator',
    },
    secondaryColor: {
      control: 'color',
      description: 'Secondary color for elapsed time background',
    },
    backgroundColor: {
      control: 'color',
      description: 'Background color for the timer face',
    },
    borderColor: {
      control: 'color',
      description: 'Border color for the timer rim and text',
    },
    showDigitalTime: {
      control: 'boolean',
      description: 'Whether to show digital time display',
    },
    enableSound: {
      control: 'boolean',
      description: 'Whether to enable sound notifications on completion',
    },
    progressMode: {
      control: { type: 'select' },
      options: ['sector', 'arc'],
      description: 'Progress display mode: sector (filled pie slice) or arc (outline only)',
    },
    controlled: {
      control: 'boolean',
      description: 'Whether the timer is controlled externally',
    },
    isRunning: {
      control: 'boolean',
      description: 'External control for starting/pausing (controlled mode only)',
      if: { arg: 'controlled', eq: true },
    },
    shouldReset: {
      control: 'boolean',
      description: 'External control for resetting (controlled mode only)',
      if: { arg: 'controlled', eq: true },
    },
  },
  // Use `fn` to spy on the callback args, which will appear in the actions panel once invoked
  args: {
    onComplete: fn(),
    onStart: fn(),
    onPause: fn(),
    onReset: fn(),
    onTimeUpdate: fn(),
  },
} satisfies Meta<typeof AnalogTimer>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Default: Story = {
  args: {
    initialMinutes: 25,
    size: 200,
  },
  parameters: {
    docs: {
      description: {
        story: 'The default analog timer with 25 minutes duration. Features a classic red design similar to kitchen timers.',
      },
    },
  },
};

export const PomodoroTimer: Story = {
  args: {
    initialMinutes: 25,
    size: 250,
    primaryColor: '#e74c3c',
    secondaryColor: '#ffffff',
    backgroundColor: '#f8f9fa',
    borderColor: '#2c3e50',
    showDigitalTime: true,
    enableSound: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'A Pomodoro timer preset with 25 minutes duration and classic red styling.',
      },
    },
  },
};

export const ShortBreakTimer: Story = {
  args: {
    initialMinutes: 5,
    size: 180,
    primaryColor: '#3498db',
    secondaryColor: '#ecf0f1',
    backgroundColor: '#ffffff',
    borderColor: '#34495e',
  },
  parameters: {
    docs: {
      description: {
        story: 'A 5-minute timer perfect for short breaks, with a calming blue color scheme.',
      },
    },
  },
};

export const LongBreakTimer: Story = {
  args: {
    initialMinutes: 15,
    size: 220,
    primaryColor: '#2ecc71',
    secondaryColor: '#d5f4e6',
    backgroundColor: '#f8fffc',
    borderColor: '#27ae60',
  },
  parameters: {
    docs: {
      description: {
        story: 'A 15-minute timer for longer breaks, featuring a refreshing green color palette.',
      },
    },
  },
};

export const CustomColors: Story = {
  args: {
    initialMinutes: 10,
    size: 200,
    primaryColor: '#9b59b6',
    secondaryColor: '#f3e5f5',
    backgroundColor: '#faf5ff',
    borderColor: '#8e44ad',
    showDigitalTime: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates custom color theming with a purple color scheme.',
      },
    },
  },
};

export const LargeTimer: Story = {
  args: {
    initialMinutes: 30,
    size: 300,
    primaryColor: '#ff6b6b',
    showDigitalTime: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'A large 300px timer suitable for presentations or when visibility from a distance is important.',
      },
    },
  },
};

export const SmallTimer: Story = {
  args: {
    initialMinutes: 15,
    size: 120,
    showDigitalTime: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'A compact 120px timer without digital display, perfect for tight spaces or mobile interfaces.',
      },
    },
  },
};

export const NoDigitalDisplay: Story = {
  args: {
    initialMinutes: 20,
    size: 200,
    showDigitalTime: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Timer without digital time display for a cleaner, more analog appearance.',
      },
    },
  },
};

export const SilentTimer: Story = {
  args: {
    initialMinutes: 10,
    size: 200,
    enableSound: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Timer with sound notifications disabled for quiet environments.',
      },
    },
  },
};

export const ControlledTimer: Story = {
  args: {
    initialMinutes: 15,
    size: 200,
    controlled: true,
    isRunning: false,
    shouldReset: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'A controlled timer where start/pause/reset actions are managed externally. Use the controls below to interact with the timer.',
      },
    },
  },
};

export const DarkTheme: Story = {
  args: {
    initialMinutes: 20,
    size: 220,
    primaryColor: '#ff6b6b',
    secondaryColor: '#34495e',
    backgroundColor: '#2c3e50',
    borderColor: '#ecf0f1',
    showDigitalTime: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Dark theme variant suitable for dark mode interfaces.',
      },
    },
  },
};

export const MinimalTimer: Story = {
  args: {
    initialMinutes: 25,
    size: 180,
    primaryColor: '#333333',
    secondaryColor: '#f0f0f0',
    backgroundColor: '#ffffff',
    borderColor: '#666666',
    showDigitalTime: false,
    enableSound: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'A minimal, monochromatic timer design for professional or minimalist interfaces.',
      },
    },
  },
};

export const AccessibilityFocused: Story = {
  args: {
    initialMinutes: 15,
    size: 240,
    primaryColor: '#0066cc',
    secondaryColor: '#e6f3ff',
    backgroundColor: '#ffffff',
    borderColor: '#003366',
    showDigitalTime: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'High contrast timer design optimized for accessibility and screen readers.',
      },
    },
  },
};

export const SectorMode: Story = {
  args: {
    initialMinutes: 25,
    size: 250,
    primaryColor: '#ff6b35',
    secondaryColor: '#f0f0f0',
    backgroundColor: '#ffffff',
    borderColor: '#333333',
    showDigitalTime: true,
    progressMode: 'sector',
  },
  parameters: {
    docs: {
      description: {
        story: 'Sector mode (default): Shows progress as a filled pie slice from center to remaining time position. More visually prominent and easier to read at a glance.',
      },
    },
  },
};

export const ArcMode: Story = {
  args: {
    initialMinutes: 25,
    size: 250,
    primaryColor: '#ff6b35',
    secondaryColor: '#f0f0f0',
    backgroundColor: '#ffffff',
    borderColor: '#333333',
    showDigitalTime: true,
    progressMode: 'arc',
  },
  parameters: {
    docs: {
      description: {
        story: 'Arc mode: Shows progress as an outline arc only. More subtle and minimalist appearance.',
      },
    },
  },
};
