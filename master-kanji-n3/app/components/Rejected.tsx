'use client'

type RejectedProps = {
  logout: () => void
}

export default function Rejected({
  logout,
}: RejectedProps) {
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