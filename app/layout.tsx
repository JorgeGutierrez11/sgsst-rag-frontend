import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'NormIA | Asistente normativo para empresas',
  description: 'Consulta normativa y entiende las obligaciones de tu empresa con NormIA.',
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: 'hsl(120 14% 99%)',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className="bg-background">
      <body className="antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
