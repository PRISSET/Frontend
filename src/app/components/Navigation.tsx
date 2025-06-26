'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function Navigation() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    setIsLoggedIn(!!token)
  }, [])

  return (
    <nav className="nav-card">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-white drop-shadow-lg">Auth App</h1>
          </div>
          <div className="flex items-center space-x-6">
            {!isLoggedIn && (
              <>
                <Link href="/" className="text-white/90 hover:text-white font-medium transition-colors duration-200 hover:drop-shadow-lg">Вход</Link>
                <Link href="/register" className="text-white/90 hover:text-white font-medium transition-colors duration-200 hover:drop-shadow-lg">Регистрация</Link>
              </>
            )}
            <Link href="/profile" className="text-white/90 hover:text-white font-medium transition-colors duration-200 hover:drop-shadow-lg">Профиль</Link>
          </div>
        </div>
      </div>
    </nav>
  )
}