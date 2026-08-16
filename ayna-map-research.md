
## Tapılmış real API

AYNA xəritəsinin JavaScript bundle-ında API bazası `https://map-api.ayna.gov.az/` kimi müəyyən edildi. İstifadə olunan endpointlər:

- `GET /api/bus/getBusList` — 209 avtobus xəttinin id və nömrəsi.
- `GET /api/bus/getBusById?id={id}` — xəttin istiqamətləri və dayanacaqları.
- `GET /api/bus/getBusesByStopId?stopId={id}` — dayanacaq üzrə avtobuslar.
- `GET /api/stop/getAll` — dayanacaq koordinatları.
- `GET /api/library/getRegions` və `GET /api/library/getSystemSettings` — köməkçi məlumatlar.

`getBusList` və `getBusById` məlumatlarından 208 xətt uğurla yükləndi; 122 xəttin ən azı iki metro dayanacağından keçdiyi müəyyən edildi. Preview-də Sahil → Nəriman Nərimanov seçimi 5 və 10 nömrəli AYNA avtobuslarını göstərdi.
