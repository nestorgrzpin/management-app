'use client'

import React from "react"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [role, setRole] = useState('analyst')
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

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (supabaseError) {
      toast.error('Supabase no está configurado correctamente')
      return
    }

    setLoading(true)

    try {
      if (!fullName || !email || !password) {
        toast.error('Por favor completa todos los campos')
        setLoading(false)
        return
      }

      console.log('[v0] Attempting signup with:', { email, fullName, role })

      const supabase = createClient()

      const { data, error: signupError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
          data: {
            full_name: fullName,
            role,
          },
        },
      })

      if (signupError) {
        console.error('[v0] Signup error:', signupError)
        toast.error(`Error en registro: ${signupError.message}`)
        setLoading(false)
        return
      }

      console.log('[v0] Signup successful:', data.user?.id)
      toast.success('¡Cuenta creada! Por favor verifica tu email.')
      
      // Redirect to login after showing success
      setTimeout(() => router.push('/login'), 2000)
    } catch (error) {
      console.error('[v0] Signup exception:', error)
      const errorMsg = error instanceof Error ? error.message : 'Error desconocido'
      toast.error(`Error: ${errorMsg}`)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Registrarse</CardTitle>
          <CardDescription>Crea tu cuenta para acceder a la plataforma</CardDescription>
        </CardHeader>
        <CardContent>
          {supabaseError && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{supabaseError}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Nombre Completo</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Juan Pérez"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                disabled={!!supabaseError || loading}
              />
            </div>
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
            <div className="space-y-2">
              <Label htmlFor="role">Rol</Label>
              <Select value={role} onValueChange={setRole} disabled={!!supabaseError || loading}>
                <SelectTrigger id="role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="analyst">Analista</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading || !!supabaseError}
            >
              {loading ? 'Registrando...' : 'Registrarse'}
            </Button>
          </form>
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              ¿Ya tienes cuenta?{' '}
              <a href="/login" className="text-indigo-600 hover:underline">
                Inicia sesión
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
