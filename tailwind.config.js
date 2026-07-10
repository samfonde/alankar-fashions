/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class"],
    content: [
      './pages/**/*.{js,jsx}',
      './components/**/*.{js,jsx}',
      './app/**/*.{js,jsx}',
      './src/**/*.{js,jsx}',
    ],
    prefix: "",
    theme: {
      container: {
        center: true,
        padding: '2rem',
        screens: { '2xl': '1400px' }
      },
      extend: {
        fontFamily: {
          serif: ['var(--font-serif)', 'Georgia', 'serif'],
          sans: ['var(--font-sans)', '-apple-system', 'sans-serif'],
          devanagari: ['var(--font-devanagari)', 'Georgia', 'serif'],
        },
        colors: {
          border: 'hsl(var(--border))',
          input: 'hsl(var(--input))',
          ring: 'hsl(var(--ring))',
          background: 'hsl(var(--background))',
          foreground: 'hsl(var(--foreground))',
          primary: { DEFAULT: 'hsl(var(--primary))', foreground: 'hsl(var(--primary-foreground))' },
          secondary: { DEFAULT: 'hsl(var(--secondary))', foreground: 'hsl(var(--secondary-foreground))' },
          destructive: { DEFAULT: 'hsl(var(--destructive))', foreground: 'hsl(var(--destructive-foreground))' },
          muted: { DEFAULT: 'hsl(var(--muted))', foreground: 'hsl(var(--muted-foreground))' },
          accent: { DEFAULT: 'hsl(var(--accent))', foreground: 'hsl(var(--accent-foreground))' },
          popover: { DEFAULT: 'hsl(var(--popover))', foreground: 'hsl(var(--popover-foreground))' },
          card: { DEFAULT: 'hsl(var(--card))', foreground: 'hsl(var(--card-foreground))' },
          gold: { DEFAULT: '#C7A25A', 50: '#F9F2E1', 100: '#EFDFB9', 200: '#E4CB90', 300: '#D9B767', 400: '#C7A25A', 500: '#B08B3F', 600: '#8A6C2E', 700: '#664F1F' },
          maroon: { DEFAULT: '#3B1F1A', 50: '#F7EEEC', 100: '#E9CFC8', 200: '#C89B90', 300: '#8C574A', 400: '#582A22', 500: '#3B1F1A', 600: '#2A1815', 700: '#1A0F0D' },
          chart: {
            '1': 'hsl(var(--chart-1))', '2': 'hsl(var(--chart-2))',
            '3': 'hsl(var(--chart-3))', '4': 'hsl(var(--chart-4))', '5': 'hsl(var(--chart-5))'
          },
          sidebar: {
            DEFAULT: 'hsl(var(--sidebar-background))',
            foreground: 'hsl(var(--sidebar-foreground))',
            primary: 'hsl(var(--sidebar-primary))',
            'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
            accent: 'hsl(var(--sidebar-accent))',
            'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
            border: 'hsl(var(--sidebar-border))',
            ring: 'hsl(var(--sidebar-ring))'
          }
        },
        borderRadius: { lg: 'var(--radius)', md: 'calc(var(--radius) - 2px)', sm: 'calc(var(--radius) - 4px)' },
        keyframes: {
          'accordion-down': { from: { height: '0' }, to: { height: 'var(--radix-accordion-content-height)' } },
          'accordion-up': { from: { height: 'var(--radix-accordion-content-height)' }, to: { height: '0' } }
        },
        animation: { 'accordion-down': 'accordion-down 0.2s ease-out', 'accordion-up': 'accordion-up 0.2s ease-out' }
      }
    },
    plugins: [require("tailwindcss-animate")],
  }
