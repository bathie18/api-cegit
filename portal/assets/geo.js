/* Services géographiques des démos.
   En démonstration, le portail interroge directement les services publics OpenStreetMap
   (Nominatim, Photon, OSRM, Valhalla, Overpass) : ce sont les mêmes logiciels que la pile CEGIT.
   Si un service ne répond pas, la démo bascule sur un jeu de données local de démonstration.
   En production, ces appels passeront par la passerelle api.cegitgroup.com. */
(function () {
  const SRC = {
    nominatim: "https://nominatim.openstreetmap.org",
    photon: "https://photon.komoot.io/api/",
    osrm: { auto: "https://routing.openstreetmap.de/routed-car", pedestrian: "https://routing.openstreetmap.de/routed-foot" },
    valhalla: "https://valhalla1.openstreetmap.de",
    overpass: "https://overpass-api.de/api/interpreter",
    dns: "https://dns.google/resolve"
  };

  const COUNTRIES = [
    ["SN", "Sénégal", [14.5, -14.45], 7], ["GM", "Gambie", [13.45, -15.4], 9], ["ML", "Mali", [17.5, -4], 6],
    ["MR", "Mauritanie", [20.2, -10.3], 6], ["GN", "Guinée", [10.4, -10.9], 7], ["GW", "Guinée-Bissau", [12.0, -15.0], 8],
    ["CV", "Cap-Vert", [15.1, -23.6], 8], ["CI", "Côte d'Ivoire", [7.6, -5.5], 7], ["BF", "Burkina Faso", [12.3, -1.6], 7],
    ["NE", "Niger", [17.6, 8.1], 6], ["BJ", "Bénin", [9.3, 2.3], 7], ["TG", "Togo", [8.6, 0.9], 7], ["MA", "Maroc", [31.8, -7.1], 6]
  ];

  /* Localités et quartiers du Sénégal (coordonnées approchées) : repli hors ligne. */
  const GAZ = [
    ["Dakar", 14.6928, -17.4467, "Dakar", "Dakar", "ville"], ["Dakar-Plateau", 14.668, -17.438, "Dakar", "Dakar", "quartier"],
    ["Médina", 14.6808, -17.4497, "Dakar", "Dakar", "quartier"], ["Fann", 14.69, -17.465, "Dakar", "Dakar", "quartier"],
    ["Point E", 14.696, -17.459, "Dakar", "Dakar", "quartier"], ["Mermoz", 14.709, -17.476, "Dakar", "Dakar", "quartier"],
    ["Ouakam", 14.723, -17.489, "Dakar", "Dakar", "quartier"], ["Almadies", 14.744, -17.515, "Dakar", "Dakar", "quartier"],
    ["Ngor", 14.75, -17.515, "Dakar", "Dakar", "quartier"], ["Yoff", 14.756, -17.471, "Dakar", "Dakar", "quartier"],
    ["Grand Yoff", 14.733, -17.451, "Dakar", "Dakar", "quartier"], ["Parcelles Assainies", 14.765, -17.44, "Dakar", "Dakar", "quartier"],
    ["HLM", 14.71, -17.44, "Dakar", "Dakar", "quartier"], ["Sicap Liberté", 14.718, -17.456, "Dakar", "Dakar", "quartier"],
    ["Pikine", 14.7547, -17.39, "Dakar", "Pikine", "ville"], ["Guédiawaye", 14.7764, -17.399, "Dakar", "Guédiawaye", "ville"],
    ["Keur Massar", 14.782, -17.318, "Dakar", "Keur Massar", "ville"], ["Rufisque", 14.7158, -17.2733, "Dakar", "Rufisque", "ville"],
    ["Diamniadio", 14.721, -17.183, "Dakar", "Rufisque", "ville"], ["Bargny", 14.698, -17.226, "Dakar", "Rufisque", "ville"],
    ["Thiès", 14.791, -16.9256, "Thiès", "Thiès", "ville"], ["Mbour", 14.4198, -16.969, "Thiès", "Mbour", "ville"],
    ["Saly Portudal", 14.4461, -17.0128, "Thiès", "Mbour", "ville"], ["Joal-Fadiouth", 14.166, -16.833, "Thiès", "Mbour", "ville"],
    ["Tivaouane", 14.95, -16.82, "Thiès", "Tivaouane", "ville"], ["Saint-Louis", 16.0326, -16.4818, "Saint-Louis", "Saint-Louis", "ville"],
    ["Richard-Toll", 16.4625, -15.7008, "Saint-Louis", "Dagana", "ville"], ["Podor", 16.6517, -14.9592, "Saint-Louis", "Podor", "ville"],
    ["Louga", 15.6144, -16.2286, "Louga", "Louga", "ville"], ["Kébémer", 15.37, -16.45, "Louga", "Kébémer", "ville"],
    ["Linguère", 15.395, -15.119, "Louga", "Linguère", "ville"], ["Diourbel", 14.655, -16.2314, "Diourbel", "Diourbel", "ville"],
    ["Touba", 14.85, -15.8833, "Diourbel", "Mbacké", "ville"], ["Mbacké", 14.79, -15.908, "Diourbel", "Mbacké", "ville"],
    ["Bambey", 14.7, -16.45, "Diourbel", "Bambey", "ville"], ["Fatick", 14.339, -16.4111, "Fatick", "Fatick", "ville"],
    ["Foundiougne", 14.133, -16.467, "Fatick", "Foundiougne", "ville"], ["Kaolack", 14.1652, -16.0726, "Kaolack", "Kaolack", "ville"],
    ["Nioro du Rip", 13.75, -15.8, "Kaolack", "Nioro du Rip", "ville"], ["Kaffrine", 14.1059, -15.5508, "Kaffrine", "Kaffrine", "ville"],
    ["Koungheul", 13.98, -14.8, "Kaffrine", "Koungheul", "ville"], ["Tambacounda", 13.7707, -13.6673, "Tambacounda", "Tambacounda", "ville"],
    ["Bakel", 14.9, -12.46, "Tambacounda", "Bakel", "ville"], ["Kédougou", 12.5579, -12.1743, "Kédougou", "Kédougou", "ville"],
    ["Kolda", 12.8939, -14.9407, "Kolda", "Kolda", "ville"], ["Vélingara", 13.15, -14.11, "Kolda", "Vélingara", "ville"],
    ["Sédhiou", 12.7081, -15.5569, "Sédhiou", "Sédhiou", "ville"], ["Ziguinchor", 12.5681, -16.2719, "Ziguinchor", "Ziguinchor", "ville"],
    ["Bignona", 12.81, -16.23, "Ziguinchor", "Bignona", "ville"], ["Oussouye", 12.485, -16.547, "Ziguinchor", "Oussouye", "ville"],
    ["Cap Skirring", 12.39, -16.746, "Ziguinchor", "Oussouye", "ville"], ["Matam", 15.6559, -13.2554, "Matam", "Matam", "ville"],
    ["Ourossogui", 15.605, -13.32, "Matam", "Matam", "ville"], ["Kanel", 15.49, -13.18, "Matam", "Kanel", "ville"]
  ];

  const REGIONS = {
    "Dakar": ["Dakar", "Guédiawaye", "Keur Massar", "Pikine", "Rufisque"],
    "Diourbel": ["Bambey", "Diourbel", "Mbacké"],
    "Fatick": ["Fatick", "Foundiougne", "Gossas"],
    "Kaffrine": ["Birkelane", "Kaffrine", "Koungheul", "Malem-Hodar"],
    "Kaolack": ["Guinguinéo", "Kaolack", "Nioro du Rip"],
    "Kédougou": ["Kédougou", "Salémata", "Saraya"],
    "Kolda": ["Kolda", "Médina Yoro Foulah", "Vélingara"],
    "Louga": ["Kébémer", "Linguère", "Louga"],
    "Matam": ["Kanel", "Matam", "Ranérou-Ferlo"],
    "Saint-Louis": ["Dagana", "Podor", "Saint-Louis"],
    "Sédhiou": ["Bounkiling", "Goudomp", "Sédhiou"],
    "Tambacounda": ["Bakel", "Goudiry", "Koumpentoum", "Tambacounda"],
    "Thiès": ["Mbour", "Thiès", "Tivaouane"],
    "Ziguinchor": ["Bignona", "Oussouye", "Ziguinchor"]
  };

  /* ---------- Utilitaires ---------- */
  const R = 6371008.8, rad = d => d * Math.PI / 180, deg = r => r * 180 / Math.PI;
  function dist(a, b) { // [lat, lon] → mètres
    const dLat = rad(b[0] - a[0]), dLon = rad(b[1] - a[1]);
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a[0])) * Math.cos(rad(b[0])) * Math.sin(dLon / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(h));
  }
  function dest(p, bearingDeg, m) {
    const br = rad(bearingDeg), d = m / R, la = rad(p[0]), lo = rad(p[1]);
    const la2 = Math.asin(Math.sin(la) * Math.cos(d) + Math.cos(la) * Math.sin(d) * Math.cos(br));
    const lo2 = lo + Math.atan2(Math.sin(br) * Math.sin(d) * Math.cos(la), Math.cos(d) - Math.sin(la) * Math.sin(la2));
    return [deg(la2), deg(lo2)];
  }
  function circle(p, m, n, wobble, seed) { // polygone [lat, lon]
    const r = rng(seed || p[0] * 1000 + p[1]);
    const pts = [];
    for (let i = 0; i < (n || 64); i++) pts.push(dest(p, i * 360 / (n || 64), m * (1 - (wobble || 0) * r())));
    return pts;
  }
  function rng(seed) { let s = Math.abs(Math.floor(seed * 9301 + 49297)) % 233280 || 1; return () => (s = (s * 9301 + 49297) % 233280) / 233280; }
  const fmtKm = m => m < 1000 ? `${Math.round(m)} m` : `${(m / 1000).toLocaleString("fr-FR", { maximumFractionDigits: 1 })} km`;
  const fmtMin = s => s < 3600 ? `${Math.max(1, Math.round(s / 60))} min` : `${Math.floor(s / 3600)} h ${String(Math.round(s % 3600 / 60)).padStart(2, "0")}`;
  const norm = s => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

  async function fetchJSON(url, opts, ms) {
    const ctl = new AbortController();
    const t = setTimeout(() => ctl.abort(), ms || 9000);
    try {
      const r = await fetch(url, Object.assign({ signal: ctl.signal, headers: { "Accept": "application/json" } }, opts || {}));
      if (!r.ok) throw new Error("HTTP " + r.status);
      return await r.json();
    } finally { clearTimeout(t); }
  }

  function nearestGaz(lat, lon, kind) {
    let best = null, bd = Infinity;
    for (const g of GAZ) { if (kind && g[5] !== kind) continue; const d = dist([lat, lon], [g[1], g[2]]); if (d < bd) { bd = d; best = g; } }
    return { g: best, d: bd };
  }
  const gazToPlace = g => ({ label: `${g[0]}, ${g[3] === g[0] ? "" : g[3] + ", "}Sénégal`.replace(", ,", ","), lat: g[1], lon: g[2], address: { quartier: g[5] === "quartier" ? g[0] : "", ville: g[5] === "ville" ? g[0] : g[4], departement: g[4], region: g[3], pays: "Sénégal" }, src: "demo" });

  /* ---------- Géocodage ---------- */
  function addrFromNominatim(a) {
    a = a || {};
    return {
      numero: a.house_number || "", rue: a.road || a.pedestrian || a.footway || "",
      quartier: a.neighbourhood || a.quarter || a.suburb || a.hamlet || "",
      ville: a.city || a.town || a.village || a.municipality || "",
      departement: a.county || a.state_district || "", region: a.state || a.region || "",
      code_postal: a.postcode || "", pays: a.country || ""
    };
  }
  async function search(q, cc, limit, extra) {
    try {
      const u = `${SRC.nominatim}/search?format=jsonv2&addressdetails=1&accept-language=fr&limit=${limit || 5}&q=${encodeURIComponent(q)}` + (cc ? `&countrycodes=${cc.toLowerCase()}` : "") + (extra || "");
      const res = await fetchJSON(u);
      return res.map(r => ({ label: r.display_name, lat: +r.lat, lon: +r.lon, type: r.type, cls: r.category, importance: r.importance, address: addrFromNominatim(r.address), geojson: r.geojson, bbox: r.boundingbox, src: "osm" }));
    } catch (_) {
      const n = norm(q);
      const hits = GAZ.filter(g => n.includes(norm(g[0])) || norm(g[0]).includes(n.split(",")[0].trim()));
      return (hits.length ? hits : [GAZ[0]]).slice(0, limit || 5).map(gazToPlace);
    }
  }
  async function reverse(lat, lon, zoom, extra) {
    try {
      const u = `${SRC.nominatim}/reverse?format=jsonv2&addressdetails=1&accept-language=fr&zoom=${zoom || 18}&lat=${lat}&lon=${lon}` + (extra || "");
      const r = await fetchJSON(u);
      if (r.error) throw new Error(r.error);
      return { label: r.display_name, lat: +r.lat, lon: +r.lon, address: addrFromNominatim(r.address), raw: r, geojson: r.geojson, src: "osm" };
    } catch (_) {
      const { g, d } = nearestGaz(lat, lon);
      const p = gazToPlace(g); p.lat = lat; p.lon = lon; p.distance = d; return p;
    }
  }
  async function suggest(q, cc) {
    if (!q || q.length < 2) return [];
    try {
      const c = COUNTRIES.find(x => x[0] === (cc || "SN"));
      const u = `${SRC.photon}?q=${encodeURIComponent(q)}&lang=fr&limit=8` + (c ? `&lat=${c[2][0]}&lon=${c[2][1]}` : "");
      const res = await fetchJSON(u, null, 5000);
      return res.features
        .filter(f => !cc || (f.properties.countrycode || "").toUpperCase() === cc.toUpperCase())
        .map(f => {
          const p = f.properties;
          const parts = [p.name || [p.housenumber, p.street].filter(Boolean).join(" "), p.district || p.locality, p.city, p.county, p.state].filter(Boolean);
          return { label: [...new Set(parts)].join(", "), lat: f.geometry.coordinates[1], lon: f.geometry.coordinates[0], type: p.osm_value, kind: p.type,
            address: { rue: p.street || "", quartier: p.district || p.locality || "", ville: p.city || "", departement: p.county || "", region: p.state || "", code_postal: p.postcode || "", pays: p.country || "" }, src: "osm" };
        }).slice(0, 6);
    } catch (_) {
      const n = norm(q);
      return GAZ.filter(g => norm(g[0]).startsWith(n) || norm(g[0]).includes(n)).slice(0, 6).map(gazToPlace);
    }
  }

  /* ---------- Itinéraires (OSRM) ---------- */
  const TURN = { "left": "à gauche", "right": "à droite", "slight left": "légèrement à gauche", "slight right": "légèrement à droite", "sharp left": "franchement à gauche", "sharp right": "franchement à droite", "straight": "tout droit", "uturn": "demi-tour" };
  const DIRS = ["le nord", "le nord-est", "l'est", "le sud-est", "le sud", "le sud-ouest", "l'ouest", "le nord-ouest"];
  function instruction(st) {
    const m = st.maneuver || {}, on = st.name ? ` sur ${st.name}` : "", mod = TURN[m.modifier] || "";
    switch (m.type) {
      case "depart": return `Partez vers ${DIRS[Math.round(((m.bearing_after || 0) % 360) / 45) % 8]}${on}`;
      case "arrive": return "Vous êtes arrivé à destination";
      case "roundabout": case "rotary": return `Au rond-point, prenez la ${m.exit || 1}${m.exit === 1 ? "re" : "e"} sortie${on}`;
      case "exit roundabout": case "exit rotary": return `Sortez du rond-point${on}`;
      case "merge": return `Insérez-vous ${mod}${on}`;
      case "on ramp": return `Prenez la bretelle ${mod}${on}`;
      case "off ramp": return `Prenez la sortie ${mod}${on}`;
      case "fork": return `À l'embranchement, restez ${mod}${on}`;
      case "end of road": return `Au bout de la route, tournez ${mod}${on}`;
      case "continue": case "new name": return `Continuez ${mod === "tout droit" || !mod ? "tout droit" : mod}${on}`;
      default: return m.modifier === "uturn" ? `Faites demi-tour${on}` : `Tournez ${mod}${on}`;
    }
  }
  async function route(points, mode) {
    const base = SRC.osrm[mode] || SRC.osrm.auto;
    try {
      const coords = points.map(p => `${p[1]},${p[0]}`).join(";");
      const r = await fetchJSON(`${base}/route/v1/driving/${coords}?overview=full&geometries=geojson&steps=true`, null, 12000);
      if (r.code !== "Ok") throw new Error(r.code);
      const rt = r.routes[0];
      const steps = rt.legs.flatMap(l => l.steps).map(s => ({ text: instruction(s), distance: s.distance, duration: s.duration }));
      return { line: rt.geometry.coordinates.map(c => [c[1], c[0]]), distance: rt.distance, duration: rt.duration, steps, src: "osm" };
    } catch (_) {
      let d = 0; for (let i = 1; i < points.length; i++) d += dist(points[i - 1], points[i]);
      d *= 1.3; const v = mode === "pedestrian" ? 1.3 : 11;
      return { line: points, distance: d, duration: d / v, steps: [{ text: "Itinéraire estimé à vol d'oiseau (service de routage indisponible)", distance: d, duration: d / v }], src: "demo" };
    }
  }
  async function table(sources, dests, mode) {
    const base = SRC.osrm[mode] || SRC.osrm.auto;
    const all = [...sources, ...dests];
    try {
      const coords = all.map(p => `${p[1]},${p[0]}`).join(";");
      const si = sources.map((_, i) => i).join(";"), di = dests.map((_, i) => i + sources.length).join(";");
      const r = await fetchJSON(`${base}/table/v1/driving/${coords}?sources=${si}&destinations=${di}&annotations=distance,duration`, null, 12000);
      if (r.code !== "Ok") throw new Error(r.code);
      return { distances: r.distances, durations: r.durations, src: "osm" };
    } catch (_) {
      const v = mode === "pedestrian" ? 1.3 : 11;
      const distances = sources.map(s => dests.map(t => dist(s, t) * 1.3));
      return { distances, durations: distances.map(row => row.map(x => x / v)), src: "demo" };
    }
  }
  async function nearestRoad(lat, lon) {
    try {
      const r = await fetchJSON(`${SRC.osrm.auto}/nearest/v1/driving/${lon},${lat}?number=1`, null, 8000);
      if (r.code !== "Ok") throw new Error(r.code);
      const w = r.waypoints[0];
      return { name: w.name, lat: w.location[1], lon: w.location[0], distance: w.distance, src: "osm" };
    } catch (_) { return null; }
  }

  /* ---------- Isochrones (Valhalla) ---------- */
  async function isochrone(lat, lon, mode, value, unit) {
    const contour = unit === "km" ? { distance: +value } : { time: +value };
    try {
      const q = { locations: [{ lat, lon }], costing: mode === "pedestrian" ? "pedestrian" : "auto", contours: [contour], polygons: true, denoise: 0.5, generalize: 30 };
      const r = await fetchJSON(`${SRC.valhalla}/isochrone?json=${encodeURIComponent(JSON.stringify(q))}`, null, 15000);
      const f = r.features && r.features[0];
      if (!f) throw new Error("vide");
      const ring = (f.geometry.type === "Polygon" ? f.geometry.coordinates[0] : f.geometry.coordinates[0][0]).map(c => [c[1], c[0]]);
      return { ring, src: "osm" };
    } catch (_) {
      const v = mode === "pedestrian" ? 1.3 : 9;
      const m = unit === "km" ? value * 1000 * 0.75 : value * 60 * v * 0.7;
      return { ring: circle([lat, lon], m, 48, 0.35), src: "demo" };
    }
  }

  /* ---------- Overpass ---------- */
  async function overpass(ql) {
    const r = await fetchJSON(SRC.overpass, { method: "POST", body: "data=" + encodeURIComponent(ql), headers: { "Content-Type": "application/x-www-form-urlencoded" } }, 20000);
    return r.elements || [];
  }
  function elPos(e) { return e.center ? [e.center.lat, e.center.lon] : [e.lat, e.lon]; }

  /* ---------- Limites ---------- */
  async function boundaryByName(name, cc) {
    try {
      const u = `${SRC.nominatim}/search?format=jsonv2&polygon_geojson=1&polygon_threshold=0.001&accept-language=fr&limit=5&q=${encodeURIComponent(name)}&countrycodes=${(cc || "sn").toLowerCase()}`;
      const res = await fetchJSON(u);
      const hit = res.find(r => r.geojson && /Polygon/.test(r.geojson.type)) || null;
      if (!hit) throw new Error("aucune limite");
      return { label: hit.display_name, geojson: hit.geojson, lat: +hit.lat, lon: +hit.lon, src: "osm" };
    } catch (_) {
      const g = GAZ.find(x => norm(name).includes(norm(x[0]))) || GAZ[0];
      const ring = circle([g[1], g[2]], 6000, 40, 0.25).map(p => [p[1], p[0]]);
      ring.push(ring[0]);
      return { label: `${g[0]} (emprise approximative)`, geojson: { type: "Polygon", coordinates: [ring] }, lat: g[1], lon: g[2], src: "demo" };
    }
  }

  /* ---------- Vérifications ---------- */
  async function mx(domain) {
    try {
      const r = await fetchJSON(`${SRC.dns}?name=${encodeURIComponent(domain)}&type=MX`, null, 6000);
      return { ok: r.Status === 0 && Array.isArray(r.Answer) && r.Answer.length > 0, records: (r.Answer || []).map(a => a.data), src: "dns" };
    } catch (_) { return { ok: null, records: [], src: "demo" }; }
  }

  function inPoly(pt, poly) { // pt [lat, lon], poly [[lat, lon]…]
    let c = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const [yi, xi] = poly[i], [yj, xj] = poly[j];
      if (((yi > pt[0]) !== (yj > pt[0])) && (pt[1] < (xj - xi) * (pt[0] - yi) / (yj - yi) + xi)) c = !c;
    }
    return c;
  }

  window.GEO = { SRC, COUNTRIES, GAZ, REGIONS, dist, dest, circle, rng, fmtKm, fmtMin, norm, fetchJSON, nearestGaz, search, reverse, suggest, route, table, nearestRoad, isochrone, overpass, elPos, boundaryByName, mx, inPoly };
})();
