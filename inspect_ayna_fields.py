import json
from pathlib import Path
raw=json.loads((Path('/home/ubuntu/baki-metro-marshrut')/'ayna-bus-details.json').read_text())
for row in raw:
    if row.get('number') in {'10','11','H1'}:
        print('ROUTE', row.get('number'))
        print('row keys', sorted(row.keys()))
        detail=row.get('detail',{})
        print('detail keys', sorted(detail.keys()))
        stops=detail.get('busStops', detail.get('stops',[]))
        print('stop count', len(stops))
        if stops:
            print('stop keys', sorted(stops[0].keys()))
            print('first stop', stops[0])
