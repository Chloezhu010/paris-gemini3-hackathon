import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // 清爽的品牌色系
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9', // 主色 - 清爽的天蓝
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c3d66',
        },
        // 实验性的accent色 - 活力青绿
        accent: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e', // 清新的绿
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#145231',
        },
        // 中立色 - 更现代的灰度
        slate: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
        // 功能色
        success: '#22c55e',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#0ea5e9',
      },
      backgroundColor: {
        base: 'var(--color-background)',
      },
      textColor: {
        base: 'var(--color-foreground)',
      },
      fontSize: {
        xs: ['12px', { lineHeight: '16px', letterSpacing: '0.5px' }],
        sm: ['14px', { lineHeight: '20px', letterSpacing: '0.25px' }],
        base: ['16px', { lineHeight: '24px', letterSpacing: '0px' }],
        lg: ['18px', { lineHeight: '28px', letterSpacing: '0px' }],
        xl: ['20px', { lineHeight: '28px', letterSpacing: '-0.5px' }],
        '2xl': ['24px', { lineHeight: '32px', letterSpacing: '-0.5px' }],
        '3xl': ['30px', { lineHeight: '36px', letterSpacing: '-1px' }],
        '4xl': ['36px', { lineHeight: '44px', letterSpacing: '-1px' }],
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
        display: ['"Inter Display"', 'var(--font-sans)', 'system-ui'],
      },
      spacing: {
        xs: '4px',
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '24px',
        '2xl': '32px',
        '3xl': '48px',
        '4xl': '64px',
      },
      borderRadius: {
        none: '0',
        xs: '4px',
        sm: '6px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        '2xl': '20px',
        full: '9999px',
      },
      boxShadow: {
        // 微妙的阴影系统 - 实验性设计
        xs: '0 1px 2px 0 rgba(15, 23, 42, 0.08)',
        sm: '0 1px 3px 0 rgba(15, 23, 42, 0.1), 0 1px 2px 0 rgba(15, 23, 42, 0.06)',
        md: '0 4px 6px -1px rgba(15, 23, 42, 0.1), 0 2px 4px -1px rgba(15, 23, 42, 0.06)',
        lg: '0 10px 15px -3px rgba(15, 23, 42, 0.1), 0 4px 6px -2px rgba(15, 23, 42, 0.05)',
        xl: '0 20px 25px -5px rgba(15, 23, 42, 0.1), 0 10px 10px -5px rgba(15, 23, 42, 0.04)',
        // 实验性：彩色阴影
        'glow-primary': '0 0 20px rgba(14, 165, 233, 0.2)',
        'glow-accent': '0 0 20px rgba(34, 197, 94, 0.2)',
        'inset-sm': 'inset 0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      },
      backgroundImage: {
        // 实验性：微妙渐变
        'gradient-subtle': 'linear-gradient(135deg, var(--tw-gradient-stops))',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'pulse-soft': 'pulseSoft 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(8px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
      },
      transitionDuration: {
        fast: '150ms',
        normal: '200ms',
        slow: '300ms',
      },
      transitionTimingFunction: {
        smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
        'smooth-in': 'cubic-bezier(0.4, 0, 1, 1)',
        'smooth-out': 'cubic-bezier(0, 0, 0.2, 1)',
      },
    },
  },
  plugins: [
    function ({ addBase, theme }: any) {
      addBase({
        'h1, h2, h3, h4, h5, h6': {
          fontWeight: '700',
          letterSpacing: '-0.02em',
        },
        'h1': { fontSize: '2.25rem', lineHeight: '2.5rem' },
        'h2': { fontSize: '1.875rem', lineHeight: '2.25rem' },
        'h3': { fontSize: '1.5rem', lineHeight: '2rem' },
        'h4': { fontSize: '1.25rem', lineHeight: '1.75rem' },
        'h5': { fontSize: '1.125rem', lineHeight: '1.75rem' },
        'h6': { fontSize: '1rem', lineHeight: '1.5rem' },
      });
    },
  ],
};

export default config;
