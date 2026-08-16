import json
from pathlib import Path
raw=json.loads(Path('/home/ubuntu/baki-metro-marshrut/ayna-bus-details.json').read_text())
terms=['nəriman nərimanov','28 may']
for term in terms:
    print('---', term)
    seen=set()
    for row in raw:
        stops=row['detail'].get('busStops', row['detail'].get('stops', []))
        for stop in stops:
            name=(stop.get('stopName') or stop.get('stop',{}).get('name') or '').strip()
            if term in name.lower() and name not in seen:
                s=stop.get('stop', stop)
                seen.add(name)
                print(name, s.get('latitude'), s.get('longitude'))
