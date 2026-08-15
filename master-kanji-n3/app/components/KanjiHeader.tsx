'use client'

type KanjiHeaderProps = {
  part: string
  showParts: boolean
  showCollection: boolean
  showUserMenu: boolean

  profile: any
  user: any

  mastered: string[]

  allParts: Record<string, any[]>
  allCurrentCards: any[]

  progress: number

  setShowParts: (value: boolean) => void
  setShowCollection: (value: boolean) => void
  setShowUserMenu: (value: boolean) => void
  setUnlearnedOnly: (value: boolean) => void

  startUnlearnedMode: () => void

  changePart: (newPart: string) => void

  openAdmin: () => void
  logout: () => void
}

export default function KanjiHeader({
  part,
  showParts,
  showCollection,
  showUserMenu,

  profile,
  user,

  mastered,

  allParts,
  allCurrentCards,

  progress,

  setShowParts,
  setShowCollection,
  setShowUserMenu,
  setUnlearnedOnly,

  startUnlearnedMode,

  changePart,

  openAdmin,
  logout,
}: KanjiHeaderProps) {
  return (
    <div className="sticky top-0 z-30 bg-[#f7f8fc] pt-1 pb-3">

      <header className="mb-4">

        <div className="flex items-center gap-2">

          {/* ========================================================
              BAGIAN
          ========================================================= */}

          <div className="relative flex-1 min-w-0">

            <button
              onClick={() =>
                setShowParts(!showParts)
              }
              className="w-full h-[54px] flex items-center gap-2 bg-white border border-gray-200 rounded-2xl px-2.5 shadow-sm hover:shadow-md hover:border-gray-300 active:scale-[0.98] transition-all"
            >

              <div className="w-9 h-9 rounded-xl bg-black text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                {part.replace('part', '')}
              </div>

              <div className="flex items-center gap-1.5 min-w-0">

                <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
                  Bagian
                </p>

                <p className="text-base font-bold leading-none">
                  {part.replace('part', '')}
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

            {/* DROPDOWN BAGIAN */}

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

                    {Object.keys(allParts).map(
                      (p, index) => {

                        const cards =
                          allParts[p] || []

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
                              changePart(p)
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
                              {index + 1}
                            </div>

                            <div className="flex-1 min-w-0">

                              <div className="flex items-center justify-between">

                                <p className="font-bold text-sm">
                                  Bagian {index + 1}
                                </p>

                                {percentage === 100 && (
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
                                {learned} /{' '}
                                {cards.length}{' '}
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

          {/* ========================================================
              KOLEKSI
          ========================================================= */}

          <button
            onClick={() => {
              setUnlearnedOnly(false)
              setShowCollection(true)
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

          {/* ========================================================
              BELUM
          ========================================================= */}

          <button
            onClick={startUnlearnedMode}
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

          {/* ========================================================
              MENU AKUN
          ========================================================= */}

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

            {/* DROPDOWN MENU AKUN */}

            {showUserMenu && (
              <>

                <div
                  className="fixed inset-0 z-40"
                  onClick={() =>
                    setShowUserMenu(false)
                  }
                />

                <div className="absolute z-50 top-full right-0 mt-3 w-[210px] bg-white rounded-3xl border border-gray-100 shadow-2xl shadow-black/10 p-2 animate-[dropdownIn_.22s_ease-out]">

                  {/* INFO AKUN */}

                  <div className="px-3 py-3 border-b border-gray-100 mb-1">

                    <p className="text-[9px] uppercase tracking-widest font-bold text-gray-400">
                      Akun
                    </p>

                    <p className="text-xs font-semibold text-gray-800 mt-1 break-all">
                      {user.email}
                    </p>

                  </div>

                  {/* ADMIN */}

                  {profile.role === 'admin' && (
                    <button
                      onClick={() => {
                        setShowUserMenu(false)
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

                  {/* KELUAR */}

                  <button
                    onClick={() => {
                      setShowUserMenu(false)
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

      {/* ============================================================
          PROGRESS
      ============================================================ */}

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

            {allCurrentCards.length}

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
  )
}