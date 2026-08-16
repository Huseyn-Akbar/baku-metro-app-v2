import json
from pathlib import Path
raw=json.loads(Path('/home/ubuntu/baki-metro-marshrut/ayna-bus-details.json').read_text())
row=next(x for x in raw if x['number']=='10')
for stop in row['detail'].get('busStops', row['detail'].get('stops', [])):
    name=(stop.get('stopName') or stop.get('stop',{}).get('name') or '').strip()
    if any(term in name.lower() for term in ['nəriman', '28 may', 'metro', 'm/st']):
        s=stop.get('stop', stop)
        print(name, s.get('latitude'), s.get('longitude'))
