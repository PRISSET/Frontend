'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Пароли не совпадают')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('http://localhost:3001/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password
        }),
      })

      const data = await response.json()

      if (response.ok) {
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
        router.push('/profile')
      } else {
        setError(data.message || 'Ошибка регистрации')
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
        <h2 className="text-3xl font-bold mb-6 text-center text-white drop-shadow-lg">Регистрация</h2>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-white text-sm font-bold mb-2 drop-shadow" htmlFor="name">
              Имя
            </label>
            <input
              className="input-field"
              id="name"
              name="name"
              type="text"
              placeholder="Введите имя"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-white text-sm font-bold mb-2 drop-shadow" htmlFor="email">
              Email
            </label>
            <input
              className="input-field"
              id="email"
              name="email"
              type="email"
              placeholder="Введите email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-white text-sm font-bold mb-2 drop-shadow" htmlFor="password">
              Пароль
            </label>
            <input
              className="input-field"
              id="password"
              name="password"
              type="password"
              placeholder="Введите пароль"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-white text-sm font-bold mb-2 drop-shadow" htmlFor="confirmPassword">
              Подтвердите пароль
            </label>
            <input
              className="input-field"
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="Подтвердите пароль"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="flex items-center justify-between">
            <button
              className="btn-primary w-full"
              type="submit"
              disabled={loading}
            >
              {loading ? 'Регистрация...' : 'Зарегистрироваться'}
            </button>
          </div>
        </form>
        
        <div className="text-center mt-4">
          <p className="text-white/90">
            Уже есть аккаунт?{' '}
            <Link href="/login" className="text-blue-300 hover:text-blue-100 font-medium transition-colors duration-200">
                    Войти
                  </Link>
          </p>
        </div>
      </div>
    </div>
  )
}