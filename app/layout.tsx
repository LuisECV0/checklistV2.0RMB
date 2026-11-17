
import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import Script from 'next/script'
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
    <html lang="es" suppressHydrationWarning>
      <head>
        <Script id="theme-preference" strategy="beforeInteractive">
          {`try {
            const preference = localStorage.getItem('rmb-sateci-theme')
            const useDarkTheme = preference === 'dark' ||
              (preference !== 'light' && window.matchMedia('(prefers-color-scheme: dark)').matches)
            document.documentElement.classList.toggle('dark', useDarkTheme)
          } catch {
            document.documentElement.classList.toggle(
              'dark',
              window.matchMedia('(prefers-color-scheme: dark)').matches,
            )
          }`}
        </Script>
      </head>
      <body className="antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}