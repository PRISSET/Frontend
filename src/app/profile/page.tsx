'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import WeatherWidget from '../../components/WeatherWidget'

interface User {
  id: string
  name: string
  email: string
  avatar?: string
}

interface Bookmark {
  id: number
  title: string
  url: string
  created_at: string
}

export default function Profile() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [currentCity, setCurrentCity] = useState('')
  const [weather, setWeather] = useState<any>(null)
  const [weatherLoading, setWeatherLoading] = useState(false)
  const [weatherError, setWeatherError] = useState('')
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [newBookmark, setNewBookmark] = useState({ title: '', url: '' })
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/')
      return
    }

    loadUserData()
    loadWeatherSettings()
    loadBookmarks()
  }, [])

  const loadUserData = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:3001/api/user/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
        localStorage.setItem('user', JSON.stringify(userData))
      }
    } catch (error) {
      console.error('Ошибка загрузки профиля:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadWeatherSettings = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:3001/api/weather/settings', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.city) {
          setCurrentCity(data.city)
        }
      }
    } catch (error) {
      console.error('Ошибка загрузки настроек погоды:', error)
    }
  }

  const loadBookmarks = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:3001/api/bookmarks', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setBookmarks(data.bookmarks)
      }
    } catch (error) {
      console.error('Ошибка загрузки закладок:', error)
    }
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setError('')
    setSuccess('')

    const formData = new FormData()
    formData.append('avatar', file)

    try {
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:3001/api/user/avatar', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      })

      const data = await response.json()

      if (response.ok) {
        setUser(prev => prev ? { ...prev, avatar: data.avatarUrl } : null)
        localStorage.setItem('user', JSON.stringify({ ...user, avatar: data.avatarUrl }))
        setSuccess('Аватар успешно обновлен')
      } else {
        setError(data.message || 'Ошибка загрузки аватара')
      }
    } catch (error) {
      setError('Ошибка соединения с сервером')
    } finally {
      setUploading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/')
  }

  const getWeather = async () => {
    if (!currentCity.trim()) {
      setWeatherError('Введите название города')
      return
    }
    
    setWeatherLoading(true)
    setWeatherError('')
    
    try {
      const response = await fetch(
        `https://wttr.in/${encodeURIComponent(currentCity)}?format=j1&lang=ru`
      )
      
      if (response.ok) {
        const data = await response.json()
        
        const forecast = data.weather.slice(0, 7).map((day: any, index: number) => {
          const date = new Date()
          date.setDate(date.getDate() + index)
          
          return {
            date: index === 0 ? 'Сегодня' : date.toLocaleDateString('ru-RU', { 
              weekday: 'short', 
              day: 'numeric', 
              month: 'short' 
            }),
            temp: Math.round(day.maxtempC),
            description: day.hourly[0]?.lang_ru?.[0]?.value || day.hourly[0]?.weatherDesc?.[0]?.value || 'Нет данных',
            icon: getWeatherIcon(day.hourly[0]?.weatherCode || '113')
          }
        })
        
        setWeather({
          city: data.nearest_area?.[0]?.areaName?.[0]?.value || currentCity,
          forecast
        })
        
        // Сохраняем город в базе данных
        await saveWeatherCity(currentCity)
      } else {
        setWeatherError('Город не найден')
      }
    } catch (error) {
      setWeatherError('Ошибка получения данных о погоде')
    } finally {
      setWeatherLoading(false)
    }
  }

  const saveWeatherCity = async (city: string) => {
    try {
      const token = localStorage.getItem('token')
      await fetch('http://localhost:3001/api/weather/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ city })
      })
    } catch (error) {
      console.error('Ошибка сохранения города:', error)
    }
  }

  const getWeatherIcon = (code: string) => {
    const iconMap: { [key: string]: string } = {
      '113': '☀️', '116': '⛅', '119': '☁️', '122': '☁️',
      '143': '🌫️', '176': '🌦️', '179': '🌨️', '200': '⛈️',
      '227': '🌨️', '230': '❄️', '248': '🌫️', '260': '🌫️',
      '263': '🌦️', '266': '🌧️', '281': '🌧️', '284': '🌧️',
      '293': '🌦️', '296': '🌧️', '299': '🌧️', '302': '🌧️',
      '305': '🌧️', '308': '🌧️', '311': '🌧️', '314': '🌧️',
      '317': '🌧️', '320': '🌨️', '323': '🌨️', '326': '🌨️',
      '329': '❄️', '332': '❄️', '335': '❄️', '338': '❄️',
      '350': '🌧️', '353': '🌦️', '356': '🌧️', '359': '🌧️',
      '362': '🌨️', '365': '🌨️', '368': '🌨️', '371': '❄️',
      '374': '🌧️', '377': '🌧️', '386': '⛈️', '389': '⛈️',
      '392': '⛈️', '395': '❄️'
    }
    return iconMap[code] || '🌤️'
   }

   const addBookmark = async () => {
     if (!newBookmark.title.trim() || !newBookmark.url.trim()) return
     
     try {
       const token = localStorage.getItem('token')
       const response = await fetch('http://localhost:3001/api/bookmarks', {
         method: 'POST',
         headers: {
           'Content-Type': 'application/json',
           'Authorization': `Bearer ${token}`
         },
         body: JSON.stringify({
           title: newBookmark.title.trim(),
           url: newBookmark.url.trim()
         })
       })
       
       if (response.ok) {
         const data = await response.json()
         setBookmarks(prev => [data.bookmark, ...prev])
         setNewBookmark({ title: '', url: '' })
         setSuccess('Закладка успешно добавлена')
       } else {
         const errorData = await response.json()
         setError(errorData.message || 'Ошибка добавления закладки')
       }
     } catch (error) {
       setError('Ошибка соединения с сервером')
     }
   }

   const removeBookmark = async (bookmarkId: number) => {
     try {
       const token = localStorage.getItem('token')
       const response = await fetch(`http://localhost:3001/api/bookmarks/${bookmarkId}`, {
         method: 'DELETE',
         headers: {
           'Authorization': `Bearer ${token}`
         }
       })
       
       if (response.ok) {
         setBookmarks(prev => prev.filter(bookmark => bookmark.id !== bookmarkId))
         setSuccess('Закладка успешно удалена')
       } else {
         const errorData = await response.json()
         setError(errorData.message || 'Ошибка удаления закладки')
       }
     } catch (error) {
       setError('Ошибка соединения с сервером')
     }
   }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl">Загрузка...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="text-center">
        <p className="text-xl text-red-600">Пользователь не найден</p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="card max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-12 text-center">
          Личный профиль
        </h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
            {success}
          </div>
        )}
        
        {/* Секция аватара */}
        <div className="bg-white/5 rounded-2xl p-8 mb-8">
          <h2 className="text-xl font-semibold text-white mb-8 text-center">Фото профиля</h2>
          <div className="flex flex-col items-center">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 mb-8 shadow-lg">
              {user.avatar ? (
                <img 
                  src={`http://localhost:3001${user.avatar}`} 
                  alt="Avatar" 
                  className="avatar-image"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-500">
                  <div className="w-10 h-10 bg-gray-400 rounded-full"></div>
                </div>
              )}
            </div>
            
            <div className="mt-6">
              <label className="btn-secondary cursor-pointer px-10 py-3 text-sm font-medium hover:bg-white/20 transition-all duration-200 shadow-lg inline-flex items-center space-x-2">
                {uploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Загрузка...</span>
                  </>
                ) : (
                  <>
                    <span>📷</span>
                    <span>Изменить аватар</span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                  disabled={uploading}
                />
              </label>
            </div>
          </div>
        </div>
        
        {/* Секция информации пользователя */}
        <div className="bg-white/5 rounded-2xl p-8 mb-8">
          <h2 className="text-xl font-semibold text-white mb-8 text-center">Информация профиля</h2>
          <div className="space-y-6 max-w-md mx-auto">
            <div>
              <label className="block text-white/80 text-sm font-semibold mb-3">
                Имя пользователя
              </label>
              <div className="input-field bg-white/10 text-white font-medium">
                {user.name}
              </div>
            </div>
            
            <div>
              <label className="block text-white/80 text-sm font-semibold mb-3">
                Электронная почта
              </label>
              <div className="input-field bg-white/10 text-white font-medium">
                {user.email}
              </div>
            </div>
          </div>
        </div>
        
        {/* Секция функций */}
        <div className="space-y-8">
          {/* Погода */}
          <div className="bg-white/5 rounded-2xl p-8">
            <h2 className="text-xl font-semibold text-white mb-8 text-center">Погода</h2>
            <div className="max-w-md mx-auto space-y-4">
              <div>
                <label className="block text-white/80 text-sm font-semibold mb-3">Текущий город</label>
                <input
                  type="text"
                  value={currentCity}
                  onChange={(e) => {
                    setCurrentCity(e.target.value)
                    localStorage.setItem('currentCity', e.target.value)
                  }}
                  placeholder="Введите название города"
                  className="input-field w-full mb-4"
                  onKeyPress={(e) => e.key === 'Enter' && getWeather()}
                />
              </div>
              <button
                onClick={getWeather}
                disabled={weatherLoading || !currentCity.trim()}
                className="btn-secondary w-full py-3 mt-4"
              >
                {weatherLoading ? 'Загрузка...' : 'Показать погоду'}
              </button>
              {weatherError && (
                <div className="text-red-400 text-sm text-center bg-red-500/10 p-3 rounded-lg mt-4">
                  {weatherError}
                </div>
              )}
            </div>
          </div>
          
          {/* Закладки */}
          <div className="bg-white/5 rounded-2xl p-8">
            <h2 className="text-xl font-semibold text-white mb-8 text-center">Закладки</h2>
            <div className="max-w-md mx-auto space-y-6">
              <div>
                <label className="block text-white/80 text-sm font-semibold mb-4">Добавить новую закладку</label>
                <div className="space-y-4">
                  <input
                    type="text"
                    value={newBookmark.title}
                    onChange={(e) => setNewBookmark(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Название закладки"
                    className="input-field w-full"
                  />
                  <div className="flex space-x-3">
                    <input
                      type="url"
                      value={newBookmark.url}
                      onChange={(e) => setNewBookmark(prev => ({ ...prev, url: e.target.value }))}
                      placeholder="https://example.com"
                      className="input-field flex-1"
                      onKeyPress={(e) => e.key === 'Enter' && addBookmark()}
                    />
                    <button
                      onClick={addBookmark}
                      disabled={!newBookmark.title.trim() || !newBookmark.url.trim()}
                      className="btn-secondary px-6 py-3 whitespace-nowrap"
                    >
                      Добавить
                    </button>
                  </div>
                </div>
              </div>
              
              {bookmarks.length > 0 && (
                <div className="mt-8">
                  <label className="block text-white/80 text-sm font-semibold mb-4">Мои закладки</label>
                  <div className="space-y-3 max-h-48 overflow-y-auto">
                    {bookmarks.map((bookmark) => (
                      <div key={bookmark.id} className="nav-card flex justify-between items-center">
                        <div className="flex-1 min-w-0">
                          <div className="text-white text-sm font-medium truncate">{bookmark.title}</div>
                          <div className="text-white/60 text-xs truncate">
                            {bookmark.url}
                          </div>
                        </div>
                        <button
                          onClick={() => removeBookmark(bookmark.id)}
                          className="text-red-400 hover:text-red-300 text-sm px-3 py-1 rounded-lg hover:bg-red-500/10 transition-colors ml-3 flex-shrink-0"
                          title="Удалить закладку"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          
        </div>
        
        {weather && (
          <div className="bg-white/5 rounded-2xl p-8 mt-8">
            <h3 className="text-lg font-semibold mb-6 text-white text-center">
              Погода в городе {weather.city}
            </h3>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {weather.forecast.map((day: any, index: number) => (
                <div key={index} className="nav-card flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">{day.icon}</span>
                    <div>
                      <div className="text-white text-sm font-medium">{day.date}</div>
                      <div className="text-white/80 text-xs capitalize">{day.description}</div>
                    </div>
                  </div>
                  <div className="text-white text-sm font-bold">
                    {day.temp}°C
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Кнопка выхода */}
        <div className="text-center pt-12 mt-10">
          <button
            onClick={handleLogout}
            className="btn-primary px-12 py-4 text-lg font-semibold"
          >
            Выйти из аккаунта
          </button>
        </div>
      </div>
    </div>
  )
}