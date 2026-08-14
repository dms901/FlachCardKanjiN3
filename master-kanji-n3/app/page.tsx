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

  // MODE HANYA KANJI YANG BELUM HAFAL
  const [unlearnedOnly, setUnlearnedOnly] = useState(false)

  // MENU BAGIAN
  const [showParts, setShowParts] = useState(false)

  // ANIMASI GANTI BAGIAN
  const [changingPart, setChangingPart] = useState(false)

  const allParts = kanjiData as Record<string, any[]>

  /*
  |--------------------------------------------------------------------------
  | CURRENT CARDS
  |--------------------------------------------------------------------------
  */

  const allCurrentCards = allParts[part] || []

  // Simpan index asli supaya data Supabase tidak tertukar
  const currentCards = allCurrentCards
    .map((card, index) => ({
      card,
      originalIndex: index,
    }))
    .filter(({ originalIndex }) => {
      if (!unlearnedOnly) return true

      return !mastered.includes(
        `${part}-${originalIndex}`
      )
    })

  const currentItem = currentCards[cardIndex]

  const currentKanji = currentItem?.card

  const currentOriginalIndex =
    currentItem?.originalIndex ?? 0

  const currentId = `${part}-${currentOriginalIndex}`

  const isMastered = mastered.includes(currentId)

  /*
  |--------------------------------------------------------------------------
  | PROGRESS
  |--------------------------------------------------------------------------
  */

  const progress =
    allCurrentCards.length > 0
      ? (mastered.filter((m) =>
          m.startsWith(`${part}-`)
        ).length /
          allCurrentCards.length) *
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
    } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setUser(session?.user ?? null)

        if (session?.user) {
          await loadMastered(session.user.id)
        } else {
          setMastered([])
        }
      }
    )

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
        data?.map(
          (item) =>
            `${item.part}-${item.card_index}`
        ) || []

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

  const handleAuth = async (
    e: React.FormEvent
  ) => {
    e.preventDefault()

    if (!email || !password) {
      alert('Email dan password harus diisi.')
      return
    }

    setLoading(true)

    try {
      if (authMode === 'register') {
        const { data, error } =
          await supabase.auth.signUp({
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
        const { error } =
          await supabase.auth.signInWithPassword({
            email,
            password,
          })

        if (error) throw error
      }
    } catch (error: any) {
      alert(
        error.message ||
          'Terjadi kesalahan.'
      )
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
    setUnlearnedOnly(false)
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
      return (
        (prev + 1) %
        currentCards.length
      )
    })
  }

  const prevCard = () => {
    if (!currentCards.length) return

    setIsFlipped(false)

    setCardIndex((prev) => {
      return (
        (prev - 1 + currentCards.length) %
        currentCards.length
      )
    })
  }

  const shuffle = () => {
    if (!currentCards.length) return

    setIsFlipped(false)

    let randomIndex = Math.floor(
      Math.random() * currentCards.length
    )

    if (
      currentCards.length > 1 &&
      randomIndex === cardIndex
    ) {
      randomIndex =
        (randomIndex + 1) %
        currentCards.length
    }

    setCardIndex(randomIndex)
  }

  /*
  |--------------------------------------------------------------------------
  | CHANGE PART + ANIMATION
  |--------------------------------------------------------------------------
  */

  const changePart = (newPart: string) => {
    if (newPart === part) {
      setShowParts(false)
      return
    }

    setShowParts(false)
    setChangingPart(true)

    setTimeout(() => {
      setPart(newPart)
      setCardIndex(0)
      setIsFlipped(false)

      // Saat pindah bagian kembali ke mode normal
      setUnlearnedOnly(false)

      setTimeout(() => {
        setChangingPart(false)
      }, 60)
    }, 220)
  }

  /*
  |--------------------------------------------------------------------------
  | MASTERED
  |--------------------------------------------------------------------------
  */

  const toggleMastered = async () => {
    if (!user || !currentKanji) return

    const id =
      `${part}-${currentOriginalIndex}`

    setSaving(true)

    try {
      /*
      |--------------------------------------------------------------------------
      | HAPUS DARI MASTERED
      |--------------------------------------------------------------------------
      */

      if (mastered.includes(id)) {
        const { error } = await supabase
          .from('kanji_progress')
          .delete()
          .eq('user_id', user.id)
          .eq('part', part)
          .eq(
            'card_index',
            currentOriginalIndex
          )

        if (error) throw error

        setMastered((prev) =>
          prev.filter(
            (item) => item !== id
          )
        )

        return
      }

      /*
      |--------------------------------------------------------------------------
      | TAMBAHKAN KE MASTERED
      |--------------------------------------------------------------------------
      */

      const { error } = await supabase
        .from('kanji_progress')
        .insert({
          user_id: user.id,
          part: part,
          card_index: currentOriginalIndex,
        })

      if (error) throw error

      const updatedMastered = [
        ...mastered,
        id,
      ]

      setMastered(updatedMastered)

      /*
      |--------------------------------------------------------------------------
      | JIKA SEDANG MODE BELUM HAFAL
      |--------------------------------------------------------------------------
      */

      if (unlearnedOnly) {
        const remainingCards =
          allCurrentCards
            .map((card, index) => ({
              card,
              originalIndex: index,
            }))
            .filter(
              ({ originalIndex }) =>
                !updatedMastered.includes(
                  `${part}-${originalIndex}`
                )
            )

        setIsFlipped(false)

        if (remainingCards.length === 0) {
          setCardIndex(0)
        } else {
          // Kalau kartu sekarang index 2,
          // kartu berikutnya akan otomatis menempati index 2.
          // Kalau kartu terakhir, mundur ke kartu sebelumnya.
          setCardIndex((prev) =>
            Math.min(
              prev,
              remainingCards.length - 1
            )
          )
        }
      }
    } catch (error: any) {
      alert(
        error.message ||
          'Gagal menyimpan progress.'
      )
    } finally {
      setSaving(false)
    }
  }

  /*
  |--------------------------------------------------------------------------
  | START UNLEARNED MODE
  |--------------------------------------------------------------------------
  */

  const startUnlearnedMode = () => {
    const unlearnedCards =
      allCurrentCards.filter(
        (_, index) =>
          !mastered.includes(
            `${part}-${index}`
          )
      )

    if (unlearnedCards.length === 0) {
      alert(
        `🎉 Semua kanji Bagian ${part.replace(
          'part',
          ''
        )} sudah hafal!`
      )
      return
    }

    setUnlearnedOnly(true)
    setCardIndex(0)
    setIsFlipped(false)
  }

  /*
  |--------------------------------------------------------------------------
  | LOADING
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#f7f8fc]">
        <div className="text-center animate-pulse">

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

            <form
              onSubmit={handleAuth}
              className="space-y-4"
            >

              <div>

                <label className="block text-xs font-semibold text-gray-600 mb-2">
                  EMAIL
                </label>

                <input
                  type="email"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
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
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
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

        {/* HEADER + PROGRESS STICKY */}

        <div className="sticky top-0 z-30 bg-[#f7f8fc] pt-1 pb-2">

          {/* HEADER */}

          <header className="flex items-center justify-between mb-6">

            {/* CUSTOM PART MENU */}

            <div className="relative">

              <p className="text-[10px] tracking-[0.2em] font-bold text-gray-400 mb-2">
                MASTER KANJI
              </p>

              <button
  onClick={() =>
    setShowParts(!showParts)
  }
  className="group flex items-center gap-3 bg-white border border-gray-200 rounded-2xl px-4 py-2.5 shadow-sm hover:shadow-md hover:border-gray-300 active:scale-[0.98] transition-all"
