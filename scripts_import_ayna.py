import json
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
import requests

BASE = "https://map-api.ayna.gov.az"
ROOT = Path("/home/ubuntu/baki-metro-marshrut")
items = requests.get(f"{BASE}/api/bus/getBusList", timeout=30).json()

def fetch(item):
    for attempt in range(3):
        try:
            response = requests.get(f"{BASE}/api/bus/getBusById", params={"id": item["id"]}, timeout=30)
            if response.ok:
                return {"id": item["id"], "number": item["number"], "detail": response.json()}
        except requests.RequestException:
            pass
    print(f"Skipped bus {item['number']} (API unavailable)")
    return None

results = []
with ThreadPoolExecutor(max_workers=12) as pool:
    jobs = [pool.submit(fetch, item) for item in items]
    for index, job in enumerate(as_completed(jobs), 1):
        result = job.result()
        if result is not None:
            results.append(result)
        if index % 25 == 0:
            print(f"Fetched {index}/{len(items)}")
results.sort(key=lambda row: int(row["id"]))
(ROOT / "ayna-bus-details.json").write_text(json.dumps(results, ensure_ascii=False), encoding="utf-8")
metro_stops = {}
for row in results:
    detail = row["detail"]
    for stop in detail.get("busStops", detail.get("stops", [])):
        name = (stop.get("stopName") or stop.get("stop", {}).get("name") or "").strip()
        if "m/st" in name.lower() or "metro" in name.lower():
            metro_stops.setdefault(name, set()).add(row["number"])
print("metro stop names:")
for name, numbers in sorted(metro_stops.items()):
    print(name, sorted(numbers))
print("route records", len(results), "metro stop names", len(metro_stops))
