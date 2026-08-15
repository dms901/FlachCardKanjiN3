'use client'

import { useState, useEffect, type FormEvent } from 'react'
import { kanjiData } from '@/data/kanjiData'
import { useAuth } from './AuthProvider'

export default function KanjiApp() {
  /*
    |--------------------------------------------------------------------------
      | AUTH
        |------------------------
        '
import { useAuth } from './AuthProvider'

export default function KanjiApp() {
  /*
  |--------------------------------------------------------------------------
  | AUTH
  |--------------------------------------------------------------------------
  */

  const {
    supabase,
    user,
    loading: authLoading,
  } = useAuth()

  const [profile, setProfile] = useState<any>(null)

  /*
  |--------------------------------------------------------------------------
  | AUTH FORM
  |--------------------------------------------------------------------------
  */

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const [authMode, setAuthMode] =
    useState<'login' | 'register'>('login')

  const [authProcessing, setAuthProcessing] =
    useState(false)

  /*
  |--------------------------------------------------------------------------
  | KANJI
  |--------------------------------------------------------------------------
  */

  const [part, setPart] = useState(() => {
    return Object.keys(kanjiData)[0] || ''
  })

  const [cardIndex, setCardIndex] = useState(0)

  const [isFlipped, setIsFlipped] =
    useState(false)

  const [mastered, setMastered] =
    useState<string[]>([])

  /*
  |--------------------------------------------------------------------------
  | APP LOADING
  |--------------------------------------------------------------------------
  */

  const [profileLoading, setProfileLoading] =
    useState(false)

  const [saving, setSaving] =
    useState(false)

  /*
  |--------------------------------------------------------------------------
  | COLLECTION
  |--------------------------------------------------------------------------
  */

  const [showCollection, setShowCollection] =
    useState(false)

  const [unlearnedOnly, setUnlearnedOnly] =
    useState(false)

  /*
  |--------------------------------------------------------------------------
  | MENU
  |--------------------------------------------------------------------------
  */

  const [showParts, setShowParts] =
    useState(false)

  const [showUserMenu, setShowUserMenu] =
    useState(false)

  const [changingPart, setChangingPart] =
    useState(false)

  /*
  |--------------------------------------------------------------------------
  | ADMIN
  |--------------------------------------------------------------------------
  */

  const [showAdmin, setShowAdmin] =
    useState(false)

  const [adminUsers, setAdminUsers] =
    useState<any[]>([])

  const [adminLoading, setAdminLoading] =
    useState(false)

  const [adminActionLoading, setAdminActionLoading] =
    useState<string | null>(null)

  /*
  |--------------------------------------------------------------------------
  | EMAIL
  |--------------------------------------------------------------------------
  */

  const [resendingEmail, setResendingEmail] =
    useState(false)

  /*
  |--------------------------------------------------------------------------
  | ALL PARTS
  |--------------------------------------------------------------------------
  */

  const allParts =
    kanjiData as Record<string, any[]>

  /*
  |--------------------------------------------------------------------------
  | CURRENT CARDS
  |--------------------------------------------------------------------------
  */

  const allCurrentCards =
    allParts[part] || []

  const currentCards =
    allCurrentCards
      .map((card, index) => ({
        card,
        originalIndex: index,
      }))
      .filter(({ originalIndex }) => {
        if (!unlearnedOnly) {
          return true
        }

        return !mastered.includes(
          `${part}-${originalIndex}`
        )
      })

  const currentItem =
    currentCards[cardIndex]

  const currentKanji =
    currentItem?.card

  const currentOriginalIndex =
    currentItem?.originalIndex ?? 0

  const currentId =
    `${part}-${currentOriginalIndex}`

  const isMastered =
    mastered.includes(currentId)

  /*
  |--------------------------------------------------------------------------
  | PROGRESS
  |--------------------------------------------------------------------------
  */

  const progress =
    allCurrentCards.length > 0
      ? (
          mastered.filter((m) =>
            m.startsWith(`${part}-`)
          ).length /
          allCurrentCards.length
        ) * 100
      : 0

  /*
  |--------------------------------------------------------------------------
  | LOAD PROFILE
  |--------------------------------------------------------------------------
  */

  const loadProfile = async (
    userId: string
  ) => {
    try {
      setProfileLoading(true)

      const {
        data,
        error,
      } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error(
          'Gagal mengambil profile:',
          error
        )

        return null
      }

      setProfile(data)

      return data
    } catch (error) {
      console.error(error)

      return null
    } finally {
      setProfileLoading(false)
    }
  }

  /*
  |--------------------------------------------------------------------------
  | LOAD MASTERED
  |--------------------------------------------------------------------------
  */

  const loadMastered = async (
    userId: string
  ) => {
    try {
      const {
        data,
        error,
      } = await supabase
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
  | LOAD USER DATA
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    let mounted = true

    const loadUserData = async () => {
      if (!user) {
        setProfile(null)
        setMastered([])
        setShowAdmin(false)
        return
      }

      const loadedProfile =
        await loadProfile(user.id)

      if (!mounted) return

      if (
        loadedProfile?.status ===
        'approved'
      ) {
        await loadMastered(user.id)
      } else {
        setMastered([])
      }
    }

    loadUserData()

    return () => {
      mounted = false
    }
  }, [user])

  /*
  |--------------------------------------------------------------------------
  | LOGIN / REGISTER
  |--------------------------------------------------------------------------
  */

  const handleAuth = async (
    e: FormEvent
  ) => {
    e.preventDefault()

    if (!email || !password) {
      alert(
        'Email dan password harus diisi.'
      )

      return
    }

    if (
      authMode === 'register' &&
      password.length < 6
    ) {
      alert(
        'Password minimal 6 karakter.'
      )

      return
    }

    setAuthProcessing(true)

    try {
      if (
        authMode === 'register'
      ) {
        const {
          data,
          error,
        } =
          await supabase.auth.signUp({
            email,
            password,
          })

        if (error) {
          throw error
        }

        if (!data.session) {
          alert(
            'Akun berhasil dibuat.\n\nSilakan cek email kamu dan klik link verifikasi terlebih dahulu.'
          )
        } else {
          alert(
            'Akun berhasil dibuat. Silakan menunggu persetujuan admin.'
          )
        }
      } else {
        const {
          error,
        } =
          await supabase.auth.signInWithPassword({
            email,
            password,
          })

        if (error) {
          throw error
        }
      }
    } catch (error: any) {
      console.error(error)

      alert(
        error?.message ||
          'Terjadi kesalahan.'
      )
    } finally {
      setAuthProcessing(false)
    }
  }

  /*
  |--------------------------------------------------------------------------
  | RESEND VERIFICATION EMAIL
  |--------------------------------------------------------------------------
  */

  const resendVerificationEmail =
    async () => {
      if (!user?.email) {
        return
      }

      setResendingEmail(true)

      try {
        const {
          error,
        } =
          await supabase.auth.resend({
            type: 'signup',
            email: user.email,
          })

        if (error) {
          throw error
        }

        alert(
          'Email verifikasi sudah dikirim ulang. Silakan cek inbox email kamu.'
        )
      } catch (error: any) {
        alert(
          error?.message ||
            'Gagal mengirim ulang email verifikasi.'
        )
      } finally {
        setResendingEmail(false)
      }
    }

  /*
  |--------------------------------------------------------------------------
  | LOGOUT
  |--------------------------------------------------------------------------
  */

  const logout = async () => {
    await supabase.auth.signOut()

    setProfile(null)
    setMastered([])
    setCardIndex(0)
    setIsFlipped(false)
    setUnlearnedOnly(false)
    setShowAdmin(false)
    setShowUserMenu(false)
    setShowParts(false)
    setShowCollection(false)
  }

  /*
  |--------------------------------------------------------------------------
  | LOAD ADMIN USERS
  |--------------------------------------------------------------------------
  */

  const loadAdminUsers = async () => {
    if (
      profile?.role !== 'admin'
    ) {
      return
    }

    setAdminLoading(true)

    try {
      const {
        data,
        error,
      } =
        await supabase
          .from('profiles')
          .select(
            'id, email, role, status, created_at'
          )
          .order(
            'created_at',
            {
              ascending: false,
            }
          )

      if (error) {
        throw error
      }

      setAdminUsers(
        data || []
      )
    } catch (error: any) {
      console.error(error)

      alert(
        error?.message ||
          'Gagal mengambil daftar akun.'
      )
    } finally {
      setAdminLoading(false)
    }
  }

  /*
  |--------------------------------------------------------------------------
  | OPEN ADMIN
  |--------------------------------------------------------------------------
  */

  const openAdmin = async () => {
    if (
      profile?.role !== 'admin'
    ) {
      return
    }

    setShowAdmin(true)

    await loadAdminUsers()
  }

  /*
  |--------------------------------------------------------------------------
  | ADMIN CHANGE STATUS
  |--------------------------------------------------------------------------
  */

  const changeUserStatus = async (
    userId: string,
    newStatus:
      | 'approved'
      | 'rejected'
      | 'pending'
  ) => {
    if (
      profile?.role !== 'admin'
    ) {
      return
    }

    if (
      userId === user?.id
    ) {
      alert(
        'Kamu tidak dapat mengubah status akun admin yang sedang digunakan.'
      )

      return
    }

    setAdminActionLoading(userId)

    try {
      const {
        error,
      } =
        await supabase
          .from('profiles')
          .update({
            status: newStatus,
          })
          .eq('id', userId)

      if (error) {
        throw error
      }

      await loadAdminUsers()
    } catch (error: any) {
      console.error(error)

      alert(
        error?.message ||
          'Gagal mengubah status akun.'
      )
    } finally {
      setAdminActionLoading(null)
    }
  }

  /*
  |--------------------------------------------------------------------------
  | CARD NAVIGATION
  |--------------------------------------------------------------------------
  */

  const nextCard = () => {
    if (!currentCards.length) {
      return
    }

    setIsFlipped(false)

    setCardIndex((prev) => {
      return (
        (prev + 1) %
        currentCards.length
      )
    })
  }

  const prevCard = () => {
    if (!currentCards.length) {
      return
    }

    setIsFlipped(false)

    setCardIndex((prev) => {
      return (
        (prev -
          1 +
          currentCards.length) %
        currentCards.length
      )
    })
  }

  const shuffle = () => {
    if (!currentCards.length) {
      return
    }

    setIsFlipped(false)

    let randomIndex =
      Math.floor(
        Math.random() *
          currentCards.length
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
  | CHANGE PART
  |--------------------------------------------------------------------------
  */

  const changePart = (
    newPart: string
  ) => {
    if (newPart === part) {
      setShowParts(false)
      return
    }

    setShowParts(false)
    setChangingPart(true)

    /*
     * Animasi keluar dibuat sedikit lebih panjang
     * agar perpindahan terasa lebih halus.
     */

    setTimeout(() => {
      setPart(newPart)
      setCardIndex(0)
      setIsFlipped(false)
      setUnlearnedOnly(false)

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setChangingPart(false)
        })
      })
    }, 220)
  }

  /*
  |--------------------------------------------------------------------------
  | MASTERED
  |--------------------------------------------------------------------------
  */

  const toggleMastered =
    async () => {
      if (
        !user ||
        !currentKanji
      ) {
        return
      }

      const id =
        `${part}-${currentOriginalIndex}`

      setSaving(true)

      try {
        if (
          mastered.includes(id)
        ) {
          const {
            error,
          } =
            await supabase
              .from(
                'kanji_progress'
              )
              .delete()
              .eq(
                'user_id',
                user.id
              )
              .eq(
                'part',
                part
              )
              .eq(
                'card_index',
                currentOriginalIndex
              )

          if (error) {
            throw error
          }

          setMastered((prev) =>
            prev.filter(
              (item) =>
                item !== id
            )
          )

          return
        }

        const {
          error,
        } =
          await supabase
            .from(
              'kanji_progress'
            )
            .insert({
              user_id:
                user.id,
              part,
              card_index:
                currentOriginalIndex,
            })

        if (error) {
          throw error
        }

        const updatedMastered =
          [
            ...mastered,
            id,
          ]

        setMastered(
          updatedMastered
        )

        if (unlearnedOnly) {
          const remainingCards =
            allCurrentCards
              .map(
                (
                  card,
                  index
                ) => ({
                  card,
                  originalIndex:
                    index,
                })
              )
              .filter(
                ({
                  originalIndex,
                }) =>
                  !updatedMastered.includes(
                    `${part}-${originalIndex}`
                  )
              )

          setIsFlipped(false)

          if (
            remainingCards.length ===
            0
          ) {
            setCardIndex(0)
          } else {
            setCardIndex(
              (prev) =>
                Math.min(
                  prev,
                  remainingCards.length -
                    1
                )
            )
          }
        }
      } catch (error: any) {
        alert(
          error?.message ||
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

  const startUnlearnedMode =
    () => {
      const unlearnedCards =
        allCurrentCards.filter(
          (_, index) =>
            !mastered.includes(
              `${part}-${index}`
            )
        )

      if (
        unlearnedCards.length ===
        0
      ) {
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
  | INITIAL LOADING
  |--------------------------------------------------------------------------
  */

  if (authLoading) {
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
  | NOT LOGGED IN
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
                    setEmail(
                      e.target.value
                    )
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
                    setPassword(
                      e.target.value
                    )
                  }
                  placeholder="••••••••"
                  autoComplete={
                    authMode ===
                    'login'
                      ? 'current-password'
                      : 'new-password'
                  }
                  className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:bg-white focus:border-black focus:ring-2 focus:ring-black/5 transition"
                />

              </div>

              <button
                type="submit"
                disabled={
                  authProcessing
                }
                className="w-full bg-black text-white py-3.5 rounded-2xl font-semibold hover:bg-gray-800 active:scale-[0.98] transition disabled:opacity-50"
              >
                {authProcessing
                  ? 'Memproses...'
                  : authMode ===
                    'login'
                    ? 'Masuk'
                    : 'Buat Akun'}
              </button>

            </form>

            <button
              onClick={() =>
                setAuthMode(
                  authMode ===
                    'login'
                    ? 'register'
                    : 'login'
                )
              }
              className="w-full mt-5 text-sm text-gray-500 hover:text-black transition"
            >
              {authMode ===
              'login'
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
  | EMAIL BELUM DIVERIFIKASI
  |--------------------------------------------------------------------------
  */

  if (
    user &&
    !user.email_confirmed_at
  ) {
    return (
      <main className="min-h-screen bg-[#f7f8fc] flex items-center justify-center px-5 py-10">

        <div className="w-full max-w-md">

          <div className="bg-white rounded-[28px] shadow-xl shadow-black/5 p-7 sm:p-9 border border-gray-100 text-center">

            <div className="w-16 h-16 bg-black text-white rounded-2xl flex items-center justify-center text-3xl mx-auto mb-5">
              ✉️
            </div>

            <h1 className="text-xl font-bold text-gray-900">
              Verifikasi Email
            </h1>

            <p className="text-sm text-gray-500 mt-3 leading-relaxed">
              Kami sudah mengirimkan email verifikasi ke:
            </p>

            <p className="font-semibold text-gray-900 mt-2 break-all">
              {user.email}
            </p>

            <p className="text-xs text-gray-400 mt-4 leading-relaxed">
              Silakan buka email tersebut dan klik link verifikasi sebelum melanjutkan.
            </p>

            <button
              onClick={
                resendVerificationEmail
              }
              disabled={
                resendingEmail
              }
              className="w-full mt-6 bg-black text-white py-3.5 rounded-2xl font-semibold active:scale-[0.98] transition disabled:opacity-50"
            >
              {resendingEmail
                ? 'Mengirim...'
                : 'Kirim Ulang Email'}
            </button>

            <button
              onClick={logout}
              className="w-full mt-3 py-3 text-sm text-gray-500 hover:text-black transition"
            >
              Keluar
            </button>

          </div>

        </div>

      </main>
    )
  }

  /*
  |--------------------------------------------------------------------------
  | PROFILE BELUM TERSEDIA
  |--------------------------------------------------------------------------
  */

  if (
    profileLoading ||
    !profile
  ) {
    return (
      <main className="min-h-screen bg-[#f7f8fc] flex items-center justify-center px-5">

        <div className="text-center">

          <div className="w-10 h-10 border-4 border-gray-200 border-t-black rounded-full animate-spin mx-auto mb-4" />

          <p className="text-sm text-gray-500">
            Menyiapkan akun...
          </p>

          <button
            onClick={logout}
            className="mt-5 text-xs text-gray-400"
          >
            Keluar
          </button>

        </div>

      </main>
    )
  }

  /*
  |--------------------------------------------------------------------------
  | PENDING APPROVAL
  |--------------------------------------------------------------------------
  */

  if (
    profile.status ===
    'pending'
  ) {
    return (
      <main className="min-h-screen bg-[#f7f8fc] flex items-center justify-center px-5 py-10">

        <div className="w-full max-w-md">

          <div className="bg-white rounded-[28px] shadow-xl shadow-black/5 p-7 sm:p-9 border border-gray-100 text-center">

            <div className="w-16 h-16 bg-yellow-50 border border-yellow-100 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-5">
              ⏳
            </div>

            <h1 className="text-xl font-bold text-gray-900">
              Menunggu Persetujuan
            </h1>

            <p className="text-sm text-gray-500 mt-3 leading-relaxed">
              Email kamu sudah terverifikasi.
            </p>

            <p className="text-sm text-gray-500 mt-1 leading-relaxed">
              Sekarang akun kamu sedang menunggu persetujuan dari admin.
            </p>

            <div className="bg-gray-50 rounded-2xl p-4 mt-6 text-left">

              <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400">
                Akun
              </p>

              <p className="text-sm font-semibold text-gray-800 mt-1 break-all">
                {user.email}
              </p>

              <div className="mt-4 flex items-center gap-2">

                <div className="w-2 h-2 bg-yellow-400 rounded-full" />

                <span className="text-xs font-medium text-gray-500">
                  Menunggu persetujuan admin
                </span>

              </div>

            </div>

            <button
              onClick={async () => {
                const updated =
                  await loadProfile(
                    user.id
                  )

                if (
                  updated?.status ===
                  'approved'
                ) {
                  await loadMastered(
                    user.id
                  )
                } else {
                  alert(
                    'Akun kamu masih menunggu persetujuan admin.'
                  )
                }
              }}
              className="w-full mt-6 bg-black text-white py-3.5 rounded-2xl font-semibold active:scale-[0.98] transition"
            >
              Cek Status
            </button>

            <button
              onClick={logout}
              className="w-full mt-3 py-3 text-sm text-gray-500 hover:text-black transition"
            >
              Keluar
            </button>

          </div>

        </div>

      </main>
    )
  }

  /*
  |--------------------------------------------------------------------------
  | REJECTED
  |--------------------------------------------------------------------------
  */

  if (
    profile.status ===
    'rejected'
  ) {
    return (
      <main className="min-h-screen bg-[#f7f8fc] flex items-center justify-center px-5 py-10">

        <div className="w-full max-w-md">

          <div className="bg-white rounded-[28px] shadow-xl shadow-black/5 p-7 sm:p-9 border border-gray-100 text-center">

            <div className="w-16 h-16 bg-red-50 border border-red-100 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-5">
              ✕
            </div>

            <h1 className="text-xl font-bold text-gray-900">
              Akun Tidak Disetujui
            </h1>

            <p className="text-sm text-gray-500 mt-3 leading-relaxed">
              Maaf, akun kamu belum disetujui oleh admin.
            </p>

            <p className="text-xs text-gray-400 mt-3 leading-relaxed">
              Jika menurut kamu ini adalah kesalahan, silakan hubungi administrator aplikasi.
            </p>

            <button
              onClick={logout}
              className="w-full mt-6 bg-black text-white py-3.5 rounded-2xl font-semibold active:scale-[0.98] transition"
            >
              Keluar
            </button>

          </div>

        </div>

      </main>
    )
  }

  /*
  |--------------------------------------------------------------------------
  | ADMIN PAGE
  |--------------------------------------------------------------------------
  */

  if (
    showAdmin &&
    profile.role === 'admin'
  ) {
    const pendingUsers =
      adminUsers.filter(
        (item) =>
          item.status ===
          'pending'
      )

    const approvedUsers =
      adminUsers.filter(
        (item) =>
          item.status ===
          'approved'
      )

    const rejectedUsers =
      adminUsers.filter(
        (item) =>
          item.status ===
          'rejected'
      )

    return (
      <main className="min-h-screen bg-[#f7f8fc] text-gray-900">

        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-5 sm:py-8">

          <div className="flex items-center justify-between mb-6">

            <div>

              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                Administrator
              </p>

              <h1 className="text-2xl font-bold mt-1">
                Persetujuan Akun
              </h1>

            </div>

            <button
              onClick={() =>
                setShowAdmin(false)
              }
              className="w-11 h-11 bg-white border border-gray-200 rounded-2xl flex items-center justify-center text-gray-500 hover:bg-gray-100 active:scale-95 transition"
            >
              ✕
            </button>

          </div>

          <div className="bg-black text-white rounded-3xl p-5 mb-5">

            <p className="text-xs text-white/50">
              Login sebagai admin
            </p>

            <p className="font-semibold text-sm mt-1 break-all">
              {user.email}
            </p>

            <div className="grid grid-cols-3 gap-2 mt-5">

              <div className="bg-white/10 rounded-2xl p-3">
                <p className="text-2xl font-bold">
                  {pendingUsers.length}
                </p>

                <p className="text-[10px] text-white/50 mt-1">
                  Menunggu
                </p>
              </div>

              <div className="bg-white/10 rounded-2xl p-3">
                <p className="text-2xl font-bold">
                  {approvedUsers.length}
                </p>

                <p className="text-[10px] text-white/50 mt-1">
                  Disetujui
                </p>
              </div>

              <div className="bg-white/10 rounded-2xl p-3">
                <p className="text-2xl font-bold">
                  {rejectedUsers.length}
                </p>

                <p className="text-[10px] text-white/50 mt-1">
                  Ditolak
                </p>
              </div>

            </div>

          </div>

          <button
            onClick={
              loadAdminUsers
            }
            disabled={
              adminLoading
            }
            className="w-full bg-white border border-gray-200 py-3 rounded-2xl text-sm font-semibold mb-5 hover:border-gray-300 active:scale-[0.98] transition disabled:opacity-50"
          >
            {adminLoading
              ? 'Memuat...'
              : '↻ Perbarui Daftar'}
          </button>

          {adminLoading &&
          adminUsers.length ===
            0 ? (

            <div className="bg-white rounded-3xl p-10 text-center">

              <div className="w-9 h-9 border-4 border-gray-200 border-t-black rounded-full animate-spin mx-auto mb-4" />

              <p className="text-sm text-gray-500">
                Memuat akun...
              </p>

            </div>

          ) : (

            <div className="space-y-6">

              <section>

                <div className="flex items-center justify-between mb-3 px-1">

                  <div>

                    <h2 className="font-bold text-base">
                      Menunggu Persetujuan
                    </h2>

                    <p className="text-xs text-gray-400 mt-0.5">
                      Akun yang sudah mendaftar
                    </p>

                  </div>

                  <span className="bg-yellow-50 text-yellow-600 border border-yellow-100 px-2.5 py-1 rounded-full text-[10px] font-bold">
                    {pendingUsers.length}
                  </span>

                </div>

                {pendingUsers.length ===
                0 ? (

                  <div className="bg-white border border-gray-100 rounded-3xl p-7 text-center">

                    <div className="text-3xl mb-3">
                      ✓
                    </div>

                    <p className="font-semibold text-gray-700 text-sm">
                      Tidak ada pendaftar baru
                    </p>

                    <p className="text-xs text-gray-400 mt-1">
                      Semua akun sudah diproses.
                    </p>

                  </div>

                ) : (

                  <div className="space-y-3">

                    {pendingUsers.map(
                      (adminUser) => (

                        <div
                          key={
                            adminUser.id
                          }
                          className="bg-white border border-gray-100 rounded-3xl p-4 shadow-sm"
                        >

                          <div className="flex items-start gap-3">

                            <div className="w-11 h-11 bg-yellow-50 border border-yellow-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                              👤
                            </div>

                            <div className="flex-1 min-w-0">

                              <p className="font-semibold text-sm text-gray-800 break-all">
                                {
                                  adminUser.email
                                }
                              </p>

                              <p className="text-[10px] text-gray-400 mt-1">
                                Terdaftar{' '}
                                {adminUser.created_at
                                  ? new Date(
                                      adminUser.created_at
                                    ).toLocaleDateString(
                                      'id-ID',
                                      {
                                        day: 'numeric',
                                        month: 'short',
                                        year: 'numeric',
                                      }
                                    )
                                  : '-'}
                              </p>

                            </div>

                          </div>

                          <div className="grid grid-cols-2 gap-2 mt-4">

                            <button
                              onClick={() =>
                                changeUserStatus(
                                  adminUser.id,
                                  'approved'
                                )
                              }
                              disabled={
                                adminActionLoading ===
                                adminUser.id
                              }
                              className="bg-green-500 text-white py-3 rounded-2xl text-xs font-bold active:scale-95 transition disabled:opacity-50"
                            >
                              {adminActionLoading ===
                              adminUser.id
                                ? '...'
                                : '✓ Setujui'}
                            </button>

                            <button
                              onClick={() =>
                                changeUserStatus(
                                  adminUser.id,
                                  'rejected'
                                )
                              }
                              disabled={
                                adminActionLoading ===
                                adminUser.id
                              }
                              className="bg-red-50 text-red-600 border border-red-100 py-3 rounded-2xl text-xs font-bold active:scale-95 transition disabled:opacity-50"
                            >
                              ✕ Tolak
                            </button>

                          </div>

                        </div>

                      )
                    )}

                  </div>

                )}

              </section>

              <section>

                <div className="flex items-center justify-between mb-3 px-1">

                  <h2 className="font-bold text-base">
                    Akun Disetujui
                  </h2>

                  <span className="bg-green-50 text-green-600 border border-green-100 px-2.5 py-1 rounded-full text-[10px] font-bold">
                    {approvedUsers.length}
                  </span>

                </div>

                <div className="space-y-2">

                  {approvedUsers.map(
                    (adminUser) => (

                      <div
                        key={
                          adminUser.id
                        }
                        className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-3"
                      >

                        <div className="w-9 h-9 bg-green-50 rounded-xl flex items-center justify-center text-sm flex-shrink-0">
                          ✓
                        </div>

                        <div className="flex-1 min-w-0">

                          <p className="text-sm font-semibold break-all">
                            {
                              adminUser.email
                            }
                          </p>

                          <p className="text-[10px] text-green-500 mt-0.5 font-medium">
                            Aktif
                          </p>

                        </div>

                      </div>

                    )
                  )}

                </div>

              </section>

              <section>

                <div className="flex items-center justify-between mb-3 px-1">

                  <h2 className="font-bold text-base">
                    Akun Ditolak
                  </h2>

                  <span className="bg-red-50 text-red-500 border border-red-100 px-2.5 py-1 rounded-full text-[10px] font-bold">
                    {rejectedUsers.length}
                  </span>

                </div>

                {rejectedUsers.length ===
                0 ? (

                  <div className="bg-white border border-gray-100 rounded-2xl p-5 text-center">

                    <p className="text-xs text-gray-400">
                      Belum ada akun yang ditolak.
                    </p>

                  </div>

                ) : (

                  <div className="space-y-2">

                    {rejectedUsers.map(
                      (adminUser) => (

                        <div
                          key={
                            adminUser.id
                          }
                          className="bg-white border border-gray-100 rounded-2xl p-4"
                        >

                          <div className="flex items-center gap-3">

                            <div className="w-9 h-9 bg-red-50 rounded-xl flex items-center justify-center text-sm flex-shrink-0">
                              ✕
                            </div>

                            <div className="flex-1 min-w-0">

                              <p className="text-sm font-semibold break-all">
                                {
                                  adminUser.email
                                }
                              </p>

                              <p className="text-[10px] text-red-400 mt-0.5">
                                Ditolak
                              </p>

                            </div>

                          </div>

                          <button
                            onClick={() =>
                              changeUserStatus(
                                adminUser.id,
                                'approved'
                              )
                            }
                            disabled={
                              adminActionLoading ===
                              adminUser.id
                            }
                            className="w-full mt-3 bg-black text-white py-2.5 rounded-xl text-xs font-semibold active:scale-[0.98] transition disabled:opacity-50"
                          >
                            {adminActionLoading ===
                            adminUser.id
                              ? 'Memproses...'
                              : 'Setujui Akun Ini'}
                          </button>

                        </div>

                      )
                    )}

                  </div>

                )}

              </section>

            </div>

          )}

          <footer className="text-center mt-8 pb-5">

            <p className="text-[10px] tracking-widest text-gray-300 font-semibold">
              MASTER KANJI N3 @by DIMAS M
            </p>

          </footer>

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

        <div className="sticky top-0 z-30 bg-[#f7f8fc] pt-1 pb-3">

          <header className="mb-4">

            <div className="flex items-center gap-2">

              {/* BAGIAN */}

              <div className="relative flex-1 min-w-0">

                <button
                  onClick={() =>
                    setShowParts(
                      !showParts
                    )
                  }
                  className="w-full h-[54px] flex items-center gap-2 bg-white border border-gray-200 rounded-2xl px-2.5 shadow-sm hover:shadow-md hover:border-gray-300 active:scale-[0.98] transition-all"
                >

                  <div className="w-9 h-9 rounded-xl bg-black text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                    {part.replace(
                      'part',
                      ''
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 min-w-0">

                    <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
                      Bagian
                    </p>

                    <p className="text-base font-bold leading-none">
                      {part.replace(
                        'part',
                        ''
                      )}
                    </p>

                  </div>

                  <span
                    className={`ml-auto text-gray-400 transition-transform duration-300 ${
                      showParts
                        ? 'rotate-180'
                        : ''
                    }`}
                  >
                    ↓
                  </span>

                </button>

                {showParts && (
                  <>

                    <div
                      className="fixed inset-0 z-30"
                      onClick={() =>
                        setShowParts(
                          false
                        )
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
                          (
                            p,
                            index
                          ) => {

                            const cards =
                              allParts[
                                p
                              ] || []

                            const learned =
                              mastered.filter(
                                (m) =>
                                  m.startsWith(
                                    `${p}-`
                                  )
                              ).length

                            const percentage =
                              cards.length >
                              0
                                ? Math.round(
                                    (learned /
                                      cards.length) *
                                      100
                                  )
                                : 0

                            const selected =
                              p ===
                              part

                            return (
                              <button
                                key={
                                  p
                                }
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

                                <div
                                  className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                                    selected
                                      ? 'bg-white/15 text-white'
                                      : 'bg-gray-100 text-gray-700'
                                  }`}
                                >
                                  {index +
                                    1}
                                </div>

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

                                  <p
                                    className={`text-[10px] mt-1 ${
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

              {/* KOLEKSI */}

              <button
                onClick={() => {
                  setUnlearnedOnly(
                    false
                  )

                  setShowCollection(
                    true
                  )
                }}
                className="bg-white border border-gray-200 rounded-2xl w-[54px] h-[54px] flex-shrink-0 flex flex-col items-center justify-center shadow-sm hover:shadow-md hover:border-gray-300 active:scale-95 transition-all"
                aria-label="Koleksi"
              >

                <span className="text-lg leading-none">
                  📚
                </span>

                <span className="text-[9px] font-semibold text-gray-500 mt-1">
                  Koleksi
                </span>

              </button>

              {/* BELUM */}

              <button
                onClick={
                  startUnlearnedMode
                }
                className="bg-white border border-gray-200 rounded-2xl w-[54px] h-[54px] flex-shrink-0 flex flex-col items-center justify-center shadow-sm hover:shadow-md hover:border-gray-300 active:scale-95 transition-all"
                aria-label="Belum Hafal"
              >

                <span className="text-lg leading-none">
                  🔄
                </span>

                <span className="text-[9px] font-semibold text-gray-500 mt-1">
                  Belum
                </span>

              </button>

              {/* MENU AKUN */}

              <div className="relative flex-shrink-0">

                <button
                  onClick={() =>
                    setShowUserMenu(
                      !showUserMenu
                    )
                  }
                  className="bg-white border border-gray-200 rounded-2xl w-[54px] h-[54px] flex flex-col items-center justify-center shadow-sm hover:shadow-md hover:border-gray-300 active:scale-95 transition-all"
                  aria-label="Menu akun"
                >

                  <span className="text-lg leading-none">
                    👤
                  </span>

                  <span className="text-[9px] font-semibold text-gray-500 mt-1">
                    Menu
                  </span>

                </button>

                {showUserMenu && (
                  <>

                    <div
                      className="fixed inset-0 z-40"
                      onClick={() =>
                        setShowUserMenu(
                          false
                        )
                      }
                    />

                    <div className="absolute z-50 top-full right-0 mt-3 w-[210px] bg-white rounded-3xl border border-gray-100 shadow-2xl shadow-black/10 p-2 animate-[dropdownIn_.22s_ease-out]">

                      <div className="px-3 py-3 border-b border-gray-100 mb-1">

                        <p className="text-[9px] uppercase tracking-widest font-bold text-gray-400">
                          Akun
                        </p>

                        <p className="text-xs font-semibold text-gray-800 mt-1 break-all">
                          {user.email}
                        </p>

                      </div>

                      {profile.role ===
                        'admin' && (

                        <button
                          onClick={() => {
                            setShowUserMenu(
                              false
                            )

                            openAdmin()
                          }}
                          className="w-full flex items-center gap-3 px-3 py-3 rounded-2xl text-left hover:bg-gray-50 active:scale-[0.98] transition"
                        >

                          <div className="w-9 h-9 rounded-xl bg-black text-white flex items-center justify-center text-sm">
                            🛡️
                          </div>

                          <div className="flex-1">

                            <p className="text-sm font-semibold text-gray-800">
                              Admin
                            </p>

                            <p className="text-[10px] text-gray-400 mt-0.5">
                              Kelola akun pengguna
                            </p>

                          </div>

                          <span className="text-gray-300">
                            ›
                          </span>

                        </button>

                      )}

                      <button
                        onClick={() => {
                          setShowUserMenu(
                            false
                          )

                          logout()
                        }}
                        className="w-full flex items-center gap-3 px-3 py-3 rounded-2xl text-left hover:bg-red-50 active:scale-[0.98] transition"
                      >

                        <div className="w-9 h-9 rounded-xl bg-red-50 text-red-500 flex items-center justify-center text-sm">
                          ↪
                        </div>

                        <div className="flex-1">

                          <p className="text-sm font-semibold text-red-600">
                            Keluar
                          </p>

                          <p className="text-[10px] text-gray-400 mt-0.5">
                            Keluar dari akun
                          </p>

                        </div>

                      </button>

                    </div>

                  </>
                )}

              </div>

            </div>

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
                }

                {' / '}

                {
                  allCurrentCards.length
                }

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

        {/* MODE BELUM HAFAL */}

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
                setUnlearnedOnly(
                  false
                )

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
                perspective:
                  '1200px',
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

                      {cardIndex +
                        1}{' '}
                      /{' '}
                      {
                        currentCards.length
                      }

                    </span>

                  </div>

                  {isMastered && (
                    <div className="absolute top-5 right-5 w-9 h-9 rounded-full bg-green-500 text-white flex items-center justify-center shadow-lg animate-[pop_.3s_ease-out]">
                      ✓
                    </div>
                  )}

                  <div className="text-[clamp(30px,10vw,80px)] leading-none font-medium select-none transition-transform duration-300 hover:scale-105">
                    {
                      currentKanji.k
                    }
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
                    {
                      currentKanji.k
                    }
                  </div>

                  <div className="text-center">

                    <p className="text-xs uppercase tracking-[0.2em] text-gray-400 mb-3">
                      Bacaan
                    </p>

                    <p className="text-2xl font-semibold">
                      {
                        currentKanji.r
                      }
                    </p>

                  </div>

                  <div className="w-16 h-px bg-gray-700 my-8" />

                  <div className="text-center">

                    <p className="text-xs uppercase tracking-[0.2em] text-gray-400 mb-3">
                      Arti
                    </p>

                    <p className="text-xl font-medium">
                      {
                        currentKanji.m
                      }
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

                {cardIndex +
                  1}{' '}
                dari{' '}
                {
                  currentCards.length
                }

              </span>

            </div>

            {/* NAVIGATION */}

            <div className="grid grid-cols-3 gap-3 mt-5">

              <button
                onClick={
                  prevCard
                }
                className="bg-white border border-gray-200 py-3.5 rounded-2xl font-semibold text-sm hover:border-gray-300 hover:-translate-y-0.5 active:scale-95 transition-all"
              >
                ← Prev
              </button>

              <button
                onClick={
                  shuffle
                }
                className="bg-white border border-gray-200 py-3.5 rounded-2xl font-semibold text-sm hover:border-gray-300 hover:-translate-y-0.5 active:scale-95 transition-all"
              >
                ⤨ Acak
              </button>

              <button
                onClick={
                  nextCard
                }
                className="bg-white border border-gray-200 py-3.5 rounded-2xl font-semibold text-sm hover:border-gray-300 hover:-translate-y-0.5 active:scale-95 transition-all"
              >
                Next →
              </button>

            </div>

            {/* MASTERED */}

            <button
              onClick={
                toggleMastered
              }
              disabled={
                saving
              }
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
                    setUnlearnedOnly(
                      false
                    )

                    setCardIndex(
                      0
                    )

                    setIsFlipped(
                      false
                    )
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

        {/* FOOTER */}

        <footer className="text-center mt-8 pb-5">

          <p className="text-[10px] tracking-widest text-gray-300 font-semibold">
            MASTER KANJI N3 @by DIMAS M
          </p>

        </footer>

      </div>

      {/* COLLECTION MODAL */}

      {showCollection && (

        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-5 animate-[fadeIn_.2s_ease-out]"
          onClick={() =>
            setShowCollection(
              false
            )
          }
        >

          <div
            className="w-full max-w-2xl bg-white rounded-t-[30px] sm:rounded-[30px] max-h-[88vh] h-[88dvh] shadow-2xl flex flex-col overflow-hidden animate-[modalUp_.35s_cubic-bezier(.22,1,.36,1)]"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            {/* MODAL HEADER */}

            <div className="flex-shrink-0 bg-white px-5 pt-5 pb-4 sm:px-6 sm:pt-6 sm:pb-5 border-b border-gray-100">

              <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-5 sm:hidden" />

              <div className="flex items-center justify-between gap-4">

                <div className="min-w-0">

                  <div className="flex items-center gap-2">

                    <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center text-lg flex-shrink-0">
                      📚
                    </div>

                    <div className="min-w-0">

                      <h2 className="font-bold text-lg leading-tight text-gray-900">
                        Koleksi Hafalan
                      </h2>

                      <p className="text-xs text-gray-400 mt-0.5">
                        {
                          mastered.length
                        }{' '}
                        kanji sudah ditandai
                      </p>

                    </div>

                  </div>

                </div>

                <button
                  onClick={() =>
                    setShowCollection(
                      false
                    )
                  }
                  className="w-10 h-10 flex-shrink-0 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center hover:bg-gray-200 hover:text-gray-700 active:scale-90 transition-all"
                  aria-label="Tutup koleksi"
                >
                  ✕
                </button>

              </div>

            </div>

            {/* COLLECTION CONTENT */}

            <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 sm:px-5 py-7">

              {mastered.length ===
              0 ? (

                <div className="h-full flex flex-col items-center justify-center text-center px-6">

                  <div className="w-16 h-16 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center text-3xl mb-4">
                    📖
                  </div>

                  <p className="font-semibold text-gray-700">
                    Belum ada kanji
                  </p>

                  <p className="text-sm text-gray-400 mt-1 max-w-xs">
                    Tandai kanji sebagai sudah hafal untuk memasukkannya ke koleksi.
                  </p>

                </div>

              ) : (

                <div className="space-y-2.5">

                  {mastered.map(
                    (id) => {

                      const [
                        savedPart,
                        savedIndexString,
                      ] =
                        id.split(
                          '-'
                        )

                      const savedIndex =
                        Number(
                          savedIndexString
                        )

                      const cards =
                        allParts[
                          savedPart
                        ] || []

                      const card =
                        cards[
                          savedIndex
                        ]

                      if (!card) {
                        return null
                      }

                      return (

                        <button
                          key={
                            id
                          }
                          onClick={() => {
                            setUnlearnedOnly(
                              false
                            )

                            setPart(
                              savedPart
                            )

                            setCardIndex(
                              savedIndex
                            )

                            setIsFlipped(
                              false
                            )

                            setShowCollection(
                              false
                            )
                          }}
                          className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-3 py-3 sm:px-4 sm:py-3.5 flex items-center gap-3 sm:gap-4 text-left hover:bg-gray-100 hover:border-gray-200 active:scale-[0.985] transition-all"
                        >

                          <div className="flex-shrink-0 flex items-start justify-start min-w-fit max-w-[55%] pr-4">

                            <span className="text-[30px] sm:text-[32px] leading-none whitespace-nowrap">
                              {
                                card.k
                              }
                            </span>

                          </div>

                          <div className="flex-1 min-w-0">

                            <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.15em] text-gray-400 mb-1">
                              Arti
                            </p>

                            <p className="text-sm sm:text-base font-semibold text-gray-800 leading-snug break-words">
                              {
                                card.m
                              }
                            </p>

                            {card.r && (

                              <p className="text-[11px] sm:text-xs text-gray-400 mt-1 leading-relaxed break-words">
                                {
                                  card.r
                                }
                              </p>

                            )}

                            <p className="text-[9px] text-gray-300 mt-1.5">
                              Bagian{' '}
                              {savedPart.replace(
                                'part',
                                ''
                              )}
                            </p>

                          </div>

                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-50 border border-green-100 flex items-center justify-center">

                            <span className="text-green-500 text-sm font-bold">
                              ✓
                            </span>

                          </div>

                        </button>

                      )
                    }
                  )}

                </div>

              )}

            </div>

            <div className="flex-shrink-0 bg-white h-[env(safe-area-inset-bottom)]" />

          </div>

        </div>

      )}

    </main>
  )
}