>

  <div className="w-9 h-9 rounded-xl bg-black text-white flex items-center justify-center text-sm font-bold">
    {part.replace(
      'part',
      ''
    )}
  </div>

  <div className="flex items-center gap-2">

    <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
      Bagian
    </p>

    <p className="text-base font-bold leading-tight">
      {part.replace(
        'part',
        ''
      )}
    </p>

  </div>

  <span
    className={`ml-2 text-gray-400 transition-transform duration-300 ${
      showParts
        ? 'rotate-180'
        : ''
    }`}
  >
    ↓
  </span>

</button>

              {/* DROPDOWN */}

              {showParts && (
                <>

                  <div
                    className="fixed inset-0 z-30"
                    onClick={() =>
                      setShowParts(false)
                    }
                  />

                  <div className="absolute z-40 top-full left-0 mt-3 w-[280px] sm:w-[310px] bg-white rounded-3xl border border-gray-100 shadow-2xl shadow-black/10 p-2 animate-[dropdownIn_.22s_ease-out]">

                    <div className="px-4 pt-3 pb-2">

                      <p className="text-xs font-bold text-gray-900">
                        Pilih Bagian
                      </p>

                      <p className="text-[11px] text-gray-400 mt-1">
                        Pilih materi kanji yang ingin dipelajari
                      </p>

                    </div>

                    <div className="max-h-[330px] overflow-y-auto px-1 pb-1">

                      {Object.keys(
                        kanjiData
                      ).map(
                        (p, index) => {

                          const cards =
                            allParts[p] ||
                            []

                          const learned =
                            mastered.filter(
                              (m) =>
                                m.startsWith(
                                  `${p}-`
                                )
                            ).length

                          const percentage =
                            cards.length > 0
                              ? Math.round(
                                  (learned /
                                    cards.length) *
                                    100
                                )
                              : 0

                          const selected =
                            p === part

                          return (
                            <button
                              key={p}
                              onClick={() =>
                                changePart(
                                  p
                                )
                              }
                              className={`w-full flex items-center gap-3 p-3 rounded-2xl text-left transition-all duration-200 ${
                                selected
                                  ? 'bg-black text-white'
                                  : 'hover:bg-gray-50 text-gray-900'
                              }`}
                            >

                              {/* NUMBER */}

                              <div
                                className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                                  selected
                                    ? 'bg-white/15 text-white'
                                    : 'bg-gray-100 text-gray-700'
                                }`}
                              >
                                {index + 1}
                              </div>

                              {/* INFO */}

                              <div className="flex-1 min-w-0">

                                <div className="flex items-center justify-between">

                                  <p className="font-bold text-sm">
                                    Bagian{' '}
                                    {index +
                                      1}
                                  </p>

                                  {percentage ===
                                    100 && (
                                    <span
                                      className={
                                        selected
                                          ? 'text-green-300'
                                          : 'text-green-500'
                                      }
                                    >
                                      ✓
                                    </span>
                                  )}

                                </div>

                                <div className="flex items-center gap-2 mt-1">

                                  <p
                                    className={`text-[10px] ${
                                      selected
                                        ? 'text-white/50'
                                        : 'text-gray-400'
                                    }`}
                                  >
                                    {learned}{' '}
                                    /{' '}
                                    {
                                      cards.length
                                    }{' '}
                                    hafal
                                  </p>

                                </div>

                                {/* MINI PROGRESS */}

                                <div
                                  className={`h-1 rounded-full mt-2 overflow-hidden ${
                                    selected
                                      ? 'bg-white/10'
                                      : 'bg-gray-100'
                                  }`}
                                >

                                  <div
                                    className={`h-full rounded-full transition-all duration-500 ${
                                      selected
                                        ? 'bg-white'
                                        : 'bg-black'
                                    }`}
                                    style={{
                                      width: `${percentage}%`,
                                    }}
                                  />

                                </div>

                              </div>

                              {/* ARROW */}

                              <span
                                className={`text-sm ${
                                  selected
                                    ? 'text-white/50'
                                    : 'text-gray-300'
                                }`}
                              >
                                ›
                              </span>

                            </button>
                          )
                        }
                      )}

                    </div>

                  </div>

                </>
              )}

            </div>

            {/* LOGOUT */}

            <button
              onClick={logout}
              className="px-4 py-2 rounded-full bg-white border border-gray-200 text-xs font-semibold text-gray-600 hover:text-black hover:border-gray-300 active:scale-95 transition"
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
                  mastered.filter(
                    (m) =>
                      m.startsWith(
                        `${part}-`
                      )
                  ).length
                }{' '}

                / {allCurrentCards.length}

              </span>

            </div>

            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">

              <div
                className="h-full bg-black rounded-full transition-all duration-700 ease-out"
                style={{
                  width: `${progress}%`,
                }}
              />

            </div>

          </section>

        </div>

        {/* MODE INDICATOR */}

        {unlearnedOnly && (
          <div className="mb-4 flex items-center justify-between bg-black text-white rounded-2xl px-4 py-3">

            <div>

              <p className="text-xs font-bold">
                MODE BELUM HAFAL
              </p>

              <p className="text-[10px] text-white/50 mt-0.5">
                Hanya menampilkan kanji yang belum hafal
              </p>

            </div>

            <button
              onClick={() => {
                setUnlearnedOnly(false)
                setCardIndex(0)
                setIsFlipped(false)
              }}
              className="text-xs font-semibold bg-white text-black px-3 py-2 rounded-xl active:scale-95 transition"
            >
              Semua
            </button>

          </div>
        )}

        {/* CARD */}

        {currentKanji ? (

          <section
            className={
              changingPart
                ? 'animate-[partExit_.22s_ease-in_forwards]'
                : 'animate-[partEnter_.42s_cubic-bezier(.22,1,.36,1)]'
            }
          >

            <div
              className="relative h-[430px] sm:h-[480px] cursor-pointer"
              style={{
                perspective: '1200px',
              }}
              onClick={() =>
                setIsFlipped(
                  !isFlipped
                )
              }
            >

              <div
                className="relative w-full h-full transition-transform duration-500 ease-out"
                style={{
                  transformStyle:
                    'preserve-3d',
                  transform:
                    isFlipped
                      ? 'rotateY(180deg)'
                      : 'rotateY(0deg)',
                }}
              >

                {/* FRONT */}

                <div
                  className="absolute inset-0 bg-white rounded-[27px] border border-gray-100 shadow-xl shadow-black/5 flex flex-col items-center justify-center p-8"
                  style={{
                    backfaceVisibility:
                      'hidden',
                  }}
                >

                  <div className="absolute top-6 left-6">

                    <span className="text-[10px] font-bold tracking-widest text-gray-300">

                      {cardIndex + 1}{' '}
                      /{' '}
                      {currentCards.length}

                    </span>

                  </div>

                  {isMastered && (
                    <div className="absolute top-5 right-5 w-9 h-9 rounded-full bg-green-500 text-white flex items-center justify-center shadow-lg animate-[pop_.3s_ease-out]">
                      ✓
                    </div>
                  )}

                  <div className="text-[clamp(6px,12vw,80px)] leading-none font-medium select-none transition-transform duration-300 hover:scale-105">
                    {currentKanji.k}
                  </div>

                  <p className="mt-10 text-xs text-gray-400 tracking-widest uppercase">
                    Ketuk untuk melihat jawaban
                  </p>

                </div>

                {/* BACK */}

                <div
                  className="absolute inset-0 bg-black text-white rounded-[70px] shadow-xl flex flex-col items-center justify-center p-8"
                  style={{
                    backfaceVisibility:
                      'hidden',
                    transform:
                      'rotateY(180deg)',
                  }}
                >

                  <div className="text-[50px] leading-none">
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

                {cardIndex + 1} dari{' '}
                {currentCards.length}

              </span>

            </div>

            {/* NAVIGATION */}

            <div className="grid grid-cols-3 gap-3 mt-5">

              <button
                onClick={prevCard}
                className="bg-white border border-gray-200 py-3.5 rounded-2xl font-semibold text-sm hover:border-gray-300 hover:-translate-y-0.5 active:scale-95 transition-all"
              >
                ← Prev
              </button>

              <button
                onClick={shuffle}
                className="bg-white border border-gray-200 py-3.5 rounded-2xl font-semibold text-sm hover:border-gray-300 hover:-translate-y-0.5 active:scale-95 transition-all"
              >
                ⤨ Acak
              </button>

              <button
                onClick={nextCard}
                className="bg-white border border-gray-200 py-3.5 rounded-2xl font-semibold text-sm hover:border-gray-300 hover:-translate-y-0.5 active:scale-95 transition-all"
              >
                Next →
              </button>

            </div>

            {/* MASTERED */}

            <button
              onClick={toggleMastered}
              disabled={saving}
              className={`w-full mt-3 py-4 rounded-2xl font-bold text-sm transition-all active:scale-[0.97] ${
                isMastered
                  ? 'bg-green-500 text-white shadow-lg shadow-green-500/20 scale-[1.01]'
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

          <div className="bg-white rounded-3xl p-10 text-center animate-[partEnter_.4s_ease-out]">

            {unlearnedOnly ? (
              <>
                <div className="text-4xl mb-4">
                  🎉
                </div>

                <p className="font-semibold text-gray-700">
                  Semua kanji sudah hafal!
                </p>

                <p className="text-sm text-gray-400 mt-1">
                  Tidak ada kartu yang tersisa.
                </p>

                <button
                  onClick={() => {
                    setUnlearnedOnly(false)
                    setCardIndex(0)
                    setIsFlipped(false)
                  }}
                  className="mt-5 bg-black text-white px-5 py-3 rounded-2xl text-sm font-semibold"
                >
                  Tampilkan Semua
                </button>
              </>
            ) : (
              <p className="text-gray-500">
                Belum ada data kanji pada bagian ini.
              </p>
            )}

          </div>

        )}

               {/* BOTTOM MENU */}

        <div className="grid grid-cols-2 gap-3 mt-6">

          {/* KOLEKSI */}

          <button
            onClick={() => {
              setUnlearnedOnly(false)
              setShowCollection(true)
            }}
            className="bg-white border border-gray-200 rounded-2xl px-3.5 py-3.5 text-left hover:border-gray-300 hover:-translate-y-0.5 active:scale-[0.98] transition-all flex items-center gap-3"
          >

            {/* ICON */}

            <div className="text-xl flex-shrink-0">
              📚
            </div>

            {/* TEXT */}

            <div className="min-w-0">

              <p className="font-bold text-sm leading-tight">
                Koleksi
              </p>

              <p className="text-[11px] text-gray-400 mt-1 leading-tight">
                {mastered.length} kanji sudah hafal
              </p>

            </div>

          </button>


          {/* BELUM HAFAL */}

          <button
            onClick={startUnlearnedMode}
            className="bg-white border border-gray-200 rounded-2xl px-3.5 py-3.5 text-left hover:border-gray-300 hover:-translate-y-0.5 active:scale-[0.98] transition-all flex items-center gap-3"
          >

            {/* ICON */}

            <div className="text-xl flex-shrink-0">
              🔄
            </div>

            {/* TEXT */}

            <div className="min-w-0">

              <p className="font-bold text-sm leading-tight">
                Belum Hafal
              </p>

              <p className="text-[11px] text-gray-400 mt-1 leading-tight">

                {
                  allCurrentCards.filter(
                    (_, index) =>
                      !mastered.includes(
                        `${part}-${index}`
                      )
                  ).length
                } kartu belum hafal

              </p>

            </div>

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
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-5 animate-[fadeIn_.2s_ease-out]"
          onClick={() =>
            setShowCollection(false)
          }
        >

          <div
            className="w-full max-w-2xl bg-white rounded-t-[30px] sm:rounded-[30px] h-[85vh] shadow-2xl flex flex-col overflow-hidden animate-[modalUp_.35s_cubic-bezier(.22,1,.36,1)]"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            {/* MODAL HEADER */}

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
                onClick={() =>
                  setShowCollection(false)
                }
                className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 active:scale-90 transition"
              >
                ✕
              </button>

            </div>

            {/* COLLECTION CONTENT */}

            <div className="flex-1 min-h-0 overflow-y-auto p-5 overscroll-contain">

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

                    const [
                      savedPart,
                      savedIndexString,
                    ] = id.split('-')

                    const savedIndex =
                      Number(
                        savedIndexString
                      )

                    const cards =
                      allParts[
                        savedPart
                      ] || []

                    const card =
                      cards[savedIndex]

                    if (!card)
                      return null

                    return (

                      <button
                        key={id}
                        onClick={() => {
                          setUnlearnedOnly(false)
                          setPart(savedPart)
                          setCardIndex(
                            savedIndex
                          )
                          setIsFlipped(false)
                          setShowCollection(
                            false
                          )
                        }}
                        className="aspect-square bg-gray-50 border border-gray-100 rounded-2xl flex flex-col items-center justify-center hover:bg-gray-100 hover:scale-[1.02] active:scale-95 transition-all"
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

      {/* ANIMATION STYLE */}

      <style jsx global>{`

        @keyframes dropdownIn {

          from {
            opacity: 0;
            transform:
              translateY(-8px)
              scale(0.96);
          }

          to {
            opacity: 1;
            transform:
              translateY(0)
              scale(1);
          }

        }

        @keyframes partEnter {

          from {
            opacity: 0;
            transform:
              translateY(14px)
              scale(0.985);
          }

          to {
            opacity: 1;
            transform:
              translateY(0)
              scale(1);
          }

        }

        @keyframes partExit {

          from {
            opacity: 1;
            transform:
              translateY(0)
              scale(1);
          }

          to {
            opacity: 0;
            transform:
              translateY(-10px)
              scale(0.985);
          }

        }

        @keyframes pop {

          0% {
            opacity: 0;
            transform:
              scale(0.5);
          }

          70% {
            transform:
              scale(1.15);
          }

          100% {
            opacity: 1;
            transform:
              scale(1);
          }

        }

        @keyframes fadeIn {

          from {
            opacity: 0;
          }

          to {
            opacity: 1;
          }

        }

        @keyframes modalUp {

          from {
            opacity: 0;
            transform:
              translateY(30px)
              scale(0.98);
          }

          to {
            opacity: 1;
            transform:
              translateY(0)
              scale(1);
          }

        }

      `}</style>

    </main>
  )
}