/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    50: '#eef2ff',
                    100: '#e0e7ff',
                    200: '#c7d2fe',
                    300: '#a5b4fc',
                    400: '#818cf8',
                    500: '#6366f1',
                    600: '#4f46e5',
                    700: '#4338ca',
                    800: '#3730a3',
                    900: '#312e81',
                    950: '#1e1b4b',
                },
                neon: {
                    blue: '#00d4ff',
                    purple: '#a855f7',
                    pink: '#ec4899',
                    green: '#10b981',
                    orange: '#f97316',
                    red: '#ef4444',
                },
                surface: {
                    900: '#0a0a1a',
                    800: '#0f0f2e',
                    700: '#1a1a3e',
                    600: '#252550',
                }
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
            },
            animation: {
                'glow': 'glow 2s ease-in-out infinite alternate',
                'float': 'float 6s ease-in-out infinite',
                'pulse-neon': 'pulse-neon 2s ease-in-out infinite',
                'slide-up': 'slide-up 0.5s ease-out',
                'scan-line': 'scan-line 3s linear infinite',
            },
            keyframes: {
                glow: {
                    '0%': { boxShadow: '0 0 5px rgba(99,102,241,0.5), 0 0 20px rgba(99,102,241,0.2)' },
                    '100%': { boxShadow: '0 0 20px rgba(99,102,241,0.8), 0 0 60px rgba(99,102,241,0.4)' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-20px)' },
                },
                'pulse-neon': {
                    '0%, 100%': { opacity: 1 },
                    '50%': { opacity: 0.5 },
                },
                'slide-up': {
                    '0%': { transform: 'translateY(30px)', opacity: 0 },
                    '100%': { transform: 'translateY(0)', opacity: 1 },
                },
                'scan-line': {
                    '0%': { transform: 'translateY(-100%)' },
                    '100%': { transform: 'translateY(100%)' },
                },
            },
            backgroundImage: {
                'grid-pattern': 'linear-gradient(rgba(99,102,241,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.1) 1px, transparent 1px)',
            },
        },
    },
    plugins: [],
}
