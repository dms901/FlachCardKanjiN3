'use client'

type AdminUser = {
  id: string
  email: string
  role: string
  status: 'approved' | 'rejected' | 'pending'
  created_at: string
}

type AdminPageProps = {
  user: any
  profile: any

  adminUsers: AdminUser[]
  adminLoading: boolean
  adminActionLoading: string | null

  loadAdminUsers: () => Promise<void>

  changeUserStatus: (
    userId: string,
    newStatus:
      | 'approved'
      | 'rejected'
      | 'pending'
  ) => Promise<void>

  setShowAdmin: (value: boolean) => void
}

export default function AdminPage({
  user,
  profile,
  adminUsers,
  adminLoading,
  adminActionLoading,
  loadAdminUsers,
  changeUserStatus,
  setShowAdmin,
}: AdminPageProps) {
  const pendingUsers =
    adminUsers.filter(
      (item) =>
        item.status === 'pending'
    )

  const approvedUsers =
    adminUsers.filter(
      (item) =>
        item.status === 'approved'
    )

  const rejectedUsers =
    adminUsers.filter(
      (item) =>
        item.status === 'rejected'
    )

  return (
    <main className="min-h-screen bg-[#f7f8fc] text-gray-900">

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-5 sm:py-8">

        {/* ADMIN HEADER */}

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

        {/* ADMIN INFO */}

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

        {/* REFRESH */}

        <button
          onClick={loadAdminUsers}
          disabled={adminLoading}
          className="w-full bg-white border border-gray-200 py-3 rounded-2xl text-sm font-semibold mb-5 hover:border-gray-300 active:scale-[0.98] transition disabled:opacity-50"
        >
          {adminLoading
            ? 'Memuat...'
            : '↻ Perbarui Daftar'}
        </button>

        {adminLoading &&
        adminUsers.length === 0 ? (

          <div className="bg-white rounded-3xl p-10 text-center">

            <div className="w-9 h-9 border-4 border-gray-200 border-t-black rounded-full animate-spin mx-auto mb-4" />

            <p className="text-sm text-gray-500">
              Memuat akun...
            </p>

          </div>

        ) : (

          <div className="space-y-6">

            {/* =====================================================
                PENDING
            ====================================================== */}

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

              {pendingUsers.length === 0 ? (

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
                        key={adminUser.id}
                        className="bg-white border border-gray-100 rounded-3xl p-4 shadow-sm"
                      >

                        <div className="flex items-start gap-3">

                          <div className="w-11 h-11 bg-yellow-50 border border-yellow-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                            👤
                          </div>

                          <div className="flex-1 min-w-0">

                            <p className="font-semibold text-sm text-gray-800 break-all">
                              {adminUser.email}
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

            {/* =====================================================
                APPROVED
            ====================================================== */}

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
                      key={adminUser.id}
                      className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-3"
                    >

                      <div className="w-9 h-9 bg-green-50 rounded-xl flex items-center justify-center text-sm flex-shrink-0">
                        ✓
                      </div>

                      <div className="flex-1 min-w-0">

                        <p className="text-sm font-semibold break-all">
                          {adminUser.email}
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

            {/* =====================================================
                REJECTED
            ====================================================== */}

            <section>

              <div className="flex items-center justify-between mb-3 px-1">

                <h2 className="font-bold text-base">
                  Akun Ditolak
                </h2>

                <span className="bg-red-50 text-red-500 border border-red-100 px-2.5 py-1 rounded-full text-[10px] font-bold">
                  {rejectedUsers.length}
                </span>

              </div>

              {rejectedUsers.length === 0 ? (

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
                        key={adminUser.id}
                        className="bg-white border border-gray-100 rounded-2xl p-4"
                      >

                        <div className="flex items-center gap-3">

                          <div className="w-9 h-9 bg-red-50 rounded-xl flex items-center justify-center text-sm flex-shrink-0">
                            ✕
                          </div>

                          <div className="flex-1 min-w-0">

                            <p className="text-sm font-semibold break-all">
                              {adminUser.email}
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