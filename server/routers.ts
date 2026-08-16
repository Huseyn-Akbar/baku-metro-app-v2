import { z } from "zod";
import { staticAynaRoutes } from "@shared/ayna-static";
import { COOKIE_NAME } from "@shared/const";
import { expressRoutes, metroStations, oneTransferRoutes, routesBetween, routesByNumber, type BusRoute } from "@shared/transit-data";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { loadAynaLiveRoute, loadAynaRouteNumbers } from "./ayna-live";

const routeSchema = z.object({
  id: z.string(),
  number: z.string(),
  title: z.string(),
  description: z.string(),
  source: z.enum(["AYNA MaaS", "Ekspres", "Transfer"]),
  stations: z.array(z.string()),
  stationStops: z.record(z.string(), z.string()).optional(),
  distanceKm: z.number().optional(),
  fareAzn: z.number().optional(),
  fareLabel: z.string().optional(),
  isExpress: z.boolean().optional(),
});

export async function loadAynaRoutes(): Promise<{ routes: BusRoute[]; live: boolean }> {
  const endpoint = process.env.AYNA_MAAS_API_URL;
  if (!endpoint) {
    const officialNumbers = await loadAynaRouteNumbers();
    if (!officialNumbers) return { routes: staticAynaRoutes, live: false };
    const allowed = new Set(officialNumbers.map(number => number.trim().toLocaleUpperCase("az-AZ")));
    return {
      routes: staticAynaRoutes.filter(route => allowed.has(route.number.trim().toLocaleUpperCase("az-AZ"))),
      live: true,
    };
  }
  try {
    const response = await fetch(endpoint, { headers: { accept: "application/json" }, signal: AbortSignal.timeout(3500) });
    if (!response.ok) return { routes: staticAynaRoutes, live: false };
    const json: unknown = await response.json();
    const parsed = z.array(routeSchema).safeParse(json);
    return parsed.success ? { routes: parsed.data, live: true } : { routes: staticAynaRoutes, live: false };
  } catch {
    return { routes: staticAynaRoutes, live: false };
  }
}

export function mergeTransitRoutes(start: string, end: string, aynaRoutes: BusRoute[], live: boolean) {
  const directRoutes = [...routesBetween(start, end, expressRoutes), ...routesBetween(start, end, aynaRoutes)];
  const transferRoutes = directRoutes.length > 0
    ? []
    : oneTransferRoutes(start, end, [...expressRoutes, ...aynaRoutes]);
  return {
    routes: [...directRoutes, ...transferRoutes],
    source: live ? "AYNA MaaS + Ekspres" : "Statik fallback + Ekspres",
    live,
  };
}

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  transit: router({
    stations: publicProcedure.query(() => metroStations),
    routes: publicProcedure
      .input(z.object({ start: z.string(), end: z.string() }))
      .query(async ({ input }) => {
        const ayna = await loadAynaRoutes();
        return mergeTransitRoutes(input.start, input.end, ayna.routes, ayna.live);
      }),
    aynaRoute: publicProcedure
      .input(z.object({ number: z.string().trim().min(1).max(12) }))
      .query(({ input }) => loadAynaLiveRoute(input.number)),
    byNumber: publicProcedure
      .input(z.object({ number: z.string().trim().min(1).max(12) }))
      .query(async ({ input }) => {
        const ayna = await loadAynaRoutes();
        const routes = routesByNumber(input.number, [...expressRoutes, ...ayna.routes]);
        return {
          number: input.number.trim(),
          routes,
          source: ayna.live ? "AYNA MaaS + Ekspres" : "Statik fallback + Ekspres",
          live: ayna.live,
        };
      }),
  }),
});

export type AppRouter = typeof appRouter;
