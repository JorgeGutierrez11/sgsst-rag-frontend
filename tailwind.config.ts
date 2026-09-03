import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './features/**/*.{js,ts,jsx,tsx,mdx}',
    './shared/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        borde: {
          light: 'hsl(var(--borde-light))',
          gray: 'hsl(var(--borde-gray))',
          strong: 'hsl(var(--borde-strong))',
        },
        capa: {
          main: 'hsl(var(--bg-main))',
          surface: 'hsl(var(--bg-surface))',
          soft: 'hsl(var(--bg-soft))',
          muted: 'hsl(var(--bg-muted))',
        },
        brand: {
          primary: 'hsl(var(--brand-primary))',
          dark: 'hsl(var(--brand-dark))',
          light: 'hsl(var(--brand-light))',
          text: 'hsl(var(--brand-text))',
        },
        txt: {
          main: 'hsl(var(--txt-main))',
          bold: 'hsl(var(--txt-bold))',
          medium: 'hsl(var(--txt-medium))',
          muted: 'hsl(var(--txt-muted))',
          subtle: 'hsl(var(--txt-subtle))',
        },
        status: {
          error: {
            main: 'hsl(var(--error-main))',
            light: 'hsl(var(--error-light))',
          },
          warning: {
            main: 'hsl(var(--warning-main))',
            light: 'hsl(var(--warning-light))',
          },
          success: {
            main: 'hsl(var(--success-main))',
            light: 'hsl(var(--success-light))',
          },
        },
      },
      boxShadow: {
        soft: '0 10px 25px hsl(var(--shadow-soft) / 0.08)',
        button: '0 8px 18px hsl(var(--brand-primary) / 0.18)',
        modal: '0 20px 48px hsl(var(--shadow-strong) / 0.14), 0 4px 12px hsl(var(--shadow-strong) / 0.08)',
      },
      borderRadius: {
        app: 'var(--radius-app)',
      },
    },
  },
  plugins: [],
}

export default config
