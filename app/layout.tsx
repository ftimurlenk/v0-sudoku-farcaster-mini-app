import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Providers } from './providers'
import './globals.css'

const _geist = Geist({ subsets: ['latin'] })
const _geistMono = Geist_Mono({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'BaseDoku - Sudoku on Base',
  description: 'Challenge your mind with classic Sudoku. Compete on the leaderboard and save scores onchain.',
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
  openGraph: {
    title: 'BaseDoku - Sudoku on Base',
    description: 'Challenge your mind with classic Sudoku. Compete on the leaderboard and save scores onchain.',
    url: 'https://basedoku.vercel.app',
    siteName: 'BaseDoku',
    images: [
      {
        url: 'https://basedoku.vercel.app/sudoku-puzzle-game.jpg',
        width: 1200,
        height: 630,
        alt: 'BaseDoku - Sudoku on Base Network',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BaseDoku - Sudoku on Base',
    description: 'Challenge your mind with classic Sudoku. Compete on the leaderboard and save scores onchain.',
    images: ['https://basedoku.vercel.app/sudoku-puzzle-game.jpg'],
  },
  other: {
    'fc:miniapp': JSON.stringify({
      version: '1',
      imageUrl: 'https://basedoku.vercel.app/sudoku-puzzle-game.jpg',
      button: {
        title: '🎮 Play Sudoku',
        action: {
          type: 'launch_frame',
          name: 'BaseDoku',
          url: 'https://basedoku.vercel.app',
          splashImageUrl: 'https://basedoku.vercel.app/sudoku-puzzle-game.jpg',
          splashBackgroundColor: '#1a1a2e',
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
            imageUrl: 'https://basedoku.vercel.app/sudoku-puzzle-game.jpg',
            button: {
              title: '🎮 Play Sudoku',
              action: {
                type: 'launch_frame',
                name: 'BaseDoku',
                url: 'https://basedoku.vercel.app',
                splashImageUrl: 'https://basedoku.vercel.app/sudoku-puzzle-game.jpg',
                splashBackgroundColor: '#1a1a2e',
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
