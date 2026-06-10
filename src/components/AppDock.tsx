import { Settings, Plus, Trash2, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import AppScanner, { isNative, type LaunchableApp } from '@/lib/appScanner';

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
import jellyfinIcon from '@/assets/app_icons/jellyfin.png';
import strelkaIcon from '@/assets/app_icons/strelka.png';

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
  { id: 'yandex-radio', name: 'Яндекс Радио', package: 'ru.yandex.mobile.fmradio', scheme: 'yandexradioapp', path: '', fallbackUrl: 'https://radio.yandex.ru', icon: yandexRadioIcon, showOnLaunch: true },
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
  { id: 'kinopoisk', name: 'Kinopoisk', package: 'ru.kinopoisk', scheme: 'kp', path: 'mainView', fallbackUrl: 'https://hd.kinopoisk.ru', icon: kinopoiskIcon, showOnLaunch: true },  
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
  { id: 'lampa', name: 'Lampa', package: 'top.rootu.lampa', scheme: 'lampa', path: 'top.rootu.lampa', fallbackUrl: 'http://lampa.mx/', icon: lampaIcon, showOnLaunch: true },
  { id: 'jellyfin', name: 'Jellyfin', package: 'org.jellyfin.mobile', scheme: 'jellyfin', path: '', fallbackUrl: 'https://play.google.com/store/apps/details?id=org.jellyfin.mobile', icon: jellyfinIcon, showOnLaunch: true },
//  { id: 'strelka', name: 'Стрелка', package: 'com.ivolk.StrelkaGPS', scheme: 'strelka', path: '', fallbackUrl: 'https://ivolk.ru/astrelka.htm', icon: strelkaIcon, showOnLaunch: true },
];

const defaultApps: AppItem[] = baseApps.map(app => ({
  ...app,
  enabled: app.showOnLaunch ?? true,
}));

const STORAGE_KEY = 'app-dock-config';
const ADDED_KEY = 'app-dock-added';

// Apps the user added from the installed-apps picker (launched by package).
const ADDED_PREFIX = 'installed:';

const loadAddedApps = (): AppItem[] => {
  try {
    const parsed = JSON.parse(localStorage.getItem(ADDED_KEY) ?? '[]') as Array<Omit<AppItem, 'enabled'>>;
    return parsed.map(app => ({ ...app, enabled: true }));
  } catch (error) {
    console.error('Failed to parse added apps', error);
    return [];
  }
};

const buildInitialApps = (): AppItem[] => {
  const base = [...defaultApps, ...loadAddedApps()];

  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null') as Array<Pick<AppItem, 'id' | 'enabled'>> | null;
    if (saved) {
      const enabledById = new Map(saved.map(item => [item.id, item.enabled]));
      const orderById = new Map(saved.map((item, index) => [item.id, index]));
      base.forEach(app => {
        if (enabledById.has(app.id)) app.enabled = enabledById.get(app.id)!;
      });
      base.sort((a, b) => (orderById.get(a.id) ?? Infinity) - (orderById.get(b.id) ?? Infinity));
    }
  } catch (error) {
    console.error('Failed to parse saved apps', error);
  }

  return base;
};

