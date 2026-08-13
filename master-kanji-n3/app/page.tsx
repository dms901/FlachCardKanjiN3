'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { dataKanji } from '../data/kanjiData' // <-- Data dari file terpisah

const supabase = createClient(
  'PASTE_URL_SUPABASE_KAMU',
  'PASTE_ANON_KEY_SUPABASE_KAMU'
)

export default function Home() {
  const [user, setUser] = useState<any>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [authMode, setAuthMode] = useState('login')
  const [part, setPart] = useState('part1')
  const [cardIndex, setCardIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [mastered, setMastered] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  const currentCards = dataKanji[part as keyof typeof dataKanji] || []
  const currentKanji = currentCards[cardIndex]
  const isMastered = mastered.includes(`${part}-${cardIndex}`)
  const progress = currentCards.length? (mastered.filter(m => m.startsWith(`${part}-`)).length / currentCards.length) * 100 : 0

  useEffect(() => {
    setLoading(true)
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user?? null)
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (authMode === 'register') {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        alert('Cek email untuk verifikasi!')
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      }
    } catch (error: any) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    await supabase.auth.signOut()
    setMastered([])
  }

  const nextCard = () => { setIsFlipped(false); setCardIndex((prev) => (prev + 1) % currentCards.length) }
  const prevCard = () => { setIsFlipped(false); setCardIndex((prev) => (prev - 1 + currentCards.length) % currentCards.length) }

  const toggleMastered = () => {
    const id = `${part}-${cardIndex}`
    setMastered(prev => prev.includes(id)? prev.filter(i => i!== id) : [...prev, id])
  }

  const shuffle = () => {
    setIsFlipped(false)
    const card = document.querySelector('.perspective-1000')
    card?.classList.add('animate-shuffle')
    setTimeout(() => card?.classList.remove('animate-shuffle'), 400)
    setCardIndex(Math.floor(Math.random() * currentCards.length))
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>

  // HALAMAN LOGIN
  if (!user) return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-premium p-8">
        <p className="text-gray-400 text-sm mb-2">漢</p>
        <h1 className="text-3xl font-extrabold mb-1">Master Kanji</h1>
        <p className="text-gray-500 mb-6">Belajar Kanji N3</p>

        <div className="flex gap-2 mb-4 bg-gray-100 p-1 rounded-full">
          <button onClick={() => setAuthMode('login')} className={`flex-1 py-1.5 rounded-full text-sm font-semibold transition ${authMode === 'login'? 'bg-white text-red-500 shadow' : 'text-gray-500'}`}>Login</button>
          <button onClick={() => setAuthMode('register')} className={`flex-1 py-1.5 rounded-full text-sm font-semibold transition ${authMode === 'register'? 'bg-white text-red-500 shadow' : 'text-gray-500'}`}>Daftar</button>
        </div>

        <form onSubmit={handleAuth} className="space-y-3">
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@example.com" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-red-500 outline-none" required />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Minimal 6 karakter" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-red-500 outline-none" required />
          <button type="submit" disabled={loading} className="w-full bg-red-500 text-white py-3 rounded-xl font-bold hover:bg-red-600 transition disabled:bg-gray-300">
            {loading? 'Loading...' : authMode === 'login'? 'Login' : 'Daftar'}
          </button>
        </form>
      </div>
    </div>
  )

  // HALAMAN UTAMA FLASHCARD
  return (
    <div className="min-h-screen p-4 md:p-8 max-w-2xl mx-auto">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <p className="text-xs text-gray-400">MASTER KANJI</p>
          <select value={part} onChange={e => { setPart(e.target.value); setCardIndex(0); setMastered([]) }} className="font-bold text-xl bg-transparent outline-none">
            {Object.keys(dataKanji).map(p => <option key={p} value={p}>Bagian {p.replace('part', '')}</option>)}
          </select>
        </div>
        <button onClick={logout} className="text-sm bg-gray-100 px-4 py-2 rounded-full hover:bg-gray-200 transition">Keluar</button>
      </div>

      {/* PROGRESS BAR */}
      <div className="mb-6">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>{cardIndex + 1} / {currentCards.length}</span>
          <span className="text-red-500 font-bold">{Math.round(progress)}% Hafal</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1.5">
          <div className="bg-red-500 h-1.5 rounded-full transition-all duration-700" style={{ width: `${progress}%` }}></div>
        </div>
      </div>

      {/* KARTU */}
      <div className="perspective-1000 h-[320px] md:h-[400px] mb-6" onClick={() => setIsFlipped(!isFlipped)}>
        <div className={`card-inner relative w-full h-full preserve-3d cursor-pointer ${isFlipped? 'rotate-y-180' : ''}`}>
          {/* DEPAN */}
          <div className="absolute inset-0 backface-hidden shadow-premium flex-col items-center justify-center p-8 text-center">
            <p className="text-8xl md:text-9xl font-bold">{currentKanji?.kanji}</p>
            <p className="text-xs text-gray-400 mt-8 tracking-[0.3em]">KETUK UNTUK LIHAT ARTI</p>
          </div>
          {/* BELAKANG */}
          <div className="absolute inset-0 backface-hidden shadow-premium rotate-y-180 flex flex-col items-center justify-center p-8 text-center">
            <p className="text-4xl font-bold mb-3">{currentKanji?.kanji}</p>
            <p className="text-gray-600 text-lg">{currentKanji?.kunyomi}</p>
            <p className="text-gray-600 text-lg mb-4">{currentKanji?.onyomi}</p>
            <p className="mt-2 text-xl font-medium">{currentKanji?.arti}</p>
          </div>
        </div>
      </div>

      {/* TOMBOL */}
      <div className="flex gap-3 mb-3">
        <button onClick={prevCard} className="p-4 bg-gray-100 rounded-2xl hover:bg-gray-200 transition font-bold text-lg">←</button>
        <button onClick={toggleMastered} className={`flex-1 py-4 rounded-2xl font-bold text-white transition text-lg ${isMastered? 'bg-green-500' : 'bg-gray-400'}`}>
          {isMastered? '✓ Sudah Hafal' : 'Tandai Hafal'}
        </button>
        <button onClick={nextCard} className="p-4 bg-red-500 text-white rounded-2xl hover:bg-red-600 transition font-bold text-lg">→</button>
      </div>
      <button onClick={shuffle} className="w-full py-3 bg-gray-100 rounded-2xl text-sm text-gray-600 font-semibold hover:bg-gray-200 transition">🔀 Acak Kartu</button>
    </div>
  )
}