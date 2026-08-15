import type { Metadata } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'

import AuthProvider from 'app/components/AuthProvider'

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '700', '800'],
})

export const metadata: Metadata = {
  title: 'Master Kanji N3',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id">
      <body className={jakarta.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}