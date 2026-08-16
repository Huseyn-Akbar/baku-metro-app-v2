import { useMemo, useState } from "react";
import { ArrowDownUp, BusFront, ChevronRight, CircleHelp, Compass, MapPin, Sparkles, Route as RouteIcon, Coins, Ruler } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { bestDistanceRoute, bestFareRoute, expressRoutes, metroStations, rankRoutes, routesBetween, type BusRoute } from "@shared/transit-data";

const popular = ["28 May", "Nizami", "Elmlər Akademiyası", "20 Yanvar"];

function stopName(route: BusRoute, station: string) {
  return route.stationStops?.[station] ?? station;
}

function fareLabel(route: BusRoute) {
  return route.fareLabel ?? (route.fareAzn !== undefined ? `${route.fareAzn.toFixed(2)} AZN` : "Tarif məlum deyil");
}

export default function Home() {
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [submitted, setSubmitted] = useState<{ start: string; end: string } | null>(null);
  const input = useMemo(() => submitted ?? { start: "", end: "" }, [submitted]);
  const query = trpc.transit.routes.useQuery(input, { enabled: Boolean(submitted?.start && submitted?.end) });
  const localExpress = submitted ? routesBetween(submitted.start, submitted.end, expressRoutes) : [];
  const results = query.data?.routes ?? localExpress;
  const rankedResults = useMemo(() => rankRoutes(results), [results]);
  const distanceBest = useMemo(() => bestDistanceRoute(results), [results]);
  const fareBest = useMemo(() => bestFareRoute(results), [results]);

  const submit = () => {
    if (start && end && start !== end) setSubmitted({ start, end });
  };

  const swap = () => {
    setStart(end);
    setEnd(start);
    if (submitted) setSubmitted({ start: end, end: start });
  };

  const priorityCard = (route: BusRoute | undefined, kind: "distance" | "fare") => {
    if (!route || !submitted) return null;
    const isDistance = kind === "distance";
    return (
      <Card className={`priority-card ${isDistance ? "priority-blue" : "priority-green"}`}>
        <div className="priority-icon">{isDistance ? <Ruler size={18} /> : <Coins size={18} />}</div>
        <div className="priority-copy">
          <span>{isDistance ? "Məsafə üzrə optimal" : "Qiymət üzrə optimal"}</span>
          <strong>{route.number} nömrəli xətt</strong>
          <small>{isDistance ? `${route.distanceKm?.toFixed(1)} km gediləcək yol` : fareLabel(route)}</small>
        </div>
        <div className="priority-route-meta">
          <b>{stopName(route, submitted.start)}</b>
          <ChevronRight size={14} />
          <b>{stopName(route, submitted.end)}</b>
        </div>
      </Card>
    );
  };

  return (
    <main className="app-shell">
      <div className="ambient-glow" />
      <div className="container app-content">
        <header className="topbar">
          <div className="brand-lockup">
            <div className="brand-mark"><span>BM</span></div>
            <div><p className="eyebrow">Bakı nəqliyyatı</p><h1>Metro Marşrut</h1></div>
          </div>
        </header>

        <section className="hero-copy">
          <div className="status-pill"><span className="status-dot" /> Canlı marşrut axtarışı</div>
          <h2>Metrodan metroya<br /><em>ən rahat keçid.</em></h2>
          <p>İki stansiya seçin, sizi birləşdirən avtobus və ekspres xətləri bir baxışda görün.</p>
        </section>

        <Card className="planner-card">
          <div className="planner-heading"><div><p className="section-kicker">Səfərini planla</p><h3>Haradan hara?</h3></div><div className="route-icon"><BusFront size={20} /></div></div>
          <div className="station-stack">
            <label className="station-field"><span className="field-marker origin"><MapPin size={16} /></span><span className="field-text"><small>BAŞLANĞIC STANSİYA</small><select value={start} onChange={e => setStart(e.target.value)} aria-label="Başlanğıc stansiya"><option value="">Stansiya seçin</option>{metroStations.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}</select></span></label>
            <button className="swap-button" onClick={swap} aria-label="Stansiyaları dəyiş"><ArrowDownUp size={16} /></button>
            <label className="station-field"><span className="field-marker destination"><MapPin size={16} /></span><span className="field-text"><small>SON STANSİYA</small><select value={end} onChange={e => setEnd(e.target.value)} aria-label="Son stansiya"><option value="">Stansiya seçin</option>{metroStations.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}</select></span></label>
          </div>
          <Button className="search-button" onClick={submit} disabled={!start || !end || start === end}><Compass size={18} /> Marşrutları göstər <ChevronRight size={18} /></Button>
          {start && end && start === end && <p className="form-hint">Başlanğıc və son stansiya fərqli olmalıdır.</p>}
          <div className="popular-row"><span>Populyar:</span>{popular.map(item => <button key={item} onClick={() => setStart(item)}>{item}</button>)}</div>
        </Card>

        <section className="results-section" aria-live="polite">
          <div className="results-heading"><div><p className="section-kicker">Nəticələr</p><h3>{submitted ? `${submitted.start} → ${submitted.end}` : "Sizə uyğun xətlər"}</h3></div>{submitted && <Badge className="result-count">{results.length} xətt</Badge>}</div>
          {!submitted && <div className="empty-state"><div className="empty-icon"><Sparkles size={21} /></div><p>Başlanğıc və son stansiyanı seçin.</p><span>AYNA MaaS məlumatları və əlavə ekspres xətlər burada görünəcək.</span></div>}
          {submitted && query.isLoading && <div className="empty-state"><div className="loader-ring" /><p>Marşrutlar axtarılır...</p></div>}
          {submitted && !query.isLoading && results.length === 0 && <div className="empty-state"><div className="empty-icon"><BusFront size={21} /></div><p>Bu iki stansiya arasında xətt tapılmadı.</p><span>Başqa stansiya cütlüyü seçərək yenidən yoxlayın.</span></div>}
          {submitted && !query.isLoading && results.length > 0 && <div className="priority-grid">{priorityCard(distanceBest, "distance")}{priorityCard(fareBest, "fare")}</div>}
          <div className="route-list">{rankedResults.map(route => <Card key={route.id} className="route-card"><div className="route-card-top"><div className={`route-number ${route.isExpress ? "express" : ""}`}>{route.number}</div><div className="route-title"><div><h4>{route.title}</h4><p>{route.description}</p></div><div className="route-facts">{route.distanceKm !== undefined && <span><Ruler size={11} /> {route.distanceKm.toFixed(1)} km gediləcək yol</span>}{route.fareAzn !== undefined && <span><Coins size={11} /> {fareLabel(route)}</span>}</div><Badge variant="outline" className="source-badge">{route.source}</Badge></div></div><div className="boarding-row"><span><RouteIcon size={13} /> Min: <strong>{submitted ? stopName(route, submitted.start) : "—"}</strong></span><span><MapPin size={13} /> Düş: <strong>{submitted ? stopName(route, submitted.end) : "—"}</strong></span></div><div className="route-path">{route.stations.map((station, index) => <span key={station} className="path-stop"><i />{station}{index < route.stations.length - 1 && <b />}</span>)}{route.number === "H1" && <span className="path-stop"><i />Hava limanı</span>}</div></Card>)}</div>
          {submitted && <p className="data-note"><CircleHelp size={14} /> {query.data?.source ?? "Statik fallback + Ekspres"}. Rəsmi məlumat yenilənə bilər.</p>}
        </section>

        <section className="info-strip"><div className="mini-icon"><CircleHelp size={17} /></div><div><strong>iPhone-a əlavə edin</strong><p>Safari-də Paylaş düyməsi → “Ana ekrana əlavə et”.</p></div><ChevronRight size={17} /></section>
        <footer><span>AYNA MaaS məlumatları ilə</span><span>•</span><span>v1.0</span><strong>Hüseyn Əkbərov</strong></footer>
      </div>
    </main>
  );
}
