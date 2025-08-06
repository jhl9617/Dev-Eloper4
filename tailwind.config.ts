import type { Config } from 'tailwindcss';

const config = {
  darkMode: ['class'],
  content: ['./src/**/*.{ts,tsx}'],
  prefix: '',
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      fontFamily: {
        sans: [
          'var(--font-plus-jakarta-sans)', 
          'Pretendard Variable', 
          'Pretendard', 
          '-apple-system', 
          'BlinkMacSystemFont', 
          'system-ui', 
          'Roboto', 
          'Helvetica Neue', 
          'Segoe UI', 
          'Apple SD Gothic Neo', 
          'Noto Sans KR', 
          'Malgun Gothic', 
          'Apple Color Emoji', 
          'Segoe UI Emoji', 
          'Segoe UI Symbol', 
          'sans-serif'
        ],
        mono: ['var(--font-jetbrains-mono)', 'D2Coding', 'monospace'],
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1.2rem', letterSpacing: '0.01em' }],
        'sm': ['0.875rem', { lineHeight: '1.4rem', letterSpacing: '0.01em' }],
        'base': ['1rem', { lineHeight: '1.7rem', letterSpacing: '0.01em' }],
        'lg': ['1.125rem', { lineHeight: '1.8rem', letterSpacing: '0.01em' }],
        'xl': ['1.25rem', { lineHeight: '1.9rem', letterSpacing: '0.01em' }],
        '2xl': ['1.5rem', { lineHeight: '2.1rem', letterSpacing: '0.01em' }],
        '3xl': ['1.875rem', { lineHeight: '2.4rem', letterSpacing: '0.01em' }],
        '4xl': ['2.25rem', { lineHeight: '2.7rem', letterSpacing: '0.01em' }],
        '5xl': ['3rem', { lineHeight: '3.4rem', letterSpacing: '0.01em' }],
        '6xl': ['3.75rem', { lineHeight: '4.2rem', letterSpacing: '0.01em' }],
        '7xl': ['4.5rem', { lineHeight: '5rem', letterSpacing: '0.01em' }],
        '8xl': ['6rem', { lineHeight: '6.5rem', letterSpacing: '0.01em' }],
        '9xl': ['8rem', { lineHeight: '8.5rem', letterSpacing: '0.01em' }],
      },
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        gray: {
          50: 'hsl(var(--gray-50))',
          100: 'hsl(var(--gray-100))',
          200: 'hsl(var(--gray-200))',
          300: 'hsl(var(--gray-300))',
          400: 'hsl(var(--gray-400))',
          500: 'hsl(var(--gray-500))',
          600: 'hsl(var(--gray-600))',
          700: 'hsl(var(--gray-700))',
          800: 'hsl(var(--gray-800))',
          900: 'hsl(var(--gray-900))',
        },
      },
      borderRadius: {
        'xs': '0.25rem',
        'sm': '0.375rem',
        'md': '0.5rem',
        'lg': 'var(--radius)',
        'xl': '1rem',
        '2xl': '1.25rem',
        '3xl': '1.5rem',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        // Advanced animations
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in-down': {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-left': {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'slide-in-right': {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'bounce-in': {
          '0%': { opacity: '0', transform: 'scale(0.3)' },
          '50%': { opacity: '1', transform: 'scale(1.05)' },
          '70%': { transform: 'scale(0.9)' },
          '100%': { transform: 'scale(1)' },
        },
        'shake': {
          '0%, 100%': { transform: 'translateX(0)' },
          '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-2px)' },
          '20%, 40%, 60%, 80%': { transform: 'translateX(2px)' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        'glow': {
          '0%, 100%': { boxShadow: '0 0 5px rgba(59, 130, 246, 0.5)' },
          '50%': { boxShadow: '0 0 20px rgba(59, 130, 246, 0.8)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200px 0' },
          '100%': { backgroundPosition: 'calc(200px + 100%) 0' },
        },
        'gradient-shift': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        // Advanced animations
        'fade-in': 'fade-in 0.5s ease-out',
        'fade-in-up': 'fade-in-up 0.6s ease-out',
        'fade-in-down': 'fade-in-down 0.6s ease-out',
        'slide-in-left': 'slide-in-left 0.5s ease-out',
        'slide-in-right': 'slide-in-right 0.5s ease-out',
        'scale-in': 'scale-in 0.3s ease-out',
        'bounce-in': 'bounce-in 0.6s ease-out',
        'shake': 'shake 0.5s ease-in-out',
        'pulse-soft': 'pulse-soft 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'gradient-shift': 'gradient-shift 3s ease infinite',
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: 'none',
            color: 'hsl(var(--foreground))',
            fontSize: '1.125rem',
            lineHeight: '1.8',
            letterSpacing: '0.01em',
            'h1, h2, h3, h4, h5, h6': {
              color: 'hsl(var(--foreground))',
              fontWeight: '700',
              letterSpacing: '0.02em',
              marginTop: '2rem',
              marginBottom: '1rem',
            },
            h1: {
              fontSize: '2.5rem',
              lineHeight: '1.2',
              marginTop: '0',
              marginBottom: '1.5rem',
            },
            h2: {
              fontSize: '2rem',
              lineHeight: '1.3',
            },
            h3: {
              fontSize: '1.5rem',
              lineHeight: '1.4',
            },
            h4: {
              fontSize: '1.25rem',
              lineHeight: '1.5',
            },
            p: {
              marginTop: '1.25rem',
              marginBottom: '1.25rem',
              color: 'hsl(var(--foreground))',
              fontSize: '1.125rem',
              lineHeight: '1.8',
            },
            strong: {
              color: 'hsl(var(--foreground))',
              fontWeight: '600',
            },
            a: {
              color: 'hsl(var(--primary))',
              textDecoration: 'none',
              fontWeight: '500',
              '&:hover': {
                color: 'hsl(var(--primary))',
                textDecoration: 'underline',
              },
            },
            blockquote: {
              fontStyle: 'normal',
              fontWeight: '400',
              color: 'hsl(var(--muted-foreground))',
              borderLeftColor: 'hsl(var(--border))',
              borderLeftWidth: '4px',
              paddingLeft: '1.5rem',
              marginLeft: '0',
              marginRight: '0',
              fontSize: '1.125rem',
            },
            'ul, ol': {
              paddingLeft: '1.5rem',
              marginTop: '1.25rem',
              marginBottom: '1.25rem',
            },
            li: {
              marginTop: '0.5rem',
              marginBottom: '0.5rem',
              fontSize: '1.125rem',
              lineHeight: '1.8',
            },
            'li p': {
              marginTop: '0.5rem',
              marginBottom: '0.5rem',
            },
            'code::before': {
              content: 'none',
            },
            'code::after': {
              content: 'none',
            },
            code: {
              backgroundColor: 'hsl(var(--muted))',
              color: 'hsl(var(--foreground))',
              fontWeight: '500',
              fontSize: '0.9em',
              borderRadius: '0.375rem',
              paddingTop: '0.25rem',
              paddingBottom: '0.25rem',
              paddingLeft: '0.5rem',
              paddingRight: '0.5rem',
            },
            pre: {
              backgroundColor: 'hsl(var(--muted))',
              color: 'hsl(var(--foreground))',
              borderRadius: '0.5rem',
              padding: '1.5rem',
              overflow: 'auto',
              fontSize: '0.875rem',
              lineHeight: '1.7',
              marginTop: '1.5rem',
              marginBottom: '1.5rem',
            },
            'pre code': {
              backgroundColor: 'transparent',
              padding: '0',
              fontWeight: 'inherit',
              fontSize: 'inherit',
              borderRadius: '0',
            },
            table: {
              marginTop: '2rem',
              marginBottom: '2rem',
              fontSize: '1rem',
            },
            'thead th': {
              color: 'hsl(var(--foreground))',
              fontWeight: '600',
              borderBottomColor: 'hsl(var(--border))',
            },
            'tbody td': {
              borderBottomColor: 'hsl(var(--border))',
            },
          },
        },
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'), 
    require('@tailwindcss/typography'),
    require('@tailwindcss/container-queries')
  ],
} satisfies Config;

export default config;
