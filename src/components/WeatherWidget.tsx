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

const mockWeather: WeatherData = {
  city: 'Москва',
  temp: -4,
  description: 'Облачно',
  icon: 'cloudy',
  humidity: 78,
  wind: 5.2,
  forecast: [
    { day: 'Пт', tempMax: -3, tempMin: -9, icon: 'snow' },
    { day: 'Сб', tempMax: -3, tempMin: -6, icon: 'cloudy' },
    { day: 'Вс', tempMax: -4, tempMin: -7, icon: 'cloudy' },
    { day: 'Пн', tempMax: -6, tempMin: -8, icon: 'snow' },
    { day: 'Вт', tempMax: -8, tempMin: -10, icon: 'sunny' },
  ],
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
    const savedCity = localStorage.getItem(CITY_STORAGE_KEY);
    return savedCity ? { ...mockWeather, city: savedCity } : mockWeather;
  });
  const [citySelectorOpen, setCitySelectorOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleCitySelect = (city: string) => {
    setWeather(prev => ({ ...prev, city }));
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
