import { useState, useEffect } from 'react';
import { Cloud, Sun, CloudRain, CloudSnow, CloudLightning, Wind, Droplets, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CitySelector } from './CitySelector';
import { AppDock } from './AppDock';

interface WeatherData {
  city: string;
  temp: number;
  description: string;
  icon: string;
  humidity: number;
  wind: number;
  forecast: ForecastDay[];
}

interface ForecastDay {
  day: string;
  tempMax: number;
  tempMin: number;
  icon: string;
}

// Генерация погоды на основе названия города (детерминированная)
const generateWeatherForCity = (city: string): WeatherData => {
  // Используем хеш города для генерации "случайных" но стабильных значений
  const hash = city.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  const icons = ['sunny', 'cloudy', 'rain', 'snow', 'cloudy'];
  const descriptions = ['Ясно', 'Облачно', 'Дождь', 'Снег', 'Переменная облачность'];
  const weatherIndex = hash % icons.length;
  
  // Температура зависит от "широты" города (имитация)
  const baseTemp = ((hash % 40) - 20); // от -20 до +20
  const humidity = 40 + (hash % 50); // от 40 до 90
  const wind = 1 + (hash % 15); // от 1 до 15 м/с
  
  const days = ['Пт', 'Сб', 'Вс', 'Пн', 'Вт'];
  const forecast = days.map((day, i) => ({
    day,
    tempMax: baseTemp + 3 - i + ((hash + i) % 5),
    tempMin: baseTemp - 5 - i + ((hash + i) % 3),
    icon: icons[(hash + i) % icons.length],
  }));

  return {
    city,
    temp: baseTemp,
    description: descriptions[weatherIndex],
    icon: icons[weatherIndex],
    humidity,
    wind: parseFloat(wind.toFixed(1)),
    forecast,
  };
};

const CITY_STORAGE_KEY = 'weather-city';

const WeatherIcon = ({ icon, className }: { icon: string; className?: string }) => {
  const iconClass = cn("weather-icon-animated", className);
  
  switch (icon) {
    case 'sunny':
      return <Sun className={cn(iconClass, "text-weather-sun")} />;
    case 'cloudy':
      return <Cloud className={cn(iconClass, "text-weather-cloud")} />;
    case 'rain':
      return <CloudRain className={cn(iconClass, "text-weather-rain")} />;
    case 'snow':
      return <CloudSnow className={cn(iconClass, "text-weather-snow")} />;
    case 'storm':
      return <CloudLightning className={cn(iconClass, "text-weather-storm")} />;
    default:
      return <Cloud className={cn(iconClass, "text-weather-cloud")} />;
  }
};

export const WeatherWidget = () => {
  const [weather, setWeather] = useState<WeatherData>(() => {
    const savedCity = localStorage.getItem(CITY_STORAGE_KEY) || 'Москва';
    return generateWeatherForCity(savedCity);
  });
  const [citySelectorOpen, setCitySelectorOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleCitySelect = (city: string) => {
    setWeather(generateWeatherForCity(city));
    localStorage.setItem(CITY_STORAGE_KEY, city);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ru-RU', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long' 
    });
  };

  return (
    <div className="weather-container">
      {/* Время */}
      <div className="time-display">
        <span className="time-text">{formatTime(currentTime)}</span>
        <span className="date-text">{formatDate(currentTime)}</span>
      </div>

      {/* Виджет погоды */}
      <div className="weather-card">
        {/* Заголовок с городом */}
        <div className="weather-header">
          <div className="weather-city-row">
            <MapPin className="w-4 h-4 text-muted-foreground" />
            <span className="weather-city-name">{weather.city}</span>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setCitySelectorOpen(true)}
              className="weather-change-btn"
            >
              Изменить
            </Button>
          </div>
        </div>

        {/* Текущая погода */}
        <div className="weather-current">
          <div className="weather-main">
            <WeatherIcon icon={weather.icon} className="w-20 h-20" />
            <div className="weather-temp-block">
              <span className="weather-temp">{weather.temp}°</span>
              <span className="weather-desc">{weather.description}</span>
            </div>
          </div>
          
          {/* Детали */}
          <div className="weather-details">
            <div className="weather-detail">
              <Droplets className="w-4 h-4" />
              <span>{weather.humidity}%</span>
            </div>
            <div className="weather-detail">
              <Wind className="w-4 h-4" />
              <span>{weather.wind} м/с</span>
            </div>
          </div>
        </div>

        {/* Прогноз */}
        <div className="weather-forecast">
          {weather.forecast.map((day, index) => (
            <div 
              key={day.day} 
              className="forecast-item"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <span className="forecast-day">{day.day}</span>
              <WeatherIcon icon={day.icon} className="w-6 h-6" />
              <div className="forecast-temps">
                <span className="forecast-max">{day.tempMax}°</span>
                <span className="forecast-min">{day.tempMin}°</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Иконки приложений */}
      <AppDock />

      {/* Выбор города */}
      <CitySelector 
        open={citySelectorOpen}
        onOpenChange={setCitySelectorOpen}
        onCitySelect={handleCitySelect}
        currentCity={weather.city}
      />
    </div>
  );
};

export default WeatherWidget;
