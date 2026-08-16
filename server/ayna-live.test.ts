import { afterEach, describe, expect, it, vi } from "vitest";
import { loadAynaLiveRoute } from "./ayna-live";

describe("AYNA live route adapter", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("normalizes official bus detail into directions, flow path, and stop coordinates", async () => {
    vi.stubGlobal("fetch", vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify([{ id: 29, number: "38" }]), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({
        number: "38",
        stops: [
          { stopName: "Ulduz m/st", directionTypeId: 1, stop: { latitude: "40.40", longitude: "49.90" } },
          { stopName: "Nəriman Nərimanov m/st", directionTypeId: 1, stop: { latitude: "40.41", longitude: "49.88" } },
        ],
        routes: [{ directionTypeId: 1, routeDescription: "Ulduz - Nərimanov", flowCoordinates: [{ lat: 40.4, lng: 49.9 }, { lat: 40.41, lng: 49.88 }] }],
      }), { status: 200 })));

    const result = await loadAynaLiveRoute("38");
    expect(result?.number).toBe("38");
    expect(result?.directions[0].coordinates).toHaveLength(2);
    expect(result?.directions[0].stops[1]).toEqual({ name: "Nəriman Nərimanov m/st", lat: 40.41, lng: 49.88 });
  });

  it("returns null when the official API cannot be reached", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    await expect(loadAynaLiveRoute("38")).resolves.toBeNull();
  });
});
