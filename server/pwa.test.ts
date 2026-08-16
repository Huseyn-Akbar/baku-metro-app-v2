import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("PWA offline contract", () => {
  it("exposes installable manifest and iPhone metadata", () => {
    const manifest = JSON.parse(readFileSync(resolve(process.cwd(), "client/public/manifest.json"), "utf8"));
    const html = readFileSync(resolve(process.cwd(), "client/index.html"), "utf8");
    expect(manifest.display).toBe("standalone");
    expect(manifest.icons[0].src).toBe("/apple-touch-icon.png");
    expect(html).toContain('rel="manifest" href="/manifest.json"');
    expect(html).toContain('name="apple-mobile-web-app-capable" content="yes"');
    expect(html).toContain('rel="apple-touch-icon" href="/apple-touch-icon.png"');
  });

  it("uses versioned network-first navigation with an offline app-shell fallback", () => {
    const serviceWorker = readFileSync(resolve(process.cwd(), "client/public/sw.js"), "utf8");
    const html = readFileSync(resolve(process.cwd(), "client/index.html"), "utf8");
    expect(serviceWorker).toContain('const CACHE_NAME = "metro-marsrut-v6"');
    expect(serviceWorker).toContain('self.addEventListener("install"');
    expect(serviceWorker).toContain('cache.add(url)');
    expect(serviceWorker).toContain('self.addEventListener("activate"');
    expect(serviceWorker).toContain('self.addEventListener("fetch"');
    expect(serviceWorker).toContain('request.mode === "navigate"');
    expect(serviceWorker).toContain('fetch(request, { cache: "no-store" })');
    expect(serviceWorker).toContain('caches.match("/")');
    expect(html).toContain("/sw.js?v=6");
    expect(html).toContain("metro-marsrut-stale-cache-recovery-v1");
    expect(html).toContain("getRegistrations");
    expect(html).toContain("dynamically imported module");
    expect(html).toContain("updateViaCache: 'none'");
    expect(html).toContain("controllerchange");
  });
});
