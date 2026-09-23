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
        tiro: ['Kalpurush', 'sans-serif'],
        display: ['"Bricolage Grotesque"', 'Outfit', 'Inter', 'sans-serif'],
        noto: ['"Noto Sans Bengali"', 'sans-serif'],
        /* ── Landing (porikkhangon.app editorial theme) ── */
        bangla: ['"Noto Serif Bengali"', 'Hind Siliguri', 'serif'],
        body: ['Hind Siliguri', 'ui-sans-serif', 'system-ui', 'sans-serif'],
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
        brand: {
          DEFAULT: '#ff5200',
          deep: '#e04400',
          bright: '#ff7a35',
          orange: '#ff5200',
          black: '#000000',
          white: '#ffffff',
          /* Full scale from the premium landing design (premium-edtech-landing-page.zip) */
          50: '#fff4ed',
          100: '#ffe6d5',
          200: '#ffc9a8',
          300: '#ffa375',
          400: '#ff7a36',
          500: '#ff5200',
          600: '#e64700',
          700: '#c43c02',
          800: '#9c3008',
          900: '#7e2a0e',
          950: '#451307',
        },
        /* ── Landing palette: warm paper / warm ink / brand orange / amber ── */
        paper: '#faf9f6',
        cream: '#fff1e8',
        /* ── Single warm ink ramp shared by the landing AND the app screens.
           Previously `ink.DEFAULT` was warm (#161210) while `ink.950` was a
           cool blue-black (#101018), so the landing's headings and the
           dashboard's headings rendered two different "blacks". The ramp below
           is warm end-to-end and terminates exactly at `ink.DEFAULT`, so
           `text-ink` and `text-ink-950` are now the same colour. ── */
        ink: {
          DEFAULT: '#161210',
          2: '#201a16',
          3: '#2a231d',
          50: '#faf8f6',
          100: '#f0ece8',
          200: '#e0d8d1',
          300: '#c4b8ad',
          400: '#a19386',
          500: '#7f7267',
          600: '#665b52',
          700: '#524942',
          800: '#443c36',
          900: '#3a332e',
          950: '#161210',
        },
        /* Muted body/label text. Darkened from #6f655c so it clears WCAG AA
           (4.5:1) on the warm paper background. */
        mist: '#6a6058',
        mint: '#ffeade',
        lime: {
          DEFAULT: '#ffb92e',
          soft: '#ffedc2',
        },
        amber: {
          soft: '#fff1d6',
        },
        gold: {
          DEFAULT: '#ffb92e',
          50: '#fffaeb',
          100: '#fff1c8',
          300: '#ffd76e',
          400: '#ffc93d',
          500: '#ffb020',
          600: '#e8930c',
        },
        flag: '#e63b2e',
      },
      /* Extra spacing steps used by the landing design */
      spacing: {
        '4.5': '1.125rem',
        '5.5': '1.375rem',
      },
      /* Shared radius scale. The landing used 1.6/1.8/2/2.5rem + 26/28px while
         the dashboard used 1.75rem/3xl — no common vocabulary. Both now pull
         from these three semantic steps. */
      borderRadius: {
        card: '1.6rem',
        panel: '2rem',
        hero: '2.5rem',
      },
      /* Opacity steps the landing design leans on (ring-ink/8, bg-white/12 …) */
      opacity: {
        2: '0.02',
        3: '0.03',
        4: '0.04',
        6: '0.06',
        8: '0.08',
        12: '0.12',
        18: '0.18',
        22: '0.22',
        35: '0.35',
        45: '0.45',
        55: '0.55',
        65: '0.65',
        85: '0.85',
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
        marquee: {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(-50%)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-14px)' },
        },
        'pulse-ring': {
          '0%': { transform: 'scale(1)', opacity: '0.9' },
          '70%': { transform: 'scale(1.9)', opacity: '0' },
          '100%': { transform: 'scale(1.9)', opacity: '0' },
        },
        shimmer: {
          from: { backgroundPosition: '200% 0' },
          to: { backgroundPosition: '-200% 0' },
        },
        ticker: {
          from: { transform: 'translateY(0)' },
          to: { transform: 'translateY(-50%)' },
        },
      },
    },
  },
  plugins: [],
}
