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
        // Check auth via server endpoint instead of client Supabase
        const response = await fetch('/api/auth/session', {
          credentials: 'include'
        })

        if (response.ok) {
          const { session } = await response.json()
          if (session) {
            router.push('/dashboard')
          } else {
            router.push('/login')
          }
        } else {
          // If auth check fails, go to login
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
