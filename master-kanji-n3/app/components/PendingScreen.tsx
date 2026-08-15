'use client'

type PendingScreenProps = {
  email?: string
  onCheckStatus: () => void
  onLogout: () => void
}

export default function PendingScreen({
  email,
  onCheckStatus,
  onLogout,
}: PendingScreenProps) {
  return (
    <main className="min-h-screen bg-[#f7f8fc] flex items-center justify-center px-5 py-10">

      <div className="w-full max-w-md animate-[pageEnter_.45s_cubic-bezier(.22,1,.36,1)]">

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
              {email}
            </p>

            <div className="mt-4 flex items-center gap-2">

              <div className="w-2 h-2 bg-yellow-400 rounded-full" />

              <span className="text-xs font-medium text-gray-500">
                Menunggu persetujuan admin
              </span>

            </div>

          </div>

          <button
            onClick={onCheckStatus}
            className="w-full mt-6 bg-black text-white py-3.5 rounded-2xl font-semibold active:scale-[0.98] transition"
          >
            Cek Status
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