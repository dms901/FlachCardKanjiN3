'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../components/AuthProvider'

export default function RegisterPage() {
  const router = useRouter()

  const {
    supabase,
    user,
    loading: authLoading,
  } = useAuth()

  const [email, setEmail] =
    useState('')

  const [password, setPassword] =
    useState('')

  const [loading, setLoading] =
    useState(false)

  /*
  |--------------------------------------------------------------------------
  | REGISTER
  |--------------------------------------------------------------------------
  */

  const handleRegister = async (
    e: FormEvent
  ) => {
    e.preventDefault()

    if (!email || !password) {
      alert(
        'Email dan password harus diisi.'
      )
      return
    }

    if (password.length < 6) {
      alert(
        'Password minimal 6 karakter.'
      )
      return
    }

    setLoading(true)

    try {
      const {
        data,
        error,
      } =
        await supabase.auth.signUp({
          email,
          password,
        })

      if (error) throw error

      /*
      |--------------------------------------------------------------------------
      | EMAIL VERIFICATION
      |--------------------------------------------------------------------------
      */

      if (!data.session) {
        alert(
          'Akun berhasil dibuat.\n\nSilakan cek email kamu dan klik link verifikasi terlebih dahulu.'
        )

        router.push('/login')

        return
      }

      /*
      |--------------------------------------------------------------------------
      | JIKA SESSION LANGSUNG TERBUAT
      |--------------------------------------------------------------------------
      */

      alert(
        'Akun berhasil dibuat. Silakan menunggu persetujuan admin.'
      )

      router.push('/')

    } catch (error: any) {
      console.error(error)

      alert(
        error.message ||
          'Gagal membuat akun.'
      )
    } finally {
      setLoading(false)
    }
  }

  /*
  |--------------------------------------------------------------------------
  | JIKA SUDAH LOGIN
  |--------------------------------------------------------------------------
  */

  if (user && !authLoading) {
    router.replace('/')

    return (
      <main className="min-h-screen bg-[#f7f8fc] flex items-center justify-center">
        <div className="text-center animate-pulse">

          <div className="w-10 h-10 border-4 border-gray-200 border-t-black rounded-full animate-spin mx-auto mb-4" />

          <p className="text-sm text-gray-500">
            Membuka aplikasi...
          </p>

        </div>
      </main>
    )
  }

  /*
  |--------------------------------------------------------------------------
  | PAGE
  |--------------------------------------------------------------------------
  */

  return (
    <main className="min-h-screen bg-[#f7f8fc] flex items-center justify-center px-5 py-10">

      <div className="w-full max-w-md">

        <div className="bg-white rounded-[28px] shadow-xl shadow-black/5 p-7 sm:p-9 border border-gray-100">

          {/* LOGO */}

          <div className="text-center mb-8">

            <div className="w-16 h-16 bg-black text-white rounded-2xl flex items-center justify-center text-3xl font-bold mx-auto mb-5 shadow-lg">
              漢
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              Master Kanji N3
            </h1>

            <p className="text-sm text-gray-500 mt-2">
              Buat akun baru
            </p>

          </div>

          {/* FORM */}

          <form
            onSubmit={handleRegister}
            className="space-y-4"
          >

            {/* EMAIL */}

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

            {/* PASSWORD */}

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
                autoComplete="new-password"
                className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:bg-white focus:border-black focus:ring-2 focus:ring-black/5 transition"
              />

              <p className="text-[10px] text-gray-400 mt-2 px-1">
                Password minimal 6 karakter.
              </p>

            </div>

            {/* REGISTER BUTTON */}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-3.5 rounded-2xl font-semibold hover:bg-gray-800 active:scale-[0.98] transition disabled:opacity-50"
            >
              {loading
                ? 'Memproses...'
                : 'Buat Akun'}
            </button>

          </form>

          {/* LOGIN */}

          <button
            onClick={() =>
              router.push(
                '/login'
              )
            }
            className="w-full mt-5 text-sm text-gray-500 hover:text-black transition"
          >
            Sudah punya akun? Masuk
          </button>

        </div>

        {/* FOOTER */}

        <p className="text-center text-xs text-gray-400 mt-6">
          Master Kanji • N3
        </p>

      </div>

    </main>
  )
}