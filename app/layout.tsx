import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Providers } from './providers'
import './globals.css'

const _geist = Geist({ subsets: ['latin'] })
const _geistMono = Geist_Mono({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Sudoku Mini App',
  description: 'Challenge your mind with classic Sudoku puzzle game',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
  other: {
    'fc:miniapp': JSON.stringify({
      version: '1',
      imageUrl: '/sudoku-puzzle-game.jpg',
      button: {
        title: '🎮 Play Sudoku',
        action: {
          type: 'launch_frame',
          name: 'Sudoku',
          url: process.env.NEXT_PUBLIC_APP_URL || 'https://your-app-url.com',
          splashImageUrl: '/sudoku-logo.jpg',
          splashBackgroundColor: '#0f172a',
        },
      },
    }),
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <meta
          name="fc:miniapp"
          content={JSON.stringify({
            version: '1',
            imageUrl: '/sudoku-puzzle-game.jpg',
            button: {
              title: '🎮 Play Sudoku',
              action: {
                type: 'launch_frame',
                name: 'Sudoku',
                url: process.env.NEXT_PUBLIC_APP_URL || 'https://your-app-url.com',
                splashImageUrl: '/sudoku-logo.jpg',
                splashBackgroundColor: '#0f172a',
              },
            },
          })}
        />
      </head>
      <body className={`font-sans antialiased`}>
        <Providers>{children}</Providers>
        <Analytics />
      </body>
    </html>
  )
}
