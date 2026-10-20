/* Démos cartographiques des API CEGIT (fond OpenStreetMap). */
(function () {
  const { APIS, FAMS } = window.CEGIT;
  const { svg, AUTH, esc, toast, copy } = window.CEGIT_UI;
  const G = window.GEO;
  const $ = s => document.querySelector(s);

  /* Accès réservé aux comptes connectés */
  if (!AUTH.get()) {
    try { sessionStorage.setItem("cegit.pending", JSON.stringify({ type: "demo", id: location.hash.slice(1) })); } catch (_) {}
    location.replace("index.html#offres");
    return;
  }

  /* ---------- Carte ---------- */
  const OSM_ATTR = '© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">contributeurs OpenStreetMap</a>';
  const BASES = {
    osm: { label: "OpenStreetMap standard", desc: "Le fond de référence, mis à jour en continu.", url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png", opts: { maxZoom: 19, attribution: OSM_ATTR } },
    hot: { label: "OpenStreetMap humanitaire", desc: "Style HOT, lisible pour les zones rurales et les équipements.", url: "https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png", opts: { maxZoom: 19, attribution: OSM_ATTR + ", style HOT, hébergé par OSM France" } },
    topo: { label: "OpenTopoMap", desc: "Relief et courbes de niveau.", url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png", opts: { maxZoom: 17, attribution: OSM_ATTR + ", SRTM, style © OpenTopoMap (CC-BY-SA)" } }
  };
  const map = L.map("map", { zoomControl: true }).setView([14.5, -14.45], 7);
  map.attributionControl.setPrefix('<a href="https://leafletjs.com" target="_blank" rel="noopener">Leaflet</a>');
  let baseKey = "osm";
  let baseLayer = L.tileLayer(BASES.osm.url, BASES.osm.opts).addTo(map);
  function setBase(k) { map.removeLayer(baseLayer); baseKey = k; baseLayer = L.tileLayer(BASES[k].url, BASES[k].opts).addTo(map); }
  const res = L.layerGroup().addTo(map);
  const ORANGE = "#F39200", ANTH = "#3C3C3B", BLUE = "#2563A8";

  const pinIcon = () => L.divIcon({ className: "mk-pin", html: `<svg width="30" height="40" viewBox="0 0 30 40" aria-hidden="true"><path d="M15 39s13-13.5 13-24A13 13 0 0 0 2 15c0 10.5 13 24 13 24z" fill="${ORANGE}" stroke="#FFFFFF" stroke-width="2"/><circle cx="15" cy="15" r="5" fill="#FFFFFF"/></svg>`, iconSize: [30, 40], iconAnchor: [15, 39] });
  const numIcon = n => L.divIcon({ className: "", html: `<div class="mk-num" style="width:24px;height:24px">${n}</div>`, iconSize: [24, 24], iconAnchor: [12, 12] });
  const labIcon = t => L.divIcon({ className: "", html: `<div class="mk-lab" style="width:28px;height:28px">${t}</div>`, iconSize: [28, 28], iconAnchor: [14, 14] });
  const dotIcon = () => L.divIcon({ className: "", html: `<div class="mk-dot" style="width:12px;height:12px"></div>`, iconSize: [12, 12], iconAnchor: [6, 6] });
  const pin = (lat, lon, title) => L.marker([lat, lon], { icon: pinIcon(), title: title || "" }).addTo(res);
  const fit = (bounds, maxZoom) => { try { map.fitBounds(bounds, { padding: [40, 40], maxZoom: maxZoom || 16 }); } catch (_) {} };

  /* ---------- État et utilitaires d'affichage ---------- */
  const S = { api: null, tab: 0, place: null, run: 0, mode: "auto", draw: null };
  const busyEl = $("#busy");
  let busyN = 0;
  const busy = on => { busyN = Math.max(0, busyN + (on ? 1 : -1)); busyEl.hidden = busyN === 0; };
  const head = h => { $("#head").innerHTML = h; };
  const body = h => { $("#body").innerHTML = h; };
  const debounce = (fn, ms) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };
  const nf = (n, d) => Number(n).toLocaleString("fr-FR", { maximumFractionDigits: d == null ? 0 : d });
  const srcTag = src => src === "osm" ? `<p class="src">Données OpenStreetMap en direct</p>` : src === "dns" ? `<p class="src">Vérification DNS en direct</p>` : `<p class="src demo">Données de démonstration</p>`;
  const kv = rows => `<dl class="kv">${rows.filter(Boolean).map(([k, v, w]) => `<div class="${w ? "wide" : ""}"><dt>${esc(k)}</dt><dd>${v === "" || v == null ? "—" : v}</dd></div>`).join("")}</dl>`;
  const tbl = (hs, rows) => `<table class="tbl">${hs.some(Boolean) ? `<thead><tr>${hs.map(h => `<th>${esc(h)}</th>`).join("")}</tr></thead>` : ""}<tbody>${rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join("")}</tr>`).join("")}</tbody></table>`;
  const acc = (title, inner, open) => `<details class="acc"${open ? " open" : ""}><summary>${title}${svg("chevron", 18)}</summary>${inner}</details>`;
  const LV = { "Très élevé": "#B3261E", "Élevé": "#E4572E", "Fort": "#E4572E", "Moyen": "#F39200", "Modéré": "#F39200", "Faible": "#7BAE7F", "Très faible": "#4C8C5A", "Minimal": "#4C8C5A" };
  const lvl = t => `<span class="lvl"><i style="background:${LV[t] || "#999"}"></i>${esc(t)}</span>`;
  const empty = (ico, text) => `<div class="empty-state">${svg(ico, 34)}<p>${text}</p></div>`;
  const countryOptions = sel => G.COUNTRIES.map(c => `<option value="${c[0]}"${c[0] === (sel || "SN") ? " selected" : ""}>${esc(c[1])}</option>`).join("");
  const regionOptions = (sel, blank) => (blank ? `<option value="">${blank}</option>` : "") + Object.keys(G.REGIONS).map(r => `<option${r === sel ? " selected" : ""}>${esc(r)}</option>`).join("");
  const deptOptions = (reg, sel, blank) => (blank ? `<option value="">${blank}</option>` : "") + (G.REGIONS[reg] || []).map(d => `<option${d === sel ? " selected" : ""}>${esc(d)}</option>`).join("");
  const segHtml = (id, opts, val) => `<div class="seg" id="${id}" role="group">${opts.map(([v, l]) => `<button type="button" data-v="${v}" aria-pressed="${v === val}">${l}</button>`).join("")}</div>`;
  function bindSeg(id, onChange) {
    const el = document.getElementById(id); if (!el) return;
    el.querySelectorAll("button").forEach(b => b.onclick = () => { el.querySelectorAll("button").forEach(x => x.setAttribute("aria-pressed", String(x === b))); onChange(b.dataset.v); });
  }
  const segVal = id => document.querySelector(`#${id} [aria-pressed="true"]`)?.dataset.v;
  function seeded(p, salt) { return G.rng(Math.abs(Math.round(p.lat * 1e4) * 31 + Math.round(p.lon * 1e4) * 17 + (salt || 0))); }
  function ringToLatLng(ring) { return ring.map(c => [c[1], c[0]]); }
  function drawGeoJSON(g, color, fill) {
    if (!g) return null;
    const lyr = L.geoJSON(g, { style: { color: color || BLUE, weight: 2, fillColor: color || BLUE, fillOpacity: fill == null ? 0.18 : fill } }).addTo(res);
    return lyr;
  }

  /* Suggestions d'adresses */
  function bindAC(input, onPick, cc) {
    const wrap = input.closest(".ac"); if (!wrap) return;
    let list = wrap.querySelector(".ac-list");
    if (!list) { list = document.createElement("ul"); list.className = "ac-list"; list.hidden = true; list.setAttribute("role", "listbox"); wrap.appendChild(list); }
    let items = [], token = 0;
    const close = () => { list.hidden = true; };
    const run = debounce(async () => {
      const q = input.value.trim(), my = ++token;
      if (q.length < 2) { close(); return; }
      const r = await G.suggest(q, typeof cc === "function" ? cc() : cc);
      if (my !== token) return;
      items = r;
      list.innerHTML = r.map((s, i) => `<li role="option" data-i="${i}">${esc(s.label.split(",")[0])}<small>${esc(s.label.split(",").slice(1).join(",").trim())}</small></li>`).join("");
      list.hidden = !r.length;
    }, 280);
    input.addEventListener("input", run);
    input.addEventListener("keydown", e => { if (e.key === "Escape") close(); });
    input.addEventListener("blur", () => setTimeout(close, 180));
    list.addEventListener("mousedown", e => {
      const li = e.target.closest("li"); if (!li) return;
      e.preventDefault(); const s = items[+li.dataset.i]; input.value = s.label; close(); onPick(s);
    });
  }

  /* ---------- Sélecteur d'API ---------- */
  const DEMOS = {};
  const swBtn = $("#sw-btn"), swMenu = $("#sw-menu");
  $("#sw-mark").innerHTML = svg("pin", 20);
  $("#sw-chev").innerHTML = svg("chevron", 18);
  $("#sw-back").innerHTML = `${svg("back", 16)} Retour au portail`;
  function renderSwitcher() {
    $("#sw-list").innerHTML = FAMS.map((f, i) => {
      const list = APIS.filter(a => a.fam === i && DEMOS[a.id]);
      return list.length ? `<div class="sw-group">${esc(f)}</div>` + list.map(a => `<button class="sw-item" type="button" data-api="${a.id}" aria-current="${S.api && S.api.id === a.id}">${svg(a.ico, 18)}${esc(a.name)}</button>`).join("") : "";
    }).join("");
    $("#sw-list").querySelectorAll("[data-api]").forEach(b => b.onclick = () => { closeSw(); openApi(b.dataset.api); });
  }
  const closeSw = () => { swMenu.hidden = true; swBtn.setAttribute("aria-expanded", "false"); };
  swBtn.onclick = e => { e.stopPropagation(); swMenu.hidden = !swMenu.hidden; swBtn.setAttribute("aria-expanded", String(!swMenu.hidden)); };
  document.addEventListener("click", e => { if (!e.target.closest(".switcher")) closeSw(); });

  function openApi(id) {
    const a = APIS.find(x => x.id === id && DEMOS[x.id]) || APIS.find(x => x.id === "geocodage");
    S.api = a; S.tab = 0; S.place = null; stopDraw();
    $("#sw-name").textContent = a.name;
    document.title = `${a.name} · Démos API CEGIT`;
    try { history.replaceState(null, "", "#" + a.id); } catch (_) {}
    renderSwitcher(); renderTabs(); renderTab();
  }
  window.addEventListener("hashchange", () => { const id = location.hash.slice(1); if (!S.api || id !== S.api.id) openApi(id); });

  function renderTabs() {
    const tabs = DEMOS[S.api.id].tabs;
    const el = $("#tabs");
    el.innerHTML = tabs.map((t, i) => `<button class="vtab" type="button" role="tab" aria-selected="${i === S.tab}" data-t="${i}">${esc(t.label)}</button>`).join("");
    el.hidden = DEMOS[S.api.id].card || false;
    document.body.classList.toggle("has-tabs", !el.hidden);
    el.querySelectorAll("[data-t]").forEach(b => b.onclick = () => { S.tab = +b.dataset.t; stopDraw(); renderTabs(); renderTab(); });
  }

  function renderTab() {
    const d = DEMOS[S.api.id], t = d.tabs[S.tab];
    res.clearLayers(); S.run++;
    document.body.classList.toggle("card-mode", !!d.card);
    $("#vcard").hidden = !d.card;
    if (d.card) { t.render($("#vcard")); setTimeout(() => map.invalidateSize(), 50); return; }
    setTimeout(() => map.invalidateSize(), 50);
    if (t.type === "place") renderPlaceTab(t); else t.render();
  }

  /* ---------- Onglets « adresse → résultats » ---------- */
  function addrHeader(opts) {
    opts = opts || {};
    return `<form id="addr-form" class="addr" autocomplete="off">
      ${opts.noCountry ? "" : `<div class="field"><label for="addr-cc">Pays</label><select id="addr-cc">${countryOptions(S.cc)}</select></div>`}
      <div class="field ac"><label for="addr-q">${esc(opts.label || "Adresse ou lieu")}</label><input id="addr-q" placeholder="Commencez à saisir une adresse, une localité…" value="${esc(opts.value || "")}"></div>
      <div class="actions"><button class="btn btn-primary btn-sm" type="submit">${svg("search", 16)} Recherche</button></div>
      <div class="or">ou</div>
      <p class="hint">Cliquez sur la carte pour commencer.</p>
    </form>`;
  }
  function bindAddrHeader(onPlace) {
    const f = $("#addr-form"); if (!f) return;
    const cc = () => ($("#addr-cc") ? $("#addr-cc").value : "SN");
    $("#addr-cc")?.addEventListener("change", e => { S.cc = e.target.value; const c = G.COUNTRIES.find(x => x[0] === S.cc); if (c) map.setView(c[2], c[3]); });
    bindAC($("#addr-q"), onPlace, cc);
    f.addEventListener("submit", async e => {
      e.preventDefault();
      const q = $("#addr-q").value.trim(); if (!q) { $("#addr-q").focus(); return; }
      busy(true); const r = await G.search(q, cc(), 1); busy(false);
      if (!r.length) { toast("Aucun résultat pour cette adresse."); return; }
      onPlace(r[0]);
    });
  }
  function placeBar(p) {
    return `<div class="place-bar"><span>${esc(p.label)}</span><button type="button" id="change-place" aria-label="Changer d'adresse" title="Changer d'adresse">${svg("search", 18)}</button></div>`;
  }
  function setPlace(p) { S.place = p; renderTab(); }
  async function renderPlaceTab(t) {
    const p = S.place;
    head(p ? placeBar(p) : addrHeader(t.addr));
    if (p) $("#change-place").onclick = () => { S.place = null; renderTab(); setTimeout(() => $("#addr-q")?.focus(), 30); };
    else bindAddrHeader(setPlace);
    const form = t.form ? `<div class="body-form" id="tab-form">${t.form()}</div>` : "";
    body(form + `<div id="out">${p ? "" : empty(t.ico || S.api.ico, t.prompt || "Saisissez une adresse ou cliquez sur la carte.")}</div>`);
    if (t.bind) t.bind(() => p && runPlace(t));
    if (p) runPlace(t);
  }
  async function runPlace(t) {
    const p = S.place, my = ++S.run;
    res.clearLayers();
    pin(p.lat, p.lon, p.label);
    if (!t.noZoom) map.setView([p.lat, p.lon], Math.max(map.getZoom(), t.zoom || 15));
    $("#out").innerHTML = `<p class="r-sub">Calcul en cours…</p>`;
    busy(true);
    let html;
    try { html = await t.run(p, () => my === S.run); }
    catch (err) { html = `<p class="note">Le calcul a échoué : ${esc(err.message || err)}. Réessayez dans un instant.</p>`; }
    busy(false);
    if (my !== S.run) return;
    $("#out").innerHTML = html;
    if (t.after) t.after();
  }

  /* Clic sur la carte */
  map.on("click", async e => {
    if (S.draw) { addVertex(e.latlng); return; }
    if (!S.api) return;
    const d = DEMOS[S.api.id]; if (d.card) return;
    const t = d.tabs[S.tab];
    if (t.onMap) { t.onMap(e.latlng); return; }
    if (t.type !== "place") return;
    busy(true);
    const p = await G.reverse(e.latlng.lat, e.latlng.lng);
    busy(false);
    p.lat = e.latlng.lat; p.lon = e.latlng.lng;
    setPlace(p);
  });

  /* ---------- Dessin de polygone ---------- */
  let drawLine = null;
  function startDraw(onDone) {
    stopDraw(); S.draw = { pts: [], onDone };
    document.body.classList.add("map-draw");
    toast("Cliquez sur la carte pour placer les sommets, puis « Terminer ».");
  }
  function addVertex(ll) {
    S.draw.pts.push([ll.lat, ll.lng]);
    if (drawLine) map.removeLayer(drawLine);
    drawLine = L.polygon(S.draw.pts, { color: ORANGE, weight: 2, dashArray: "5 5", fillOpacity: 0.1 }).addTo(map);
    const ta = $("#poly-coords"); if (ta) ta.value = JSON.stringify(S.draw.pts.map(p => [+p[1].toFixed(5), +p[0].toFixed(5)]));
  }
  function stopDraw(finish) {
    const d = S.draw; S.draw = null;
    document.body.classList.remove("map-draw");
    if (drawLine) { map.removeLayer(drawLine); drawLine = null; }
    if (finish && d && d.onDone) d.onDone(d.pts);
  }
  function polyHeader(extra) {
    return `<div class="field"><label for="poly-coords">Coordonnées du polygone (longitude, latitude)</label><textarea id="poly-coords" rows="4" spellcheck="false" placeholder="[[-17.46,14.69],[-17.44,14.69],[-17.44,14.70]]"></textarea></div>
      ${extra || ""}
      <div class="actions"><button class="btn btn-ghost btn-sm" type="button" id="poly-draw" style="color:#FFFFFF;border-color:rgba(255,255,255,.4)">${svg("draw", 16)} Dessiner</button><button class="btn btn-ghost btn-sm" type="button" id="poly-end" style="color:#FFFFFF;border-color:rgba(255,255,255,.4)">Terminer</button><button class="btn btn-primary btn-sm" type="button" id="poly-go">${svg("search", 16)} Recherche</button></div>`;
  }
  function readPoly() {
    try {
      const a = JSON.parse($("#poly-coords").value);
      if (!Array.isArray(a) || a.length < 3) throw 0;
      return a.map(c => [+c[1], +c[0]]);
    } catch (_) { toast("Dessinez ou collez au moins trois sommets."); return null; }
  }
  function bindPoly(onGo) {
    $("#poly-draw").onclick = () => startDraw();
    $("#poly-end").onclick = () => { if (S.draw && S.draw.pts.length >= 3) stopDraw(); else toast("Placez au moins trois sommets."); };
    $("#poly-go").onclick = () => { if (S.draw) stopDraw(); const poly = readPoly(); if (poly) onGo(poly); };
  }
  const polyQL = poly => `poly:"${poly.map(p => `${p[0].toFixed(5)} ${p[1].toFixed(5)}`).join(" ")}"`;
  function geojsonToPoly(g) {
    if (!g) return null;
    const ring = g.type === "Polygon" ? g.coordinates[0] : g.type === "MultiPolygon" ? g.coordinates.reduce((a, b) => (b[0].length > a[0].length ? b : a))[0] : null;
    if (!ring) return null;
    const step = Math.max(1, Math.ceil(ring.length / 120));
    return ring.filter((_, i) => i % step === 0).map(c => [c[1], c[0]]);
  }

  /* ---------- Requêtes Overpass ---------- */
  async function around(filters, p, radius, limit) {
    const ql = `[out:json][timeout:25];(${filters.map(f => `nwr${f}(around:${radius},${p.lat},${p.lon});`).join("")});out center tags ${limit || 80};`;
    const els = await G.overpass(ql);
    return els.map(e => ({ e, pos: G.elPos(e), d: G.dist([p.lat, p.lon], G.elPos(e)) })).filter(x => x.pos[0]).sort((a, b) => a.d - b.d);
  }
  function fakePOIs(p, n, label, radius, salt) {
    const r = seeded(p, salt || 7);
    return Array.from({ length: n }, (_, i) => {
      const pos = G.dest([p.lat, p.lon], r() * 360, (0.15 + r() * 0.85) * radius);
      return { e: { tags: { name: `${label} (exemple ${i + 1})` } }, pos, d: G.dist([p.lat, p.lon], pos), fake: true };
    }).sort((a, b) => a.d - b.d);
  }

  /* ==========================================================
     Définition des démos, API par API
     ========================================================== */

  /* --- Géocodage --- */
  DEMOS["geocodage"] = { tabs: [
    { label: "Géocodage direct", render() {
      head(`<form id="gf" autocomplete="off"><div class="field"><label for="g-cc">Pays</label><select id="g-cc">${countryOptions(S.cc)}</select></div>
        <div class="field ac"><label for="g-q">Adresse, lieu-dit ou repère</label><input id="g-q" placeholder="Ex. Avenue Lamine Guèye, Dakar"></div>
        <div class="actions"><button class="btn btn-primary btn-sm" type="submit">Géocodage direct</button></div></form>`);
      body(empty("globe", "Saisissez une adresse : les candidats s'affichent ici, classés par pertinence."));
      bindAC($("#g-q"), s => go(s.label), () => $("#g-cc").value);
      $("#gf").addEventListener("submit", e => { e.preventDefault(); go($("#g-q").value.trim()); });
      async function go(q) {
        if (!q) return;
        busy(true); const r = await G.search(q, $("#g-cc").value, 5); busy(false);
        res.clearLayers();
        if (!r.length) { body(empty("globe", "Aucun résultat. Vérifiez l'orthographe ou élargissez la recherche.")); return; }
        r.forEach((x, i) => L.marker([x.lat, x.lon], { icon: numIcon(i + 1) }).addTo(res));
        fit(r.map(x => [x.lat, x.lon]), 16);
        body(srcTag(r[0].src) + `<p class="r-title">${r.length} candidat${r.length > 1 ? "s" : ""}</p><ol class="list-num">${r.map((x, i) => `<li data-i="${i}"><span class="num">${i + 1}</span><span>${esc(x.label)}<br><small class="mono">${x.lat.toFixed(5)}, ${x.lon.toFixed(5)}</small></span><em>${esc(x.type || x.address.quartier || "")}</em></li>`).join("")}</ol>`);
        document.querySelectorAll(".list-num li").forEach(li => li.onclick = () => { const x = r[+li.dataset.i]; map.setView([x.lat, x.lon], 17); });
      }
    } },
    { label: "Géocodage inverse", render() {
      head(`<form id="rf" autocomplete="off"><div class="row"><div class="field"><label for="r-lat">Latitude</label><input id="r-lat" inputmode="decimal" placeholder="14.6928"></div><div class="field"><label for="r-lon">Longitude</label><input id="r-lon" inputmode="decimal" placeholder="-17.4467"></div></div>
        <div class="actions"><button class="btn btn-primary btn-sm" type="submit">Géocodage inverse</button></div><div class="or">ou</div><p class="hint">Cliquez sur la carte pour commencer.</p></form>`);
      body(empty("globe", "Cliquez sur la carte ou saisissez des coordonnées pour obtenir l'adresse la plus proche."));
      $("#rf").addEventListener("submit", e => { e.preventDefault(); const la = parseFloat($("#r-lat").value.replace(",", ".")), lo = parseFloat($("#r-lon").value.replace(",", ".")); if (isNaN(la) || isNaN(lo)) { toast("Saisissez une latitude et une longitude."); return; } rev(la, lo); });
    }, onMap(ll) { $("#r-lat").value = ll.lat.toFixed(6); $("#r-lon").value = ll.lng.toFixed(6); rev(ll.lat, ll.lng); } }
  ] };
  async function rev(lat, lon) {
    busy(true); const r = await G.reverse(lat, lon); busy(false);
    res.clearLayers(); pin(lat, lon); L.marker([r.lat, r.lon], { icon: dotIcon() }).addTo(res);
    const a = r.address, d = G.dist([lat, lon], [r.lat, r.lon]);
    body(srcTag(r.src) + `<p class="r-title">${esc(r.label)}</p>` + kv([["Numéro", esc(a.numero)], ["Voie", esc(a.rue)], ["Quartier", esc(a.quartier)], ["Ville ou commune", esc(a.ville)], ["Département", esc(a.departement)], ["Région", esc(a.region)], ["Pays", esc(a.pays)], ["Distance au point cliqué", G.fmtKm(d)], ["Coordonnées", `<span class="mono">${lat.toFixed(5)}, ${lon.toFixed(5)}</span>`, 1]]));
  }

  /* --- Saisie automatique d'adresse --- */
  DEMOS["saisie-adresse"] = { tabs: [
    { label: "Lieux", render() {
      head(`<div class="field"><label for="sa-cc">Pays</label><select id="sa-cc">${countryOptions(S.cc)}</select></div>
        <div class="field ac"><label for="sa-q">Adresse</label><input id="sa-q" placeholder="Commencez à saisir une adresse, une localité…" autocomplete="off"></div>
        <label class="check"><input type="checkbox" id="sa-admin"> Afficher uniquement les zones administratives (villes, quartiers)</label>`);
      body(`<div class="body-form"><div class="field"><label for="sa-v">Ville ou commune</label><input id="sa-v" readonly></div><div class="row"><div class="field"><label for="sa-r">Région</label><input id="sa-r" readonly></div><div class="field"><label for="sa-cp">Code postal</label><input id="sa-cp" readonly></div></div></div><div id="out">${empty("gauge", "Les suggestions apparaissent sous le champ dès deux caractères.")}</div>`);
      bindAC2("#sa-q", () => $("#sa-cc").value, () => $("#sa-admin").checked, null);
    } },
    { label: "Adresse IP", render() {
      head(`<div class="field"><label for="sa-ip">Adresse IP</label><input id="sa-ip" placeholder="41.82.10.20" disabled></div>
        <label class="check"><input type="checkbox" id="sa-auto" checked> Détection automatique de l'adresse IP</label>
        <div class="row"><div class="field"><label for="sa-rad">Rayon de recherche</label><input id="sa-rad" type="number" min="1" value="25"></div><div class="field"><label for="sa-unit">Unité</label><select id="sa-unit"><option value="km">Kilomètres</option><option value="m">Mètres</option></select></div></div>
        <div class="field ac"><label for="sa-q">Adresse</label><input id="sa-q" placeholder="Commencez à saisir une adresse, une localité…" autocomplete="off"></div>`);
      body(`<div id="out">${empty("gauge", "Les suggestions sont limitées au rayon autour de la position déduite de l'adresse IP.")}</div>`);
      $("#sa-auto").onchange = e => { $("#sa-ip").disabled = e.target.checked; };
      bindAC2("#sa-q", () => "SN", () => false, () => {
        const ip = $("#sa-auto").checked ? "" : $("#sa-ip").value.trim();
        const loc = ipLocate(ip || "41.82.0.1");
        const m = (+$("#sa-rad").value || 25) * ($("#sa-unit").value === "km" ? 1000 : 1);
        return { loc, m };
      });
    } }
  ] };
  function bindAC2(sel, cc, adminOnly, zoneFn) {
    const input = $(sel);
    const run = debounce(async () => {
      const q = input.value.trim(); if (q.length < 2) return;
      let r = await G.suggest(q, cc());
      if (adminOnly()) r = r.filter(x => /city|town|village|suburb|neighbourhood|quarter|county|state|district|locality|hamlet/.test((x.type || "") + " " + (x.kind || "")));
      res.clearLayers();
      let zone = null;
      if (zoneFn) {
        zone = zoneFn();
        L.circle([zone.loc.lat, zone.loc.lon], { radius: zone.m, color: ORANGE, weight: 1.5, fillOpacity: 0.06 }).addTo(res);
        L.marker([zone.loc.lat, zone.loc.lon], { icon: labIcon("IP") }).addTo(res);
        r = r.map(x => Object.assign(x, { d: G.dist([zone.loc.lat, zone.loc.lon], [x.lat, x.lon]) })).filter(x => x.d <= zone.m).sort((a, b) => a.d - b.d);
      }
      r.forEach((x, i) => L.marker([x.lat, x.lon], { icon: numIcon(i + 1) }).addTo(res));
      if (r.length) fit(r.map(x => [x.lat, x.lon]).concat(zone ? [[zone.loc.lat, zone.loc.lon]] : []), 15);
      else if (zone) map.setView([zone.loc.lat, zone.loc.lon], 10);
      $("#out").innerHTML = (r.length ? srcTag(r[0].src) : "") + (zone ? `<p class="r-sub">Position déduite de l'adresse IP : ${esc(zone.loc.ville)} (précision ± ${zone.loc.prec} km)</p>` : "") +
        (r.length ? `<ol class="list-num">${r.map((x, i) => `<li data-i="${i}"><span class="num">${i + 1}</span><span>${esc(x.label)}</span><em>${x.d != null ? G.fmtKm(x.d) : esc(x.type || "")}</em></li>`).join("")}</ol>` : empty("gauge", "Aucune suggestion dans cette zone."));
      document.querySelectorAll("#out .list-num li").forEach(li => li.onclick = () => {
        const x = r[+li.dataset.i]; input.value = x.label; map.setView([x.lat, x.lon], 17);
        if ($("#sa-v")) { $("#sa-v").value = x.address.ville || x.address.quartier || ""; $("#sa-r").value = x.address.region || ""; $("#sa-cp").value = x.address.code_postal || ""; }
      });
    }, 300);
    input.addEventListener("input", run);
  }
  function ipLocate(ip) {
    const PREF = [["41.82.", "Dakar"], ["41.83.", "Dakar"], ["41.208.", "Dakar"], ["41.214.", "Thiès"], ["154.124.", "Dakar"], ["154.125.", "Touba"], ["196.207.", "Dakar"], ["196.1.", "Saint-Louis"], ["102.164.", "Kaolack"], ["197.149.", "Ziguinchor"]];
    const hit = PREF.find(p => ip.startsWith(p[0]));
    let g = hit ? G.GAZ.find(x => x[0] === hit[1]) : null;
    if (!g) { let h = 0; for (const c of ip) h = (h * 31 + c.charCodeAt(0)) % 9973; const towns = G.GAZ.filter(x => x[5] === "ville"); g = towns[h % towns.length]; }
    return { lat: g[1], lon: g[2], ville: g[0], prec: hit ? 15 : 50, operateur: hit ? (/^(154)/.test(ip) ? "Yas (ex-Free)" : "Orange (Sonatel)") : "Inconnu" };
  }

  /* --- Saisie d'adresses Entreprise --- */
  function entFields() { return `<div class="row3" style="grid-template-columns:1fr 1fr 1fr"><div class="field"><label for="e-v">Ville</label><input id="e-v" readonly></div><div class="field"><label for="e-d">Département</label><input id="e-d" readonly></div><div class="field"><label for="e-r">Région</label><input id="e-r" readonly></div></div>`; }
  function entFill(x) {
    $("#e-v").value = x.address.ville || x.address.quartier || ""; $("#e-d").value = x.address.departement || ""; $("#e-r").value = x.address.region || "";
    res.clearLayers(); pin(x.lat, x.lon); map.setView([x.lat, x.lon], 16);
    $("#out").innerHTML = srcTag(x.src) + `<p class="r-title">${esc(x.label)}</p>` + kv([["Latitude", x.lat.toFixed(6)], ["Longitude", x.lon.toFixed(6)]]);
  }
  DEMOS["saisie-adresse-entreprise"] = { tabs: [
    { label: "Saisie anticipée", render() {
      head(`<div class="field"><label for="e-cc">Pays</label><select id="e-cc">${countryOptions(S.cc)}</select></div><div class="field ac"><label for="e-q">Saisissez l'adresse</label><input id="e-q" placeholder="Commencez à saisir une adresse, une localité…" autocomplete="off"></div>${entFields()}<div class="actions"><button class="btn btn-ghost btn-sm" type="button" id="e-clear" style="color:#FFFFFF;border-color:rgba(255,255,255,.4)">Effacer</button></div>`);
      body(`<div id="out">${empty("building", "Choisissez une suggestion : les champs ville, département et région se remplissent seuls.")}</div>`);
      bindAC($("#e-q"), entFill, () => $("#e-cc").value);
      $("#e-clear").onclick = () => { ["#e-q", "#e-v", "#e-d", "#e-r"].forEach(s => { $(s).value = ""; }); res.clearLayers(); };
    } },
    { label: "Recherche par lieu", render() {
      head(`<div class="row"><div class="field"><label for="e-rad">Rayon de recherche</label><input id="e-rad" type="number" min="1" value="5"></div><div class="field"><label for="e-unit">Unité</label><select id="e-unit"><option value="km">Kilomètres</option><option value="m">Mètres</option></select></div></div>
        <div class="field ac"><label for="e-q">Adresse</label><input id="e-q" placeholder="Commencez à saisir une adresse, une localité…" autocomplete="off"></div>${entFields()}<p class="hint" style="font-weight:400">La recherche est centrée sur le centre de la carte.</p>`);
      body(`<div id="out">${empty("building", "Déplacez la carte sur la zone voulue, puis saisissez l'adresse.")}</div>`);
      const input = $("#e-q");
      input.addEventListener("input", debounce(async () => {
        const q = input.value.trim(); if (q.length < 2) return;
        const c = map.getCenter(), m = (+$("#e-rad").value || 5) * ($("#e-unit").value === "km" ? 1000 : 1);
        const r = (await G.suggest(q, null)).map(x => Object.assign(x, { d: G.dist([c.lat, c.lng], [x.lat, x.lon]) })).filter(x => x.d <= m).sort((a, b) => a.d - b.d);
        res.clearLayers(); L.circle(c, { radius: m, color: ORANGE, weight: 1.5, fillOpacity: 0.05 }).addTo(res);
        $("#out").innerHTML = r.length ? `<ol class="list-num">${r.map((x, i) => `<li data-i="${i}"><span class="num">${i + 1}</span><span>${esc(x.label)}</span><em>${G.fmtKm(x.d)}</em></li>`).join("")}</ol>` : empty("building", "Aucune adresse dans ce rayon.");
        document.querySelectorAll("#out .list-num li").forEach(li => li.onclick = () => { input.value = r[+li.dataset.i].label; entFill(r[+li.dataset.i]); });
      }, 300));
    } },
    { label: "Recherche par code", render() {
      head(`<form id="ec" autocomplete="off"><div class="field"><label for="e-cc">Pays</label><select id="e-cc">${countryOptions(S.cc)}</select></div><div class="field"><label for="e-code">Code postal ou code GINDI</label><input id="e-code" placeholder="Ex. 10200"></div><div class="actions"><button class="btn btn-primary btn-sm" type="submit">${svg("search", 16)} Recherche</button></div></form>`);
      body(`<div id="out">${empty("building", "Au Sénégal, les codes postaux sont peu renseignés dans OpenStreetMap ; le code d'adresse GINDI les complétera.")}</div>`);
      $("#ec").addEventListener("submit", async e => {
        e.preventDefault(); const code = $("#e-code").value.trim(); if (!code) return;
        busy(true); const r = await G.search(code, $("#e-cc").value, 8, "&dedupe=1"); busy(false);
        res.clearLayers();
        const ok = r.filter(x => x.src === "osm" && (x.address.code_postal || "").replace(/\s/g, "") === code.replace(/\s/g, ""));
        if (!ok.length) { $("#out").innerHTML = `<p class="note">Aucune adresse ne porte le code « ${esc(code)} » dans les données ouvertes. Le référentiel GINDI attribuera un code à chaque adresse.</p>`; return; }
        ok.forEach((x, i) => L.marker([x.lat, x.lon], { icon: numIcon(i + 1) }).addTo(res)); fit(ok.map(x => [x.lat, x.lon]));
        $("#out").innerHTML = srcTag("osm") + `<ol class="list-num">${ok.map((x, i) => `<li><span class="num">${i + 1}</span><span>${esc(x.label)}</span><em></em></li>`).join("")}</ol>`;
      });
    } },
    { label: "Recherche administrative", render() {
      head(`<form id="ea" autocomplete="off"><div class="row"><div class="field"><label for="e-reg">Région</label><select id="e-reg">${regionOptions("Thiès")}</select></div><div class="field"><label for="e-dep">Département</label><select id="e-dep">${deptOptions("Thiès", "Mbour", "Tous")}</select></div></div>
        <div class="field"><label for="e-com">Commune ou localité</label><input id="e-com" placeholder="Ex. Saly Portudal"></div><div class="field"><label for="e-rue">Rue ou lieu</label><input id="e-rue" placeholder="Facultatif"></div>
        <div class="actions"><button class="btn btn-primary btn-sm" type="submit">${svg("search", 16)} Recherche</button></div></form>`);
      body(`<div id="out">${empty("building", "Choisissez une région, un département et, si besoin, une commune et une rue.")}</div>`);
      $("#e-reg").onchange = e => { $("#e-dep").innerHTML = deptOptions(e.target.value, "", "Tous"); };
      $("#ea").addEventListener("submit", async e => {
        e.preventDefault();
        const q = [$("#e-rue").value, $("#e-com").value, $("#e-dep").value, $("#e-reg").value].filter(Boolean).join(", ");
        busy(true); const r = await G.search(q, "SN", 8); busy(false);
        res.clearLayers();
        if (!r.length) { $("#out").innerHTML = empty("building", "Aucun résultat."); return; }
        r.forEach((x, i) => L.marker([x.lat, x.lon], { icon: numIcon(i + 1) }).addTo(res)); fit(r.map(x => [x.lat, x.lon]), 15);
        $("#out").innerHTML = srcTag(r[0].src) + `<ol class="list-num">${r.map((x, i) => `<li data-i="${i}"><span class="num">${i + 1}</span><span>${esc(x.label)}</span><em>${esc(x.type || "")}</em></li>`).join("")}</ol>`;
        document.querySelectorAll("#out .list-num li").forEach(li => li.onclick = () => map.setView([r[+li.dataset.i].lat, r[+li.dataset.i].lon], 17));
      });
    } }
  ] };

  /* --- Vérification d'adresse (sans carte) --- */
  DEMOS["verification-adresse"] = { card: true, tabs: [{ label: "Vérification", render(el) {
    el.innerHTML = `<h2>Vérification uniquement</h2><p>Cette API vérifie et normalise une adresse. Saisissez l'adresse à vérifier.</p>
      <form id="va" autocomplete="off"><div class="field"><label for="va-a">Adresse</label><input id="va-a" placeholder="Ex. Rue 10 x 13, Médina" required></div>
      <div class="field"><label for="va-b">Complément (facultatif)</label><input id="va-b" placeholder="Immeuble, étage, repère…"></div>
      <div class="row"><div class="field"><label for="va-c">Commune ou ville</label><input id="va-c" placeholder="Ex. Dakar"></div><div class="field"><label for="va-r">Région</label><select id="va-r">${regionOptions("", "Toutes")}</select></div><div class="field"><label for="va-p">Pays</label><select id="va-p">${countryOptions("SN")}</select></div></div>
      <div class="foot"><label class="check"><input type="checkbox" id="va-robot"> Je ne suis pas un robot</label><button class="btn btn-primary" type="submit">Rechercher</button></div></form><div id="va-out"></div>`;
    $("#va").addEventListener("submit", async e => {
      e.preventDefault();
      if (!$("#va-robot").checked) { toast("Cochez « Je ne suis pas un robot »."); return; }
      const a = $("#va-a").value.trim(); if (!a) { $("#va-a").focus(); return; }
      const q = [a, $("#va-c").value, $("#va-r").value].filter(Boolean).join(", ");
      busy(true); const r = await G.search(q, $("#va-p").value, 1); busy(false);
      res.clearLayers();
      const out = $("#va-out");
      if (!r.length || r[0].src !== "osm") {
        out.innerHTML = `<div class="verdict ${r.length ? "warn" : "bad"}">${r.length ? "Adresse non confirmée : seule la localité a été reconnue" : "Adresse introuvable"}</div>` + (r.length ? kv([["Localité reconnue", esc(r[0].label)]]) : "") + srcTag(r.length ? r[0].src : "demo");
        return;
      }
      const x = r[0], c = G.norm($("#va-c").value);
      const cityOk = !c || G.norm(x.label).includes(c);
      const street = !!x.address.rue;
      const cls = street && cityOk ? "ok" : "warn";
      const txt = street && cityOk ? "Adresse vérifiée : la voie et la localité existent" : !cityOk ? "Adresse trouvée dans une autre localité que celle saisie" : "Localité vérifiée, voie non trouvée";
      pin(x.lat, x.lon); map.setView([x.lat, x.lon], 15);
      out.innerHTML = `<div class="verdict ${cls}">${txt}</div>` + kv([["Adresse normalisée", esc(x.label), 1], ["Voie", esc(x.address.rue)], ["Quartier", esc(x.address.quartier)], ["Ville ou commune", esc(x.address.ville)], ["Région", esc(x.address.region)], ["Coordonnées", `<span class="mono">${x.lat.toFixed(5)}, ${x.lon.toFixed(5)}</span>`]]) + srcTag(x.src);
    });
  } }] };

  /* --- Adresses --- */
  async function listAddresses(poly, label) {
    const bb = poly.reduce((b, p) => [Math.min(b[0], p[0]), Math.min(b[1], p[1]), Math.max(b[2], p[0]), Math.max(b[3], p[1])], [90, 180, -90, -180]);
    let items = [], src = "osm";
    try {
      const ql = `[out:json][timeout:25];(nwr["addr:street"](${polyQL(poly)});way["highway"]["name"](${polyQL(poly)}););out center tags 300;`;
      const els = await G.overpass(ql);
      const seen = new Set();
      for (const e of els) {
        const t = e.tags || {};
        const lab = t["addr:street"] ? [t["addr:housenumber"], t["addr:street"]].filter(Boolean).join(" ") : t.name;
        if (!lab || seen.has(lab)) continue; seen.add(lab);
        items.push({ label: lab, kind: t["addr:street"] ? "adresse" : "voie", pos: G.elPos(e) });
      }
      if (!items.length) throw 0;
    } catch (_) {
      src = "demo";
      const r = G.rng(bb[0] * 1000 + bb[1]);
      const names = ["Rue", "Avenue", "Allée", "Boulevard"];
      for (let i = 0; i < 20; i++) {
        let pos; do { pos = [bb[0] + r() * (bb[2] - bb[0]), bb[1] + r() * (bb[3] - bb[1])]; } while (!G.inPoly(pos, poly) && r() < 0.95);
        items.push({ label: `${names[i % 4]} ${String.fromCharCode(65 + (i % 26))}-${10 + i} (exemple)`, kind: "voie", pos });
      }
    }
    const shown = items.slice(0, 20);
    shown.forEach((x, i) => L.marker(x.pos, { icon: numIcon(i + 1) }).addTo(res));
    return srcTag(src) + `<p class="r-title">${esc(label)}</p>` +
      (items.length > 20 ? `<p class="note">Seules 20 adresses sont affichées à titre d'exemple ; la zone en compte ${nf(items.length)} dans les données ouvertes.</p>` : "") +
      `<ol class="list-num">${shown.map((x, i) => `<li><span class="num">${i + 1}</span><span>${esc(x.label)}</span><em>${x.kind}</em></li>`).join("")}</ol>`;
  }
  DEMOS["adresses"] = { tabs: [
    { label: "Par nom de limite", render() {
      head(`<form id="ad" autocomplete="off"><div class="field"><label for="ad-p">Pays</label><select id="ad-p" disabled><option>Sénégal</option></select></div><div class="row"><div class="field"><label for="ad-r">Région</label><select id="ad-r">${regionOptions("Dakar")}</select></div><div class="field"><label for="ad-d">Département</label><select id="ad-d">${deptOptions("Dakar", "Dakar", "Toute la région")}</select></div></div>
        <div class="field"><label for="ad-c">Commune (facultatif)</label><input id="ad-c" placeholder="Ex. Médina"></div><div class="actions"><button class="btn btn-primary btn-sm" type="submit">${svg("search", 16)} Recherche</button></div></form>`);
      body(`<div id="out">${empty("mappin", "Choisissez une limite administrative pour lister ses adresses.")}</div>`);
      $("#ad-r").onchange = e => { $("#ad-d").innerHTML = deptOptions(e.target.value, "", "Toute la région"); };
      $("#ad").addEventListener("submit", async e => {
        e.preventDefault();
        const name = $("#ad-c").value.trim() ? `${$("#ad-c").value.trim()}, ${$("#ad-d").value || $("#ad-r").value}` : ($("#ad-d").value ? `Département de ${$("#ad-d").value}` : `Région de ${$("#ad-r").value}`);
        res.clearLayers(); busy(true);
        const b = await G.boundaryByName(name, "sn");
        const lyr = drawGeoJSON(b.geojson, BLUE);
        if (lyr) fit(lyr.getBounds());
        const poly = geojsonToPoly(b.geojson);
        $("#out").innerHTML = poly ? await listAddresses(poly, b.label) : `<p class="note">Limite introuvable.</p>`;
        busy(false);
      });
    } },
    { label: "Par limite", render() {
      head(polyHeader());
      body(`<div id="out">${empty("draw", "Dessinez une zone sur la carte (Dessiner, puis cliquez les sommets) ou collez ses coordonnées.")}</div>`);
      bindPoly(async poly => {
        res.clearLayers(); L.polygon(poly, { color: BLUE, weight: 2, fillOpacity: 0.15 }).addTo(res); fit(poly);
        busy(true); $("#out").innerHTML = await listAddresses(poly, "Adresses dans la zone dessinée"); busy(false);
      });
    } }
  ] };

  /* --- Cartes --- */
  DEMOS["cartes"] = { tabs: [
    { label: "Fonds de plan", render() {
      head(`<p class="hint" style="text-align:left">Choisissez un fond : la carte change immédiatement.</p>`);
      body(Object.entries(BASES).map(([k, b]) => `<label class="opt"><input type="radio" name="base" value="${k}"${k === baseKey ? " checked" : ""}><span><b>${esc(b.label)}</b><small>${esc(b.desc)}</small></span></label>`).join("") +
        `<p class="note">En production, les styles aux couleurs CEGIT seront servis par Martin (tuiles vectorielles) depuis la base PostGIS.</p>`);
      document.querySelectorAll('input[name="base"]').forEach(r => r.onchange = () => setBase(r.value));
      if (map.getZoom() < 6) map.setView([14.5, -14.45], 7);
    } },
    { label: "Intégration", render() {
      head(`<p class="hint" style="text-align:left">Code prêt à copier pour afficher ce fond dans vos outils.</p>`);
      const b = BASES[baseKey];
      const leaflet = `<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.css">\n<script src="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.js"><\/script>\n<div id="carte" style="height:400px"></div>\n<script>\n  const carte = L.map("carte").setView([14.69, -17.45], 12);\n  L.tileLayer("${b.url}", {\n    maxZoom: ${b.opts.maxZoom},\n    attribution: "© contributeurs OpenStreetMap"\n  }).addTo(carte);\n<\/script>`;
      body(`<p class="r-title">${esc(b.label)}</p><p class="r-sub">Leaflet (site web)</p><pre class="snippet">${esc(leaflet)}</pre><button class="btn btn-ghost btn-sm" type="button" id="cp1">Copier</button>
        <p class="r-sub" style="margin-top:16px">QGIS ou QWC2 : connexion XYZ Tiles</p><pre class="snippet">${esc(b.url.replace("{s}.", "a."))}</pre><button class="btn btn-ghost btn-sm" type="button" id="cp2">Copier</button>
        <p class="note">Respectez la politique d'usage des tuiles OpenStreetMap ; en production, utilisez les tuiles servies par api.cegitgroup.com.</p>`);
      $("#cp1").onclick = () => copy(leaflet); $("#cp2").onclick = () => copy(b.url.replace("{s}.", "a."));
    } }
  ] };

  /* --- Limites administratives --- */
  DEMOS["limites-administratives"] = { tabs: [
    { label: "Entités d'un point", type: "place", ico: "shape", zoom: 9, async run(p, alive) {
      const r = await G.reverse(p.lat, p.lon, 18);
      const lv = [];
      for (const [z, name, color] of [[8, "Région", ANTH], [10, "Département ou commune", ORANGE]]) {
        const b = await G.reverse(p.lat, p.lon, z, "&polygon_geojson=1&polygon_threshold=0.001");
        if (!alive()) return "";
        if (b.geojson && /Polygon/.test(b.geojson.type)) { const l = drawGeoJSON(b.geojson, color, 0.08); if (z === 8 && l) fit(l.getBounds(), 10); }
        lv.push([name, b.label.split(",")[0]]);
      }
      const a = r.address;
      return srcTag(r.src) + `<p class="r-title">Entités administratives</p>` + kv([["Région", esc(a.region)], ["Département", esc(a.departement)], ["Commune ou ville", esc(a.ville)], ["Quartier", esc(a.quartier)], ["Pays", esc(a.pays), 1]]) +
        `<p class="note">Contour gris : niveau régional. Contour orange : niveau local. Les limites officielles (ANAT, ANSD) remplaceront celles d'OpenStreetMap en production.</p>`;
    } },
    { label: "Recherche par nom", render() {
      head(`<form id="lb" autocomplete="off"><div class="row"><div class="field"><label for="lb-r">Région</label><select id="lb-r">${regionOptions("Thiès")}</select></div><div class="field"><label for="lb-d">Département</label><select id="lb-d">${deptOptions("Thiès", "", "Toute la région")}</select></div></div><div class="actions"><button class="btn btn-primary btn-sm" type="submit">Afficher la limite</button></div></form>`);
      body(`<div id="out">${empty("shape", "Choisissez une région ou un département.")}</div>`);
      $("#lb-r").onchange = e => { $("#lb-d").innerHTML = deptOptions(e.target.value, "", "Toute la région"); };
      $("#lb").addEventListener("submit", async e => {
        e.preventDefault();
        const name = $("#lb-d").value ? `Département de ${$("#lb-d").value}` : `Région de ${$("#lb-r").value}`;
        res.clearLayers(); busy(true); const b = await G.boundaryByName(name, "sn"); busy(false);
        const l = drawGeoJSON(b.geojson, BLUE); if (l) fit(l.getBounds());
        let area = 0;
        try { area = polyArea(geojsonToPoly(b.geojson)); } catch (_) { area = 0; }
        $("#out").innerHTML = srcTag(b.src) + `<p class="r-title">${esc(b.label.split(",")[0])}</p>` + kv([["Nom complet", esc(b.label), 1], ["Niveau", $("#lb-d").value ? "Département" : "Région"], ["Surface approchée", area ? nf(area) + " km²" : "—"]]);
      });
    } }
  ] };

  /* --- Quartiers --- */
  DEMOS["quartiers"] = { tabs: [{ label: "Quartier d'un point", type: "place", ico: "quarter", zoom: 15, async run(p) {
    const r = await G.reverse(p.lat, p.lon, 16, "&polygon_geojson=1&polygon_threshold=0.0005");
    if (r.geojson && /Polygon/.test(r.geojson.type)) drawGeoJSON(r.geojson, ORANGE, 0.12);
    else L.circle([p.lat, p.lon], { radius: 450, color: ORANGE, weight: 1.5, fillOpacity: 0.08 }).addTo(res);
    const a = r.address, near = G.nearestGaz(p.lat, p.lon);
    const typo = near.d < 4000 && ["Dakar"].includes(near.g[3]) ? "Urbain dense" : near.d < 3000 ? "Urbain" : near.d < 10000 ? "Périurbain" : "Rural";
    return srcTag(r.src) + `<p class="r-title">${esc(a.quartier || a.ville || near.g[0])}</p>` +
      kv([["Quartier ou village", esc(a.quartier || "—")], ["Commune", esc(a.ville)], ["Département", esc(a.departement)], ["Région", esc(a.region)], ["Typologie", typo], ["Agglomération la plus proche", `${esc(near.g[0])} (${G.fmtKm(near.d)})`]]) +
      `<p class="note">La typologie (urbain dense, urbain, périurbain, rural) est une classification CEGIT de démonstration.</p>`;
  } }] };

  /* --- Fuseau horaire --- */
  const TZ = { cv: ["Atlantic/Cape_Verde", "Heure du Cap-Vert (UTC−1)"], ma: ["Africa/Casablanca", "Heure du Maroc"], eh: ["Africa/El_Aaiun", "Heure du Maroc"], ne: ["Africa/Lagos", "Heure d'Afrique de l'Ouest (UTC+1)"], bj: ["Africa/Lagos", "Heure d'Afrique de l'Ouest (UTC+1)"], ng: ["Africa/Lagos", "Heure d'Afrique de l'Ouest (UTC+1)"], dz: ["Africa/Algiers", "Heure d'Europe centrale (UTC+1)"] };
  DEMOS["fuseau-horaire"] = { tabs: [{ label: "Fuseau horaire", type: "place", ico: "clock", zoom: 9, async run(p) {
    const r = await G.reverse(p.lat, p.lon, 5);
    const ccode = (r.raw && r.raw.address && r.raw.address.country_code) || (p.lon < -22 ? "cv" : "sn");
    const [zone, name] = TZ[ccode] || ["Africa/Dakar", "Temps universel coordonné (GMT)"];
    const now = new Date();
    let local = "", off = "";
    try {
      local = new Intl.DateTimeFormat("fr-FR", { timeZone: zone, dateStyle: "full", timeStyle: "medium" }).format(now);
      off = new Intl.DateTimeFormat("fr-FR", { timeZone: zone, timeZoneName: "shortOffset" }).formatToParts(now).find(x => x.type === "timeZoneName").value.replace("UTC", "UTC ").replace("GMT", "UTC ");
    } catch (_) { local = now.toUTCString(); off = "UTC"; }
    return srcTag(r.src) + `<p class="r-title">${esc(name)}</p>` + kv([["Heure locale", esc(local), 1], ["Fuseau (IANA)", `<span class="mono">${zone}</span>`], ["Décalage", esc(off.trim() === "UTC" ? "UTC +0" : off)], ["Heure d'été", "Non"], ["Pays", esc(r.address.pays || "Sénégal")]]);
  } }] };

  /* --- Zones --- */
  DEMOS["zones"] = { tabs: [
    { label: "Isochrone", type: "place", ico: "target", zoom: 12, noZoom: false,
      form: () => `<h3>Zone accessible</h3>${segHtml("z-mode", [["auto", "Conduire"], ["pedestrian", "Marcher"]], S.mode)}
        <div class="field"><label for="z-type">Type de trajet</label><select id="z-type"><option value="min">Par le temps</option><option value="km">Par la distance</option></select></div>
        <div class="row"><div class="field"><label for="z-val">Valeur</label><input id="z-val" type="number" min="1" value="10"></div><div class="field"><label for="z-unit">Unité</label><input id="z-unit" value="Minutes" readonly></div></div>`,
      bind(rerun) {
        bindSeg("z-mode", v => { S.mode = v; rerun(); });
        $("#z-type").onchange = e => { $("#z-unit").value = e.target.value === "km" ? "Kilomètres" : "Minutes"; $("#z-val").value = e.target.value === "km" ? 2 : 10; rerun(); };
        $("#z-val").onchange = rerun;
      },
      async run(p) {
        const unit = $("#z-type").value, v = Math.max(1, +$("#z-val").value || 10);
        const r = await G.isochrone(p.lat, p.lon, S.mode, v, unit);
        const pl = L.polygon(r.ring, { color: BLUE, weight: 2, fillColor: BLUE, fillOpacity: 0.2 }).addTo(res); fit(pl.getBounds());
        const ring = r.ring, area = polyArea(ring);
        return srcTag(r.src) + kv([["Mode", S.mode === "auto" ? "En voiture" : "À pied"], ["Seuil", `${v} ${unit === "km" ? "km" : "min"}`], ["Surface accessible", nf(area, 1) + " km²"], ["Sommets du polygone", nf(ring.length)]]);
      } },
    { label: "Zone tampon", type: "place", ico: "target", zoom: 13,
      form: () => `<h3>Zone tampon</h3><div class="row"><div class="field"><label for="b-val">Rayon</label><input id="b-val" type="number" min="1" value="1"></div><div class="field"><label for="b-unit">Unité</label><select id="b-unit"><option value="km">Kilomètres</option><option value="m">Mètres</option></select></div></div>`,
      bind(rerun) { $("#b-val").onchange = rerun; $("#b-unit").onchange = rerun; },
      async run(p) {
        const m = Math.max(1, +$("#b-val").value || 1) * ($("#b-unit").value === "km" ? 1000 : 1);
        const c = L.circle([p.lat, p.lon], { radius: m, color: BLUE, weight: 2, fillOpacity: 0.18 }).addTo(res); fit(c.getBounds());
        return kv([["Rayon", G.fmtKm(m)], ["Surface", nf(Math.PI * m * m / 1e6, 2) + " km²"], ["Périmètre", G.fmtKm(2 * Math.PI * m)]]);
      } },
    { label: "Zone autour d'un lieu", type: "place", ico: "target", zoom: 13, addr: { label: "Lieu (marché, hôpital, gare…)" },
      form: () => `<h3>Zone de chalandise</h3>${segHtml("zp-mode", [["auto", "Conduire"], ["pedestrian", "Marcher"]], S.mode)}<div class="field"><label for="zp-val">Temps de trajet (minutes)</label><input id="zp-val" type="number" min="1" value="15"></div>`,
      bind(rerun) { bindSeg("zp-mode", v => { S.mode = v; rerun(); }); $("#zp-val").onchange = rerun; },
      async run(p) {
        const v = Math.max(1, +$("#zp-val").value || 15);
        const r = await G.isochrone(p.lat, p.lon, S.mode, v, "min");
        const pl = L.polygon(r.ring, { color: ORANGE, weight: 2, fillOpacity: 0.18 }).addTo(res); fit(pl.getBounds());
        return srcTag(r.src) + `<p class="r-title">${esc(p.label.split(",")[0])}</p>` + kv([["Mode", S.mode === "auto" ? "En voiture" : "À pied"], ["Temps de trajet", `${v} min`]]) + `<p class="note">Utile pour une zone de chalandise, l'aire de desserte d'un équipement ou un périmètre d'intervention.</p>`;
      } }
  ] };
  const rad = d => d * Math.PI / 180;
  function polyArea(ring) { // [lat, lon] → km²
    let a = 0;
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) a += rad(ring[i][1] - ring[j][1]) * (2 + Math.sin(rad(ring[j][0])) + Math.sin(rad(ring[i][0])));
    return Math.abs(a * 6371.0088 * 6371.0088 / 2);
  }

  /* --- Routage --- */
  const PTS = { a: null, b: null };
  DEMOS["routage"] = { tabs: [
    { label: "Itinéraire", render() {
      head(`${segHtml("rt-mode", [["auto", "Conduire"], ["pedestrian", "Marcher"]], S.mode)}
        <div class="field"><label for="rt-cc">Pays</label><select id="rt-cc">${countryOptions(S.cc)}</select></div>
        <div class="field ac"><label for="rt-a">A · Départ</label><input id="rt-a" placeholder="Adresse de départ ou clic sur la carte" value="${esc(PTS.a ? PTS.a.label : "")}"></div>
        <div class="field ac"><label for="rt-b">B · Arrivée</label><input id="rt-b" placeholder="Adresse d'arrivée ou clic sur la carte" value="${esc(PTS.b ? PTS.b.label : "")}"></div>
        <div class="actions"><button class="btn btn-primary btn-sm" type="button" id="rt-go">Obtenir l'itinéraire</button></div>`);
      body(`<div id="out">${empty("arrow", "Saisissez deux adresses, ou cliquez deux fois sur la carte : départ puis arrivée.")}</div>`);
      bindSeg("rt-mode", v => { S.mode = v; if (PTS.a && PTS.b) goRoute(); });
      bindAC($("#rt-a"), s => { PTS.a = s; marks(); }, () => $("#rt-cc").value);
      bindAC($("#rt-b"), s => { PTS.b = s; marks(); if (PTS.a) goRoute(); }, () => $("#rt-cc").value);
      $("#rt-go").onclick = async () => {
        busy(true);
        for (const k of ["a", "b"]) { const v = $("#rt-" + k).value.trim(); if (v && (!PTS[k] || PTS[k].label !== v)) { const r = await G.search(v, $("#rt-cc").value, 1); if (r[0]) PTS[k] = r[0]; } }
        busy(false);
        if (!PTS.a || !PTS.b) { toast("Indiquez un départ et une arrivée."); return; }
        goRoute();
      };
      marks();
      if (PTS.a && PTS.b) goRoute();
    }, async onMap(ll) {
      const k = !PTS.a || (PTS.a && PTS.b) ? "a" : "b";
      if (k === "a") PTS.b = null;
      const pt = { lat: ll.lat, lon: ll.lng, label: `${ll.lat.toFixed(5)}, ${ll.lng.toFixed(5)}` };
      PTS[k] = pt;
      const sync = () => { $("#rt-a").value = PTS.a ? PTS.a.label : ""; $("#rt-b").value = PTS.b ? PTS.b.label : ""; };
      sync(); marks();
      if (PTS.a && PTS.b) goRoute();
      const r = await G.reverse(ll.lat, ll.lng, 17);
      if (PTS[k] === pt) { pt.label = r.label; sync(); }
    } },
    { label: "Matrice des coûts", render() { S.mx = S.mx || { src: [null], dst: [null] }; renderMatrix(); } }
  ] };
  function marks() {
    res.clearLayers();
    if (PTS.a) L.marker([PTS.a.lat, PTS.a.lon], { icon: labIcon("A") }).addTo(res);
    if (PTS.b) L.marker([PTS.b.lat, PTS.b.lon], { icon: labIcon("B") }).addTo(res);
    const pts = [PTS.a, PTS.b].filter(Boolean).map(p => [p.lat, p.lon]);
    if (pts.length === 1) map.setView(pts[0], Math.max(map.getZoom(), 12)); else if (pts.length === 2) fit(pts);
  }
  async function goRoute() {
    const my = ++S.run; busy(true);
    const r = await G.route([[PTS.a.lat, PTS.a.lon], [PTS.b.lat, PTS.b.lon]], S.mode);
    busy(false); if (my !== S.run) return;
    marks();
    const line = L.polyline(r.line, { color: BLUE, weight: 5, opacity: 0.85 }).addTo(res); fit(line.getBounds());
    $("#out").innerHTML = srcTag(r.src) + `<div class="totals"><span>Durée totale<b>${G.fmtMin(r.duration)}</b></span><span>Distance totale<b>${G.fmtKm(r.distance)}</b></span></div>` +
      `<ol class="steps-list">${r.steps.filter(s => s.distance > 0 || /arrivé/.test(s.text)).map(s => `<li><small>${G.fmtKm(s.distance)} · ${G.fmtMin(s.duration)}</small><b>${esc(s.text)}</b></li>`).join("")}</ol>`;
  }
  function renderMatrix() {
    const M = S.mx;
    const row = (k, i, p, letter) => `<div class="mrow"><b>${letter}</b><div class="ac"><input id="mx-${k}-${i}" placeholder="Adresse" value="${esc(p ? p.label : "")}" style="width:100%;padding:8px 10px;border-radius:8px;border:0"></div>${i === M[k].length - 1 ? `<button class="add" type="button" data-add="${k}" aria-label="Ajouter">${svg("plus", 16)}</button>` : "<span></span>"}</div>`;
    head(`${segHtml("mx-mode", [["auto", "Conduire"], ["pedestrian", "Marcher"]], S.mode)}
      <div class="field"><label>Sources</label><div class="matrix-rows">${M.src.map((p, i) => row("src", i, p, String.fromCharCode(65 + i))).join("")}</div></div>
      <div class="field"><label>Destinations</label><div class="matrix-rows">${M.dst.map((p, i) => row("dst", i, p, String.fromCharCode(88 + i > 90 ? 85 + i : 88 + i))).join("")}</div></div>
      <div class="actions"><button class="btn btn-primary btn-sm" type="button" id="mx-go">Obtenir la matrice des coûts</button></div>`);
    if (!$("#out")) body(`<div id="out">${empty("arrow", "Ajoutez jusqu'à trois sources et trois destinations.")}</div>`);
    bindSeg("mx-mode", v => { S.mode = v; });
    ["src", "dst"].forEach(k => M[k].forEach((_, i) => bindAC($(`#mx-${k}-${i}`), s => { M[k][i] = s; drawMx(); }, "SN")));
    document.querySelectorAll("[data-add]").forEach(b => b.onclick = () => { const k = b.dataset.add; if (M[k].length >= 3) { toast("Trois points au maximum dans la démo."); return; } M[k].push(null); renderMatrix(); });
    $("#mx-go").onclick = async () => {
      busy(true);
      for (const k of ["src", "dst"]) for (let i = 0; i < M[k].length; i++) { const v = $(`#mx-${k}-${i}`).value.trim(); if (v && (!M[k][i] || M[k][i].label !== v)) { const r = await G.search(v, "SN", 1); if (r[0]) M[k][i] = r[0]; } }
      const s = M.src.filter(Boolean), d = M.dst.filter(Boolean);
      if (!s.length || !d.length) { busy(false); toast("Indiquez au moins une source et une destination."); return; }
      const t = await G.table(s.map(p => [p.lat, p.lon]), d.map(p => [p.lat, p.lon]), S.mode);
      busy(false); drawMx();
      const ls = i => String.fromCharCode(65 + i), ld = i => String.fromCharCode(88 + i > 90 ? 85 + i : 88 + i);
      $("#out").innerHTML = srcTag(t.src) + s.map((_, i) => d.map((__, j) => `<p class="r-title">${ls(i)} – ${ld(j)}</p>` + tbl(["", ""], [["Distance", G.fmtKm(t.distances[i][j])], ["Temps", G.fmtMin(t.durations[i][j])]])).join("")).join("");
    };
    function drawMx() {
      res.clearLayers();
      const pts = [];
      M.src.forEach((p, i) => { if (p) { L.marker([p.lat, p.lon], { icon: labIcon(String.fromCharCode(65 + i)) }).addTo(res); pts.push([p.lat, p.lon]); } });
      M.dst.forEach((p, i) => { if (p) { L.marker([p.lat, p.lon], { icon: numIcon(String.fromCharCode(88 + i > 90 ? 85 + i : 88 + i)) }).addTo(res); pts.push([p.lat, p.lon]); } });
      if (pts.length) fit(pts, 13);
    }
    drawMx();
  }

  /* --- Rues --- */
  const HW = { motorway: "Autoroute", trunk: "Route nationale à chaussées séparées", primary: "Route principale", secondary: "Route secondaire", tertiary: "Route tertiaire", residential: "Rue résidentielle", unclassified: "Route locale", service: "Voie de desserte", living_street: "Zone de rencontre", track: "Piste", footway: "Chemin piéton", path: "Sentier", pedestrian: "Voie piétonne", motorway_link: "Bretelle d'autoroute", primary_link: "Bretelle", secondary_link: "Bretelle" };
  const SURF = { asphalt: "Bitume", paved: "Revêtue", unpaved: "Non revêtue", sand: "Sable", dirt: "Terre", ground: "Terre", compacted: "Latérite compactée", gravel: "Gravier", concrete: "Béton", paving_stones: "Pavés" };
  DEMOS["rues"] = { tabs: [{ label: "Voie la plus proche", type: "place", ico: "road", zoom: 17, async run(p) {
    const n = await G.nearestRoad(p.lat, p.lon);
    let way = null;
    try {
      const at = n ? [n.lat, n.lon] : [p.lat, p.lon];
      const els = await G.overpass(`[out:json][timeout:20];way["highway"](around:40,${at[0]},${at[1]});out tags geom 6;`);
      way = els.map(e => ({ e, d: Math.min(...e.geometry.map(g => G.dist(at, [g.lat, g.lon]))) })).sort((a, b) => a.d - b.d)[0]?.e || null;
    } catch (_) { way = null; }
    if (!n && !way) {
      const r = seeded(p, 3);
      return srcTag("demo") + `<p class="r-title">Voie la plus proche</p>` + kv([["Nom de la voie", "Rue (exemple)"], ["Classe", "Rue résidentielle"], ["Revêtement", ["Bitume", "Latérite compactée", "Sable"][Math.floor(r() * 3)]], ["Distance", G.fmtKm(10 + r() * 60)]]);
    }
    const t = (way && way.tags) || {};
    if (way) L.polyline(way.geometry.map(g => [g.lat, g.lon]), { color: ORANGE, weight: 7, opacity: 0.8 }).addTo(res);
    if (n) { L.marker([n.lat, n.lon], { icon: dotIcon() }).addTo(res); L.polyline([[p.lat, p.lon], [n.lat, n.lon]], { color: ANTH, dashArray: "4 4", weight: 2 }).addTo(res); }
    const dist = n ? n.distance : 0;
    return srcTag("osm") + `<p class="r-title">${esc(t.name || (n && n.name) || "Voie sans nom")}</p>` + kv([
      ["Classe routière", esc(HW[t.highway] || t.highway || "—")], ["Référence", esc(t.ref || "—")],
      ["Revêtement", esc(SURF[t.surface] || t.surface || "Non renseigné")], ["Nombre de voies", esc(t.lanes || "Non renseigné")],
      ["Sens unique", t.oneway === "yes" ? "Oui" : "Non"], ["Vitesse maximale", t.maxspeed ? esc(t.maxspeed) + " km/h" : "Non renseignée"],
      ["Distance au point", G.fmtKm(dist)], ["Temps de conduite estimé", G.fmtMin(dist / 8)],
      ["Latitude", n ? n.lat.toFixed(6) : p.lat.toFixed(6)], ["Longitude", n ? n.lon.toFixed(6) : p.lon.toFixed(6)]]);
  } }] };

  /* --- Lieux --- */
  const POI = [["Marché", '["amenity"="marketplace"]'], ["Mosquée", '["amenity"="place_of_worship"]["religion"="muslim"]'], ["Église", '["amenity"="place_of_worship"]["religion"="christian"]'], ["Gare routière", '["amenity"="bus_station"]'], ["Banque", '["amenity"="bank"]'], ["Distributeur", '["amenity"="atm"]'], ["Pharmacie", '["amenity"="pharmacy"]'], ["Station-service", '["amenity"="fuel"]'], ["Hôtel", '["tourism"="hotel"]'], ["Restaurant", '["amenity"="restaurant"]'], ["Mairie", '["amenity"="townhall"]'], ["Bureau de poste", '["amenity"="post_office"]'], ["Police et gendarmerie", '["amenity"="police"]']];
  const poiSelect = id => `<select id="${id}"><option value="">Tous les types</option>${POI.map((p, i) => `<option value="${i}">${p[0]}</option>`).join("")}</select>`;
  const matchRadios = () => `<div class="field"><label>Mode de correspondance du nom</label><div class="radios"><label><input type="radio" name="mm" value="spec" checked> Spécifique</label><label><input type="radio" name="mm" value="exact"> Exact</label><label><input type="radio" name="mm" value="relax"> Détendu</label></div></div>`;
  function poiFilters(typeIdx, name) {
    const base = typeIdx === "" ? POI.map(p => p[1]) : [POI[+typeIdx][1]];
    const mm = document.querySelector('input[name="mm"]:checked')?.value || "spec";
    const nm = name ? (mm === "exact" ? `["name"="${name.replace(/"/g, "")}"]` : mm === "relax" ? `["name"~"${name.replace(/["\\]/g, "")}",i]` : `["name"~"(^|\\\\s)${name.replace(/["\\]/g, "")}",i]`) : "";
    return base.map(b => b + nm);
  }
  function poiList(items, center) {
    items.slice(0, 25).forEach((x, i) => L.marker(x.pos, { icon: numIcon(i + 1) }).addTo(res));
    if (items.length) fit(items.slice(0, 25).map(x => x.pos).concat(center ? [center] : []), 16);
    return `<ol class="list-num">${items.slice(0, 25).map((x, i) => {
      const t = x.e.tags || {};
      const type = POI.find(p => { const m = p[1].match(/"(\w+)"="([^"]+)"/g); return m && m.every(s => { const [k, v] = s.replace(/"/g, "").split("="); return t[k] === v; }); });
      return `<li data-i="${i}"><span class="num">${i + 1}</span><span>${esc(t.name || (type ? type[0] : "Sans nom"))}<br><small>${esc(type ? type[0] : t.amenity || t.tourism || "")}</small></span><em>${x.d != null ? G.fmtKm(x.d) : ""}</em></li>`;
    }).join("")}</ol>`;
  }
  async function poiRun(filters, where, center, label) {
    let items, src = "osm";
    try {
      const ql = `[out:json][timeout:25];(${filters.map(f => `nwr${f}(${where});`).join("")});out center tags 120;`;
      items = (await G.overpass(ql)).map(e => ({ e, pos: G.elPos(e), d: center ? G.dist(center, G.elPos(e)) : null })).filter(x => x.pos[0]);
      if (center) items.sort((a, b) => a.d - b.d);
    } catch (_) { src = "demo"; items = center ? fakePOIs({ lat: center[0], lon: center[1] }, 8, label || "Lieu", 1500, 11) : []; }
    return srcTag(src) + `<p class="r-title">${nf(items.length)} lieu${items.length > 1 ? "x" : ""}</p>` + (items.length ? poiList(items, center) : empty("pin", "Aucun lieu ne correspond. Élargissez le rayon ou passez en mode Détendu."));
  }
  DEMOS["lieux"] = { tabs: [
    { label: "Autour d'une adresse", type: "place", ico: "pin", zoom: 15,
      form: () => `<div class="row"><div class="field"><label for="l-type">Type</label>${poiSelect("l-type")}</div><div class="field"><label for="l-rad">Rayon (m)</label><input id="l-rad" type="number" min="100" step="100" value="1500"></div></div><div class="field"><label for="l-name">Nom (facultatif)</label><input id="l-name" placeholder="Ex. Sandaga"></div>${matchRadios()}<button class="btn btn-primary btn-sm" type="button" id="l-go">${svg("search", 16)} Recherche</button>`,
      bind(rerun) { $("#l-go").onclick = rerun; $("#l-type").onchange = rerun; },
      async run(p) {
        const rad = Math.min(10000, Math.max(100, +$("#l-rad").value || 1500));
        L.circle([p.lat, p.lon], { radius: rad, color: ORANGE, weight: 1, fillOpacity: 0.04 }).addTo(res);
        return poiRun(poiFilters($("#l-type").value, $("#l-name").value.trim()), `around:${rad},${p.lat},${p.lon}`, [p.lat, p.lon], $("#l-type").value === "" ? "Lieu" : POI[+$("#l-type").value][0]);
      } },
    { label: "Par zone", render() {
      head(`<form id="lz" autocomplete="off"><div class="row"><div class="field"><label for="lz-r">Région</label><select id="lz-r">${regionOptions("Dakar")}</select></div><div class="field"><label for="lz-d">Département</label><select id="lz-d">${deptOptions("Dakar", "Dakar")}</select></div></div>
        <div class="row"><div class="field"><label for="lz-t">Type</label>${poiSelect("lz-t")}</div><div class="field"><label for="lz-n">Nom</label><input id="lz-n" placeholder="Facultatif"></div></div>${matchRadios()}<div class="actions"><button class="btn btn-primary btn-sm" type="submit">${svg("search", 16)} Recherche</button></div></form>`);
      body(`<div id="out">${empty("pin", "Choisissez un département et un type de lieu.")}</div>`);
      $("#lz-r").onchange = e => { $("#lz-d").innerHTML = deptOptions(e.target.value); };
      $("#lz-t").value = "4";
      $("#lz").addEventListener("submit", async e => {
        e.preventDefault(); res.clearLayers(); busy(true);
        const b = await G.boundaryByName(`Département de ${$("#lz-d").value}`, "sn");
        const l = drawGeoJSON(b.geojson, BLUE, 0.06); if (l) fit(l.getBounds());
        const poly = geojsonToPoly(b.geojson);
        $("#out").innerHTML = poly ? await poiRun(poiFilters($("#lz-t").value, $("#lz-n").value.trim()), polyQL(poly), null) : empty("pin", "Limite introuvable.");
        busy(false);
      });
    } },
    { label: "Par limite", render() {
      head(polyHeader(`<div class="field"><label for="lp-t">Type</label>${poiSelect("lp-t")}</div>`));
      body(`<div id="out">${empty("draw", "Dessinez une zone sur la carte, puis lancez la recherche.")}</div>`);
      bindPoly(async poly => {
        res.clearLayers(); L.polygon(poly, { color: BLUE, weight: 2, fillOpacity: 0.12 }).addTo(res); fit(poly);
        busy(true); $("#out").innerHTML = await poiRun(poiFilters($("#lp-t").value, ""), polyQL(poly), null); busy(false);
      });
    } },
    { label: "Saisie semi-automatique", render() {
      head(`<div class="field ac"><label for="ls-q">Texte de recherche</label><input id="ls-q" placeholder="Ex. Marché Sandaga, Gare de Thiès…" autocomplete="off"></div><div class="field"><label for="ls-cc">Pays</label><select id="ls-cc">${countryOptions(S.cc)}</select></div>`);
      body(`<div id="out">${empty("pin", "Les lieux correspondants s'affichent à la frappe.")}</div>`);
      const input = $("#ls-q");
      input.addEventListener("input", debounce(async () => {
        const q = input.value.trim(); if (q.length < 2) return;
        const r = (await G.suggest(q, $("#ls-cc").value)).filter(x => !/^(house|street|city|town|village|state|county|country|district|locality)$/.test(x.kind || ""));
        res.clearLayers();
        r.forEach((x, i) => L.marker([x.lat, x.lon], { icon: numIcon(i + 1) }).addTo(res));
        if (r.length) fit(r.map(x => [x.lat, x.lon]), 16);
        $("#out").innerHTML = r.length ? srcTag(r[0].src) + `<ol class="list-num">${r.map((x, i) => `<li data-i="${i}"><span class="num">${i + 1}</span><span>${esc(x.label)}</span><em>${esc(x.type || "")}</em></li>`).join("")}</ol>` : empty("pin", "Aucun lieu trouvé.");
        document.querySelectorAll("#out .list-num li").forEach(li => li.onclick = () => map.setView([r[+li.dataset.i].lat, r[+li.dataset.i].lon], 17));
      }, 300));
    } }
  ] };

  /* --- Risques --- */
  const FLOOD = [["Pikine et Thiaroye", 14.752, -17.37, 4200, "Fort"], ["Keur Massar", 14.782, -17.318, 3500, "Fort"], ["Guédiawaye", 14.776, -17.399, 2600, "Fort"], ["Yeumbeul", 14.775, -17.345, 2000, "Fort"], ["Saint-Louis", 16.03, -16.49, 3500, "Fort"], ["Kaolack", 14.15, -16.07, 3000, "Moyen"], ["Touba", 14.86, -15.88, 4500, "Moyen"], ["Ziguinchor", 12.57, -16.27, 2500, "Moyen"], ["Kolda", 12.89, -14.94, 2000, "Moyen"], ["Podor", 16.65, -14.96, 2500, "Moyen"], ["Matam", 15.65, -13.26, 2500, "Fort"]];
  const COAST = [["Langue de Barbarie, Saint-Louis", 16.0, -16.505, 2.5], ["Rufisque", 14.71, -17.27, 1.5], ["Bargny", 14.693, -17.23, 1.8], ["Malika", 14.8, -17.34, 1.2], ["Saly", 14.44, -17.02, 1.3], ["Mbour", 14.41, -16.97, 1.0], ["Joal-Fadiouth", 14.16, -16.85, 1.1], ["Cap Skirring", 12.39, -16.75, 0.9], ["Guet Ndar", 16.03, -16.51, 2.0], ["Yoff", 14.76, -17.47, 0.6]];
  const FIRE = { "Tambacounda": "Élevé", "Kédougou": "Élevé", "Kolda": "Élevé", "Matam": "Élevé", "Kaffrine": "Élevé", "Sédhiou": "Élevé", "Louga": "Moyen", "Saint-Louis": "Moyen", "Kaolack": "Moyen", "Fatick": "Moyen", "Ziguinchor": "Moyen", "Diourbel": "Faible", "Thiès": "Faible", "Dakar": "Très faible" };
  const riskNote = `<p class="note">Indicateurs de démonstration. En production, ils proviendront des études de vulnérabilité et des bases d'événements des services de l'État et de la BNSP.</p>`;
  async function fireStations(p, n) {
    let list, src = "osm";
    try { list = (await around(['["amenity"="fire_station"]'], p, 40000, 40)).slice(0, n || 3); if (!list.length) throw 0; }
    catch (_) { src = "demo"; const near = G.GAZ.filter(g => g[5] === "ville").map(g => ({ e: { tags: { name: `Centre de secours de ${g[0]}` } }, pos: [g[1] + 0.004, g[2] + 0.004], d: G.dist([p.lat, p.lon], [g[1], g[2]]), fake: true })).sort((a, b) => a.d - b.d); list = near.slice(0, n || 3); }
    let t = null;
    try { t = await G.table(list.map(x => x.pos), [[p.lat, p.lon]], "auto"); } catch (_) { t = null; }
    list.forEach((x, i) => { x.road = t ? t.distances[i][0] : x.d * 1.3; x.time = t ? t.durations[i][0] : x.d * 1.3 / 11; });
    list.sort((a, b) => a.time - b.time);
    return { list, src };
  }
  DEMOS["risques"] = { tabs: [
    { label: "Inondation", type: "place", ico: "alert", zoom: 13, async run(p) {
      const hit = FLOOD.map(f => ({ f, d: G.dist([p.lat, p.lon], [f[1], f[2]]) })).filter(x => x.d < x.f[3]).sort((a, b) => a.d - b.d)[0];
      const level = hit ? hit.f[4] : "Faible", r = seeded(p, 21);
      if (hit) L.polygon(G.circle([hit.f[1], hit.f[2]], hit.f[3], 60, 0.3, hit.f[1]), { color: LV[level], weight: 1.5, fillColor: LV[level], fillOpacity: 0.25 }).addTo(res);
      return srcTag("demo") + kv([["Niveau de risque", lvl(level)], ["Secteur", hit ? esc(hit.f[0]) : "Hors zone inondable recensée"], ["Hauteur d'eau modélisée", hit ? nf(0.3 + r() * (level === "Fort" ? 1.2 : 0.5), 1) + " m" : "—"], ["Événements recensés (10 ans)", hit ? nf(2 + Math.floor(r() * (level === "Fort" ? 8 : 4))) : "0"]]) +
        `<p class="note">Les inondations de la banlieue de Dakar (Pikine, Keur Massar, Guédiawaye) et des vallées du fleuve sont liées aux pluies d'hivernage et à la remontée de la nappe.</p>` + riskNote;
    } },
    { label: "Érosion côtière", type: "place", ico: "alert", zoom: 12, async run(p) {
      const near = COAST.map(c => ({ c, d: G.dist([p.lat, p.lon], [c[1], c[2]]) })).sort((a, b) => a.d - b.d)[0];
      const level = near.d < 1500 ? "Élevé" : near.d < 5000 ? "Moyen" : "Faible";
      L.circleMarker([near.c[1], near.c[2]], { radius: 9, color: LV[level], fillOpacity: 0.7 }).addTo(res);
      L.polyline([[p.lat, p.lon], [near.c[1], near.c[2]]], { color: ANTH, dashArray: "4 4", weight: 2 }).addTo(res);
      return srcTag("demo") + kv([["Niveau de risque", lvl(level)], ["Secteur côtier le plus proche", esc(near.c[0])], ["Distance", G.fmtKm(near.d)], ["Recul moyen du trait de côte", nf(near.c[3], 1) + " m par an"]]) + riskNote;
    } },
    { label: "Feux de brousse", type: "place", ico: "alert", zoom: 9, async run(p) {
      const r0 = await G.reverse(p.lat, p.lon, 8);
      const reg = Object.keys(FIRE).find(k => G.norm(r0.address.region || r0.label).includes(G.norm(k))) || G.nearestGaz(p.lat, p.lon).g[3];
      const level = FIRE[reg] || "Moyen", r = seeded(p, 33);
      const months = ["Novembre", "Décembre", "Janvier", "Février", "Mars", "Avril", "Mai"];
      const k = { "Élevé": 1, "Moyen": 0.5, "Faible": 0.15, "Très faible": 0.05 }[level];
      return srcTag("demo") + kv([["Niveau de risque", lvl(level)], ["Région", esc(reg)], ["Saison sensible", "Novembre à mai"], ["Surface brûlée moyenne", nf(k * (2000 + r() * 6000)) + " ha / an"]]) +
        tbl(["Mois", "Départs de feu"], months.map((m, i) => [m, nf(Math.round(k * (4 + r() * 20) * (i < 4 ? 1.4 : 0.7)))])) + riskNote;
    } },
    { label: "Accidentalité routière", type: "place", ico: "alert", zoom: 15, async run(p) {
      L.circle([p.lat, p.lon], { radius: 1000, color: ORANGE, weight: 1.5, fillOpacity: 0.08 }).addTo(res);
      const near = G.nearestGaz(p.lat, p.lon), urb = near.d < 5000 ? 1 : 0.3, r = seeded(p, 44);
      const cats = [["Ensemble des accidents", 20], ["Mortels", 1.5], ["Avec blessés graves", 6], ["Impliquant un piéton", 5], ["Impliquant un deux-roues", 7], ["Impliquant un transport en commun", 3]];
      const rows = cats.map(([c, base]) => { const n = Math.round(base * urb * (0.5 + r() * 1.5)); return [c, n]; });
      const idx = Math.round(rows[0][1] / 20 * 100);
      const level = idx > 120 ? "Élevé" : idx > 70 ? "Moyen" : "Faible";
      return srcTag("demo") + kv([["Niveau de risque", lvl(level)], ["Indice (100 = moyenne nationale)", nf(idx)], ["Rayon d'analyse", "1 km"], ["Période", "3 dernières années"]]) + tbl(["Type d'accident", "Nombre"], rows.map(x => [x[0], nf(x[1])])) + riskNote;
    } },
    { label: "Centres de secours", type: "place", ico: "aid", zoom: 12, async run(p) {
      const { list, src } = await fireStations(p, 3);
      list.forEach((x, i) => L.marker(x.pos, { icon: numIcon(i + 1) }).addTo(res));
      fit(list.map(x => x.pos).concat([[p.lat, p.lon]]), 14);
      return srcTag(src) + list.map((x, i) => acc(`${i + 1}. ${esc(x.e.tags.name || "Centre de secours")}`, kv([["Distance par la route", G.fmtKm(x.road)], ["Temps de trajet", G.fmtMin(x.time)], ["Numéro d'urgence", "18"], ["Opérateur", esc(x.e.tags.operator || "Brigade nationale des sapeurs-pompiers")]]), i === 0)).join("");
    } },
    { label: "Distance à l'eau", type: "place", ico: "alert", zoom: 13, async run(p) {
      let items, src = "osm";
      try {
        items = await around(['["natural"="water"]', '["waterway"~"river|stream|canal"]', '["natural"="coastline"]'], p, 6000, 60);
        if (!items.length) throw 0;
      } catch (_) { src = "demo"; items = fakePOIs(p, 3, "Plan d'eau", 3000, 55); }
      const seen = new Set(), out = [];
      for (const x of items) { const t = x.e.tags || {}; const nm = t.name || (t.natural === "coastline" ? "Océan Atlantique" : t.waterway ? "Cours d'eau sans nom" : "Plan d'eau sans nom"); if (seen.has(nm)) continue; seen.add(nm); out.push({ nm, t, x }); if (out.length === 3) break; }
      out.forEach((o, i) => L.marker(o.x.pos, { icon: numIcon(i + 1) }).addTo(res));
      if (out.length) fit(out.map(o => o.x.pos).concat([[p.lat, p.lon]]), 15);
      const kind = t => t.natural === "coastline" ? "Océan et mer" : t.waterway === "river" ? "Fleuve ou rivière" : t.waterway ? "Cours d'eau" : t.water === "lake" ? "Lac" : "Plan d'eau";
      return srcTag(src) + (out.length ? out.map(o => `<p class="r-title" style="margin-top:8px">${esc(o.nm)}</p>` + kv([["Type", kind(o.t)], ["Distance", G.fmtKm(o.x.d)]])).join("") : empty("alert", "Aucune étendue d'eau à moins de 6 km."));
    } }
  ] };

  /* --- Secours 18 --- */
  DEMOS["secours"] = { tabs: [
    { label: "Centre compétent", type: "place", ico: "aid", zoom: 12, async run(p) {
      const { list, src } = await fireStations(p, 3);
      const c = list[0];
      L.marker(c.pos, { icon: numIcon(1) }).addTo(res); fit([c.pos, [p.lat, p.lon]], 15);
      try { const r = await G.route([c.pos, [p.lat, p.lon]], "auto"); L.polyline(r.line, { color: "#B3261E", weight: 4, opacity: 0.8 }).addTo(res); } catch (_) {}
      return srcTag(src) + `<p class="r-title">${esc(c.e.tags.name || "Centre de secours")}</p>` + kv([["Numéro d'urgence", "<b>18</b>"], ["Délai d'intervention estimé", G.fmtMin(c.time)], ["Distance par la route", G.fmtKm(c.road)], ["Opérateur", esc(c.e.tags.operator || "Brigade nationale des sapeurs-pompiers")], ["Adresse", esc(c.e.tags["addr:street"] || "Non renseignée"), 1]]) +
        `<p class="note">Le centre compétent est celui qui atteint le lieu le plus vite par la route, pas forcément le plus proche à vol d'oiseau.</p>`;
    } },
    { label: "Services d'urgence", type: "place", ico: "aid", zoom: 13, async run(p) {
      let pol = [], hos = [], src = "osm";
      try { pol = await around(['["amenity"="police"]'], p, 15000, 20); hos = await around(['["amenity"="hospital"]'], p, 25000, 20); }
      catch (_) { src = "demo"; pol = fakePOIs(p, 1, "Commissariat", 3000, 61); hos = fakePOIs(p, 1, "Hôpital", 6000, 62); }
      const items = [];
      if (pol[0]) items.push(["Police ou gendarmerie", "17", pol[0]]);
      if (hos[0]) items.push(["Hôpital (urgences)", "1515 (SAMU)", hos[0]]);
      items.forEach((x, i) => L.marker(x[2].pos, { icon: numIcon(i + 1) }).addTo(res));
      if (items.length) fit(items.map(x => x[2].pos).concat([[p.lat, p.lon]]), 15);
      return srcTag(src) + tbl(["Service", "Numéro"], [["Sapeurs-pompiers (BNSP)", "<b>18</b>"], ["SAMU national", "<b>1515</b>"], ["Police nationale", "<b>17</b>"]]) +
        items.map((x, i) => acc(`${i + 1}. ${esc(x[2].e.tags.name || x[0])}`, kv([["Service", x[0]], ["Numéro", x[1]], ["Distance", G.fmtKm(x[2].d)]]), true)).join("");
    } }
  ] };

  /* --- Écoles --- */
  const schoolKind = t => { const n = G.norm(t.name || ""); if (t.amenity === "university" || /universite|ucad|ugb/.test(n)) return ["Enseignement supérieur", "Université"]; if (/lycee/.test(n)) return ["Secondaire", "Lycée"]; if (/cem|college/.test(n)) return ["Moyen", "Collège (CEM)"]; if (t.amenity === "kindergarten" || /maternelle|case des tout/.test(n)) return ["Préscolaire", "École maternelle"]; if (/daara|franco-arabe/.test(n)) return ["Élémentaire", "École franco-arabe"]; return ["Élémentaire", "École"]; };
  DEMOS["ecoles"] = { tabs: [{ label: "Écoles à proximité", type: "place", ico: "school", zoom: 15, async run(p) {
    let items, src = "osm";
    try { items = (await around(['["amenity"~"^(school|college|university|kindergarten)$"]'], p, 3000, 80)).slice(0, 8); if (!items.length) throw 0; }
    catch (_) { src = "demo"; items = fakePOIs(p, 5, "École", 2000, 71); }
    items.forEach((x, i) => L.marker(x.pos, { icon: numIcon(i + 1) }).addTo(res));
    fit(items.map(x => x.pos).concat([[p.lat, p.lon]]), 16);
    return srcTag(src) + items.map((x, i) => { const t = x.e.tags || {}, k = schoolKind(t);
      return acc(`${i + 1}. ${esc(t.name || k[1])}`, kv([["Adresse", esc([t["addr:street"], t["addr:city"]].filter(Boolean).join(", ") || "Non renseignée"), 1], ["Distance", G.fmtKm(x.d)], ["Cycle", k[0]], ["Type d'établissement", k[1]], ["Statut", esc(t["operator:type"] === "private" ? "Privé" : t["operator:type"] === "public" || t["operator:type"] === "government" ? "Public" : "Non renseigné")], ["Langue d'enseignement", esc(t["school:language"] || "Non renseignée")]]), i < 2);
    }).join("") + `<p class="note">Effectifs, ratio élèves par enseignant et carte scolaire seront issus du module CartoScol et des données du ministère de l'Éducation nationale.</p>`;
  } }] };

  /* --- Santé --- */
  const HEALTH = { hospital: "Hôpital", clinic: "Centre ou poste de santé", doctors: "Cabinet médical", pharmacy: "Pharmacie", dentist: "Cabinet dentaire" };
  DEMOS["sante"] = { tabs: [{ label: "Structures proches", type: "place", ico: "health", zoom: 14,
    form: () => `<div class="field"><label for="h-type">Type de structure</label><select id="h-type"><option value="hospital|clinic|doctors">Hôpitaux, centres et postes de santé</option><option value="hospital">Hôpitaux</option><option value="pharmacy">Pharmacies</option></select></div>`,
    bind(rerun) { $("#h-type").onchange = rerun; },
    async run(p) {
      let items, src = "osm";
      try { items = (await around([`["amenity"~"^(${$("#h-type").value})$"]`], p, 8000, 60)).slice(0, 6); if (!items.length) throw 0; }
      catch (_) { src = "demo"; items = fakePOIs(p, 4, "Structure de santé", 4000, 81); }
      let t = null; try { t = await G.table([[p.lat, p.lon]], items.map(x => x.pos), "auto"); } catch (_) {}
      items.forEach((x, i) => { x.time = t ? t.durations[0][i] : x.d * 1.3 / 11; x.road = t ? t.distances[0][i] : x.d * 1.3; });
      items.sort((a, b) => a.time - b.time);
      items.forEach((x, i) => L.marker(x.pos, { icon: numIcon(i + 1) }).addTo(res));
      fit(items.map(x => x.pos).concat([[p.lat, p.lon]]), 15);
      return srcTag(src) + items.map((x, i) => { const tg = x.e.tags || {};
        return acc(`${i + 1}. ${esc(tg.name || HEALTH[tg.amenity] || "Structure de santé")}`, kv([["Type", esc(HEALTH[tg.amenity] || "Structure de santé")], ["Temps d'accès en voiture", G.fmtMin(x.time)], ["Distance par la route", G.fmtKm(x.road)], ["Urgences", tg.emergency === "yes" ? "Oui" : tg.emergency === "no" ? "Non" : "Non renseigné"], ["Téléphone", esc(tg.phone || tg["contact:phone"] || "Non renseigné")]]), i === 0);
      }).join("");
    } }] };

  /* --- Informations sur la propriété --- */
  function parcel(p) {
    const r = seeded(p, 91), w = 12 + r() * 18, h = 15 + r() * 20, ang = r() * 90;
    const c = [p.lat, p.lon], hw = w / 2, hh = h / 2;
    const corners = [[-hw, -hh], [hw, -hh], [hw, hh], [-hw, hh]].map(([x, y]) => { const a = rad(ang); const dx = x * Math.cos(a) - y * Math.sin(a), dy = x * Math.sin(a) + y * Math.cos(a); return G.dest(G.dest(c, 90, dx), 0, dy); });
    return { corners, area: w * h, r };
  }
  DEMOS["propriete"] = { tabs: [
    { label: "Attributs de la propriété", type: "place", ico: "house", zoom: 18, async run(p) {
      const pc = parcel(p), r = pc.r;
      L.polygon(pc.corners, { color: BLUE, weight: 2, fillOpacity: 0.2 }).addTo(res);
      const near = G.nearestGaz(p.lat, p.lon), dakar = near.g[3] === "Dakar" && near.d < 6000;
      const prixM2 = dakar ? 250000 + r() * 650000 : near.d < 4000 ? 40000 + r() * 110000 : 5000 + r() * 30000;
      const bati = r() > 0.2, niveaux = bati ? Math.floor(r() * 4) : 0, emprise = bati ? pc.area * (0.45 + r() * 0.4) : 0;
      const usage = ["Habitation", "Habitation et commerce", "Commerce", "Bureaux", "Équipement public"][Math.floor(r() * 5)];
      const etat = r() > 0.85;
      return srcTag("demo") + `<p class="r-title">Parcelle (fictive)</p>` + kv([
        ["NICAD (identifiant cadastral)", `<span class="mono">${String(Math.floor(r() * 9000 + 1000))} ${String(Math.floor(r() * 9000 + 1000))} ${String(Math.floor(r() * 90000 + 10000))}</span>`],
        ["Titre foncier", `TF ${nf(Math.floor(r() * 20000 + 100))}/${near.g[3] === "Dakar" ? "DK" : near.g[3].slice(0, 2).toUpperCase()}`],
        ["Superficie de la parcelle", nf(pc.area) + " m²"], ["Usage", usage],
        ["Bâti", bati ? `R+${niveaux}` : "Non bâti"], ["Emprise au sol", bati ? nf(emprise) + " m²" : "—"],
        ["Surface de plancher", bati ? nf(emprise * (niveaux + 1)) + " m²" : "—"], ["Année de construction", bati ? String(1975 + Math.floor(r() * 49)) : "—"],
        ["Prix de référence du terrain", nf(Math.round(prixM2 / 1000) * 1000) + " FCFA/m²"], ["Valeur vénale estimée", nf(Math.round(pc.area * prixM2 / 1e6)) + " millions FCFA"],
        ["Propriétaire", etat ? "État du Sénégal (patrimoine bâti public)" : "Masqué (donnée personnelle)", 1]]) +
        `<p class="note">Toutes les valeurs sont fictives. En production, ces informations proviendront du cadastre et des modules PatriBâti et CegitCAD+, avec un accès réservé aux comptes habilités.</p>`;
    } },
    { label: "Limite de la parcelle", type: "place", ico: "house", zoom: 19, async run(p) {
      const pc = parcel(p);
      const pl = L.polygon(pc.corners, { color: BLUE, weight: 2.5, fillOpacity: 0.25 }).addTo(res); fit(pl.getBounds(), 19);
      let per = 0; for (let i = 0; i < 4; i++) per += G.dist(pc.corners[i], pc.corners[(i + 1) % 4]);
      return srcTag("demo") + `<p class="r-title">Limite de la parcelle</p>` + kv([["Superficie", nf(pc.area) + " m²"], ["Périmètre", nf(per, 1) + " m"], ["Sommets", "4"], ["Système", "WGS 84 (EPSG:4326)"]]) +
        `<pre class="snippet">${esc(JSON.stringify({ type: "Polygon", coordinates: [pc.corners.concat([pc.corners[0]]).map(c => [+c[1].toFixed(6), +c[0].toFixed(6)])] }, null, 1))}</pre>`;
    } }
  ] };

  /* --- Urbanisme --- */
  const ZONES = [["UA", "Zone urbaine dense (centre)", "R+6", "80 %"], ["UB", "Zone urbaine résidentielle", "R+4", "60 %"], ["UC", "Zone d'habitat économique", "R+2", "60 %"], ["UE", "Zone d'équipements", "R+4", "50 %"], ["UX", "Zone d'activités", "R+2", "70 %"], ["AU", "Zone à urbaniser", "R+3", "50 %"], ["N", "Zone naturelle protégée", "Non constructible", "0 %"], ["A", "Zone agricole", "R+1 (bâtiments agricoles)", "10 %"]];
  DEMOS["urbanisme"] = { tabs: [{ label: "Zone applicable", type: "place", ico: "city", zoom: 15, async run(p) {
    const near = G.nearestGaz(p.lat, p.lon), r = seeded(p, 101);
    const pool = near.d < 2500 ? [0, 1, 3] : near.d < 6000 ? [1, 2, 3, 4] : near.d < 15000 ? [2, 5, 4] : [7, 6];
    const z = ZONES[pool[Math.floor(r() * pool.length)]];
    L.polygon(G.circle([p.lat, p.lon], 350 + r() * 400, 40, 0.35, p.lat * 3), { color: ORANGE, weight: 2, fillOpacity: 0.15 }).addTo(res);
    return srcTag("demo") + `<p class="r-title">Zone ${z[0]}</p>` + kv([["Libellé", esc(z[1]), 1], ["Document", `Plan d'urbanisme de ${esc(near.g[0])} (fictif)`, 1], ["Hauteur maximale", z[2]], ["Emprise au sol maximale", z[3]], ["Retrait sur voie", z[0] === "UA" ? "À l'alignement" : "3 m minimum"], ["Stationnement", z[0] === "UA" ? "1 place pour 100 m²" : "1 place par logement"]]) +
      `<p class="note">Règles fictives. Le module CEGIT-URBA intégrera les plans directeurs (PDU) et plans d'urbanisme de détail (PUD) approuvés.</p>`;
  } }] };

  /* --- Fiscalité locale --- */
  const taxNote = `<p class="note">Taux indicatifs à vérifier auprès de la Direction générale des impôts et domaines (DGID) et de la commune avant tout usage.</p>`;
  DEMOS["fiscalite-locale"] = { tabs: [
    { label: "Général", type: "place", ico: "coin", zoom: 13, async run(p) {
      const r = await G.reverse(p.lat, p.lon, 12);
      return srcTag(r.src === "osm" ? "osm" : "demo") + `<p class="r-title">Taxe sur la valeur ajoutée</p>` + kv([["Taux normal", "18 %"], ["Taux réduit (hébergement touristique)", "10 %"], ["Commune", esc(r.address.ville || r.label.split(",")[0])], ["Région", esc(r.address.region)]]) + taxNote;
    } },
    { label: "Foncier", type: "place", ico: "coin", zoom: 15, async run(p) {
      return srcTag("demo") + `<p class="r-title">Contributions foncières</p>` + kv([["Propriétés bâties (CFPB)", "5 % de la valeur locative"], ["Propriétés non bâties (CFPNB)", "5 % de la valeur vénale"], ["Bénéficiaire", "Commune"], ["Exonérations possibles", "Résidence principale sous conditions, constructions neuves"]]) + taxNote;
    } },
    { label: "Commune", type: "place", ico: "coin", zoom: 13, async run(p) {
      const r = await G.reverse(p.lat, p.lon, 12);
      return srcTag(r.src === "osm" ? "osm" : "demo") + `<p class="r-title">${esc(r.address.ville || r.label.split(",")[0])}</p>` + kv([["Contribution économique locale (CEL)", "Selon le barème national"], ["Taxe d'enlèvement des ordures ménagères", "Selon délibération communale"], ["Droits de place sur les marchés", "Selon délibération communale"], ["Taxe sur la publicité", "Selon délibération communale"]]) + taxNote;
    } }
  ] };

  /* --- Télécoms --- */
  DEMOS["telecoms"] = { tabs: [{ label: "Couverture mobile", type: "place", ico: "phone", zoom: 13, async run(p) {
    const near = G.nearestGaz(p.lat, p.lon), r = seeded(p, 111);
    const urb = near.d < 4000 ? 2 : near.d < 15000 ? 1 : 0;
    const ops = [["Orange (Sonatel)", 1], ["Yas (ex-Free)", 0.85], ["Expresso", 0.6]];
    L.circle([p.lat, p.lon], { radius: 800, color: ORANGE, weight: 1, fillOpacity: 0.06 }).addTo(res);
    return srcTag("demo") + ops.map(([n, k], i) => {
      const tech = ["2G"]; if (urb >= 1 || r() < k) tech.push("3G"); if (urb >= 1 && r() < k + 0.1) tech.push("4G"); if (urb === 2 && i === 0 && near.g[3] === "Dakar") tech.push("5G (zones pilotes)");
      const sig = urb === 2 ? "Bon" : urb === 1 ? (r() < k ? "Bon" : "Moyen") : (r() < k * 0.6 ? "Moyen" : "Faible");
      return acc(esc(n), kv([["Technologies", tech.join(", ")], ["Qualité du signal", sig], ["Débit descendant indicatif", tech.includes("4G") ? `${nf(10 + r() * 40)} Mbit/s` : tech.includes("3G") ? `${nf(1 + r() * 6, 1)} Mbit/s` : "Voix et SMS"], ["Couverture intérieure", urb === 2 ? "Oui" : "Partielle"]]), i === 0);
    }).join("") + `<p class="note">Données fictives. En production : cartes de couverture publiées par l'ARTP et données des opérateurs.</p>`;
  } }] };

  /* --- Géolocalisation --- */
  DEMOS["geolocalisation"] = { tabs: [
    { label: "Adresse IP", render() {
      head(`<form id="gi"><div class="field"><label for="gi-ip">Adresse IP</label><input id="gi-ip" placeholder="Ex. 41.82.10.20" inputmode="decimal"></div><div class="actions"><button class="btn btn-primary btn-sm" type="submit">Obtenir l'emplacement</button></div></form>`);
      body(`<div id="out">${empty("compass", "Saisissez une adresse IPv4.")}</div>`);
      $("#gi").addEventListener("submit", e => {
        e.preventDefault(); const ip = $("#gi-ip").value.trim();
        if (!/^(\d{1,3}\.){3}\d{1,3}$/.test(ip) || ip.split(".").some(x => +x > 255)) { toast("Adresse IPv4 invalide."); return; }
        const l = ipLocate(ip); res.clearLayers();
        L.circle([l.lat, l.lon], { radius: l.prec * 1000, color: ORANGE, weight: 1.5, fillOpacity: 0.1 }).addTo(res); pin(l.lat, l.lon); map.setView([l.lat, l.lon], l.prec > 20 ? 9 : 10);
        $("#out").innerHTML = srcTag("demo") + kv([["Adresse IP", `<span class="mono">${esc(ip)}</span>`], ["Ville", esc(l.ville)], ["Pays", "Sénégal"], ["Fournisseur d'accès", esc(l.operateur)], ["Précision", `± ${l.prec} km`], ["Coordonnées", `${l.lat.toFixed(4)}, ${l.lon.toFixed(4)}`]]) + `<p class="note">Correspondance fictive fondée sur quelques plages d'adresses. En production : base de géolocalisation IP mise à jour régulièrement.</p>`;
      });
    } },
    { label: "Wi-Fi", render() {
      head(`<form id="gw"><div class="field"><label for="gw-mac">Adresse MAC du point d'accès</label><input id="gw-mac" placeholder="Ex. 00:1A:2B:3C:4D:5E"></div><div class="actions"><button class="btn btn-primary btn-sm" type="submit">Obtenir l'emplacement</button></div></form>`);
      body(`<div id="out">${empty("compass", "Saisissez l'adresse MAC (BSSID) d'un point d'accès Wi-Fi.")}</div>`);
      $("#gw").addEventListener("submit", e => {
        e.preventDefault(); const mac = $("#gw-mac").value.trim().toUpperCase();
        if (!/^([0-9A-F]{2}[:-]){5}[0-9A-F]{2}$/.test(mac)) { toast("Adresse MAC invalide (6 octets hexadécimaux)."); return; }
        let h = 0; for (const c of mac) h = (h * 33 + c.charCodeAt(0)) % 100003;
        const g = G.GAZ.filter(x => x[3] === "Dakar")[h % 14], r = G.rng(h);
        const pos = G.dest([g[1], g[2]], r() * 360, r() * 600);
        res.clearLayers(); L.circle(pos, { radius: 60, color: ORANGE, weight: 1.5, fillOpacity: 0.15 }).addTo(res); pin(pos[0], pos[1]); map.setView(pos, 17);
        $("#out").innerHTML = srcTag("demo") + kv([["Point d'accès", `<span class="mono">${esc(mac)}</span>`], ["Secteur", esc(g[0])], ["Précision", "± 60 m"], ["Coordonnées", `${pos[0].toFixed(5)}, ${pos[1].toFixed(5)}`]]) + `<p class="note">Position fictive. En production : base de points d'accès alimentée par des relevés autorisés.</p>`;
      });
    } }
  ] };

  /* --- Vérification d'e-mail (sans carte) --- */
  const DISPOSABLE = ["yopmail.com", "mailinator.com", "10minutemail.com", "guerrillamail.com", "trashmail.com", "tempmail.com", "temp-mail.org", "jetable.org", "getnada.com", "sharklasers.com"];
  DEMOS["verification-email"] = { card: true, tabs: [{ label: "Vérification", render(el) {
    el.innerHTML = `<h2>Vérification uniquement</h2><p>Cette API n'utilise pas de données géographiques. Saisissez l'adresse électronique à vérifier.</p>
      <form id="ve" autocomplete="off"><div class="field"><label for="ve-m">Adresse électronique</label><input id="ve-m" type="text" inputmode="email" placeholder="prenom.nom@exemple.sn"></div>
      <div class="foot"><label class="check"><input type="checkbox" id="ve-robot"> Je ne suis pas un robot</label><button class="btn btn-primary" type="submit">Rechercher</button></div></form><div id="ve-out"></div>`;
    $("#ve").addEventListener("submit", async e => {
      e.preventDefault();
      if (!$("#ve-robot").checked) { toast("Cochez « Je ne suis pas un robot »."); return; }
      const m = $("#ve-m").value.trim().toLowerCase(), out = $("#ve-out");
      const syntax = /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/.test(m);
      if (!syntax) { out.innerHTML = `<div class="verdict bad">Syntaxe invalide</div>` + kv([["Adresse", esc(m) || "—"]]); return; }
      const domain = m.split("@")[1], local = m.split("@")[0];
      busy(true); const mx = await G.mx(domain); busy(false);
      const disp = DISPOSABLE.includes(domain), role = /^(contact|info|admin|support|direction|secretariat|noreply|no-reply|webmaster|rh)$/.test(local);
      const verdict = mx.ok === false ? ["bad", "Domaine sans serveur de messagerie : l'adresse ne peut pas recevoir de courriels"] : disp ? ["warn", "Adresse jetable : à éviter pour un compte client"] : mx.ok === null ? ["warn", "Syntaxe valide ; serveur de messagerie non vérifié"] : ["ok", "L'adresse peut recevoir des courriels"];
      out.innerHTML = `<div class="verdict ${verdict[0]}">${verdict[1]}</div>` + kv([["Adresse", esc(m)], ["Domaine", esc(domain)], ["Serveur de messagerie (MX)", mx.ok ? esc(mx.records.slice(0, 2).join(" · ")) : mx.ok === false ? "Aucun" : "Non vérifié"], ["Adresse jetable", disp ? "Oui" : "Non"], ["Adresse de rôle", role ? "Oui (boîte partagée)" : "Non"], ["Domaine sénégalais", domain.endsWith(".sn") ? "Oui (.sn)" : "Non"]]) + srcTag(mx.src);
    });
  } }] };

  /* --- Vérification téléphonique (sans carte) --- */
  const CC = { "221": "Sénégal", "220": "Gambie", "222": "Mauritanie", "223": "Mali", "224": "Guinée", "225": "Côte d'Ivoire", "226": "Burkina Faso", "227": "Niger", "228": "Togo", "229": "Bénin", "238": "Cap-Vert", "245": "Guinée-Bissau", "33": "France", "1": "États-Unis ou Canada" };
  const SN_PREFIX = { "77": ["Orange (Sonatel)", "Mobile"], "78": ["Orange (Sonatel)", "Mobile"], "76": ["Yas (ex-Free)", "Mobile"], "70": ["Expresso", "Mobile"], "75": ["Promobile", "Mobile"], "33": ["Orange (Sonatel)", "Fixe"], "30": ["Expresso", "Fixe"] };
  DEMOS["verification-telephone"] = { card: true, tabs: [{ label: "Vérification", render(el) {
    el.innerHTML = `<h2>Vérification uniquement</h2><p>Cette API n'utilise pas de données géographiques. Le numéro est saisi en notation internationale E.123, avec l'indicatif du pays (par exemple +221).</p>
      <form id="vt" autocomplete="off"><div class="field"><label for="vt-n">Numéro de téléphone</label><input id="vt-n" type="tel" placeholder="+221 77 000 00 00"></div>
      <div class="foot"><label class="check"><input type="checkbox" id="vt-robot"> Je ne suis pas un robot</label><button class="btn btn-primary" type="submit">Rechercher</button></div></form><div id="vt-out"></div>`;
    $("#vt").addEventListener("submit", e => {
      e.preventDefault();
      if (!$("#vt-robot").checked) { toast("Cochez « Je ne suis pas un robot »."); return; }
      const raw = $("#vt-n").value.trim(), out = $("#vt-out");
      let d = raw.replace(/[^\d+]/g, "");
      if (d.startsWith("00")) d = "+" + d.slice(2);
      if (!d.startsWith("+") && /^[37]\d{8}$/.test(d)) d = "+221" + d;
      if (!d.startsWith("+")) { out.innerHTML = `<div class="verdict bad">Indicatif du pays manquant (ex. +221)</div>`; return; }
      const digits = d.slice(1), code = ["221", "220", "222", "223", "224", "225", "226", "227", "228", "229", "238", "245", "33", "1"].find(c => digits.startsWith(c));
      if (!code) { out.innerHTML = `<div class="verdict bad">Indicatif de pays non reconnu</div>`; return; }
      const nat = digits.slice(code.length);
      if (code === "221") {
        const pre = SN_PREFIX[nat.slice(0, 2)];
        const ok = nat.length === 9 && !!pre;
        out.innerHTML = ok
          ? `<div class="verdict ok">Numéro valide : format et plan de numérotation sénégalais respectés</div>` + kv([["Téléphone", `<span class="mono">+221 ${nat.slice(0, 2)} ${nat.slice(2, 5)} ${nat.slice(5, 7)} ${nat.slice(7)}</span>`], ["Format E.164", `<span class="mono">+221${nat}</span>`], ["Opérateur d'attribution", pre[0]], ["Type de ligne", pre[1]], ["Pays", "Sénégal"]]) + `<p class="note">L'opérateur est déduit du préfixe d'attribution ; un numéro peut avoir été porté vers un autre réseau. Le statut « actif sur le réseau » nécessitera un accord avec les opérateurs.</p>`
          : `<div class="verdict bad">Numéro invalide : un numéro sénégalais compte 9 chiffres après +221 et commence par 70, 75, 76, 77, 78, 30 ou 33</div>`;
        return;
      }
      const okLen = nat.length >= 7 && nat.length <= 10;
      out.innerHTML = `<div class="verdict ${okLen ? "warn" : "bad"}">${okLen ? "Format plausible ; contrôle détaillé disponible pour le Sénégal uniquement dans la démo" : "Longueur de numéro invalide"}</div>` + kv([["Format E.164", `<span class="mono">+${code}${nat}</span>`], ["Pays", CC[code]]]);
    });
  } }] };

  /* --- Biodiversité --- */
  const PARKS = [["Parc national des oiseaux du Djoudj", 16.36, -16.27], ["Parc national du Niokolo-Koba", 13.07, -12.72], ["Parc national du Delta du Saloum", 13.75, -16.6], ["Parc national de la Langue de Barbarie", 15.93, -16.5], ["Réserve de Bandia", 14.58, -17.01], ["Parc forestier et zoologique de Hann", 14.72, -17.43], ["Parc national des îles de la Madeleine", 14.66, -17.47], ["Parc national de Basse-Casamance", 12.45, -16.6], ["Réserve spéciale de faune de Guembeul", 15.97, -16.46], ["Réserve naturelle de Popenguine", 14.55, -17.11]];
  DEMOS["biodiversite"] = { tabs: [{ label: "Aires protégées", type: "place", ico: "leaf", zoom: 9, async run(p) {
    let items = [], src = "osm";
    try {
      const els = await G.overpass(`[out:json][timeout:25];(nwr["boundary"="protected_area"](around:60000,${p.lat},${p.lon});nwr["leisure"="nature_reserve"](around:60000,${p.lat},${p.lon});nwr["boundary"="national_park"](around:60000,${p.lat},${p.lon}););out center tags 40;`);
      const seen = new Set();
      items = els.filter(e => e.tags && e.tags.name && !seen.has(e.tags.name) && seen.add(e.tags.name)).map(e => ({ name: e.tags.name, pos: G.elPos(e), d: G.dist([p.lat, p.lon], G.elPos(e)), t: e.tags })).sort((a, b) => a.d - b.d).slice(0, 6);
      if (!items.length) throw 0;
    } catch (_) { src = "demo"; items = PARKS.map(k => ({ name: k[0], pos: [k[1], k[2]], d: G.dist([p.lat, p.lon], [k[1], k[2]]), t: {} })).sort((a, b) => a.d - b.d).slice(0, 4); }
    items.forEach((x, i) => L.marker(x.pos, { icon: numIcon(i + 1) }).addTo(res));
    fit(items.map(x => x.pos).concat([[p.lat, p.lon]]), 11);
    return srcTag(src) + `<ol class="list-num">${items.map((x, i) => `<li data-i="${i}"><span class="num">${i + 1}</span><span>${esc(x.name)}<br><small>${esc(x.t.protection_title || x.t.designation || "Aire protégée")}</small></span><em>${G.fmtKm(x.d)}</em></li>`).join("")}</ol>` +
      `<p class="note">Les observations d'espèces (module NaturaSen) seront ajoutées avec les partenaires naturalistes ; les espèces sensibles seront floutées.</p>`;
  }, after() { document.querySelectorAll("#out .list-num li").forEach(li => li.onclick = () => { const m = res.getLayers().filter(l => l instanceof L.Marker)[+li.dataset.i + 1]; if (m) map.setView(m.getLatLng(), 12); }); } }] };

  /* ---------- Démarrage ---------- */
  S.cc = "SN";
  renderSwitcher();
  openApi(decodeURIComponent(location.hash.slice(1)) || "geocodage");
})();
