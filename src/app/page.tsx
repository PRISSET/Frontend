'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (response.ok) {
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
        router.push('/profile')
      } else {
        setError(data.message || 'Ошибка входа')
      }
    } catch (error) {
      setError('Ошибка соединения с сервером')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="card">
        <h2 className="text-3xl font-bold mb-6 text-center text-white drop-shadow-lg">Вход в систему</h2>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-white text-sm font-bold mb-2 drop-shadow" htmlFor="email">
              Email
            </label>
            <input
              className="input-field"
              id="email"
              type="email"
              placeholder="Введите email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-white text-sm font-bold mb-2 drop-shadow" htmlFor="password">
              Пароль
            </label>
            <input
              className="input-field"
              id="password"
              type="password"
              placeholder="Введите пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <div className="flex items-center justify-between">
            <button
              className="btn-primary w-full"
              type="submit"
              disabled={loading}
            >
              {loading ? 'Вход...' : 'Войти'}
            </button>
          </div>
        </form>
        
        <div className="text-center mt-4">
          <p className="text-white/90">
            Нет аккаунта?{' '}
            <Link href="/register" className="text-blue-300 hover:text-blue-100 font-medium transition-colors duration-200">
                    Зарегистрироваться
                  </Link>
          </p>
        </div>
      </div>
    </div>
  )
}