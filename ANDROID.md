# Android (Capacitor)

Это веб-лаунчер «Start Menu», упакованный в нативное Android-приложение через
[Capacitor](https://capacitorjs.com/). React/Vite-код не менялся — нативная
часть добавлена сверху.

## Что даёт нативная обёртка

- **Оффлайн.** Веб-ассеты лежат внутри APK и отдаются локальным WebView —
  оболочка открывается без интернета. (Погода всё равно требует сети.)
- **Только установленные приложения.** При запуске на устройстве док
  фильтруется по реально установленным пакетам (`PackageManager`).
- **Надёжный запуск диплинков.** Клик идёт через `BROWSABLE`-intent
  (`AppScanner.openUri`); если схема не обрабатывается — пробуется запуск по
  пакету, затем веб-fallback.

В обычном вебе (Lovable / `npm run dev`) всё работает как раньше: показываются
все включённые приложения, диплинк через `window.location.href`.

## Нативный плагин `AppScanner`

`android/app/src/main/java/ru/huako/startmenu/AppScannerPlugin.java`,
зарегистрирован в `MainActivity`. Методы:

| Метод | Назначение |
|---|---|
| `getInstalled({ packages })` | какие из переданных пакетов установлены |
| `resolveScheme({ scheme, host?, path? })` | есть ли `BROWSABLE`-обработчик схемы и какие пакеты её обрабатывают |
| `openUri({ scheme, host?, path? })` | запустить диплинк как `BROWSABLE` VIEW-intent |
| `launchPackage({ package })` | запустить приложение по имени пакета |

Манифест объявляет `QUERY_ALL_PACKAGES` — на Android 11+ это нужно, чтобы видеть
установленные приложения и резолвить схемы. Для Google Play это «чувствительное»
разрешение, но для sideload-лаунчера ограничений нет.

## Сборка APK

Требуется машина с **Android Studio + Android SDK 36 + JDK 21** (Capacitor 8).
На Маке, где писался код, Android-тулчейна нет — собирать здесь нельзя.

```sh
npm install
npm run build          # собрать веб-часть в dist/
npx cap sync android   # скопировать dist в нативный проект и обновить плагины

# вариант А — через Android Studio:
npx cap open android   # открыть проект, Run на устройстве/эмуляторе

# вариант Б — из консоли (нужен ANDROID_HOME и local.properties):
cd android && ./gradlew assembleDebug
# APK: android/app/build/outputs/apk/debug/app-debug.apk
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
```

## TODO / известные мелочи

- `src/assets/app_icons/jellyfin.png` — **временный placeholder** (копия
  okko.png). Заменить на настоящую иконку Jellyfin. До этого фикса сборка веба
  была сломана (битый импорт).
- Релизный APK нужно подписать своим keystore (`apksigner` / Android Studio →
  Generate Signed Bundle/APK).
