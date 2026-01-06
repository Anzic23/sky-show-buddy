import { Settings } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

import appleMusicIcon from '@/assets/app_icons/apple_music.png';
import spotifyIcon from '@/assets/app_icons/spotify.png';
import yandexMapsIcon from '@/assets/app_icons/yandex_maps.png';
import yandexNaviIcon from '@/assets/app_icons/yandex_navi.png';
import yandexMusicIcon from '@/assets/app_icons/yandex_music.png';
import yandexRadioIcon from '@/assets/app_icons/yandex_radio.png';
import googleMapsIcon from '@/assets/app_icons/google_maps.png';
import twoGisIcon from '@/assets/app_icons/2gis.png';
import wazeIcon from '@/assets/app_icons/waze.png';
import zoomIcon from '@/assets/app_icons/zoom.png';
import chatgptIcon from '@/assets/app_icons/chatgpt.png';
import deepseekIcon from '@/assets/app_icons/deepseek.png';
import aliceIcon from '@/assets/app_icons/alice.png';
import kinopubIcon from '@/assets/app_icons/kinopub.png';
import kinopoiskIcon from '@/assets/app_icons/kinopoisk.png';
import youtubeIcon from '@/assets/app_icons/youtube.png';
import youtubeMusicIcon from '@/assets/app_icons/youtubeMusic.png';
import tiktokIcon from '@/assets/app_icons/tiktok.png';
import okkoIcon from '@/assets/app_icons/okko.png';
import iviIcon from '@/assets/app_icons/ivi.png';
import telegramIcon from '@/assets/app_icons/telegram.png';
import whatsappIcon from '@/assets/app_icons/whatsapp.png';
import wechatIcon from '@/assets/app_icons/wechat.png';
import instagramIcon from '@/assets/app_icons/instagram.png';
import facebookIcon from '@/assets/app_icons/facebook.png';
import vkIcon from '@/assets/app_icons/vk.png';
import vkVideoIcon from '@/assets/app_icons/vk_video.png';
import googleDiskIcon from '@/assets/app_icons/google_disk.png';
import twoChargersIcon from '@/assets/app_icons/2chargers.png';
import rutubeIcon from '@/assets/app_icons/rutube.png';
import powerampIcon from '@/assets/app_icons/poweramp.png';
import lampaIcon from '@/assets/app_icons/lampa.png';

interface AppItem {
  id: string;
  name: string;
  icon: string;
  scheme?: string;
  path?: string;
  fallbackUrl?: string;
  package?: string;
  class?: string;
  showOnLaunch?: boolean;
  enabled: boolean;
}

