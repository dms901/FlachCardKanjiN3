'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { kanjiData } from '../data/kanjiData'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
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

  const currentCards = kanjiData[part as keyof typeof kanjiData] || []
  const currentKanji = currentCards[cardIndex]
  const isMastered = mastered.includes(`${part}-${cardIndex}`)
  const progress = currentCards.length > 0? (mastered.filter(m => m.startsWith(`${part}-`)).length / currentCards.length) * 100 : 0

  useEffect(() => { // <- FIX 2: kurung udah dibenerin
    setLoading(true)
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user?? null)
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user?? null)
    })
    return () => {
      subscription.unsubscribe()
    }
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
    setCardIndex(Math.floor(Math.random() * currentCards.length))
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  if (!user) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Master Kanji N3</h1>
        <form onSubmit={handleAuth} className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition"
            disabled={loading}
          >
            {authMode === 'login' ? 'Login' : 'Register'}
          </button>
        </form>
        <button
          onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
          className="w-full mt-4 text-sm text-gray-600 hover:text-gray-800 transition"
        >
          {authMode === 'login' ? 'Belum punya akun? Daftar' : 'Sudah punya akun? Login'}
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-2xl mx-auto bg-gray-50">
      <div className="flex justify-between items-center mb-6">
        <div>
          <p className="text-xs text-gray-400">MASTER KANJI</p>
          <select value={part} onChange={e => { setPart(e.target.value); setCardIndex(0); setMastered([]) }} className="font-bold text-xl bg-transparent outline-none">
            {Object.keys(kanjiData).map(p => <option key={p} value={p}>Bagian {p.replace('part', '')}</option>)} // {/*FIX 3: kanjiData*/}
          </select>
        </div>
        <button onClick={logout} className="text-sm bg-gray-100 px-4 py-2 rounded-full hover:bg-gray-200 transition">Keluar</button>
      </div>
      {/*... sisanya sama... */}
    </div>
  )
}