'use client'

import { ReactNode } from 'react'

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50">
      {children}
    </div>
  )
}
