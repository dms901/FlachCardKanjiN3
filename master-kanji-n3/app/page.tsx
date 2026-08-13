'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import allData from '../data/kanjiData' // PENTING:../ bukan @/

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function Home() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLogin, setIsLogin] = useState(true)
  const [message, setMessage] = useState('')

  const [part, setPart] = useState(1)
  const [cardIndex, setCardIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [mastered, setMastered] = useState<string[]>([])

  const currentCards = allData[part as keyof typeof allData] || []
  const currentKanji = currentCards[cardIndex]

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user?? null)
      setLoading(false)
    })
    supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user?? null)
    })
  }, [])

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage('')
    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setMessage(error.message)
    } else {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) setMessage(error.message)
      else setMessage('Cek email untuk verifikasi!')
    }
  }

  const logout = async () => { await supabase.auth.signOut() }

  const nextCard = () => { setIsFlipped(false); setCardIndex((prev) => (prev + 1) % currentCards.length) }
  const prevCard = () => { setIsFlipped(false); setCardIndex((prev) => (prev - 1 + currentCards.length) % currentCards.length) }
  const shuffle = () => {
  setIsFlipped(false)
  const card = document.querySelector('.perspective-1000')
  card?.classList.add('animate-shuffle')
  setTimeout(() => card?.classList.remove('animate-shuffle'), 400)
  setCardIndex(Math.floor(Math.random() * currentCards.length))
}
  const toggleMastered = () => {
    const id = `${part}-${cardIndex}`
    setMastered(prev => prev.includes(id)? prev.filter(i => i!== id) : [...prev, id])
  }

  const progress = currentCards.length? (mastered.filter(m => m.startsWith(`${part}-`)).length / currentCards.length) * 100 : 0

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>

  if (!user) return (
  <div className="min-h-screen flex items-center justify-center p-4">
    <div className="w-full max-w-md bg-white rounded-3xl shadow-premium p-8">
      <p className="text-gray-400 text-sm mb-2">漢</p>
      <h1 className="text-3xl font-extrabold mb-1">Master Kanji</h1>
      <p className="text-gray-500 mb-6">Belajar Kanji N3</p>
      
      <div className="flex gap-2 mb-4">
        <button onClick={() => setAuthMode('login')} className={`px-4 py-1.5 rounded-full text-sm font-semibold ${authMode === 'login' ? 'bg-red-100 text-red-500' : 'bg-gray-100 text-gray-500'}`}>Login</button>
        <button onClick={() => setAuthMode('register')} className={`px-4 py-1.5 rounded-full text-sm font-semibold ${authMode === 'register' ? 'bg-red-100 text-red-500' : 'bg-gray-100 text-gray-500'}`}>Daftar</button>
      </div>

      <form onSubmit={handleAuth} className="flex gap-2">
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@example.com" className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm" required />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Minimal 6 karakter" className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm" required />
        <button type="submit" className="bg-blue-500 text-white px-6 py-3 rounded-xl font-bold">Login</button>
      </form>
    </div>
  </div>
)

 // PROGRESS BAR
<div className="mb-6">
  <div className="flex justify-between text-xs text-gray-500 mb-1">
    <span>{cardIndex + 1} / {currentCards.length}</span>
    <span className="text-red-500 font-bold">{Math.round(progress)}%</span>
  </div>
  <div className="w-full bg-gray-200 rounded-full h-1.5">
    <div className="bg-red-500 h-1.5 rounded-full transition-all duration-700" style={{width: `${progress}%`}}></div>
  </div>
</div>

// KARTU
<div className="perspective-1000 h-[320px] mb-6">
  <div className={`card-inner relative w-full h-full preserve-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
    <div className="absolute inset-0 backface-hidden bg-white shadow-premium flex-col items-center justify-center p-8 text-center">
      <p className="text-8xl font-bold">{currentKanji?.kanji}</p>
      <p className="text-xs text-gray-400 mt-8">LIHAT ARTI</p>
    </div>
    <div className="absolute inset-0 backface-hidden bg-white shadow-premium rotate-y-180 flex-col items-center justify-center p-8">
      <p className="text-2xl font-bold">{currentKanji?.kanji}</p>
      <p className="text-gray-600">{currentKanji?.kunyomi}</p>
      <p className="text-gray-600">{currentKanji?.onyomi}</p>
      <p className="mt-2">{currentKanji?.arti}</p>
    </div>
  </div>
</div>

// TOMBOL BAWAH
<div className="flex gap-2 mb-2">
  <button onClick={prevCard} className="p-4 bg-gray-100 rounded-full">←</button>
  <button onClick={toggleMastered} className={`flex-1 py-4 rounded-2xl font-bold text-white ${isMastered ? 'bg-green-500' : 'bg-gray-300'}`}>
    ✓ Sudah Hafal
  </button>
  <button onClick={nextCard} className="p-4 bg-red-500 text-white rounded-full">→</button>
</div>
<button onClick={shuffle} className="w-full py-3 bg-gray-100 rounded-2xl text-sm text-gray-600">🔀 Acak Kartu</button>