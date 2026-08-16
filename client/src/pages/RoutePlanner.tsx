import React, { useMemo, useState } from "react";
import { ArrowDownUp, BusFront, ChevronRight, CircleHelp, Compass, Download, MapPin, Share2, Sparkles, Route as RouteIcon, Coins, Ruler, Smartphone, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { GoogleRouteMapPanel } from "@/components/GoogleRouteMapPanel";
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
  const [routeNumber, setRouteNumber] = useState("");
  const [submittedRouteNumber, setSubmittedRouteNumber] = useState("");
  const [showIosGuide, setShowIosGuide] = useState(false);
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const input = useMemo(() => submitted ?? { start: "", end: "" }, [submitted]);
  const query = trpc.transit.routes.useQuery(input, { enabled: Boolean(submitted?.start && submitted?.end) });
  const routeNumberQuery = trpc.transit.byNumber.useQuery(
    { number: submittedRouteNumber },
    { enabled: Boolean(submittedRouteNumber) },
  );
  const localExpress = submitted ? routesBetween(submitted.start, submitted.end, expressRoutes) : [];
  const results = query.data?.routes ?? localExpress;
  const rankedResults = useMemo(() => rankRoutes(results), [results]);
  const distanceBest = useMemo(() => bestDistanceRoute(results), [results]);
  const fareBest = useMemo(() => bestFareRoute(results), [results]);
  const mapRoute = rankedResults.find(route => route.id === selectedRouteId) ?? rankedResults[0];

  const submit = () => {
    if (start && end && start !== end) {
      setSubmitted({ start, end });
      setSelectedRouteId(null);
    }
  };

  const submitRouteNumber = () => {
    const value = routeNumber.trim();
    if (value) setSubmittedRouteNumber(value);
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
            <div className="brand-mark" aria-label="Bakı nəqliyyatı loqosu" />
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

        <Card className="route-number-card">
          <div className="planner-heading">
            <div><p className="section-kicker">Xətti tap</p><h3>Marşrut nömrəsi</h3></div>
            <div className="route-icon"><BusFront size={20} /></div>
          </div>
          <p className="route-number-help">Avtobus nömrəsini yazın. Yalnız xəttin 500 metr radiusundan keçdiyi metro stansiyaları göstəriləcək.</p>
          <div className="route-number-form">
            <input
              value={routeNumber}
              onChange={event => setRouteNumber(event.target.value)}
              onKeyDown={event => { if (event.key === "Enter") submitRouteNumber(); }}
              inputMode="text"
              placeholder="Məsələn: 38 və ya M1"
              aria-label="Marşrut nömrəsi"
            />
            <Button className="route-number-button" onClick={submitRouteNumber} disabled={!routeNumber.trim()}><Compass size={16} /> Tap</Button>
          </div>
        </Card>

        {submittedRouteNumber && <section className="route-number-results" aria-live="polite">
          <div className="results-heading"><div><p className="section-kicker">Marşrut üzrə metrolar</p><h3>№ {submittedRouteNumber}</h3></div><Badge className="result-count">500 m radius</Badge></div>
          {routeNumberQuery.isLoading && <div className="empty-state"><div className="loader-ring" /><p>Marşrut axtarılır...</p></div>}
          {!routeNumberQuery.isLoading && (routeNumberQuery.data?.routes.length ?? 0) === 0 && <div className="empty-state"><div className="empty-icon"><BusFront size={21} /></div><p>Bu nömrə üzrə uyğun xətt tapılmadı.</p><span>Yalnız 500 metr radius qaydasına uyğun metro keçidləri göstərilir.</span></div>}
          {!routeNumberQuery.isLoading && (routeNumberQuery.data?.routes.length ?? 0) > 0 && <div className="route-list">{routeNumberQuery.data?.routes.map(route => <Card key={route.id} className={`route-card metro-route-card ${route.isExpress ? "express-result" : ""}`}><div className="route-card-top"><div className={`route-number ${route.isExpress ? "express" : ""}`}>{route.number}</div><div className="route-title"><div><h4>{route.title}</h4><p>{route.isExpress ? "Ekspress xətt" : "AYNA MaaS xətti"} · 500 metr radiusa uyğun</p></div><Badge variant="outline" className={`source-badge ${route.isExpress ? "express-badge" : ""}`}>{route.isExpress ? "Ekspress" : "AYNA MaaS"}</Badge></div></div><div className="metro-station-list">{route.stations.map(station => <span key={station}><MapPin size={13} /> {station}</span>)}</div></Card>)}</div>}
          {routeNumberQuery.data && <p className="data-note"><CircleHelp size={14} /> {routeNumberQuery.data.source}. Metro stansiyaları yalnız 500 m radius qaydasına əsasən seçilib.</p>}
        </section>}

        <section className="results-section" aria-live="polite">
          <div className="results-heading"><div><p className="section-kicker">Nəticələr</p><h3>{submitted ? `${submitted.start} → ${submitted.end}` : "Sizə uyğun xətlər"}</h3></div>{submitted && <Badge className="result-count">{results.length} xətt</Badge>}</div>
          {!submitted && <div className="empty-state"><div className="empty-icon"><Sparkles size={21} /></div><p>Başlanğıc və son stansiyanı seçin.</p><span>AYNA MaaS məlumatları və əlavə ekspres xətlər burada görünəcək.</span></div>}
          {submitted && query.isLoading && <div className="empty-state"><div className="loader-ring" /><p>Marşrutlar axtarılır...</p></div>}
          {submitted && !query.isLoading && results.length === 0 && <div className="empty-state"><div className="empty-icon"><BusFront size={21} /></div><p>Bu iki stansiya arasında xətt tapılmadı.</p><span>Başqa stansiya cütlüyü seçərək yenidən yoxlayın.</span></div>}
          {submitted && !query.isLoading && results.length > 0 && <div className="priority-grid">{priorityCard(distanceBest, "distance")}{priorityCard(fareBest, "fare")}</div>}
          <div className="route-list">{rankedResults.map(route => <Card key={route.id} role="button" tabIndex={0} aria-pressed={selectedRouteId === route.id} onClick={() => setSelectedRouteId(route.id)} onKeyDown={event => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); setSelectedRouteId(route.id); } }} className={`route-card ${selectedRouteId === route.id ? "selected-map-route" : ""}`}><div className="route-card-top"><div className={`route-number ${route.isExpress ? "express" : ""}`}>{route.number}</div><div className="route-title"><div><h4>{route.title}</h4><p>{route.description}</p></div><div className="route-facts">{route.distanceKm !== undefined && <span><Ruler size={11} /> {route.distanceKm.toFixed(1)} km gediləcək yol</span>}{route.fareAzn !== undefined && <span><Coins size={11} /> {fareLabel(route)}</span>}</div><Badge variant="outline" className="source-badge">{route.source}</Badge></div></div>{route.isTransfer && route.transfer && <div className="transfer-steps"><div className="transfer-leg"><span className="transfer-step-number">1</span><span><strong>{route.transfer.first.number} nömrəli avtobus</strong><small>Min: {route.transfer.first.fromStop ?? (submitted ? stopName(route, submitted.start) : "—")} · Düş: {route.transfer.first.toStop ?? route.transfer.station}</small></span></div><div className="transfer-station"><RouteIcon size={13} /> Keçid: <strong>{route.transfer.station}</strong></div><div className="transfer-leg"><span className="transfer-step-number">2</span><span><strong>{route.transfer.second.number} nömrəli avtobus</strong><small>Min: {route.transfer.second.fromStop ?? route.transfer.station} · Düş: {route.transfer.second.toStop ?? (submitted ? stopName(route, submitted.end) : "—")}</small></span></div></div>}
{!route.isTransfer && <div className="boarding-row"><span><RouteIcon size={13} /> Min: <strong>{submitted ? stopName(route, submitted.start) : "—"}</strong></span><span><MapPin size={13} /> Düş: <strong>{submitted ? stopName(route, submitted.end) : "—"}</strong></span></div>}<div className="route-path">{route.stations.map((station, index) => <span key={station} className="path-stop"><i />{station}{index < route.stations.length - 1 && <b />}</span>)}</div></Card>)}</div>
          {submitted && <p className="data-note"><CircleHelp size={14} /> {query.data?.source ?? "Statik fallback + Ekspres"}. Rəsmi məlumat yenilənə bilər.</p>}
        </section>

        <GoogleRouteMapPanel route={mapRoute} start={submitted?.start} end={submitted?.end} />

        <section className="install-actions" aria-label="Tətbiqi quraşdırma seçimləri">
          <button className="install-action ios-action" onClick={() => setShowIosGuide(value => !value)} aria-expanded={showIosGuide}>
            <span className="install-action-icon"><Smartphone size={18} /></span>
            <span><strong>iOS üçün ana ekrana əlavə et</strong><small>Safari ilə tətbiq kimi istifadə edin</small></span>
            {showIosGuide ? <X size={17} /> : <ChevronRight size={17} />}
          </button>
          <a className="install-action android-action" href="/manus-storage/Metro-Marsrut_5bab4618.apk" download="Metro-Marsrut.apk">
            <span className="install-action-icon"><Download size={18} /></span>
            <span><strong>Android APK-nı yüklə</strong><small>Metro Marşrut tətbiqini telefona yükləyin</small></span>
            <Download size={17} />
          </a>
          {showIosGuide && <div className="ios-guide"><div className="ios-guide-title"><Share2 size={16} /><strong>iPhone-da quraşdırma</strong></div><p>Safari-də aşağıdakı <b>Paylaş</b> düyməsinə toxunun, sonra <b>“Ana ekrana əlavə et”</b> seçimini edin.</p></div>}
        </section>
        <footer><span>AYNA MaaS məlumatları ilə</span><span>•</span><span>v1.0</span><strong>Hüseyn Əkbərov</strong></footer>
      </div>
    </main>
  );
}
