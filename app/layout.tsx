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
  // Android: el teclado redimensiona el layout para que el campo de consulta no quede tapado
  interactiveWidget: 'resizes-content',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className="bg-background">
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
