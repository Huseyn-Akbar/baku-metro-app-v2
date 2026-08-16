import type { BusRoute } from "./transit-data";

export type MapPoint = {
  label: "A" | "B" | "C";
  title: string;
  detail: string;
};

export function mapStopName(route: Pick<BusRoute, "stationStops">, station: string) {
  return route.stationStops?.[station] ?? `${station} m/st`;
}

export function mapPointsForRoute(route: BusRoute, start: string, end: string): MapPoint[] {
  if (route.isTransfer && route.transfer) {
    return [
      { label: "A", title: mapStopName(route.transfer.first, start), detail: `Minik · ${route.transfer.first.number} nömrəli avtobus` },
      { label: "B", title: mapStopName(route.transfer.first, route.transfer.station), detail: `Mübadilə · ${route.transfer.station}` },
      { label: "C", title: mapStopName(route.transfer.second, end), detail: `Düşmə · ${route.transfer.second.number} nömrəli avtobus` },
    ];
  }
  return [
    { label: "A", title: mapStopName(route, start), detail: "Minik nöqtəsi" },
    { label: "B", title: mapStopName(route, end), detail: "Düşmə nöqtəsi" },
  ];
}
