import { useState, useEffect, useCallback } from 'react';
import { Cloud, Sun, CloudRain, CloudSnow, CloudLightning, Wind, Droplets, MapPin, Loader2 } from 'lucide-react';
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

interface OpenMeteoGeocodingResult {
  results?: Array<{
    name: string;
    country?: string;
    latitude: number;
    longitude: number;
  }>;
}

interface OpenMeteoWeatherResponse {
  current: {
    temperature_2m: number;
    relativehumidity_2m: number;
    wind_speed_10m: number;
    weather_code: number;
  };
  daily: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    weather_code: number[];
  };
}

const CITY_STORAGE_KEY = 'weather-city';

const getWeatherDescription = (code: number) => {
  if (code === 0) return 'Ясно';
  if ([1, 2, 3].includes(code)) return 'Облачно';
  if ([45, 48].includes(code)) return 'Туман';
  if ([51, 53, 55, 56, 57, 61, 63, 65, 80, 81, 82].includes(code)) return 'Дождь';
  if ([71, 73, 75, 77, 85, 86].includes(code)) return 'Снег';
  if ([95, 96, 99].includes(code)) return 'Гроза';
  return 'Переменная облачность';
};

const getWeatherIcon = (code: number) => {
  if (code === 0) return 'sunny';
  if ([1, 2, 3, 45, 48].includes(code)) return 'cloudy';
  if ([51, 53, 55, 56, 57, 61, 63, 65, 80, 81, 82].includes(code)) return 'rain';
  if ([71, 73, 75, 77, 85, 86].includes(code)) return 'snow';
  if ([95, 96, 99].includes(code)) return 'storm';
  return 'cloudy';
};

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
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [city, setCity] = useState(() => localStorage.getItem(CITY_STORAGE_KEY) || 'Москва');
  const [citySelectorOpen, setCitySelectorOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchWeather = useCallback(async (cityName: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const geoResponse = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&language=ru&count=1`
      );

      if (!geoResponse.ok) {
        throw new Error('Не удалось получить координаты города');
      }

      const geoData: OpenMeteoGeocodingResult = await geoResponse.json();
      const location = geoData.results?.[0];

      if (!location) {
        throw new Error('Город не найден');
      }

      const weatherResponse = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}` +
        `&current=temperature_2m,relativehumidity_2m,wind_speed_10m,weather_code` +
        `&daily=temperature_2m_max,temperature_2m_min,weather_code&forecast_days=5&timezone=auto&language=ru`
      );

      if (!weatherResponse.ok) {
        throw new Error('Не удалось получить данные погоды');
      }

      const weatherData: OpenMeteoWeatherResponse = await weatherResponse.json();
      const { current, daily } = weatherData;

      const forecast: ForecastDay[] = daily.time.map((date, index) => {
        const dayName = new Date(date).toLocaleDateString('ru-RU', { weekday: 'short' });
        return {
          day: dayName.charAt(0).toUpperCase() + dayName.slice(1),
          tempMax: Math.round(daily.temperature_2m_max[index]),
          tempMin: Math.round(daily.temperature_2m_min[index]),
          icon: getWeatherIcon(daily.weather_code[index]),
        };
      });

      setWeather({
        city: location.name,
        temp: Math.round(current.temperature_2m),
        description: getWeatherDescription(current.weather_code),
        icon: getWeatherIcon(current.weather_code),
        humidity: Math.round(current.relativehumidity_2m),
        wind: Number(current.wind_speed_10m.toFixed(1)),
        forecast,
      });
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWeather(city);
  }, [city, fetchWeather]);

  const handleCitySelect = (newCity: string) => {
    setCity(newCity);
    localStorage.setItem(CITY_STORAGE_KEY, newCity);
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

  const renderContent = () => {
    if (isLoading && !weather) {
      return (
        <div className="weather-card flex items-center justify-center min-h-[320px]">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      );
    }

    if (error) {
      return (
        <div className="weather-card flex flex-col items-center justify-center text-center gap-3 min-h-[320px]">
          <p className="text-lg font-semibold">Не удалось загрузить погоду</p>
          <p className="text-sm text-muted-foreground">{error}</p>
          <Button onClick={() => fetchWeather(city)}>Повторить</Button>
        </div>
      );
    }

    if (!weather) return null;

    return (
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
              key={`${day.day}-${index}`}
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
    );
  };

  return (
    <div className="weather-container">
      {/* Время */}
      <div className="time-display">
        <span className="time-text">{formatTime(currentTime)}</span>
        <span className="date-text">{formatDate(currentTime)}</span>
      </div>

      {/* Виджет погоды */}
      {renderContent()}

      {/* Иконки приложений */}
      <AppDock />

      {/* Выбор города */}
      <CitySelector
        open={citySelectorOpen}
        onOpenChange={setCitySelectorOpen}
        onCitySelect={handleCitySelect}
        currentCity={weather?.city ?? city}
      />
    </div>
  );
};

export default WeatherWidget;
