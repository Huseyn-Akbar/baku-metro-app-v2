// @vitest-environment jsdom
import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GoogleRouteMapPanel } from "./GoogleRouteMapPanel";
import { expressRoutes, oneTransferRoutes, routesBetween } from "@shared/transit-data";
import { staticAynaRoutes } from "@shared/ayna-static";
import { mapPointsForRoute } from "@shared/route-map-logic";

vi.mock("@/lib/trpc", () => ({
  trpc: { transit: { aynaRoute: { useQuery: () => ({ data: undefined }) } } },
}));

vi.mock("@/components/Map", () => ({
  MapView: ({ onMapReady }: { onMapReady?: (map: unknown) => void }) => {
    const React = require("react") as typeof import("react");
    React.useEffect(() => onMapReady?.({ panTo: vi.fn() }), [onMapReady]);
    return React.createElement("div", { "data-testid": "google-map-canvas" });
  },
}));

vi.mock("@/components/ui/card", () => ({
  Card: ({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }) => {
    const React = require("react") as typeof import("react");
    return React.createElement("section", props, children);
  },
}));

function setupGoogleMaps() {
  class FakeDirectionsService {
    route = vi.fn().mockResolvedValue({ routes: [{ legs: [] }] });
  }
  class FakeDirectionsRenderer {
    setMap = vi.fn();
  }
  class FakeMarker {
    setMap = vi.fn();
  }
  vi.stubGlobal("google", {
    maps: {
      DirectionsService: FakeDirectionsService,
      DirectionsRenderer: FakeDirectionsRenderer,
      Marker: FakeMarker,
      TravelMode: { DRIVING: "DRIVING" },
    },
  });
}

describe("GoogleRouteMapPanel", () => {
  let host: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
    setupGoogleMaps();
    host = document.createElement("div");
    document.body.appendChild(host);
    root = createRoot(host);
  });

  afterEach(() => {
    act(() => root.unmount());
    host.remove();
    vi.unstubAllGlobals();
  });

  it("renders direct route A/B points and a successful status", async () => {
    const route = routesBetween("28 May", "Nəriman Nərimanov", staticAynaRoutes)[0];
    await act(async () => {
      root.render(<GoogleRouteMapPanel route={route} start="28 May" end="Nəriman Nərimanov" />);
    });
    expect(host.textContent).toContain("A");
    expect(host.textContent).toContain("B");
    expect(host.textContent).toContain("Minik nöqtəsi");
    expect(host.textContent).toContain("Düşmə nöqtəsi");
    expect(host.textContent).toMatch(/AYNA live məlumatı əlçatan deyil|AYNA xətti ilə sinxronlaşdırılmış Google Maps marşrutu göstərilir/);
  });

  it("renders transfer A/B/C points and updates when selected route changes", async () => {
    const transfer = oneTransferRoutes("Ulduz", "Elmlər Akademiyası", [...expressRoutes, ...staticAynaRoutes])[0];
    await act(async () => {
      root.render(<GoogleRouteMapPanel route={transfer} start="Ulduz" end="Elmlər Akademiyası" />);
    });
    expect(host.textContent).toContain("Mübadilə ·");
    expect(host.textContent).toContain("Düşmə ·");
    expect(host.textContent).toContain("38 nömrəli avtobus");
    expect(host.textContent).toContain("17 nömrəli avtobus");
    expect(host.textContent).toContain("C");

    const direct = routesBetween("28 May", "Nəriman Nərimanov", staticAynaRoutes)[0];
    await act(async () => {
      root.render(<GoogleRouteMapPanel route={direct} start="28 May" end="Nəriman Nərimanov" />);
    });
    expect(host.textContent).toContain(mapPointsForRoute(direct, "28 May", "Nəriman Nərimanov")[0].title);
    expect(host.textContent).not.toContain("Mübadilə ·");
  });
});
