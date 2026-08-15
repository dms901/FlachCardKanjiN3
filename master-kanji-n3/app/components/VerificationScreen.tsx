'use client'

type VerificationScreenProps = {
  email?: string
  resendingEmail: boolean
  onResend: () => void
  onLogout: () => void
}

export default function VerificationScreen({
  email,
  resendingEmail,
  onResend,
  onLogout,
}: VerificationScreenProps) {
  return (
    <main className="min-h-screen bg-[#f7f8fc] flex items-center justify-center px-5 py-10">

      <div className="w-full max-w-md animate-[pageEnter_.45s_cubic-bezier(.22,1,.36,1)]">

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
            {email}
          </p>

          <p className="text-xs text-gray-400 mt-4 leading-relaxed">
            Silakan buka email tersebut dan klik link verifikasi sebelum melanjutkan.
          </p>

          <button
            onClick={onResend}
            disabled={resendingEmail}
            className="w-full mt-6 bg-black text-white py-3.5 rounded-2xl font-semibold active:scale-[0.98] transition disabled:opacity-50"
          >
            {resendingEmail
              ? 'Mengirim...'
              : 'Kirim Ulang Email'}
          </button>

          <button
            onClick={onLogout}
            className="w-full mt-3 py-3 text-sm text-gray-500 hover:text-black transition"
          >
            Keluar
          </button>

        </div>

      </div>

    </main>
  )
}