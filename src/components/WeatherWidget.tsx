import { useState, useEffect, useCallback } from 'react';
import { Cloud, Sun, CloudRain, CloudSnow, CloudLightning, Wind, Droplets, MapPin, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CitySelector } from './CitySelector';
import { AppDock } from './AppDock';
import { ThemeToggle } from './ThemeToggle';

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

type OwmGeoResult = Array<{
  name: string;
  local_names?: { ru?: string };
  lat: number;
  lon: number;
}>;

interface OwmCurrentResponse {
  main: { temp: number; humidity: number };
  wind: { speed: number };
  weather: Array<{ id: number; description: string }>;
}

interface OwmForecastResponse {
  list: Array<{
    dt_txt: string;
    main: { temp_max: number; temp_min: number };
    weather: Array<{ id: number }>;
  }>;
}

const CITY_STORAGE_KEY = 'weather-city';
const OWM_KEY = import.meta.env.VITE_OWM_KEY as string | undefined;
const OWM_BASE = 'https://api.openweathermap.org/data/2.5';

// Называет упавший запрос и причину (сеть vs HTTP-статус) — иначе в APK
// не отличить заблокированный геокодинг от проблемы с ключом OWM.
const fetchOrThrow = async (label: string, url: string): Promise<Response> => {
  let res: Response;
  try {
    res = await fetch(url);
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    throw new Error(`${label}: сеть недоступна (${detail})`);
  }
  if (!res.ok) {
    throw new Error(`${label}: HTTP ${res.status}`);
  }
  return res;
};

// OpenWeatherMap condition codes: https://openweathermap.org/weather-conditions
const getWeatherDescription = (code: number) => {
  if (code === 800) return 'Ясно';
  if (code > 800) return 'Облачно';
  if (code >= 700) return 'Туман';
  if (code >= 600) return 'Снег';
  if (code >= 500) return 'Дождь';
  if (code >= 300) return 'Морось';
  if (code >= 200) return 'Гроза';
  return 'Переменная облачность';
};

const getWeatherIcon = (code: number) => {
  if (code === 800) return 'sunny';
  if (code >= 200 && code < 300) return 'storm';
  if (code >= 300 && code < 600) return 'rain';
  if (code >= 600 && code < 700) return 'snow';
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

      if (!OWM_KEY) {
        throw new Error('Не задан ключ OpenWeatherMap');
      }

      // Геокодинг тоже через OWM: open-meteo (вкл. geocoding-api) с телефона в РФ не ходит.
      const geoResponse = await fetchOrThrow(
        'Геокодинг',
        `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(cityName)}&limit=1&appid=${OWM_KEY}`
      );

      const geoData: OwmGeoResult = await geoResponse.json();
      const location = geoData[0];

      if (!location) {
        throw new Error('Город не найден');
      }

      const coords = `lat=${location.lat}&lon=${location.lon}`;
      const [currentRes, forecastRes] = await Promise.all([
        fetchOrThrow('Погода', `${OWM_BASE}/weather?${coords}&units=metric&lang=ru&appid=${OWM_KEY}`),
        fetchOrThrow('Прогноз', `${OWM_BASE}/forecast?${coords}&units=metric&lang=ru&appid=${OWM_KEY}`),
      ]);

      const current: OwmCurrentResponse = await currentRes.json();
      const forecastData: OwmForecastResponse = await forecastRes.json();

      // OWM выдаёт прогноз шагами по 3 часа — агрегируем по календарным дням.
      const byDay = new Map<string, { max: number; min: number; codes: number[] }>();
      for (const item of forecastData.list) {
        const date = item.dt_txt.slice(0, 10);
        const entry = byDay.get(date) ?? { max: -Infinity, min: Infinity, codes: [] };
        entry.max = Math.max(entry.max, item.main.temp_max);
        entry.min = Math.min(entry.min, item.main.temp_min);
        entry.codes.push(item.weather[0].id);
        byDay.set(date, entry);
      }

      const forecast: ForecastDay[] = Array.from(byDay.entries())
        .slice(0, 5)
        .map(([date, value]) => {
          const dayName = new Date(date).toLocaleDateString('ru-RU', { weekday: 'short' });
          return {
            day: dayName.charAt(0).toUpperCase() + dayName.slice(1),
            tempMax: Math.round(value.max),
            tempMin: Math.round(value.min),
            icon: getWeatherIcon(value.codes[Math.floor(value.codes.length / 2)]),
          };
        });

      setWeather({
        city: location.local_names?.ru ?? location.name,
        temp: Math.round(current.main.temp),
        description: getWeatherDescription(current.weather[0].id),
        icon: getWeatherIcon(current.weather[0].id),
        humidity: Math.round(current.main.humidity),
        wind: Number(current.wind.speed.toFixed(1)),
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
      <ThemeToggle />

      {/* Время + погода в одну строку на широких экранах */}
      <div className="weather-compact-row">
        <div className="time-display">
          <span className="time-text">{formatTime(currentTime)}</span>
          <span className="date-text">{formatDate(currentTime)}</span>
        </div>
        {renderContent()}
      </div>

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
