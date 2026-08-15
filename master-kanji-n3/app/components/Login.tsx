'use client'

import { FormEvent } from 'react'

type LoginProps = {
  email: string
  password: string
  authMode: 'login' | 'register'
  loading: boolean
  setEmail: (value: string) => void
  setPassword: (value: string) => void
  setAuthMode: (
    value: 'login' | 'register'
  ) => void
  handleAuth: (
    e: FormEvent<HTMLFormElement>
  ) => void
}

export default function Login({
  email,
  password,
  authMode,
  loading,
  setEmail,
  setPassword,
  setAuthMode,
  handleAuth,
}: LoginProps) {
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