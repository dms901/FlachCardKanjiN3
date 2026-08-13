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
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')

  const [part, setPart] = useState(() => {
  return Object.keys(kanjiData)[0] || ''
})
  const [cardIndex, setCardIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [mastered, setMastered] = useState<string[]>([])

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showCollection, setShowCollection] = useState(false)
const allParts = kanjiData as Record<string, any[]>
const currentCards = allParts[part] || []

  const currentKanji = currentCards[cardIndex]

  const currentId = `${part}-${cardIndex}`

  const isMastered = mastered.includes(currentId)

  const progress =
    currentCards.length > 0
      ? (mastered.filter((m) => m.startsWith(`${part}-`)).length /
          currentCards.length) *
        100
      : 0

  /*
  |--------------------------------------------------------------------------
  | AUTH
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const initialize = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      setUser(session?.user ?? null)

      if (session?.user) {
        await loadMastered(session.user.id)
      }

      setLoading(false)
    }

    initialize()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null)

      if (session?.user) {
        await loadMastered(session.user.id)
      } else {
        setMastered([])
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  /*
  |--------------------------------------------------------------------------
  | LOAD MASTERED
  |--------------------------------------------------------------------------
  */

  const loadMastered = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('kanji_progress')
        .select('part, card_index')
        .eq('user_id', userId)

      if (error) {
        console.error(error)
        return
      }

      const ids =
        data?.map((item) => `${item.part}-${item.card_index}`) || []

      setMastered(ids)
    } catch (error) {
      console.error(error)
    }
  }

  /*
  |--------------------------------------------------------------------------
  | LOGIN / REGISTER
  |--------------------------------------------------------------------------
  */

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !password) {
      alert('Email dan password harus diisi.')
      return
    }

    setLoading(true)

    try {
      if (authMode === 'register') {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        })

        if (error) throw error

        if (!data.session) {
          alert(
            'Akun berhasil dibuat. Silakan cek email untuk verifikasi akun.'
          )
        } else {
          alert('Akun berhasil dibuat!')
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) throw error
      }
    } catch (error: any) {
      alert(error.message || 'Terjadi kesalahan.')
    } finally {
      setLoading(false)
    }
  }

  /*
  |--------------------------------------------------------------------------
  | LOGOUT
  |--------------------------------------------------------------------------
  */

  const logout = async () => {
    await supabase.auth.signOut()

    setUser(null)
    setMastered([])
    setCardIndex(0)
    setIsFlipped(false)
  }

  /*
  |--------------------------------------------------------------------------
  | CARD NAVIGATION
  |--------------------------------------------------------------------------
  */

  const nextCard = () => {
    if (!currentCards.length) return

    setIsFlipped(false)

    setCardIndex((prev) => {
      return (prev + 1) % currentCards.length
    })
  }

  const prevCard = () => {
    if (!currentCards.length) return

    setIsFlipped(false)

    setCardIndex((prev) => {
      return (prev - 1 + currentCards.length) % currentCards.length
    })
  }

  const shuffle = () => {
    if (!currentCards.length) return

    setIsFlipped(false)

    let randomIndex = Math.floor(
      Math.random() * currentCards.length
    )

    if (currentCards.length > 1 && randomIndex === cardIndex) {
      randomIndex = (randomIndex + 1) % currentCards.length
    }

    setCardIndex(randomIndex)
  }

  /*
  |--------------------------------------------------------------------------
  | CHANGE PART
  |--------------------------------------------------------------------------
  */

  const changePart = (newPart: string) => {
    setPart(newPart)
    setCardIndex(0)
    setIsFlipped(false)
  }

  /*
  |--------------------------------------------------------------------------
  | MASTERED
  |--------------------------------------------------------------------------
  */

  const toggleMastered = async () => {
    if (!user || !currentKanji) return

    const id = `${part}-${cardIndex}`

    setSaving(true)

    try {
      if (mastered.includes(id)) {
        const { error } = await supabase
          .from('kanji_progress')
          .delete()
          .eq('user_id', user.id)
          .eq('part', part)
          .eq('card_index', cardIndex)

        if (error) throw error

        setMastered((prev) =>
          prev.filter((item) => item !== id)
        )
      } else {
        const { error } = await supabase
          .from('kanji_progress')
          .insert({
            user_id: user.id,
            part: part,
            card_index: cardIndex,
          })

        if (error) throw error

        setMastered((prev) => [...prev, id])
      }
    } catch (error: any) {
      alert(error.message || 'Gagal menyimpan progress.')
    } finally {
      setSaving(false)
    }
  }

  /*
  |--------------------------------------------------------------------------
  | LOADING
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#f7f8fc]">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-gray-200 border-t-black rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-gray-500">
            Memuat Master Kanji...
          </p>
        </div>
      </main>
    )
  }

  /*
  |--------------------------------------------------------------------------
  | LOGIN
  |--------------------------------------------------------------------------
  */

  if (!user) {
    return (
      <main className="min-h-screen bg-[#f7f8fc] flex items-center justify-center px-5 py-10">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-[28px] shadow-xl shadow-black/5 p-7 sm:p-9 border border-gray-100">

            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-black text-white rounded-2xl flex items-center justify-center text-3xl font-bold mx-auto mb-5 shadow-lg">
                漢
              </div>

              <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                Master Kanji N3
              </h1>

              <p className="text-sm text-gray-500 mt-2">
                Belajar kanji dengan flashcard
              </p>
            </div>

            <form onSubmit={handleAuth} className="space-y-4">

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-2">
                  EMAIL
                </label>

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@email.com"
                  autoComplete="email"
                  className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:bg-white focus:border-black focus:ring-2 focus:ring-black/5 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-2">
                  PASSWORD
                </label>

                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete={
                    authMode === 'login'
                      ? 'current-password'
                      : 'new-password'
                  }
                  className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:bg-white focus:border-black focus:ring-2 focus:ring-black/5 transition"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-black text-white py-3.5 rounded-2xl font-semibold hover:bg-gray-800 active:scale-[0.98] transition disabled:opacity-50"
              >
                {loading
                  ? 'Memproses...'
                  : authMode === 'login'
                    ? 'Masuk'
                    : 'Buat Akun'}
              </button>
            </form>

            <button
              onClick={() =>
                setAuthMode(
                  authMode === 'login'
                    ? 'register'
                    : 'login'
                )
              }
              className="w-full mt-5 text-sm text-gray-500 hover:text-black transition"
            >
              {authMode === 'login'
                ? 'Belum punya akun? Daftar'
                : 'Sudah punya akun? Masuk'}
            </button>

          </div>

          <p className="text-center text-xs text-gray-400 mt-6">
            Master Kanji • N3
          </p>
        </div>
      </main>
    )
  }

  /*
  |--------------------------------------------------------------------------
  | MAIN APP
  |--------------------------------------------------------------------------
  */

  return (
    <main className="min-h-screen bg-[#f7f8fc] text-gray-900">

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-5 sm:py-8">

        {/* HEADER */}

        <header className="flex items-center justify-between mb-6">

          <div>
            <p className="text-[10px] tracking-[0.2em] font-bold text-gray-400 mb-1">
              MASTER KANJI
            </p>

            <select
              value={part}
              onChange={(e) => changePart(e.target.value)}
              className="bg-transparent text-xl font-bold outline-none cursor-pointer appearance-none pr-5"
            >
              {Object.keys(kanjiData).map((p) => (
                <option key={p} value={p}>
                  Bagian {p.replace('part', '')}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={logout}
            className="px-4 py-2 rounded-full bg-white border border-gray-200 text-xs font-semibold text-gray-600 hover:text-black hover:border-gray-300 transition"
          >
            Keluar
          </button>

        </header>

        {/* PROGRESS */}

        <section className="bg-white rounded-2xl border border-gray-100 p-4 mb-5 shadow-sm">

          <div className="flex items-center justify-between mb-2">

            <span className="text-xs font-semibold text-gray-500">
              Progress Bagian
            </span>

            <span className="text-xs font-bold text-gray-900">
              {
                mastered.filter((m) =>
                  m.startsWith(`${part}-`)
                ).length
              }{' '}
              / {currentCards.length}
            </span>

          </div>

          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">

            <div
              className="h-full bg-black rounded-full transition-all duration-500"
              style={{
                width: `${progress}%`,
              }}
            />

          </div>

        </section>

        {/* CARD */}

        {currentKanji ? (
          <section>

            <div
              className="relative h-[430px] sm:h-[480px] cursor-pointer"
              style={{
                perspective: '1200px',
              }}
              onClick={() => setIsFlipped(!isFlipped)}
            >

              <div
                className="relative w-full h-full transition-transform duration-500"
                style={{
                  transformStyle: 'preserve-3d',
                  transform: isFlipped
                    ? 'rotateY(180deg)'
                    : 'rotateY(0deg)',
                }}
              >

                {/* FRONT */}

                <div
                  className="absolute inset-0 bg-white rounded-[32px] border border-gray-100 shadow-xl shadow-black/5 flex flex-col items-center justify-center p-8"
                  style={{
                    backfaceVisibility: 'hidden',
                  }}
                >

                  <div className="absolute top-6 left-6">
                    <span className="text-[10px] font-bold tracking-widest text-gray-300">
                      {cardIndex + 1} / {currentCards.length}
                    </span>
                  </div>

                  {isMastered && (
                    <div className="absolute top-5 right-5 w-9 h-9 rounded-full bg-green-500 text-white flex items-center justify-center shadow-lg">
                      ✓
                    </div>
                  )}

                  <div className="text-[150px] sm:text-[180px] leading-none font-medium select-none">
                    {currentKanji.k}
                  </div>

                  <p className="mt-10 text-xs text-gray-400 tracking-widest uppercase">
                    Ketuk untuk melihat jawaban
                  </p>

                </div>

                {/* BACK */}

                <div
                  className="absolute inset-0 bg-black text-white rounded-[32px] shadow-xl flex flex-col items-center justify-center p-8"
                  style={{
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                  }}
                >

                  <div className="text-[80px] leading-none mb-8">
                    {currentKanji.k}
                  </div>

                  <div className="text-center">

                    <p className="text-xs uppercase tracking-[0.2em] text-gray-400 mb-3">
                      Bacaan
                    </p>

                    <p className="text-2xl font-semibold">
                      {currentKanji.r}
                    </p>

                  </div>

                  <div className="w-16 h-px bg-gray-700 my-8" />

                  <div className="text-center">

                    <p className="text-xs uppercase tracking-[0.2em] text-gray-400 mb-3">
                      Arti
                    </p>

                    <p className="text-xl font-medium">
                      {currentKanji.m}
                    </p>

                  </div>

                  <p className="absolute bottom-7 text-xs text-gray-500">
                    Ketuk untuk kembali
                  </p>

                </div>

              </div>

            </div>

            {/* CARD COUNTER */}

            <div className="text-center mt-4">
              <span className="text-xs text-gray-400">
                {cardIndex + 1} dari {currentCards.length}
              </span>
            </div>

            {/* NAVIGATION */}

            <div className="grid grid-cols-3 gap-3 mt-5">

              <button
                onClick={prevCard}
                className="bg-white border border-gray-200 py-3.5 rounded-2xl font-semibold text-sm hover:border-gray-300 active:scale-95 transition"
              >
                ← Prev
              </button>

              <button
                onClick={shuffle}
                className="bg-white border border-gray-200 py-3.5 rounded-2xl font-semibold text-sm hover:border-gray-300 active:scale-95 transition"
              >
                ⤨ Acak
              </button>

              <button
                onClick={nextCard}
                className="bg-white border border-gray-200 py-3.5 rounded-2xl font-semibold text-sm hover:border-gray-300 active:scale-95 transition"
              >
                Next →
              </button>

            </div>

            {/* MASTERED */}

            <button
              onClick={toggleMastered}
              disabled={saving}
              className={`w-full mt-3 py-4 rounded-2xl font-bold text-sm transition active:scale-[0.98] ${
                isMastered
                  ? 'bg-green-500 text-white shadow-lg shadow-green-500/20'
                  : 'bg-black text-white hover:bg-gray-800'
              }`}
            >
              {saving
                ? 'Menyimpan...'
                : isMastered
                  ? '✓ Sudah Hafal'
                  : '○ Tandai Sudah Hafal'}
            </button>

          </section>
        ) : (
          <div className="bg-white rounded-3xl p-10 text-center">
            <p className="text-gray-500">
              Belum ada data kanji pada bagian ini.
            </p>
          </div>
        )}

        {/* BOTTOM MENU */}

        <div className="grid grid-cols-2 gap-3 mt-6">

          <button
            onClick={() => setShowCollection(true)}
            className="bg-white border border-gray-200 rounded-2xl p-4 text-left hover:border-gray-300 transition"
          >
            <div className="text-lg mb-1">📚</div>
            <p className="font-bold text-sm">
              Koleksi
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {
                mastered.length
              }{' '}
              kanji sudah hafal
            </p>
          </button>

          <button
            onClick={() => {
              setCardIndex(0)
              setIsFlipped(false)
            }}
            className="bg-white border border-gray-200 rounded-2xl p-4 text-left hover:border-gray-300 transition"
          >
            <div className="text-lg mb-1">↺</div>
            <p className="font-bold text-sm">
              Mulai Lagi
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Kembali ke kartu pertama
            </p>
          </button>

        </div>

        {/* FOOTER */}

        <footer className="text-center mt-8 pb-5">
          <p className="text-[10px] tracking-widest text-gray-300 font-semibold">
            MASTER KANJI N3
          </p>
        </footer>

      </div>

      {/* COLLECTION MODAL */}

      {showCollection && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-5"
          onClick={() => setShowCollection(false)}
        >

          <div
            className="w-full max-w-2xl bg-white rounded-t-[30px] sm:rounded-[30px] max-h-[85vh] overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >

            <div className="p-5 border-b border-gray-100 flex items-center justify-between">

              <div>
                <h2 className="font-bold text-lg">
                  Koleksi Hafalan
                </h2>

                <p className="text-xs text-gray-400 mt-1">
                  {mastered.length} kanji sudah ditandai
                </p>
              </div>

              <button
                onClick={() => setShowCollection(false)}
                className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition"
              >
                ✕
              </button>

            </div>

            <div className="overflow-y-auto p-5">

              {mastered.length === 0 ? (
                <div className="py-16 text-center">

                  <div className="text-4xl mb-4">
                    📖
                  </div>

                  <p className="font-semibold text-gray-700">
                    Belum ada kanji
                  </p>

                  <p className="text-sm text-gray-400 mt-1">
                    Tandai kanji sebagai sudah hafal.
                  </p>

                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">

                  {mastered.map((id) => {

                    const [savedPart, savedIndexString] =
                      id.split('-')

                    const savedIndex =
                      Number(savedIndexString)

                   const allParts = kanjiData as Record<string, typeof kanjiData[keyof typeof kanjiData]>

const cards = allParts[savedPart] || []

                    const card = cards[savedIndex]

                    if (!card) return null

                    return (
                      <button
                        key={id}
                        onClick={() => {
                          setPart(savedPart)
                          setCardIndex(savedIndex)
                          setIsFlipped(false)
                          setShowCollection(false)
                        }}
                        className="aspect-square bg-gray-50 border border-gray-100 rounded-2xl flex flex-col items-center justify-center hover:bg-gray-100 transition"
                      >

                        <span className="text-4xl">
                          {card.k}
                        </span>

                        <span className="text-[10px] text-gray-400 mt-2">
                          {card.m}
                        </span>

                      </button>
                    )
                  })}

                </div>
              )}

            </div>

          </div>

        </div>
      )}

    </main>
  )
}