export const AppDock = () => {
  const [apps, setApps] = useState<AppItem[]>(buildInitialApps);
  const [settingsOpen, setSettingsOpen] = useState(false);
  // null = not yet known / web build (show everything); Set = filter to installed packages.
  const [installed, setInstalled] = useState<Set<string> | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [launchable, setLaunchable] = useState<LaunchableApp[] | null>(null);
  const [pickerLoading, setPickerLoading] = useState(false);

  useEffect(() => {
    // Persist only order + enabled; full data of added apps lives in ADDED_KEY.
    localStorage.setItem(STORAGE_KEY, JSON.stringify(apps.map(({ id, enabled }) => ({ id, enabled }))));
  }, [apps]);

  useEffect(() => {
    if (!isNative) return;
    const packages = baseApps.map(app => app.package).filter((p): p is string => !!p);
    AppScanner.getInstalled({ packages })
      .then(({ installed }) => setInstalled(new Set(installed)))
      .catch(err => console.error('getInstalled failed', err));
  }, []);

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

  const persistAdded = (items: AppItem[]) => {
    const added = items
      .filter(app => app.id.startsWith(ADDED_PREFIX))
      .map(app => ({ id: app.id, name: app.name, package: app.package, icon: app.icon }));
    localStorage.setItem(ADDED_KEY, JSON.stringify(added));
  };

  const addInstalledApp = (app: LaunchableApp) => {
    const id = `${ADDED_PREFIX}${app.package}`;
    setApps(prev => {
      if (prev.some(a => a.id === id || a.package === app.package)) return prev;
      const next = [...prev, { id, name: app.label, package: app.package, icon: app.icon, enabled: true }];
      persistAdded(next);
      return next;
    });
  };

  const removeApp = (id: string) => {
    setApps(prev => {
      const next = prev.filter(app => app.id !== id);
      persistAdded(next);
      return next;
    });
  };

  const openPicker = async () => {
    setPickerOpen(true);
    if (launchable) return;
    setPickerLoading(true);
    try {
      const { apps: list } = await AppScanner.getLaunchableApps();
      list.sort((a, b) => a.label.localeCompare(b.label, 'ru'));
      setLaunchable(list);
    } catch (err) {
      console.error('getLaunchableApps failed', err);
      setLaunchable([]);
    } finally {
      setPickerLoading(false);
    }
  };

  const openFallback = (app: AppItem) => {
    if (app.fallbackUrl) window.open(app.fallbackUrl, '_blank');
  };

  const handleAppClick = async (app: AppItem) => {
    if (isNative) {
      // Try the BROWSABLE deep link, then a plain package launch, then the web fallback.
      try {
        if (app.scheme) {
          await AppScanner.openUri({ scheme: app.scheme, path: app.path });
          return;
        }
      } catch {
        /* deep link not handled — fall through */
      }
      try {
        if (app.package) {
          await AppScanner.launchPackage({ package: app.package });
          return;
        }
      } catch {
        /* not installed / no launcher — fall through */
      }
      openFallback(app);
      return;
    }

    const schemeUrl = app.scheme ? `${app.scheme}:${app.path ? `//${app.path}` : '//'}` : undefined;
    if (schemeUrl) {
      window.location.href = schemeUrl;
      return;
    }
    openFallback(app);
  };

  const isAvailable = (app: AppItem) =>
    installed === null || !app.package || installed.has(app.package);

  const enabledApps = apps.filter(app => app.enabled && isAvailable(app));
  const visibleApps = apps.filter(isAvailable);

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
            {visibleApps.map((app, index) => (
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
                    disabled={index === visibleApps.length - 1}
                  >
                    ↓
                  </Button>
                  {app.id.startsWith(ADDED_PREFIX) && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive"
                      onClick={() => removeApp(app.id)}
                      aria-label="Удалить"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
          {isNative && (
            <Button variant="outline" className="w-full mt-2" onClick={openPicker}>
              <Plus className="w-4 h-4 mr-2" />
              Добавить приложение
            </Button>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={pickerOpen} onOpenChange={setPickerOpen}>
        <DialogContent className="settings-dialog">
          <DialogHeader>
            <DialogTitle>Установленные приложения</DialogTitle>
          </DialogHeader>
          {pickerLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          )}
          {!pickerLoading && launchable && (
            <div className="settings-list">
              {launchable.map(item => {
                const added = apps.some(a => a.package === item.package);
                return (
                  <button
                    key={item.package}
                    className="settings-item w-full text-left disabled:opacity-50"
                    onClick={() => addInstalledApp(item)}
                    disabled={added}
                  >
                    <div className="flex items-center gap-3">
                      <img src={item.icon} alt={item.label} className="w-6 h-6 rounded" loading="lazy" />
                      <span className="text-sm">{item.label}</span>
                    </div>
                    {added ? (
                      <span className="text-xs text-muted-foreground">Добавлено</span>
                    ) : (
                      <Plus className="w-4 h-4" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AppDock;
