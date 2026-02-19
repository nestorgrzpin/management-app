'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { EnvDiagnostics } from '@/components/env-diagnostics'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      let supabase
      try {
        supabase = createClient()
      } catch (clientError) {
        console.error('[v0] Failed to create Supabase client:', clientError)
        toast.error('Supabase no está configurado correctamente. Por favor verifica las variables de entorno.')
        setLoading(false)
        return
      }
      
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
      const msg = error instanceof Error ? error.message : 'Error desconocido'
      toast.error(msg)
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
          <EnvDiagnostics />
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
                disabled={loading}
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
                disabled={loading}
              />
            </div>
            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading}
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
