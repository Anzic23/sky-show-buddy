import { useState, useMemo } from 'react';
import { Search, MapPin, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface CitySelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCitySelect: (city: string) => void;
  currentCity: string;
}

const cities = [
  'Москва',
  'Санкт-Петербург',
  'Новосибирск',
  'Екатеринбург',
  'Казань',
  'Нижний Новгород',
  'Челябинск',
  'Самара',
  'Омск',
  'Ростов-на-Дону',
  'Уфа',
  'Красноярск',
  'Воронеж',
  'Пермь',
  'Волгоград',
  'Краснодар',
  'Саратов',
  'Тюмень',
  'Тольятти',
  'Ижевск',
  'Барнаул',
  'Иркутск',
  'Ульяновск',
  'Хабаровск',
  'Ярославль',
  'Владивосток',
  'Махачкала',
  'Томск',
  'Оренбург',
  'Кемерово',
  'Новокузнецк',
  'Рязань',
  'Астрахань',
  'Пенза',
  'Липецк',
  'Тула',
  'Киров',
  'Чебоксары',
  'Калининград',
  'Курск',
  'Ставрополь',
  'Сочи',
  'Белгород',
  'Тверь',
  'Иваново',
  'Брянск',
  'Сургут',
  'Владимир',
  'Архангельск',
  'Чита',
];

export const CitySelector = ({ open, onOpenChange, onCitySelect, currentCity }: CitySelectorProps) => {
  const [search, setSearch] = useState('');
  const [customCity, setCustomCity] = useState('');

  const filteredCities = useMemo(() => {
    if (!search.trim()) return cities;
    const searchLower = search.toLowerCase();
    return cities.filter(city => city.toLowerCase().includes(searchLower));
  }, [search]);

  const handleCityClick = (city: string) => {
    onCitySelect(city);
    onOpenChange(false);
    setSearch('');
  };

  const handleCustomCity = () => {
    if (customCity.trim()) {
      onCitySelect(customCity.trim());
      onOpenChange(false);
      setCustomCity('');
      setSearch('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="city-modal">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Выберите город</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Поиск */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Поиск города..."
              className="pl-10"
            />
          </div>

          {/* Ввод своего города */}
          <div className="flex gap-2">
            <Input
              value={customCity}
              onChange={(e) => setCustomCity(e.target.value)}
              placeholder="Или введите город вручную..."
              onKeyDown={(e) => e.key === 'Enter' && handleCustomCity()}
            />
            <Button onClick={handleCustomCity} disabled={!customCity.trim()}>
              OK
            </Button>
          </div>

          {/* Список городов */}
          <ScrollArea className="h-[300px]">
            <div className="space-y-1">
              {filteredCities.map(city => (
                <button
                  key={city}
                  onClick={() => handleCityClick(city)}
                  className={cn(
                    "city-list-item",
                    city === currentCity && "city-list-item-active"
                  )}
                >
                  <MapPin className="w-4 h-4" />
                  <span>{city}</span>
                </button>
              ))}
              {filteredCities.length === 0 && (
                <p className="text-center text-muted-foreground py-4">
                  Город не найден. Введите его вручную выше.
                </p>
              )}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CitySelector;
