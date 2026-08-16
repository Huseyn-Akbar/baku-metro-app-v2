# HMR düzəlişi yoxlaması

Vite config-ə WebDev preview üçün HMR client scriptini çıxaran `disable-vite-hmr-client-in-webdev-preview` plugini əlavə edildi. Bu, Vite-nin `/@vite/client` scriptini səhifəyə inject etməsinin qarşısını alır; nəticədə reverse proxy-də daxili localhost:5173 WebSocket-ə qoşulma cəhdi yaranmır.

Yoxlamalar:

- Root HTML-də `/@vite/client` artıq yoxdur (`HMR_CLIENT_REMOVED`).
- `/?from_webdev=1` preview səhifəsi fresh browser açılışında normal yükləndi.
- Fresh açılışdan sonra browser console output boş oldu; yeni `[vite] failed to connect to websocket` xətası qeydə alınmadı.
- `pnpm check`, `pnpm test` (10 test) və `pnpm build` uğurla tamamlandı.
