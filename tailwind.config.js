/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./App.tsx",
    "./index.tsx",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./contexts/**/*.{js,ts,jsx,tsx}",
    "./utils/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'Hind Siliguri', 'sans-serif'],
        body: ['Hind Siliguri', 'Inter', 'sans-serif'],
        tiro: ['Kalpurush', 'sans-serif'],
        display: ['Bricolage Grotesque', 'Outfit', 'Inter', 'sans-serif'],
        bangla: ['Noto Serif Bengali', 'Hind Siliguri', 'serif'],
        noto: ['Noto Sans Bengali', 'sans-serif'],
      },
      spacing: {
        '4.5': '1.125rem',
      },
      animation: {
        marquee: 'marquee 42s linear infinite',
        'marquee-slow': 'marquee 64s linear infinite',
        float: 'float 7s ease-in-out infinite',
        'float-slow': 'float 10s ease-in-out infinite',
        'spin-slow': 'spin 22s linear infinite',
        'pulse-ring': 'pulse-ring 2.4s cubic-bezier(0.16, 1, 0.3, 1) infinite',
        shimmer: 'shimmer 2.8s linear infinite',
        ticker: 'ticker 18s linear infinite',
      },
      keyframes: {
        marquee: { from: { transform: 'translateX(0)' }, to: { transform: 'translateX(-50%)' } },
        float: { '0%, 100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-14px)' } },
        'pulse-ring': { '0%': { transform: 'scale(1)', opacity: '0.9' }, '70%': { transform: 'scale(1.9)', opacity: '0' }, '100%': { transform: 'scale(1.9)', opacity: '0' } },
        shimmer: { from: { backgroundPosition: '200% 0' }, to: { backgroundPosition: '-200% 0' } },
        ticker: { from: { transform: 'translateY(0)' }, to: { transform: 'translateY(-50%)' } },
      },
      fontSize: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: ['1rem', { lineHeight: '1.6', fontWeight: '400' }],
        md: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem',
        '5xl': '3rem',
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Existing app tokens
        brand: {
          DEFAULT: '#ff5200',
          orange: '#ff5200',
          black: '#000000',
          white: '#ffffff',
          deep: '#e04400',
          bright: '#ff7a35',
        },
        // Premium landing-page palette
        paper: '#faf9f6',
        cream: '#fff1e8',
        ink: '#161210',
        'ink-2': '#201a16',
        'ink-3': '#2a231d',
        mist: '#6f655c',
        mint: '#ffeade',
        lime: '#ffb92e',
        'lime-soft': '#ffedc2',
        'amber-soft': '#fff1d6',
        gold: '#ffb92e',
        flag: '#e63b2e',
      }
    },
  },
  plugins: [],
}
