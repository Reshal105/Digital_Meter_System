import type { Config } from 'tailwindcss'

const config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#F5F5DC', // Soft Cream
        foreground: '#3E2723', // Warm Brown
        card: '#F0E68C', // Light Cream
        'card-foreground': '#3E2723',
        primary: '#32CD32', // Lime Green
        'primary-foreground': '#F5F5DC',
        secondary: '#FFDAB9', // Peach Puff
        'secondary-foreground': '#3E2723',
        muted: '#FFE4B5', // Moccasin
        'muted-foreground': '#8B4513', // Saddle Brown
        accent: '#FFB6C1', // Light Pink
        'accent-foreground': '#3E2723',
        destructive: '#FF6347', // Tomato
        'destructive-foreground': '#F5F5DC',
        border: '#DEB887', // Burlywood
        input: '#FFE4B5',
        ring: '#32CD32',
        // Metric card border colors - pastel versions
        voltage: '#98FB98',      // Pale Green
        current: '#FFD700',       // Gold
        power: '#FFA07A',         // Light Salmon
        energy: '#20B2AA',        // Light Sea Green
        // Chart colors - pastel
        chart: {
          '1': '#32CD32',         // Lime Green
          '2': '#FFD700',         // Gold
          '3': '#FFB6C1',         // Light Pink
          '4': '#87CEEB',         // Sky Blue
          '5': '#FF6347',         // Tomato
        },
        // Consumption level colors for bar chart - pastel
        'consumption': {
          'low': '#98FB98',       // Pale Green
          'medium': '#FFD700',    // Gold
          'high': '#FFA07A',      // Light Salmon
          'critical': '#FF6347',  // Tomato
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'slide-up': {
          from: { transform: 'translateY(10px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.5s ease-in-out',
        'slide-up': 'slide-up 0.5s ease-in-out',
      },
    },
  },
  plugins: [],
} satisfies Config

export default config
