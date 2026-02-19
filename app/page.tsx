'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Spinner } from '@/components/ui/spinner'

export default function Home() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { createClient } = await import('@/lib/supabase')
        
        try {
          const supabase = createClient()
          const {
            data: { session },
          } = await supabase.auth.getSession()

          if (session) {
            router.push('/dashboard')
          } else {
            router.push('/login')
          }
        } catch (supabaseError) {
          console.warn('[v0] Supabase not available, redirecting to login:', supabaseError)
          router.push('/login')
        }
      } catch (error) {
        console.error('[v0] Auth check failed:', error)
        router.push('/login')
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Spinner />
    </div>
  )
}
