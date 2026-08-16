export type MetroStation = {
  id: string;
  name: string;
  line: "Qırmızı xətt" | "Yaşıl xətt" | "Bənövşəyi xətt";
  order: number;
};

export type TransferLeg = {
  number: string;
  stations: string[];
  title: string;
  source: "AYNA MaaS" | "Ekspres";
  stationStops?: Record<string, string>;
  fromStop?: string;
  toStop?: string;
  distanceKm?: number;
  fareAzn?: number;
  fareLabel?: string;
};

export type BusRoute = {
  id: string;
  number: string;
  title: string;
  description: string;
  source: "AYNA MaaS" | "Ekspres" | "Transfer";
  stations: string[];
  stationStops?: Record<string, string>;
  distanceKm?: number;
  fareAzn?: number;
  fareLabel?: string;
  isExpress?: boolean;
  isTransfer?: boolean;
  transfer?: {
    first: TransferLeg;
    second: TransferLeg;
    station: string;
  };
};

export const metroStations: MetroStation[] = [
  { id: "icherisheher", name: "İçərişəhər", line: "Qırmızı xətt", order: 1 },
  { id: "sahil", name: "Sahil", line: "Qırmızı xətt", order: 2 },
  { id: "28-may", name: "28 May", line: "Qırmızı xətt", order: 3 },
  { id: "ganjlik", name: "Gənclik", line: "Qırmızı xətt", order: 4 },
  { id: "nariman-narimanov", name: "Nəriman Nərimanov", line: "Qırmızı xətt", order: 5 },
  { id: "bakmil", name: "Bakmil", line: "Qırmızı xətt", order: 6 },
  { id: "ulduz", name: "Ulduz", line: "Qırmızı xətt", order: 7 },
  { id: "koroglu", name: "Koroğlu", line: "Qırmızı xətt", order: 8 },
  { id: "qara-qarayev", name: "Qara Qarayev", line: "Qırmızı xətt", order: 9 },
  { id: "neftchiler", name: "Neftçilər", line: "Qırmızı xətt", order: 10 },
  { id: "xalqlar-dostlugu", name: "Xalqlar Dostluğu", line: "Qırmızı xətt", order: 11 },
  { id: "ahmadli", name: "Əhmədli", line: "Qırmızı xətt", order: 12 },
  { id: "hazi-aslanov", name: "Həzi Aslanov", line: "Qırmızı xətt", order: 13 },
  { id: "nizami", name: "Nizami", line: "Yaşıl xətt", order: 14 },
  { id: "elmler-akademiyasi", name: "Elmlər Akademiyası", line: "Yaşıl xətt", order: 15 },
  { id: "insaatcilar", name: "İnşaatçılar", line: "Yaşıl xətt", order: 16 },
  { id: "20-yanvar", name: "20 Yanvar", line: "Yaşıl xətt", order: 17 },
  { id: "memar-əcemi", name: "Memar Əcəmi", line: "Yaşıl xətt", order: 18 },
  { id: "nasimi", name: "Nəsimi", line: "Yaşıl xətt", order: 19 },
  { id: "azadliq-prospekti", name: "Azadlıq prospekti", line: "Yaşıl xətt", order: 20 },
  { id: "dernegul", name: "Dərnəgül", line: "Yaşıl xətt", order: 21 },
  { id: "xocesen", name: "Xocəsən", line: "Bənövşəyi xətt", order: 22 },
  { id: "avtovagzal", name: "Avtovağzal", line: "Bənövşəyi xətt", order: 23 },
  { id: "8-noyabr", name: "8 Noyabr", line: "Bənövşəyi xətt", order: 24 },
  { id: "cefer-cabbarli", name: "Cəfər Cabbarlı", line: "Yaşıl xətt", order: 25 },
  { id: "shah-is mayil-xetai", name: "Şah İsmayıl Xətai", line: "Yaşıl xətt", order: 26 },
  { id: "ag-sheher", name: "Ağ Şəhər", line: "Bənövşəyi xətt", order: 27 },
];

export const expressRoutes: BusRoute[] = [
  { id: "m1", number: "M1", title: "Elmlər Akademiyası ↔ 28 May", description: "Elmlər Akademiyası və 28 May stansiyaları arasında ekspres xətt.", source: "Ekspres", stations: ["Elmlər Akademiyası", "28 May"], isExpress: true },
  { id: "m2", number: "M2", title: "İnşaatçılar ↔ Nizami ↔ 28 May", description: "İnşaatçılar, Nizami və 28 May stansiyaları arasında ekspres xətt.", source: "Ekspres", stations: ["İnşaatçılar", "Nizami", "28 May"], isExpress: true },
  { id: "m3", number: "M3", title: "20 Yanvar ↔ Nizami ↔ 28 May", description: "20 Yanvar, Nizami və 28 May stansiyaları arasında ekspres xətt.", source: "Ekspres", stations: ["20 Yanvar", "Nizami", "28 May"], isExpress: true },
  { id: "m4", number: "M4", title: "20 Yanvar ↔ Koroğlu", description: "20 Yanvar və Koroğlu stansiyaları arasında ekspres xətt.", source: "Ekspres", stations: ["20 Yanvar", "Koroğlu"], isExpress: true },
  { id: "m5", number: "M5", title: "20 Yanvar ↔ Gənclik", description: "20 Yanvar və Gənclik stansiyaları arasında ekspres xətt.", source: "Ekspres", stations: ["20 Yanvar", "Gənclik"], isExpress: true },
  { id: "m6", number: "M6", title: "Elmlər Akademiyası ↔ Gənclik", description: "Elmlər Akademiyası və Gənclik stansiyaları arasında ekspres xətt.", source: "Ekspres", stations: ["Elmlər Akademiyası", "Gənclik"], isExpress: true },
];

