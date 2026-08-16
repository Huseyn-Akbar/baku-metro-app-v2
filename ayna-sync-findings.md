# AYNA synchronization findings

Source page: https://map.ayna.gov.az/
Official API base discovered from the AYNA web bundle: https://map-api.ayna.gov.az/

Relevant public endpoints used by the official page:

- `GET https://map-api.ayna.gov.az/api/bus/getBusList` returns bus IDs and route numbers.
- `GET https://map-api.ayna.gov.az/api/bus/getBusById?id={id}` returns route details, stop records, direction types, tariffs, durations, and `routes[].flowCoordinates` path geometry.
- The route detail stop records include `stopName`, `directionTypeId`, and `stop.latitude` / `stop.longitude`.

The implementation now uses the official API server-side through `server/ayna-live.ts` and the `transit.aynaRoute` tRPC procedure. Google Maps remains the basemap, while AYNA `flowCoordinates` are drawn as the primary route polyline; Google Directions is only a fallback when the live AYNA path cannot be resolved. A/B/C markers use live AYNA stop coordinates when available.

Browser verification on the project preview confirmed the status text `AYNA xətti ilə sinxronlaşdırılmış Google Maps marşrutu göstərilir` for 28 May → Nəriman Nərimanov, with A at Bakı Dəmiryol Vağzalı and B at Nəriman Nərimanov m/st. The Ulduz → Elmlər Akademiyası transfer preview displayed A/B/C and loaded the transfer route selection.
