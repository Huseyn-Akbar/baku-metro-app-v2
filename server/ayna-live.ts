import { z } from "zod";

const AYNA_BASE_URL = process.env.AYNA_MAP_API_BASE_URL ?? "https://map-api.ayna.gov.az";
const busListSchema = z.array(z.object({ id: z.number(), number: z.string() }));
const coordinateSchema = z.object({ lat: z.number(), lng: z.number() });
const stopSchema = z.object({
  stopName: z.string().optional(),
  stop: z.object({
    name: z.string().optional(),
    nameMonitor: z.string().optional(),
    latitude: z.union([z.string(), z.number()]).optional(),
    longitude: z.union([z.string(), z.number()]).optional(),
  }).optional(),
  directionTypeId: z.number().optional(),
});
const detailSchema = z.object({
  number: z.string(),
  stops: z.array(stopSchema),
  routes: z.array(z.object({
    directionTypeId: z.number().optional(),
    variant: z.string().optional(),
    routeDescription: z.string().optional(),
    flowCoordinates: z.array(coordinateSchema),
  })).optional(),
});

export type AynaLiveDirection = {
  directionTypeId: number;
  label: string;
  coordinates: Array<{ lat: number; lng: number }>;
  stops: Array<{ name: string; lat: number; lng: number }>;
};

export type AynaLiveRoute = {
  number: string;
  directions: AynaLiveDirection[];
};

function parseCoordinate(value: string | number | undefined) {
  if (value === undefined || value === null) return undefined;
  const parsed = Number(String(value).replace(",", "."));
  return Number.isFinite(parsed) ? parsed : undefined;
}

async function getJson(path: string, params?: Record<string, string>) {
  const url = new URL(path, AYNA_BASE_URL);
  Object.entries(params ?? {}).forEach(([key, value]) => url.searchParams.set(key, value));
  const response = await fetch(url, { headers: { accept: "application/json" }, signal: AbortSignal.timeout(5000) });
  if (!response.ok) throw new Error(`AYNA request failed: ${response.status}`);
  return response.json();
}

export async function loadAynaRouteNumbers(): Promise<string[] | null> {
  try {
    const list = busListSchema.parse(await getJson("/api/bus/getBusList"));
    return list.map(item => item.number.trim()).filter(Boolean);
  } catch {
    return null;
  }
}

export async function loadAynaLiveRoute(number: string): Promise<AynaLiveRoute | null> {
  try {
    const list = busListSchema.parse(await getJson("/api/bus/getBusList"));
    const bus = list.find(item => item.number.trim().toLocaleLowerCase("az-AZ") === number.trim().toLocaleLowerCase("az-AZ"));
    if (!bus) return null;
    const detail = detailSchema.parse(await getJson("/api/bus/getBusById", { id: String(bus.id) }));
    const directions = (detail.routes ?? []).map(route => {
      const directionTypeId = route.directionTypeId ?? 0;
      const stops = detail.stops
        .filter(stop => (stop.directionTypeId ?? 0) === directionTypeId)
        .map(stop => {
          const lat = parseCoordinate(stop.stop?.latitude);
          const lng = parseCoordinate(stop.stop?.longitude);
          return { name: stop.stopName ?? stop.stop?.nameMonitor ?? stop.stop?.name ?? "", lat, lng };
        })
        .filter((stop): stop is { name: string; lat: number; lng: number } => Boolean(stop.name && stop.lat !== undefined && stop.lng !== undefined));
      return {
        directionTypeId,
        label: route.routeDescription ?? route.variant ?? `İstiqamət ${directionTypeId}`,
        coordinates: route.flowCoordinates,
        stops,
      };
    }).filter(direction => direction.coordinates.length > 1 && direction.stops.length > 1);
    return { number: detail.number, directions };
  } catch {
    return null;
  }
}
