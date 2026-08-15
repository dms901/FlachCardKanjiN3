'use client'

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react'

import { createClient } from '@supabase/supabase-js'

/*
|--------------------------------------------------------------------------
| SUPABASE
|--------------------------------------------------------------------------
*/

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

/*
|--------------------------------------------------------------------------
| TYPES
|--------------------------------------------------------------------------
*/

type AuthContextType = {
  supabase: typeof supabase
  user: any
  loading: boolean
}

/*
|--------------------------------------------------------------------------
| CONTEXT
|--------------------------------------------------------------------------
*/

const AuthContext =
  createContext<AuthContextType | undefined>(
    undefined
  )

/*
|--------------------------------------------------------------------------
| PROVIDER
|--------------------------------------------------------------------------
*/

export default function AuthProvider({
  children,
}: {
  children: ReactNode
}) {
  const [user, setUser] =
    useState<any>(null)

  const [loading, setLoading] =
    useState(true)

  /*
  |--------------------------------------------------------------------------
  | INITIALIZE AUTH
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    let mounted = true

    const initialize = async () => {
      try {
        const {
          data: {
            session,
          },
        } =
          await supabase.auth.getSession()

        if (!mounted) return

        setUser(
          session?.user ?? null
        )
      } catch (error) {
        console.error(
          'Gagal mengambil session:',
          error
        )
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    initialize()

    /*
    |--------------------------------------------------------------------------
    | AUTH STATE CHANGE
    |--------------------------------------------------------------------------
    */

    const {
      data: {
        subscription,
      },
    } =
      supabase.auth.onAuthStateChange(
        (_event, session) => {
          if (!mounted) return

          setUser(
            session?.user ?? null
          )

          setLoading(false)
        }
      )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  /*
  |--------------------------------------------------------------------------
  | CONTEXT VALUE
  |--------------------------------------------------------------------------
  */

  return (
    <AuthContext.Provider
      value={{
        supabase,
        user,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

/*
|--------------------------------------------------------------------------
| USE AUTH
|--------------------------------------------------------------------------
*/

export function useAuth() {
  const context =
    useContext(AuthContext)

  if (!context) {
    throw new Error(
      'useAuth harus digunakan di dalam AuthProvider'
    )
  }

  return context
}