import json
import math
import re
import unicodedata
from pathlib import Path

ROOT = Path('/home/ubuntu/baki-metro-marshrut')
RADIUS_METERS = 500
raw = json.loads((ROOT / 'ayna-bus-details.json').read_text(encoding='utf-8'))

# Only exact metro-stop labels define the station centers. Generic street names
# such as “Nəriman Nərimanov heykəli” are intentionally excluded.
station_aliases = {
  'İçərişəhər': ['içərişəhər m/st', 'içərişəhər metro stansiyası'],
  'Sahil': ['sahil m/st', 'sahil metro stansiyası'],
  '28 May': ['28 may m/st', '28 may metro stansiyası'],
  'Gənclik': ['gənclik m/st', 'gənclik metro stansiyası'],
  'Nəriman Nərimanov': ['nəriman nərimanov m/st', 'nəriman nərimanov metro stansiyası'],
  'Bakmil': ['bakmil m/st', 'bakmil metro stansiyası'],
  'Ulduz': ['ulduz m/st', 'ulduz metro stansiyası'],
  'Koroğlu': ['koroğlu m/st', 'koroğlu metro stansiyası'],
  'Qara Qarayev': ['qara qarayev m/st', 'qara qarayev metro stansiyası'],
  'Neftçilər': ['neftçilər m/st', 'neftçilər metro stansiyası'],
  'Xalqlar Dostluğu': ['xalqlar dostluğu m/st', 'xalqlar dostluğu metro stansiyası'],
  'Əhmədli': ['əhmədli m/st', 'əhmədli metro stansiyası'],
  'Həzi Aslanov': ['həzi aslanov m/st', 'həzi aslanov metro stansiyası'],
  'Nizami': ['nizami m/st', 'nizami metro stansiyası'],
  'Elmlər Akademiyası': ['elmlər akademiyası m/st', 'elmlər akademiyası metro stansiyası'],
  'İnşaatçılar': ['inşaatçılar m/st', 'inşaatçılar metro stansiyası'],
  '20 Yanvar': ['20 yanvar m/st', '20 yanvar metro stansiyası'],
  'Memar Əcəmi': ['memar əcəmi m/st', 'memar əcəmi metro stansiyası'],
  'Nəsimi': ['nəsimi m/st', 'nəsimi metro stansiyası'],
  'Azadlıq prospekti': ['azadlıq m/st', 'azadlıq metro stansiyası', 'azadlıq prospekti m/st'],
  'Dərnəgül': ['dərnəgül m/st', 'dərnəgül metro stansiyası'],
  'Xocəsən': ['xocəsən m/st', 'xocəsən metro stansiyası'],
  'Avtovağzal': ['avtovağzal m/st', 'avtovağzal metro stansiyası'],
  '8 Noyabr': ['8 noyabr m/st', '8 noyabr metro stansiyası'],
  'Cəfər Cabbarlı': ['cəfər cabbarlı m/st', 'cəfər cabbarlı metro stansiyası'],
  'Şah İsmayıl Xətai': ['şah ismayıl xətai m/st', 'şah ismayıl xətai metro stansiyası'],
}

def norm(value):
    value = unicodedata.normalize('NFKC', value.lower())
    return re.sub(r'\s+', ' ', value).strip()

def coords(stop):
    nested = stop.get('stop', {})
    lat = nested.get('latitude', stop.get('latitude'))
    lon = nested.get('longitude', stop.get('longitude'))
    if lat is None or lon is None:
        return None
    try:
        return float(lat), float(lon)
    except (TypeError, ValueError):
        return None

def distance_m(a, b):
    lat1, lon1 = map(math.radians, a)
    lat2, lon2 = map(math.radians, b)
    dlat, dlon = lat2 - lat1, lon2 - lon1
    h = math.sin(dlat / 2) ** 2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon / 2) ** 2
    return 6371000 * 2 * math.asin(math.sqrt(h))

all_stops = []
for row in raw:
    stops = row.get('detail', {}).get('busStops', row.get('detail', {}).get('stops', []))
    all_stops.extend(stops)

