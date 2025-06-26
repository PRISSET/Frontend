'use client'

import { useState } from 'react'

interface WeatherData {
  city: string
  forecast: {
    date: string
    temp: number
    description: string
    icon: string
  }[]
}

export default function WeatherWidget() {
  const [city, setCity] = useState('')
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const getWeather = async () => {
    if (!city.trim()) return
    
    setLoading(true)
    setError('')
    
    try {
      // Используем бесплатный API wttr.in
      const response = await fetch(
        `https://wttr.in/${encodeURIComponent(city)}?format=j1&lang=ru`
      )
      
      if (response.ok) {
        const data = await response.json()
        
        const forecast = data.weather.slice(0, 7).map((day: any, index: number) => {
          const date = new Date()
          date.setDate(date.getDate() + index)
          
          return {
            date: date.toLocaleDateString('ru-RU', { 
              weekday: 'short', 
              day: 'numeric', 
              month: 'short' 
            }),
            temp: Math.round((parseInt(day.maxtempC) + parseInt(day.mintempC)) / 2),
            description: day.hourly[0].lang_ru?.[0]?.value || day.hourly[0].weatherDesc[0].value,
            icon: getWeatherIcon(day.hourly[0].weatherCode)
          }
        })
        
        const cityName = data.nearest_area[0].areaName[0].value
        setWeather({ 
          city: cityName, 
          forecast 
        })
        localStorage.setItem('currentCity', cityName)
      } else {
        setError('Город не найден')
      }
    } catch (error) {
      // Fallback к OpenWeatherMap API
      try {
        const API_KEY = 'demo_key' // Используем демо ключ для примера
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric&lang=ru`
        )
        
        if (response.ok) {
          const data = await response.json()
          const forecast = data.list.slice(0, 7).map((item: any) => ({
            date: new Date(item.dt * 1000).toLocaleDateString('ru-RU', {
              weekday: 'short',
              day: 'numeric',
              month: 'short'
            }),
            temp: Math.round(item.main.temp),
            description: item.weather[0].description,
            icon: getOpenWeatherIcon(item.weather[0].icon)
          }))
          
          const cityName = data.city.name
          setWeather({ city: cityName, forecast })
          localStorage.setItem('currentCity', cityName)
        } else {
          setError('Не удалось получить данные о погоде')
        }
      } catch {
        setError('Ошибка получения данных о погоде')
      }
    } finally {
      setLoading(false)
    }
  }

  const getWeatherIcon = (code: string) => {
    const iconMap: { [key: string]: string } = {
      '113': '☀️', // Sunny
      '116': '⛅', // Partly cloudy
      '119': '☁️', // Cloudy
      '122': '☁️', // Overcast
      '143': '🌫️', // Mist
      '176': '🌦️', // Patchy rain possible
      '179': '🌨️', // Patchy snow possible
      '200': '⛈️', // Thundery outbreaks possible
      '227': '🌨️', // Blowing snow
      '230': '❄️', // Blizzard
      '248': '🌫️', // Fog
      '260': '🌫️', // Freezing fog
      '263': '🌦️', // Patchy light drizzle
      '266': '🌧️', // Light drizzle
      '281': '🌧️', // Freezing drizzle
      '284': '🌧️', // Heavy freezing drizzle
      '293': '🌦️', // Patchy light rain
      '296': '🌧️', // Light rain
      '299': '🌧️', // Moderate rain at times
      '302': '🌧️', // Moderate rain
      '305': '🌧️', // Heavy rain at times
      '308': '🌧️', // Heavy rain
      '311': '🌧️', // Light freezing rain
      '314': '🌧️', // Moderate or heavy freezing rain
      '317': '🌧️', // Light sleet
      '320': '🌧️', // Moderate or heavy sleet
      '323': '🌨️', // Patchy light snow
      '326': '🌨️', // Light snow
      '329': '🌨️', // Patchy moderate snow
      '332': '❄️', // Moderate snow
      '335': '❄️', // Patchy heavy snow
      '338': '❄️', // Heavy snow
      '350': '🌧️', // Ice pellets
      '353': '🌦️', // Light rain shower
      '356': '🌧️', // Moderate or heavy rain shower
      '359': '🌧️', // Torrential rain shower
      '362': '🌨️', // Light sleet showers
      '365': '🌨️', // Moderate or heavy sleet showers
      '368': '🌨️', // Light snow showers
      '371': '❄️', // Moderate or heavy snow showers
      '374': '🌧️', // Light showers of ice pellets
      '377': '🌧️', // Moderate or heavy showers of ice pellets
      '386': '⛈️', // Patchy light rain with thunder
      '389': '⛈️', // Moderate or heavy rain with thunder
      '392': '⛈️', // Patchy light snow with thunder
      '395': '⛈️'  // Moderate or heavy snow with thunder
    }
    return iconMap[code] || '🌤️'
  }

  const getOpenWeatherIcon = (icon: string) => {
    const iconMap: { [key: string]: string } = {
      '01d': '☀️', '01n': '🌙',
      '02d': '⛅', '02n': '☁️',
      '03d': '☁️', '03n': '☁️',
      '04d': '☁️', '04n': '☁️',
      '09d': '🌧️', '09n': '🌧️',
      '10d': '🌦️', '10n': '🌧️',
      '11d': '⛈️', '11n': '⛈️',
      '13d': '❄️', '13n': '❄️',
      '50d': '🌫️', '50n': '🌫️'
    }
    return iconMap[icon] || '🌤️'
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <h2 className="text-xl font-semibold mb-4 text-white">🌤️ Прогноз погоды</h2>
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Введите название города"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="input-field text-sm"
            onKeyPress={(e) => e.key === 'Enter' && getWeather()}
          />
          <button 
            onClick={getWeather} 
            disabled={loading}
            className="btn-primary text-sm px-4 py-2 w-full"
          >
            {loading ? 'Загрузка...' : 'Получить прогноз'}
          </button>
          {error && (
            <div className="text-red-400 text-sm text-center">
              {error}
            </div>
          )}
        </div>
      </div>

      {weather && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-4 text-white">
            📍 {weather.city}
          </h3>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {weather.forecast.map((day, index) => (
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
      

    </div>
  )
}