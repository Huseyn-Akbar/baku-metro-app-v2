import React, { useEffect, useRef, useState } from "react";
import { MapPinned, Route as RouteIcon } from "lucide-react";
import { MapView } from "@/components/Map";
import { Card } from "@/components/ui/card";
import type { BusRoute } from "@shared/transit-data";
import { mapPointsForRoute, mapStopName } from "@shared/route-map-logic";
import { routeStopCoordinates, stopCoordinates } from "@shared/stop-coordinates";
import { trpc } from "@/lib/trpc";

type GoogleRouteMapPanelProps = {
  route?: BusRoute;
  start?: string;
  end?: string;
};

function normalizeStopName(value: string) {
  return value.replaceAll("ә", "ə").replaceAll("Ә", "Ə").replace(/\\s+/g, " ").trim().toLocaleLowerCase("az-AZ");
}

function exactStopCoordinate(routeNumber: string, stop: string) {
  return routeStopCoordinates[`${routeNumber}|${normalizeStopName(stop)}`] ?? stopCoordinates[normalizeStopName(stop)];
}

function liveStopPoint(live: { directions: Array<{ stops: Array<{ name: string; lat: number; lng: number }> }> } | null | undefined, stop: string) {
  const target = normalizeStopName(stop);
  return live?.directions.flatMap(direction => direction.stops).find(point => {
    const name = normalizeStopName(point.name);
    return name === target || name.includes(target) || target.includes(name);
  });
}

function livePath(live: { directions: Array<{ coordinates: Array<{ lat: number; lng: number }>; stops: Array<{ name: string; lat: number; lng: number }> }> } | null | undefined, fromStop: string, toStop: string) {
  if (!live) return undefined;
  const from = liveStopPoint(live, fromStop);
  const to = liveStopPoint(live, toStop);
  if (!from || !to) return undefined;
  const direction = live.directions.find(candidate => {
    const names = candidate.stops.map(stop => normalizeStopName(stop.name));
    const fromIndex = names.findIndex(name => name === normalizeStopName(fromStop) || name.includes(normalizeStopName(fromStop)) || normalizeStopName(fromStop).includes(name));
    const toIndex = names.findIndex(name => name === normalizeStopName(toStop) || name.includes(normalizeStopName(toStop)) || normalizeStopName(toStop).includes(name));
    return fromIndex >= 0 && toIndex >= 0 && fromIndex <= toIndex;
  }) ?? live.directions[0];
  if (!direction) return undefined;
  const nearest = (point: { lat: number; lng: number }) => direction.coordinates.reduce((best, candidate, index) => {
    const current = (candidate.lat - point.lat) ** 2 + (candidate.lng - point.lng) ** 2;
    return current < best.distance ? { distance: current, index } : best;
  }, { distance: Number.POSITIVE_INFINITY, index: 0 }).index;
  const startIndex = nearest(from);
  const endIndex = nearest(to);
  return direction.coordinates.slice(Math.min(startIndex, endIndex), Math.max(startIndex, endIndex) + 1);
}

function routeStations(route: Pick<BusRoute, "stations">, from: string, to: string) {
  const fromIndex = route.stations.indexOf(from);
  const toIndex = route.stations.indexOf(to);
  if (fromIndex < 0 || toIndex < 0) return [from, to];
  const direction = fromIndex <= toIndex ? 1 : -1;
  const stations: string[] = [];
  for (let index = fromIndex; direction > 0 ? index <= toIndex : index >= toIndex; index += direction) stations.push(route.stations[index]);
  return stations;
}

function clearOverlays(overlays: Array<google.maps.DirectionsRenderer | google.maps.Marker | google.maps.Polyline>) {
  overlays.forEach(overlay => overlay.setMap(null));
}