station_points = {}
for station, aliases in station_aliases.items():
    points = []
    for stop in all_stops:
        name = norm((stop.get('stopName') or stop.get('stop', {}).get('name') or ''))
        if name in aliases:
            point = coords(stop)
            if point:
                points.append(point)
    if points:
        station_points[station] = (sum(p[0] for p in points) / len(points), sum(p[1] for p in points) / len(points))

# AYNA-nın stop feed-ində platforması olmayan stansiyalar üçün real OSM
# stansiya koordinatları fallback kimi istifadə olunur. Bu siyahı bütün
# metroStations seçimlərini radius hesablamasına daxil edir.
fallback_points = {
    'İçərişəhər': (40.3659588, 49.8316472),
    'Bakmil': (40.4141403, 49.8787959),
    'İnşaatçılar': (40.3890935, 49.8023575),
    'Dərnəgül': (40.4254022, 49.8617881),
    'Xocəsən': (40.4230824, 49.7796111),
    'Cəfər Cabbarlı': (40.3796520, 49.8489498),
    'Şah İsmayıl Xətai': (40.3832514, 49.8721454),
}
for station, point in fallback_points.items():
    station_points.setdefault(station, point)

routes = []
for row in raw:
    stops = row.get('detail', {}).get('busStops', row.get('detail', {}).get('stops', []))
    matched = []
    station_stops = {}
    for station, center in station_points.items():
        nearby = [(distance_m(point, center), stop) for stop in stops if (point := coords(stop)) and distance_m(point, center) <= RADIUS_METERS]
        if nearby:
            matched.append(station)
            nearest = min(nearby, key=lambda item: item[0])[1]
            station_stops[station] = nearest.get('stopName') or nearest.get('stop', {}).get('name') or station
    if len(matched) >= 2:
        detail = row.get('detail', {})
        tariff = detail.get('tariff')
        try:
            fare_azn = float(tariff) / 100 if tariff is not None else None
        except (TypeError, ValueError):
            fare_azn = None
        try:
            distance_km = float(detail.get('routLength')) if detail.get('routLength') is not None else None
        except (TypeError, ValueError):
            distance_km = None
        route = {
            'id': f"ayna-{row['number']}",
            'number': row['number'],
            'title': f"№ {row['number']} avtobusu",
            'description': f"AYNA xəritəsində metro stansiyalarının {RADIUS_METERS} m radiusundan keçir.",
            'source': 'AYNA MaaS',
            'stations': matched,
            'stationStops': station_stops,
            'isExpress': row['number'] == 'H1',
        }
        if distance_km is not None:
            route['distanceKm'] = distance_km
        if fare_azn is not None:
            route['fareAzn'] = fare_azn
            route['fareLabel'] = detail.get('tariffStr') or f"{fare_azn:.2f} AZN"
        # H1-in AYNA-da təsdiqlənən dayanacaqları yalnız bu üç nöqtədir.
        if row['number'] == 'H1':
            route['stations'] = ['28 May', 'Koroğlu']
            route['stationStops'] = {
                '28 May': '28 May',
                'Koroğlu': 'Koroğlu',
                'Hava limanı': 'Beynəlxalq Hava Limanı Terminal 1',
            }
            route['title'] = '28 May ↔ Koroğlu ↔ Hava limanı'
            route['description'] = 'H1 ekspress xətti yalnız 28 May, Koroğlu və Beynəlxalq Hava Limanı Terminal 1-də dayanır.'
        routes.append(route)
routes.sort(key=lambda x: (not x['number'].isdigit(), int(x['number']) if x['number'].isdigit() else x['number']))

out = ROOT / 'shared/ayna-routes.ts'
out.write_text('import type { BusRoute } from "./transit-data";\n\nexport const aynaRoutes: BusRoute[] = ' + json.dumps(routes, ensure_ascii=False, indent=2) + ';\n', encoding='utf-8')
print('station centers', len(station_points))
print('generated routes', len(routes))
print('Nəriman Nərimanov -> 28 May:', [r['number'] for r in routes if 'Nəriman Nərimanov' in r['stations'] and '28 May' in r['stations']])
print('10 stations:', next((r['stations'] for r in routes if r['number'] == '10'), []))
