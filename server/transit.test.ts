import { describe, expect, it } from "vitest";
import { bestDistanceRoute, bestFareRoute, expressRoutes, metroStations, oneTransferRoutes, rankRoutes, routesBetween, routesByNumber } from "../shared/transit-data";
import { mergeTransitRoutes } from "./routers";
import { staticAynaRoutes } from "../shared/ayna-static";
import { mapPointsForRoute } from "../shared/route-map-logic";
import { routeStopCoordinates, stopCoordinates } from "../shared/stop-coordinates";

describe("metro route matching", () => {

  it("contains all requested metro stations", () => {
    const names = metroStations.map(station => station.name);
    expect(names).toContain("Elmlər Akademiyası");
    expect(names).toContain("28 May");
    expect(names).toContain("Koroğlu");
    expect(names).toContain("Gənclik");
  });

  it("returns M1 for Elmlər Akademiyası to 28 May", () => {
    const routes = routesBetween("Elmlər Akademiyası", "28 May", expressRoutes);
    expect(routes.map(route => route.number)).toContain("M1");
  });

  it("returns M2 and M3 for Nizami to 28 May", () => {
    const routes = routesBetween("Nizami", "28 May", expressRoutes);
    expect(routes.map(route => route.number)).toEqual(expect.arrayContaining(["M2", "M3"]));
  });

  it("loads real AYNA route records into the static fallback", () => {
    expect(staticAynaRoutes.length).toBeGreaterThan(80);
    const routeOne = staticAynaRoutes.find(route => route.number === "1");
    expect(routeOne?.stations).toEqual(expect.arrayContaining(["28 May", "Koroğlu"]));
  });

  it("finds a route by number and returns only its 500m-mapped metro stations", () => {
    const routes = routesByNumber("  m1 ", [...expressRoutes, ...staticAynaRoutes]);
    expect(routes[0]?.number).toBe("M1");
    expect(routes[0]?.stations).toEqual(["Elmlər Akademiyası", "28 May"]);
    expect(routes[0]?.isExpress).toBe(true);
  });

  it("places express routes before AYNA routes when ranking route-number results", () => {
    const routes = routesByNumber("38", [
      { id: "ayna-38", number: "38", title: "AYNA 38", description: "", source: "AYNA MaaS" as const, stations: ["Ulduz", "Gənclik"] },
      { id: "express-38", number: "38", title: "Ekspres 38", description: "", source: "Ekspres" as const, stations: ["Ulduz", "Gənclik"], isExpress: true },
    ]);
    expect(routes.map(route => route.id)).toEqual(["express-38", "ayna-38"]);
  });


  it("keeps every route stop record aligned with its station list", () => {
    for (const route of [...expressRoutes, ...staticAynaRoutes]) {
      expect(Object.keys(route.stationStops ?? {}).every(station => route.stations.includes(station))).toBe(true);
      expect(route.stations.length).toBeGreaterThanOrEqual(2);
    }
  });

  it("keeps transfer legs aligned with the requested start, interchange, and end", () => {
    const transfer = oneTransferRoutes("Ulduz", "Elmlər Akademiyası", [...expressRoutes, ...staticAynaRoutes]).find(route => route.transfer);
    expect(transfer?.transfer).toBeDefined();
    if (!transfer?.transfer) return;
    const { first, second, station } = transfer.transfer;
    expect(first.stations).toContain("Ulduz");
    expect(first.stations).toContain(station);
    expect(second.stations).toContain(station);
    expect(second.stations).toContain("Elmlər Akademiyası");
    expect(first.stationStops?.[station] ?? first.toStop).toBeTruthy();
    expect(second.stationStops?.[station] ?? second.fromStop).toBeTruthy();
  });

  it("creates A/B labels for a direct route and A/B/C labels for a transfer", () => {
    const direct = routesBetween("28 May", "Nəriman Nərimanov", staticAynaRoutes)[0];
    expect(mapPointsForRoute(direct, "28 May", "Nəriman Nərimanov").map(point => point.label)).toEqual(["A", "B"]);

    const transfer = oneTransferRoutes("Ulduz", "Elmlər Akademiyası", [...expressRoutes, ...staticAynaRoutes])[0];
    expect(mapPointsForRoute(transfer, "Ulduz", "Elmlər Akademiyası").map(point => point.label)).toEqual(["A", "B", "C"]);
  });

  it("has coordinate coverage for the selected direct and transfer stop points", () => {
    const directStops = ["Bakı Dəmiryol Vağzalı", "Nəriman Nərimanov m/st"];
    expect(directStops.every(stop => Boolean(stopCoordinates[stop.toLocaleLowerCase("az-AZ")] || routeStopCoordinates[`11|${stop.toLocaleLowerCase("az-AZ")}`]))).toBe(true);
    expect(Object.keys(routeStopCoordinates).some(key => key.startsWith("38|"))).toBe(true);
    expect(Object.keys(routeStopCoordinates).some(key => key.startsWith("17|"))).toBe(true);
  });

  it("returns AYNA bus routes between metro stations", () => {
    const result = mergeTransitRoutes("Sahil", "Nəriman Nərimanov", staticAynaRoutes, false);
    expect(result.routes.some(route => route.number === "5" && route.source === "AYNA MaaS")).toBe(true);
  });

  it("does not treat bus 10 as serving Nəriman Nərimanov", () => {
    const result = mergeTransitRoutes("Nəriman Nərimanov", "28 May", staticAynaRoutes, false);
    expect(result.routes.map(route => route.number)).toEqual(expect.arrayContaining(["2", "4", "5", "11"]));
    expect(result.routes.map(route => route.number)).not.toContain("10");
  });

  it("keeps express fallback routes when AYNA API is unavailable", () => {
    const result = mergeTransitRoutes("Elmlər Akademiyası", "Gənclik", [], false);
    expect(result.live).toBe(false);
    expect(result.source).toBe("Statik fallback + Ekspres");
    expect(result.routes.map(route => route.number)).toContain("M6");
  });

  it("does not return a route for identical stations", () => {
    expect(routesBetween("Nizami", "Nizami", expressRoutes)).toEqual([]);
  });

  it("builds a two-bus option through a shared metro station", () => {
    const routes = [
      { id: "a", number: "A", title: "A xətti", description: "", source: "AYNA MaaS" as const, stations: ["Sahil", "28 May"], stationStops: { Sahil: "Sahil m/st", "28 May": "28 May m/st" }, fareAzn: 0.6, distanceKm: 5 },
      { id: "b", number: "B", title: "B xətti", description: "", source: "AYNA MaaS" as const, stations: ["28 May", "Nəriman Nərimanov"], stationStops: { "28 May": "28 May m/st", "Nəriman Nərimanov": "Nəriman Nərimanov m/st" }, fareAzn: 0.6, distanceKm: 7 },
    ];
    const result = oneTransferRoutes("Sahil", "Nəriman Nərimanov", routes);
    expect(result[0]?.number).toBe("A + B");
    expect(result[0]?.transfer?.station).toBe("28 May");
    expect(result[0]?.transfer?.first.number).toBe("A");
    expect(result[0]?.transfer?.first.fromStop).toBe("Sahil m/st");
    expect(result[0]?.transfer?.first.toStop).toBe("28 May m/st");
    expect(result[0]?.transfer?.second.number).toBe("B");
    expect(result[0]?.transfer?.second.fromStop).toBe("28 May m/st");
    expect(result[0]?.transfer?.second.toStop).toBe("Nəriman Nərimanov m/st");
  });

  it("returns transfer options only when no direct route exists", () => {
    const result = mergeTransitRoutes("İçərişəhər", "Nəriman Nərimanov", staticAynaRoutes, false);
    expect(result.routes.every(route => route.isTransfer)).toBe(true);
    expect(result.routes.some(route => route.transfer?.station)).toBe(true);
  });

  it("keeps H1 limited to 28 May, Koroğlu and the airport", () => {
    const h1 = staticAynaRoutes.find(route => route.number === "H1");
    expect(h1?.stations).toEqual(["28 May", "Koroğlu", "Hava limanı"]);
    expect(h1?.stationStops?.["Hava limanı"]).toBe("Beynəlxalq Hava Limanı Terminal 1");
    expect(h1?.stations).not.toContain("Nəriman Nərimanov");
  });

  it("calculates distance for the selected station segment, not the full line", () => {
    const routes = [
      { id: "long", number: "LONG", title: "Long route", description: "", source: "AYNA MaaS" as const, stations: ["Start", "End", "Mid", "Stop 4", "Stop 5", "Stop 6", "Stop 7", "Stop 8", "Stop 9", "Stop 10", "Last"], distanceKm: 100, fareAzn: 0.6 },
      { id: "short", number: "SHORT", title: "Short route", description: "", source: "AYNA MaaS" as const, stations: ["Start", "End"], distanceKm: 30, fareAzn: 0.6 },
    ];
    const selectedSegmentRoutes = routesBetween("Start", "End", routes);
    expect(selectedSegmentRoutes.find(route => route.number === "LONG")?.distanceKm).toBe(10);
    expect(bestDistanceRoute(selectedSegmentRoutes)?.number).toBe("LONG");
  });

  it("selects distance and fare priorities from real route metadata", () => {
    const routes = [
      { id: "a", number: "A", title: "A", description: "", source: "AYNA MaaS" as const, stations: [], distanceKm: 12.4, fareAzn: 0.6 },
      { id: "b", number: "B", title: "B", description: "", source: "AYNA MaaS" as const, stations: [], distanceKm: 8.2, fareAzn: 0.7 },
    ];
    expect(rankRoutes(routes)[0]?.number).toBe("B");
    expect(bestDistanceRoute(routes)?.number).toBe("B");
    expect(bestFareRoute(routes)?.number).toBe("A");
  });
});
