'use client'

import React from "react"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [supabaseError, setSupabaseError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    try {
      createClient()
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Error desconocido'
      console.error('[v0] Supabase client error:', errorMsg)
      setSupabaseError('Las variables de entorno de Supabase no están configuradas correctamente.')
    }
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (supabaseError) {
      toast.error('Supabase no está configurado correctamente')
      return
    }

    setLoading(true)

    try {
      const supabase = createClient()
      
      console.log('[v0] Attempting login with email:', email)

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error('[v0] Login error:', error)
        toast.error(`Error: ${error.message}`)
      } else {
        console.log('[v0] Login successful')
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('[v0] Login exception:', error)
      toast.error('An error occurred during login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Iniciar Sesión</CardTitle>
          <CardDescription>Accede a la plataforma de gestión de proyectos</CardDescription>
        </CardHeader>
        <CardContent>
          {supabaseError && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{supabaseError}</AlertDescription>
            </Alert>
          )}
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={!!supabaseError || loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={!!supabaseError || loading}
              />
            </div>
            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading || !!supabaseError}
            >
              {loading ? 'Iniciando...' : 'Iniciar Sesión'}
            </Button>
          </form>
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              ¿No tienes cuenta?{' '}
              <a href="/signup" className="text-indigo-600 hover:underline">
                Regístrate
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
