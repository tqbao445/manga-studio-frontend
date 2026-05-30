/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#fdf8f8',
        'on-background': '#1c1b1b',

        surface: '#fdf8f8',
        'surface-dim': '#ddd9d9',
        'surface-bright': '#fdf8f8',
        'surface-container': '#f1edec',
        'surface-container-high': '#ebe7e7',
        'surface-container-highest': '#e5e2e1',

        'on-surface': '#1c1b1b',
        'on-surface-variant': '#46474a',

        'inverse-surface': '#313030',
        'inverse-on-surface': '#f4f0ef',

        border: '#1c1b1b',
        'border-light': '#c7c6ca',
        outline: '#76777b',
        'outline-variant': '#c7c6ca',

        primary: '#000000',
        'on-primary': '#ffffff',
        'primary-container': '#1b1b1c',
        'on-primary-container': '#858384',
        'inverse-primary': '#c8c6c7',

        secondary: '#5d5f5f',
        'on-secondary': '#ffffff',
        'secondary-container': '#dfe0e0',
        'on-secondary-container': '#616363',

        'accent-cyan': '#00d4aa',
        'accent-purple': '#7c3aed',
        'accent-orange': '#f97316',

        workspace: {
          bg: '#1a1a2e',
          surface: '#232340',
          'canvas-bg': '#12121f',
          text: '#e8e8f0',
          'text-secondary': '#9494b8',
          accent: '#4fc3f7',
          border: '#2a2a4a',
        },

        'status-success': '#16a34a',
        'status-warning': '#ea580c',
        'status-danger': '#dc2626',
        'status-info': '#2563eb',

        'rank-s': '#fbbf24',
        'rank-a': '#9ca3af',
        'rank-b': '#d97706',
        'rank-c': '#dc2626',
        'rank-d': '#6b7280',

        error: '#ba1a1a',
        'on-error': '#ffffff',
        'error-container': '#ffdad6',
        'on-error-container': '#93000a',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        display: ['Anton', 'Impact', 'sans-serif'],
      },
      fontSize: {
        'display-lg': ['48px', { lineHeight: '52px', letterSpacing: '0.02em', fontWeight: '400' }],
        'headline-lg': ['32px', { lineHeight: '40px', letterSpacing: '0.01em', fontWeight: '400' }],
        'headline-mobile': ['24px', { lineHeight: '32px', fontWeight: '400' }],
      },
      spacing: {
        gutter: '16px',
        sidebar: '240px',
      },
      borderWidth: {
        thin: '1px',
        thick: '3px',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out forwards',
      },
    },
  },
  plugins: [],
}
