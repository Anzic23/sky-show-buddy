import { Settings } from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface AppItem {
  id: string;
  name: string;
  icon: string;
  url: string;
  enabled: boolean;
}

const defaultApps: AppItem[] = [
  { id: 'yandex-music', name: 'Yandex Music', icon: 'https://play-lh.googleusercontent.com/mfSdQmzaqOdlWlygbCuJqNC0TNOSbjdXOH9BN9MVyuYYp5p6VD54KOmRmgPVv2sXlkc=s64-rw', url: 'yandexmusic://', enabled: true },
  { id: 'yandex-radio', name: 'Yandex Radio', icon: 'https://yablyk.com/wp-content/uploads/2014/03/itunes-radio.jpg', url: 'yandexradio://', enabled: true },
  { id: 'youtube-music', name: 'YouTube Music', icon: 'https://play-lh.googleusercontent.com/zD8UA5CRdiPzbvTwGKtzR4KjQpxqEK6X0tGDpzEaOo0xPEvG6HUiC_0qkpTfzpuMTqU=s64-rw', url: 'youtubemusic://', enabled: true },
  { id: 'spotify', name: 'Spotify', icon: 'https://play-lh.googleusercontent.com/7ynvVIRdhJNAngCg_GI7i8TtH8BqkJYmffeUHsG-mJOdzt1XLvGmbsKuc5Q1SInBjDKN=s64-rw', url: 'spotify://', enabled: true },
  { id: 'yandex-navi', name: 'Yandex Navi', icon: 'https://play-lh.googleusercontent.com/quo2QK2mxipWCZiBTM58nyENopQsvXpLz1wqLOhlBg8TxJ8tEH_T9buZVdRnSDa-vPY=s64-rw', url: 'yandexnavi://', enabled: true },
  { id: '2gis', name: '2GIS', icon: 'https://play-lh.googleusercontent.com/55huczUZ05ruaVynURUNqzgTu0qXLF-SPQZKtE9KA6_BavI-g0NgXz1NR98n5xX33HwD=s64-rw', url: 'dgis://', enabled: true },
  { id: 'waze', name: 'Waze', icon: 'https://play-lh.googleusercontent.com/r7XL36PVNtnidqy6ikRiW1AHEIsjhePrZ8W5M4cNTQy5ViF3-lIDY47hpvxc84kJ7lw=s64-rw', url: 'waze://', enabled: true },
  { id: 'zoom', name: 'Zoom', icon: 'https://play-lh.googleusercontent.com/yZsmiNjmji3ZoOuLthoVvptLB9cZ0vCmitcky4OUXNcEFV3IEQkrBD2uu5kuWRF5_ERA=s64-rw', url: 'zoomus://', enabled: true },
  { id: 'chatgpt', name: 'ChatGPT', icon: 'https://play-lh.googleusercontent.com/lmG9HlI0awHie0cyBieWXeNjpyXvHPwDBb8MNOVIyp0P8VEh95AiBHtUZSDVR3HLe3A=s64-rw', url: 'chatgpt://', enabled: true },
  { id: 'alice', name: 'Alice', icon: 'https://play-lh.googleusercontent.com/EJpCCkNQrYAyD4NdTcWUe-RSdr1LGTz9ya6FQ1Q-H9RLRdhdg85_oHgHNrWxNiCVgcVD=w480-h960-rw', url: 'yandex://', enabled: true },
  { id: 'kinopub', name: 'Kinopub', icon: 'https://img.iconpusher.com/com.kinopub/1.33.png?w=64&q=75', url: 'kinopub://', enabled: true },
  { id: 'kinopoisk', name: 'Kinopoisk', icon: 'https://play-lh.googleusercontent.com/5czw6iycA8YhjI653GQdwnnmu8NNzEMXV32gZKoVCYZV6PQUAv_YV0uJ2PU1E-Jm9PE=s64-rw', url: 'kinopoisk://', enabled: true },
  { id: 'youtube', name: 'YouTube', icon: 'https://play-lh.googleusercontent.com/6am0i3walYwNLc08QOOhRJttQENNGkhlKajXSERf3JnPVRQczIyxw2w3DxeMRTOSdsY=s64-rw', url: 'youtube://', enabled: true },
  { id: 'tiktok', name: 'TikTok', icon: 'https://play-lh.googleusercontent.com/LdBITldj-tJxqLm-CsWSbnt4BMo2gk53cgM7mWIL-zn44m1ywLyQgxRsHKqp8r0qceXs=s64-rw', url: 'snssdk1128://', enabled: true },
  { id: 'telegram', name: 'Telegram', icon: 'https://play-lh.googleusercontent.com/ZU9cSsyIJZo6Oy7HTHiEPwZg0m2Crep-d5ZrfajqtsH-qgUXSqKpNA2FpPDTn-7qA5Q=s64-rw', url: 'tg://', enabled: false },
  { id: 'whatsapp', name: 'WhatsApp', icon: 'https://play-lh.googleusercontent.com/bYtqbOcTYOlgc6gqZ2rwb8lptHuwlNE75zYJu6Bn076-hTmvd96HH-6v7S0YUAAJXoJN=s64-rw', url: 'whatsapp://', enabled: false },
];

const STORAGE_KEY = 'app-dock-config';

export const AppDock = () => {
  const [apps, setApps] = useState<AppItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : defaultApps;
  });
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(apps));
  }, [apps]);

  const toggleApp = (id: string) => {
    setApps(prev => prev.map(app => 
      app.id === id ? { ...app, enabled: !app.enabled } : app
    ));
  };

  const moveApp = (id: string, direction: 'up' | 'down') => {
    setApps(prev => {
      const index = prev.findIndex(app => app.id === id);
      if (index === -1) return prev;
      if (direction === 'up' && index === 0) return prev;
      if (direction === 'down' && index === prev.length - 1) return prev;
      
      const newApps = [...prev];
      const swapIndex = direction === 'up' ? index - 1 : index + 1;
      [newApps[index], newApps[swapIndex]] = [newApps[swapIndex], newApps[index]];
      return newApps;
    });
  };

  const handleAppClick = (app: AppItem) => {
    window.location.href = app.url;
  };

  const enabledApps = apps.filter(app => app.enabled);

  return (
    <div className="app-dock">
      <div className="app-dock-grid">
        {enabledApps.map((app, index) => (
          <button
            key={app.id}
            className="app-button"
            onClick={() => handleAppClick(app)}
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <img src={app.icon} alt={app.name} className="app-icon" />
            <span className="app-name">{app.name}</span>
          </button>
        ))}
      </div>

      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="icon" className="settings-btn">
            <Settings className="w-5 h-5" />
          </Button>
        </DialogTrigger>
        <DialogContent className="settings-dialog">
          <DialogHeader>
            <DialogTitle>Настройки приложений</DialogTitle>
          </DialogHeader>
          <div className="settings-list">
            {apps.map((app, index) => (
              <div key={app.id} className="settings-item">
                <div className="flex items-center gap-3">
                  <Checkbox 
                    id={app.id}
                    checked={app.enabled}
                    onCheckedChange={() => toggleApp(app.id)}
                  />
                  <img src={app.icon} alt={app.name} className="w-6 h-6 rounded" />
                  <label htmlFor={app.id} className="text-sm cursor-pointer">
                    {app.name}
                  </label>
                </div>
                <div className="flex gap-1">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-7 w-7"
                    onClick={() => moveApp(app.id, 'up')}
                    disabled={index === 0}
                  >
                    ↑
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-7 w-7"
                    onClick={() => moveApp(app.id, 'down')}
                    disabled={index === apps.length - 1}
                  >
                    ↓
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AppDock;
