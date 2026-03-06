import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: { DEFAULT: '#0b0e14', card: '#141922', raised: '#1a1f2e', hover: '#1e2536' },
        border: { DEFAULT: '#1e2532', light: '#2a3142', active: '#387ed1' },
        txt: { primary: '#e1e4ea', secondary: '#8b93a7', muted: '#525d73', dim: '#3a4356' },
        bull: { DEFAULT: '#26a69a', light: '#2dd4bf', dim: '#1a6b66', bg: 'rgba(38,166,154,0.08)' },
        bear: { DEFAULT: '#ef5350', light: '#f87171', dim: '#a33b39', bg: 'rgba(239,83,80,0.08)' },
        accent: { DEFAULT: '#387ed1', hover: '#4a92e8', dim: '#243b5c', bg: 'rgba(56,126,209,0.1)' },
        amber: { DEFAULT: '#f59e0b', dim: '#92400e' },
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        'xxs': '0.65rem',
      },
      animation: {
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'ticker': 'ticker 0.3s ease-out',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { opacity: '0', transform: 'translateY(8px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        ticker: { '0%': { opacity: '0.5' }, '100%': { opacity: '1' } },
      },
    },
  },
  plugins: [],
};
export default config;
