'use client'

import AuthProvider from './components/AuthProvider'
import KanjiApp from './components/KanjiApp'

export default function Page() {
  return (
    <AuthProvider>
      <KanjiApp />
    </AuthProvider>
  )
}