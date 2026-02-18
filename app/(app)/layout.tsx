'use client'

import { ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { LayoutDashboard, LogOut, Plus } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const supabase = createClient()
        
        console.log('[v0] Checking authentication...')

        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession()

        if (sessionError) {
          console.error('[v0] Session error:', sessionError)
          setError('Error al verificar la sesión')
          setLoading(false)
          return
        }

        if (!session) {
          console.log('[v0] No session found, redirecting to login')
          router.push('/login')
        } else {
          console.log('[v0] Session found for user:', session.user.email)
          setUser(session.user)
          setLoading(false)
        }
      } catch (err) {
        console.error('[v0] Auth check error:', err)
        const errorMsg = err instanceof Error ? err.message : 'Error desconocido'
        setError(`Error de autenticación: ${errorMsg}`)
        setLoading(false)
      }
    }

    checkAuth()
  }, [router])

  const handleLogout = async () => {
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      router.push('/login')
    } catch (err) {
      console.error('[v0] Logout error:', err)
    }
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LayoutDashboard className="w-6 h-6 text-indigo-600" />
            <h1 className="text-2xl font-bold text-gray-900">SIE</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user?.email}</span>
            {user?.user_metadata?.role === 'admin' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/dashboard/admin')}
              >
                Admin
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Salir
            </Button>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-8">{children}</main>
    </div>
  )
}