export function GoogleRouteMapPanel({ route, start, end }: GoogleRouteMapPanelProps) {
  const mapRef = useRef<google.maps.Map | null>(null);
  const overlaysRef = useRef<Array<google.maps.DirectionsRenderer | google.maps.Marker | google.maps.Polyline>>([]);
  const [status, setStatus] = useState("Marşrut seçin");
  const [ready, setReady] = useState(false);
  const directLive = trpc.transit.aynaRoute.useQuery({ number: route?.number ?? "" }, { enabled: Boolean(route && !route.isTransfer) });
  const firstLive = trpc.transit.aynaRoute.useQuery({ number: route?.transfer?.first.number ?? "" }, { enabled: Boolean(route?.isTransfer && route.transfer) });
  const secondLive = trpc.transit.aynaRoute.useQuery({ number: route?.transfer?.second.number ?? "" }, { enabled: Boolean(route?.isTransfer && route.transfer) });

  const points = route && start && end ? mapPointsForRoute(route, start, end) : [];

  useEffect(() => {
    if (!mapRef.current || !route || !start || !end) return;
    clearOverlays(overlaysRef.current);
    overlaysRef.current = [];
    setStatus("Google Maps marşrutu hesablayır...");

    const directions = new google.maps.DirectionsService();
    const resolveStop = (routeNumber: string, value: string, live?: typeof directLive.data) => {
      const livePoint = liveStopPoint(live, value);
      const coordinate = livePoint ? { lat: livePoint.lat, lng: livePoint.lng } : exactStopCoordinate(routeNumber, value);
      if (!coordinate) throw new Error(`AYNA coordinate missing: ${routeNumber} / ${value}`);
      return coordinate;
    };

    const drawLeg = async (routeNumber: string, fromStop: string, toStop: string, color: string, destinationLabel: "B" | "C", addOriginMarker: boolean, waypoints: string[], live?: typeof directLive.data) => {
      const origin = resolveStop(routeNumber, fromStop, live);
      const destination = resolveStop(routeNumber, toStop, live);
      const aynaCoordinates = livePath(live, fromStop, toStop);
      if (aynaCoordinates && aynaCoordinates.length > 1) {
        overlaysRef.current.push(new google.maps.Polyline({ map: mapRef.current, path: aynaCoordinates, strokeColor: color, strokeOpacity: 0.95, strokeWeight: 6 }));
      }
      const waypointLocations = waypoints.map(stop => resolveStop(routeNumber, stop, live));
      if (!aynaCoordinates || aynaCoordinates.length < 2) {
        const response = await directions.route({ origin, destination, waypoints: waypointLocations.map(location => ({ location, stopover: true })), travelMode: google.maps.TravelMode.DRIVING, provideRouteAlternatives: false });
        overlaysRef.current.push(new google.maps.DirectionsRenderer({ map: mapRef.current, directions: response, suppressMarkers: true, polylineOptions: { strokeColor: color, strokeOpacity: 0.9, strokeWeight: 6 } }));
      }
      const marker = new google.maps.Marker({
        map: mapRef.current,
        position: destination,
        label: { text: destinationLabel, color: "#ffffff", fontWeight: "800" },
        title: toStop,
      });
      overlaysRef.current.push(marker);
      if (addOriginMarker) {
        const originMarker = new google.maps.Marker({
          map: mapRef.current,
          position: origin,
          label: { text: "A", color: "#ffffff", fontWeight: "800" },
          title: fromStop,
        });
        overlaysRef.current.push(originMarker);
      }
    };

    const run = async () => {
      try {
        if (route.isTransfer && route.transfer) {
          const transferData = route.transfer;
          const transfer = transferData.station;
          const firstStations = routeStations(transferData.first, start, transfer);
          const secondStations = routeStations(transferData.second, transfer, end);
          await drawLeg(
            transferData.first.number,
            mapStopName(transferData.first, start),
            mapStopName(transferData.first, transfer),
            "#3854e8",
            "B",
            true,
            firstStations.slice(1, -1).map(station => mapStopName(transferData.first, station)),
            firstLive.data,
          );
          await drawLeg(
            transferData.second.number,
            mapStopName(transferData.second, transfer),
            mapStopName(transferData.second, end),
            "#18a56b",
            "C",
            false,
            secondStations.slice(1, -1).map(station => mapStopName(transferData.second, station)),
            secondLive.data,
          );
          const transferLocation = resolveStop(transferData.first.number, mapStopName(transferData.first, transfer), firstLive.data);
          mapRef.current?.panTo(transferLocation);
        } else {
          const stations = routeStations(route, start, end);
          await drawLeg(
            route.number,
            mapStopName(route, start),
            mapStopName(route, end),
            "#3854e8",
            "B",
            true,
            stations.slice(1, -1).map(station => mapStopName(route, station)),
            directLive.data,
          );
        }
        const liveAvailable = route.isTransfer ? Boolean(firstLive.data && secondLive.data) : Boolean(directLive.data);
        setStatus(liveAvailable ? "AYNA xətti ilə sinxronlaşdırılmış Google Maps marşrutu göstərilir" : "AYNA live məlumatı əlçatan deyil; xəritə fallback koordinatlarından istifadə edir");
      } catch {
        setStatus("Bu marşrut üçün Google Maps dayanacaq ünvanını dəqiq tapa bilmədi");
      }
    };
    void run();

    return () => {
      clearOverlays(overlaysRef.current);
      overlaysRef.current = [];
    };
  }, [route, start, end, ready, directLive.data, firstLive.data, secondLive.data]);

  return (
    <Card className="route-map-panel" aria-label="Google Maps marşrut xəritəsi">
      <div className="route-map-header">
        <div><p className="section-kicker">Google Maps</p><h3>Səfər xəritəsi</h3></div>
        <MapPinned size={20} />
      </div>
      {!route || !start || !end ? (
        <div className="route-map-empty"><RouteIcon size={24} /><strong>Marşrut seçin</strong><span>Seçilmiş xəttin minik, mübadilə və düşmə nöqtələri burada görünəcək.</span></div>
      ) : (
        <>
          <MapView initialCenter={{ lat: 40.4093, lng: 49.8671 }} initialZoom={12} onMapReady={map => { mapRef.current = map; setReady(true); }} className="route-map-google" />
          <div className="route-map-status">{status}</div>
          <div className="route-map-points">{points.map(point => <div className={`route-map-point point-${point.label.toLowerCase()}`} key={point.label}><strong>{point.label}</strong><span><b>{point.title}</b><small>{point.detail}</small></span></div>)}</div>
        </>
      )}
    </Card>
  );
}