const baseApps: Array<Omit<AppItem, 'enabled'>> = [
  { id: 'apple-music', name: 'Apple Music', package: 'com.apple.android.music', scheme: 'music', path: '', fallbackUrl: 'https://music.apple.com', icon: appleMusicIcon, showOnLaunch: true },
  { id: 'spotify', name: 'Spotify', package: 'com.spotify.music', scheme: 'spotify', path: '', fallbackUrl: 'https://open.spotify.com', icon: spotifyIcon, showOnLaunch: true },
  { id: 'yandex-music', name: 'Yandex Music', package: 'ru.yandex.music', scheme: 'yandexmusic', path: '', fallbackUrl: 'https://music.yandex.ru', icon: yandexMusicIcon, showOnLaunch: true },
  { id: 'yandex-radio', name: 'Yandex Radio', package: 'ru.yandex.radio', scheme: 'yandexradio', path: '', fallbackUrl: 'https://radio.yandex.ru', icon: yandexRadioIcon, showOnLaunch: true },
  { id: 'youtube-music', name: 'YouTube Music', package: 'com.google.android.apps.youtube.music', scheme: 'youtubemusic', path: '', fallbackUrl: 'https://music.youtube.com', icon: youtubeMusicIcon, showOnLaunch: true },
  { id: 'yandex-navi', name: 'Yandex Navi', package: 'ru.yandex.yandexnavi', scheme: 'yandexnavi', path: '', fallbackUrl: 'https://maps.yandex.ru', icon: yandexNaviIcon, showOnLaunch: true },
  { id: 'yandex-maps', name: 'Yandex Maps', package: 'ru.yandex.yandexmaps', scheme: 'yandexmaps', path: '', fallbackUrl: 'https://maps.yandex.ru', icon: yandexMapsIcon, showOnLaunch: true },
  { id: 'google-maps', name: 'Google Maps', package: 'com.google.android.apps.maps', scheme: 'google.navigation', path: '', fallbackUrl: 'https://maps.google.com', icon: googleMapsIcon, showOnLaunch: true },
  { id: '2gis', name: '2GIS', package: 'ru.dublgis.dgismobile', scheme: 'dgis', path: '', fallbackUrl: 'https://2gis.ru', icon: twoGisIcon, showOnLaunch: true },
  { id: 'waze', name: 'Waze', package: 'com.waze', scheme: 'waze', path: '', fallbackUrl: 'https://www.waze.com', icon: wazeIcon, showOnLaunch: true },
  { id: 'zoom', name: 'Zoom', package: 'us.zoom.videomeetings', scheme: 'zoomus', path: '', fallbackUrl: 'https://zoom.us', icon: zoomIcon, showOnLaunch: true },
  { id: 'chatgpt', name: 'ChatGPT', package: 'com.openai.chatgpt', scheme: 'chatgpt', path: '', fallbackUrl: 'https://chat.openai.com', icon: chatgptIcon, showOnLaunch: true },
  { id: 'deepseek', name: 'DeepSeek', package: 'com.deepseek.chat', scheme: 'deepseek', path: '', fallbackUrl: 'https://deepseek.com', icon: deepseekIcon, showOnLaunch: true },
  { id: 'alice', name: 'Alice', package: 'com.yandex.aliceapp', scheme: 'yandexalice', path: '', fallbackUrl: 'https://alice.yandex.ru', icon: aliceIcon, showOnLaunch: true },
  { id: 'kinopub', name: 'Kinopub', package: 'com.kinopub', scheme: 'kinopub', path: '', fallbackUrl: 'https://kino.pub', icon: kinopubIcon, showOnLaunch: true },
  { id: 'kinopoisk', name: 'Kinopoisk', package: 'ru.kinopoisk', scheme: 'kinopoisk', path: '', fallbackUrl: 'https://hd.kinopoisk.ru', icon: kinopoiskIcon, showOnLaunch: true },
  { id: 'youtube', name: 'YouTube', package: 'com.google.android.youtube', scheme: 'vnd.youtube', path: '', fallbackUrl: 'https://m.youtube.com', icon: youtubeIcon, showOnLaunch: true },
  { id: 'tiktok', name: 'TikTok', package: 'com.zhiliaoapp.musically', scheme: 'tiktok', path: '', fallbackUrl: 'https://tiktok.com', icon: tiktokIcon, showOnLaunch: true },
  { id: 'okko', name: 'Okko', package: 'ru.more.play', scheme: 'okko', path: '', fallbackUrl: 'https://okko.tv', icon: okkoIcon, showOnLaunch: true },
  { id: 'ivi', name: 'ivi', package: 'ru.ivi.client', scheme: 'ivi', path: '', fallbackUrl: 'https://ivi.ru', icon: iviIcon, showOnLaunch: true },
  { id: 'telegram', name: 'Telegram', package: 'org.telegram.messenger', scheme: 'tg', path: '', fallbackUrl: 'https://web.telegram.org', icon: telegramIcon, showOnLaunch: true },
  { id: 'whatsapp', name: 'WhatsApp', package: 'com.whatsapp', scheme: 'whatsapp', path: '', fallbackUrl: 'https://web.whatsapp.com', icon: whatsappIcon, showOnLaunch: true },
  { id: 'wechat', name: 'WeChat', package: 'com.tencent.mm', scheme: 'weixin', path: '', fallbackUrl: 'https://web.wechat.com', icon: wechatIcon, showOnLaunch: true },
  { id: 'instagram', name: 'Instagram', package: 'com.instagram.android', scheme: 'instagram', path: '', fallbackUrl: 'https://www.instagram.com', icon: instagramIcon, showOnLaunch: true },
  { id: 'facebook', name: 'Facebook', package: 'com.facebook.katana', scheme: 'fb', path: '', fallbackUrl: 'https://fb.com', icon: facebookIcon, showOnLaunch: true },
  { id: 'vk', name: 'VK', package: 'com.vkontakte.android', scheme: 'vk', path: '', fallbackUrl: 'https://vk.com', icon: vkIcon, showOnLaunch: true },
  { id: 'vk-video', name: 'VK Video', package: 'com.vk.vkvideo', scheme: '', path: '', fallbackUrl: 'https://vkvideo.ru', icon: vkVideoIcon, showOnLaunch: true },
  { id: 'google-disk', name: 'Google disk', package: 'com.google.android.apps.docs', scheme: '', path: '', fallbackUrl: 'https://files.google.com/', icon: googleDiskIcon, showOnLaunch: true },
  { id: '2chargers', name: '2chargers', package: 'to.chargers', scheme: '', path: '', fallbackUrl: 'https://2chargers.net/', icon: twoChargersIcon, showOnLaunch: true },
  { id: 'rutube', name: 'RuTube', package: 'rtb.mobile.android', scheme: '', path: '', fallbackUrl: 'https://rutube.ru', icon: rutubeIcon, showOnLaunch: true },
  { id: 'poweramp', name: 'Poweramp', package: 'com.maxmpz.audioplayer', class: 'com.maxmpz.audioplayer.activity.MusicActivity', scheme: 'poweramp', path: '', fallbackUrl: 'https://play.google.com/store/apps/details?id=com.maxmpz.audioplayer', icon: powerampIcon, showOnLaunch: true },
  { id: 'lampa', name: 'Lampa', package: 'top.rootu.lampa', scheme: '', path: '', fallbackUrl: 'http://lampa.mx/', icon: lampaIcon, showOnLaunch: true },
];

