# Bakı Metro Marşrut — son tam komplekt

Bu arxivdə Google Maps, AYNA live route sync, A/B/C markerləri, Safari ağ ekran qoruması və PWA service worker v6 daxil olmaqla layihənin son mənbə kodu var.

## Quraşdırma

```bash
pnpm install
pnpm check
pnpm test
pnpm build
```

Render start command: `node dist/index.js`.

## Google Maps

Render Dashboard → Environment bölməsində `VITE_GOOGLE_MAPS_API_KEY` dəyişəni yaradın. Google Cloud Console-da Maps JavaScript API-ni aktiv edin, billing qoşun və Render domenini API key restriction-larına əlavə edin. Açarı GitHub-a yükləməyin.

## Safari/PWA

Service worker cache v6-dır. Köhnə cache-lər silinir; stale JavaScript bundle/chunk aşkar edilərsə service worker və browser cache bir dəfə təmizlənib səhifə avtomatik yenilənir.
