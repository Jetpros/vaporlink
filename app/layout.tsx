import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'VaporLink - Ephemeral Chat Links',
  description: 'Share a link. Chat for 24 hours. Vanish forever.',
  keywords: ['chat', 'ephemeral', 'privacy', 'secure messaging', 'temporary chat'],
  authors: [{ name: 'VaporLink Team' }],
  openGraph: {
    title: 'VaporLink - Ephemeral Chat Links',
    description: 'Share a link. Chat for 24 hours. Vanish forever.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <Toaster />
      </body>
    </html>
  )
}
