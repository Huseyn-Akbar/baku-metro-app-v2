import json
import time
import requests
from pathlib import Path

stations = [
  "İçərişəhər metro station, Baku, Azerbaijan", "Sahil metro station, Baku, Azerbaijan", "28 May metro station, Baku, Azerbaijan", "Gənclik metro station, Baku, Azerbaijan", "Nəriman Nərimanov metro station, Baku, Azerbaijan", "Bakmil metro station, Baku, Azerbaijan", "Ulduz metro station, Baku, Azerbaijan", "Koroğlu metro station, Baku, Azerbaijan", "Qara Qarayev metro station, Baku, Azerbaijan", "Neftçilər metro station, Baku, Azerbaijan", "Xalqlar Dostluğu metro station, Baku, Azerbaijan", "Əhmədli metro station, Baku, Azerbaijan", "Həzi Aslanov metro station, Baku, Azerbaijan", "Nizami metro station, Baku, Azerbaijan", "Elmlər Akademiyası metro station, Baku, Azerbaijan", "İnşaatçılar metro station, Baku, Azerbaijan", "20 Yanvar metro station, Baku, Azerbaijan", "Memar Əcəmi metro station, Baku, Azerbaijan", "Nəsimi metro station, Baku, Azerbaijan", "Azadlıq prospekti metro station, Baku, Azerbaijan", "Dərnəgül metro station, Baku, Azerbaijan", "Xocəsən metro station, Baku, Azerbaijan", "Avtovağzal metro station, Baku, Azerbaijan", "8 Noyabr metro station, Baku, Azerbaijan", "Cəfər Cabbarlı metro station, Baku, Azerbaijan", "Şah İsmayıl Xətai metro station, Baku, Azerbaijan"
]
results = []
headers = {"User-Agent": "BakuMetroMarshrut/1.0 (route mapping)"}
for query in stations:
    data = requests.get("https://nominatim.openstreetmap.org/search", params={"q": query, "format": "jsonv2", "limit": 1}, headers=headers, timeout=30).json()
    if data:
        results.append({"query": query, "lat": float(data[0]["lat"]), "lon": float(data[0]["lon"]), "display": data[0]["display_name"]})
        print(query, data[0]["lat"], data[0]["lon"])
    else:
        print("NOT FOUND", query)
    time.sleep(1)
Path("/home/ubuntu/baki-metro-marshrut/metro-geocodes.json").write_text(json.dumps(results, ensure_ascii=False, indent=2), encoding="utf-8")
print("saved", len(results))