/**
 * Sərnişinin seçdiyi iki dayanacaq arasındakı təxmini yol məsafəsini qaytarır.
 * AYNA importunda route-level total distance saxlanıldığı üçün, seçilmiş
 * stansiyalar arasındakı segment route ardıcıllığındakı payla hesablanır.
 * Beləliklə, optimal seçim bütün xəttin uzunluğuna deyil, səfərin özünə əsaslanır.
 */
export function segmentDistanceKm(route: BusRoute, start: string, end: string) {
  if (route.distanceKm === undefined) return undefined;
  const startIndex = route.stations.indexOf(start);
  const endIndex = route.stations.indexOf(end);
  if (startIndex < 0 || endIndex < 0 || route.stations.length < 2) return route.distanceKm;
  const segmentCount = route.stations.length - 1;
  const travelledSegments = Math.abs(endIndex - startIndex);
  return Number((route.distanceKm * travelledSegments / segmentCount).toFixed(1));
}

export function routesBetween(start: string, end: string, routes: BusRoute[]) {
  if (!start || !end || start === end) return [];
  return routes
    .filter(route => route.stations.includes(start) && route.stations.includes(end))
    .map(route => ({ ...route, distanceKm: segmentDistanceKm(route, start, end) }));
}

export function oneTransferRoutes(start: string, end: string, routes: BusRoute[], limit = 8): BusRoute[] {
  if (!start || !end || start === end) return [];
  const candidates: BusRoute[] = [];
  const seen = new Set<string>();
  const baseRoutes = routes.filter((route): route is BusRoute & { source: "AYNA MaaS" | "Ekspres" } => route.source !== "Transfer");

  for (const first of baseRoutes) {
    if (!first.stations.includes(start)) continue;
    for (const second of baseRoutes) {
      if (first.id === second.id || !second.stations.includes(end)) continue;
      const transferStations = first.stations.filter(station => station !== start && station !== end && second.stations.includes(station));
      for (const station of transferStations) {
        const transferKey = `${first.id}|${second.id}|${station}`;
        if (seen.has(transferKey)) continue;
        seen.add(transferKey);
        const firstDistanceKm = segmentDistanceKm(first, start, station);
        const secondDistanceKm = segmentDistanceKm(second, station, end);
        const distanceKm = firstDistanceKm !== undefined && secondDistanceKm !== undefined
          ? Number((firstDistanceKm + secondDistanceKm).toFixed(1))
          : undefined;
        const fareAzn = first.fareAzn !== undefined && second.fareAzn !== undefined
          ? first.fareAzn + second.fareAzn
          : undefined;
        candidates.push({
          id: `transfer-${first.id}-${second.id}-${station}`,
          number: `${first.number} + ${second.number}`,
          title: `${first.number} → ${second.number}`,
          description: `${first.number} nömrəli avtobusla ${station} dayanacağına gedin, orada ${second.number} nömrəli avtobusa keçin.`,
          source: "Transfer",
          stations: [start, station, end],
          stationStops: {
            [start]: first.stationStops?.[start] ?? start,
            [end]: second.stationStops?.[end] ?? end,
          },
          distanceKm,
          fareAzn,
          fareLabel: fareAzn !== undefined ? `${fareAzn.toFixed(2)} AZN ümumi` : undefined,
          isTransfer: true,
          transfer: {
            first: {
              number: first.number,
              title: first.title,
              stations: first.stations,
              source: first.source,
              stationStops: first.stationStops,
              fromStop: first.stationStops?.[start] ?? start,
              toStop: first.stationStops?.[station] ?? station,
              distanceKm: firstDistanceKm,
              fareAzn: first.fareAzn,
              fareLabel: first.fareLabel,
            },
            second: {
              number: second.number,
              title: second.title,
              stations: second.stations,
              source: second.source,
              stationStops: second.stationStops,
              fromStop: second.stationStops?.[station] ?? station,
              toStop: second.stationStops?.[end] ?? end,
              distanceKm: secondDistanceKm,
              fareAzn: second.fareAzn,
              fareLabel: second.fareLabel,
            },
            station,
          },
        });
      }
    }
  }

  return candidates.sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity)).slice(0, limit);
}

export function routesByNumber(number: string, routes: BusRoute[]) {
  const normalized = number.trim().toLocaleUpperCase("az-AZ");
  if (!normalized) return [];
  return routes
    .filter(route => route.number.trim().toLocaleUpperCase("az-AZ") === normalized)
    .sort((a, b) => Number(Boolean(b.isExpress)) - Number(Boolean(a.isExpress)));
}

export function rankRoutes(routes: BusRoute[]) {
  return [...routes].sort((a, b) => {
    const expressPriority = Number(Boolean(b.isExpress)) - Number(Boolean(a.isExpress));
    if (expressPriority !== 0) return expressPriority;
    return (a.distanceKm ?? Number.POSITIVE_INFINITY) - (b.distanceKm ?? Number.POSITIVE_INFINITY);
  });
}

export function bestDistanceRoute(routes: BusRoute[]) {
  return routes.filter(route => route.distanceKm !== undefined).sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity))[0];
}

export function bestFareRoute(routes: BusRoute[]) {
  return routes.filter(route => route.fareAzn !== undefined).sort((a, b) => (a.fareAzn ?? Infinity) - (b.fareAzn ?? Infinity))[0];
}
