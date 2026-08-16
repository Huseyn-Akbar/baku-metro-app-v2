import json
import re
import unicodedata
from pathlib import Path

ROOT = Path('/home/ubuntu/baki-metro-marshrut')
raw = json.loads((ROOT / 'ayna-bus-details.json').read_text(encoding='utf-8'))

# API stop names include variants such as “m/st” and “metro stansiyası”.
aliases = {
  'İçərişəhər': ['içərişəhər'], 'Sahil': ['sahil'], '28 May': ['28 may'],
  'Gənclik': ['gənclik'], 'Nəriman Nərimanov': ['nəriman nərimanov'], 'Bakmil': ['bakmil'],
  'Ulduz': ['ulduz'], 'Koroğlu': ['koroğlu'], 'Qara Qarayev': ['qara qarayev'],
  'Neftçilər': ['neftçilər'], 'Xalqlar Dostluğu': ['xalqlar dostluğu'], 'Əhmədli': ['əhmədli'],
  'Həzi Aslanov': ['həzi aslanov'], 'Nizami': ['nizami'], 'Elmlər Akademiyası': ['elmlər akademiyası'],
  'İnşaatçılar': ['inşaatçılar'], '20 Yanvar': ['20 yanvar'], 'Memar Əcəmi': ['memar əcəmi'],
  'Nəsimi': ['nəsimi'], 'Azadlıq prospekti': ['azadlıq'], 'Dərnəgül': ['dərnəgül'],
  'Xocəsən': ['xocəsən'], 'Avtovağzal': ['avtovağzal'], '8 Noyabr': ['8 noyabr'],
  'Cəfər Cabbarlı': ['cəfər cabbarlı'], 'Şah İsmayıl Xətai': ['şah ismayıl xətai'],
}

def norm(value):
    value = unicodedata.normalize('NFKC', value.lower())
    value = re.sub(r'\s+', ' ', value).strip()
    return value

routes = []
for row in raw:
    stops = row.get('detail', {}).get('busStops', row.get('detail', {}).get('stops', []))
    names = []
    for stop in stops:
        name = (stop.get('stopName') or stop.get('stop', {}).get('name') or '').strip()
        n = norm(name)
        for station, station_aliases in aliases.items():
            if any(alias in n for alias in station_aliases) and station not in names:
                names.append(station)
    if len(names) >= 2:
        routes.append({
            'id': f"ayna-{row['number']}",
            'number': row['number'],
            'title': f"№ {row['number']} avtobusu",
            'description': f"AYNA xəritəsində {len(names)} metro stansiyasından keçir.",
            'source': 'AYNA MaaS',
            'stations': names,
        })
routes.sort(key=lambda x: (not x['number'].isdigit(), int(x['number']) if x['number'].isdigit() else x['number']))

out = ROOT / 'shared/ayna-routes.ts'
out.write_text('import type { BusRoute } from "./transit-data";\n\nexport const aynaRoutes: BusRoute[] = ' + json.dumps(routes, ensure_ascii=False, indent=2) + ';\n', encoding='utf-8')
print('Generated', len(routes), 'routes')
print('Sample:', json.dumps(routes[:5], ensure_ascii=False, indent=2))
