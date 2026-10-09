
import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'RMB SATECI | Control de Calidad',
  description:
    'Sistema de registro de inspecciones, observaciones de calidad y exportación de fichas a Excel.',
  applicationName: 'RMB SATECI · Calidad',
}

export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: '#164B78',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body className="antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}