'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import allData from '../data/kanjiData'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function Home() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLogin, setIsLogin] = useState(true)
  const [message, setMessage] = useState('')

  const [part, setPart] = useState(1)
  const [cardIndex, setCardIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [mastered, setMastered] = useState([])

  const currentCards = allData[part] || []
  const currentKanji = currentCards[cardIndex]

  // 1. CEK LOGIN + LOAD PROGRESS DARI DB
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user?? null)
      if(session?.user) loadProgress(session.user.id)
      setLoading(false)
    })
    supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user?? null)
      if(session?.user) loadProgress(session.user.id)
      else setMastered([])
    })
  }, [])

  // 2. LOAD PROGRESS DARI TABEL user_progress
  const loadProgress = async (userId) => {
    const { data } = await supabase.from('user_progress').select('*').eq('user_id', userId)
    if(data) setMastered(data.map(d => `${d.part_id}-${d.kanji_index}`))
  }

  // 3. SIMPAN/HAPUS KE DB PAS KLIK "Tandai Hafal"
  const toggleMastered = async () => {
    const id = `${part}-${cardIndex}`
    const isMastered = mastered.includes(id)

    if (isMastered) {
      // Hapus dari DB
      await supabase.from('user_progress').delete().match({ user_id: user.id, part_id: part, kanji_index: cardIndex })
      setMastered(prev => prev.filter(i => i!== id))
    } else {
      // Tambah ke DB
      await supabase.from('user_progress').insert({ user_id: user.id, part_id: part, kanji_index: cardIndex })
      setMastered(prev => [...prev, id])
    }
  }

  const handleAuth = async (e) => {
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
  const shuffle = () => { setIsFlipped(false); setCardIndex(Math.floor(Math.random() * currentCards.length)) }
  const progress = currentCards.length? (mastered.filter(m => m.startsWith(`${part}-`)).length / currentCards.length) * 100 : 0

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 py-10">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-red-500 text-white rounded-3xl flex items-center justify-center text-3xl font-black mx-auto mb-5 shadow-lg">漢</div>
            <h1 className="text-2xl font-black text-slate-900">Master Kanji N3</h1>
          </div>
          <div className="bg-white rounded-[2rem] border-slate-100 shadow-premium p-7">
            <div className="flex bg-slate-100 rounded-2xl p-1 mb-6">
              <button onClick={() => setIsLogin(true)} className={`flex-1 py-3 rounded-xl font-bold text-sm ${isLogin? 'bg-white shadow-sm' : 'text-slate-400'}`}>Login</button>
              <button onClick={() => setIsLogin(false)} className={`flex-1 py-3 rounded-xl font-bold text-sm ${!isLogin? 'bg-white shadow-sm' : 'text-slate-400'}`}>Daftar</button>
            </div>
            {message && <div className="mb-4 p-3 rounded-xl text-xs font-bold bg-red-50 text-red-500">{message}</div>}
            <form onSubmit={handleAuth}>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="email@example.com" className="w-full px-4 py-4 mb-4 rounded-2xl border-slate-200 outline-none focus:border-red-400 text-sm" />
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength="6" placeholder="Minimal 6 karakter" className="w-full px-4 py-4 mb-6 rounded-2xl border-slate-200 outline-none focus:border-red-400 text-sm" />
              <button type="submit" className="w-full py-4 bg-red-500 text-white rounded-2xl font-black shadow-lg shadow-red-100 active:scale-95 transition">{isLogin? 'Login' : 'Daftar'}</button>
            </form>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center min-h-screen">
      <header className="w-full max-w-md sticky top-0 bg-[#fcfcfd]/90 backdrop-blur-md z-50 border-b border-slate-100">
        <div className="flex justify-between items-center px-6 py-4">
          <div>
            <h1 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Master Kanji</h1>
            <select value={part} onChange={e => {setPart(Number(e.target.value)); setCardIndex(0)}} className="text-lg font-extrabold bg-transparent outline-none">
              {Object.keys(allData).map(p => <option key={p} value={p}>Bagian {p}</option>)}
            </select>
          </div>
          <button onClick={logout} className="px-3 py-2 rounded-xl bg-slate-100 text-[9px] font-black text-slate-500">Keluar</button>
        </div>
      </header>
      <main className="w-full max-w-md px-6 pb-20 pt-8">
        <div className="mb-8 px-1">
          <div className="flex justify-between items-end mb-3">
            <span className="text-xs font-black text-slate-900">{cardIndex + 1} / {currentCards.length}</span>
            <span className="text-[10px] font-black text-red-500 bg-red-50 px-2 py-1 rounded-md">{progress.toFixed(0)}%</span>
          </div>
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-red-500 transition-all duration-700" style={{width: `${progress}%`}}></div>
          </div>
        </div>
        <div className="perspective-1000 w-full aspect-[4/4.8] cursor-pointer" onClick={() => setIsFlipped(!isFlipped)}>
          <div className={`card-inner relative w-full h-full preserve-3d ${isFlipped? 'rotate-y-180' : ''}`}>
            <div className="absolute inset-0 backface-hidden bg-white rounded-[3rem] shadow-premium border-slate-50 flex-col items-center justify-center p-8 text-center">
              <div className="text-6xl text-slate-900 tracking-tighter">{currentKanji?.k}</div>
            </div>
            <div className="absolute inset-0 backface-hidden bg-white rounded-[3rem] shadow-premium border-4 border-red-50 rotate-y-180 flex-col items-center justify-center p-8 text-center">
              <div className="text-3xl font-black text-red-500 mb-3">{currentKanji?.r}</div>
              <div className="text-2xl font-semibold text-slate-600 leading-tight">{currentKanji?.m}</div>
            </div>
          </div>
        </div>
        <div className="mt-8 px-2">
          <div className="flex items-center justify-between">
            <button onClick={prevCard} className="w-14 h-14 flex items-center justify-center bg-white border border-slate-100 rounded-[1.5rem] shadow-sm text-xl active:scale-90 transition">←</button>
            <button onClick={toggleMastered} className="flex-1 mx-3 h-14 bg-slate-900 text-white rounded-[1.5rem] font-black text-sm active:scale-95 transition">
              {mastered.includes(`${part}-${cardIndex}`)? '✓ Sudah Hafal' : 'Tandai Hafal'}
            </button>
            <button onClick={nextCard} className="w-14 h-14 flex items-center justify-center bg-red-500 text-white rounded-[1.5rem] shadow-lg text-xl active:scale-90 transition">→</button>
          </div>
          <button onClick={shuffle} className="w-full h-12 mt-3 bg-white border-slate-200 text-slate-700 rounded-2xl font-black text-xs flex items-center justify-center gap-2 active:scale-[0.97] transition">🔀 Acak Kartu</button>
        </div>
      </main>
    </div>
  )
}