/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--color-background)',
        surface: 'var(--color-surface)',
        'surface-muted': 'var(--color-surface-muted)',
        'surface-raised': 'var(--color-surface-raised)',
        'surface-variant': 'var(--color-surface-variant)',
        border: 'var(--color-border)',
        'border-hover': 'var(--color-border-hover)',
        primary: 'var(--color-primary)',
        'primary-hover': 'var(--color-primary-hover)',
        'primary-soft': 'var(--color-primary-soft)',
        text: 'var(--color-text)',
        'text-secondary': 'var(--color-text-secondary)',
        'text-tertiary': 'var(--color-text-tertiary)',
        error: 'var(--color-error)',
        'error-bg': 'var(--color-error-bg)',
        success: {
          DEFAULT: 'var(--color-success)',
          soft: 'rgba(16, 185, 129, 0.12)'
        },
        warning: {
          DEFAULT: 'var(--color-warning)',
          soft: 'rgba(245, 158, 11, 0.12)'
        },
        danger: {
          DEFAULT: 'var(--color-danger)',
          soft: 'rgba(239, 68, 68, 0.12)'
        },
        priority: {
          high: 'var(--priority-high)',
          medium: 'var(--priority-medium)',
          low: 'var(--priority-low)',
          default: 'var(--priority-default)'
        }
      },
      spacing: {
        xs: 'var(--spacing-xs)',
        sm: 'var(--spacing-sm)',
        md: 'var(--spacing-md)',
        lg: 'var(--spacing-lg)',
        xl: 'var(--spacing-xl)'
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)'
      },
      boxShadow: {
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
        xl: 'var(--shadow-xl)'
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'Oxygen',
          'Ubuntu',
          'Cantarell',
          'sans-serif'
        ]
      },
      maxWidth: {
        wrap: '1280px'
      },
      transitionTimingFunction: {
        'soft-snap': 'cubic-bezier(0.16, 1, 0.3, 1)'
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' }
        }
      },
      animation: {
        'fade-in': 'fade-in 200ms var(--easing, cubic-bezier(0.16, 1, 0.3, 1)) forwards',
        'scale-in': 'scale-in 180ms var(--easing, cubic-bezier(0.16, 1, 0.3, 1)) forwards'
      }
    }
  },
  plugins: [],
}