const defaultApps: AppItem[] = baseApps.map(app => ({
  ...app,
  enabled: app.showOnLaunch ?? true,
}));

const STORAGE_KEY = 'app-dock-config';

const buildInitialApps = (): AppItem[] => {
  const saved = localStorage.getItem(STORAGE_KEY);

  if (saved) {
    try {
      const parsed = JSON.parse(saved) as Array<Partial<AppItem>>;
      return defaultApps.map(app => {
        const savedApp = parsed.find(item => item.id === app.id);
        return {
          ...app,
          enabled: savedApp?.enabled ?? app.enabled,
        };
      });
    } catch (error) {
      console.error('Failed to parse saved apps', error);
    }
  }

  return defaultApps;
};

export const AppDock = () => {
  const [apps, setApps] = useState<AppItem[]>(buildInitialApps);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(apps));
  }, [apps]);

  const toggleApp = (id: string) => {
    setApps(prev => prev.map(app => (app.id === id ? { ...app, enabled: !app.enabled } : app)));
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
    const schemeUrl = app.scheme ? `${app.scheme}:${app.path ? `//${app.path}` : '//'}` : undefined;

    if (schemeUrl) {
      window.location.href = schemeUrl;

      if (app.fallbackUrl) {
        setTimeout(() => {
          window.open(app.fallbackUrl, '_blank');
        }, 700);
      }
      return;
    }

    if (app.fallbackUrl) {
      window.open(app.fallbackUrl, '_blank');
    }
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
            <img src={app.icon} alt={app.name} className="app-icon" loading="lazy" />
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
                  <img src={app.icon} alt={app.name} className="w-6 h-6 rounded" loading="lazy" />
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
