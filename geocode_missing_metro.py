import json, time, requests
from pathlib import Path
missing = ['İçərişəhər','Sahil','28 May','Gənclik','Nəriman Nərimanov','Bakmil','Ulduz','Qara Qarayev','Neftçilər','Xalqlar Dostluğu','Əhmədli','Həzi Aslanov','Nizami','İnşaatçılar','20 Yanvar','Memar Əcəmi','Nəsimi','Azadlıq prospekti','Dərnəgül','8 Noyabr','Cəfər Cabbarlı','Şah İsmayıl Xətai']
queries=[]
for name in missing:
    queries.append((name, [f'{name}, Bakı, Azərbaycan', f'{name} metro, Bakı', f'{name} station Baku', f'Bakı Metropoliteni {name}']))
headers={'User-Agent':'BakuMetroMarshrut/1.0 route mapping'}
for name, candidates in queries:
    found=None
    for q in candidates:
        try:
            data=requests.get('https://nominatim.openstreetmap.org/search', params={'q':q,'format':'jsonv2','limit':3},headers=headers,timeout=30).json()
        except Exception:
            data=[]
        if data:
            found=data[0]; break
        time.sleep(.3)
    if found:
        print(name, found['lat'], found['lon'], found['display_name'])
    else:
        print('NOT FOUND', name)
    time.sleep(.8)
