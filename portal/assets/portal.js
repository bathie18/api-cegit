/* Portail : catalogue, offres, fiche API (console d'essai), connexion. */
(function () {
  const { STATUS, FAMS, LAYERS, APIS } = window.CEGIT;
  const { svg, AUTH, esc, toast, copy, docUrl, REPO } = window.CEGIT_UI;
  const BASE = "https://api.cegitgroup.com";
  const $ = s => document.querySelector(s);
  const state = { fam: -1, q: "" };
  let pending = null; // destination demandée avant connexion

  /* ---------- Éléments statiques ---------- */
  $("#brand-mark").innerHTML = svg("pin", 22);
  $("#login-mark").innerHTML = svg("lock", 20);
  $("#login-close").innerHTML = svg("close", 18);
  $("#search-ico").innerHTML = svg("search", 20);
  $("#gate-ico").innerHTML = svg("lock", 22);
  $("#repo-link").href = REPO;
  $("#foot-repo").href = REPO;
  $("#copy-mail").onclick = () => copy($("#mail").textContent, "Adresse copiée.");
  $("#layers").innerHTML = LAYERS.map(([n, s, t]) =>
    `<div class="layer"><h3>${n}<small>${s}</small></h3><div class="tools">${t.map(([x, l]) => `<span class="tool"><b>${x}</b><span class="lic">${l}</span></span>`).join("")}</div></div>`).join("");

  /* ---------- Session ---------- */
  function renderSession() {
    const s = AUTH.get(), el = $("#session");
    if (!s) {
      el.innerHTML = `<button class="btn btn-ghost" type="button" data-login>Se connecter</button><a class="btn btn-primary" href="#offres" data-go="offres">Essai gratuit</a>`;
      return;
    }
    el.innerHTML = `<button class="user-btn" type="button" id="user-btn" aria-expanded="false" aria-controls="user-menu"><span class="avatar">${esc(s.user[0].toUpperCase())}</span>${esc(s.user)}${svg("chevron", 16)}</button>
      <div class="user-menu" id="user-menu" hidden>
        <dl><dt>Offre</dt><dd>${esc(s.plan)}</dd><dt>Crédits restants</dt><dd>${(s.credits || 0).toLocaleString("fr-FR")}</dd></dl>
        <div><div class="form-note" style="margin-bottom:4px">Clé d'API de démonstration</div><div class="key"><span>${esc(s.apiKey)}</span><button class="btn btn-ghost btn-sm" type="button" id="copy-key">Copier</button></div></div>
        <button class="btn btn-ghost" type="button" id="logout">Se déconnecter</button>
      </div>`;
    const btn = $("#user-btn"), menu = $("#user-menu");
    btn.onclick = e => { e.stopPropagation(); menu.hidden = !menu.hidden; btn.setAttribute("aria-expanded", String(!menu.hidden)); };
    $("#copy-key").onclick = () => copy(s.apiKey, "Clé copiée.");
    $("#logout").onclick = () => { AUTH.logout(); renderSession(); toast("Vous êtes déconnecté."); route(); };
  }
  document.addEventListener("click", e => {
    const m = $("#user-menu");
    if (m && !m.hidden && !e.target.closest(".session")) { m.hidden = true; $("#user-btn")?.setAttribute("aria-expanded", "false"); }
  });

  const dlg = $("#login");
  function openLogin() {
    $("#login-err").textContent = "";
    if (typeof dlg.showModal === "function") dlg.showModal(); else dlg.setAttribute("open", "");
    setTimeout(() => $("#login-user").focus(), 30);
  }
  function closeLogin() { if (dlg.open) dlg.close ? dlg.close() : dlg.removeAttribute("open"); }
  $("#login-close").onclick = closeLogin;
  $("#login-form").addEventListener("submit", async e => {
    e.preventDefault();
    const u = $("#login-user").value, p = $("#login-pass").value;
    if (!u || !p) { $("#login-err").textContent = "Renseignez l'identifiant et le mot de passe."; return; }
    let ok = false;
    try { ok = await AUTH.login(u, p); } catch (_) { $("#login-err").textContent = "La connexion nécessite une page en HTTPS."; return; }
    if (!ok) { $("#login-err").textContent = "Identifiant ou mot de passe incorrect."; return; }
    $("#login-pass").value = "";
    closeLogin(); renderSession(); toast(`Connecté en tant que ${u}.`);
    if (pending) { const p2 = pending; pending = null; go(p2.type, p2.id); } else route();
  });

  /* ---------- Navigation ---------- */
  const VIEWS = ["catalogue", "offres", "api", "documentation"];
  function show(view) {
    VIEWS.forEach(v => { $("#view-" + v).hidden = v !== view; });
    document.querySelectorAll(".nav a").forEach(a => a.setAttribute("aria-current", a.dataset.go === (view === "api" ? "catalogue" : view) ? "page" : "false"));
  }
  function setHash(h) { try { history.pushState(null, "", "#" + h); } catch (_) { location.hash = h; } }

  function demoUrl(id) { return "demo.html#" + id; }

  function showGate(type, api) {
    pending = { type, id: api.id };
    $("#gate").hidden = false;
    $("#gate-title").textContent = `Connectez-vous pour ${type === "demo" ? "voir la démo" : "tester l'API"} « ${api.name} »`;
    show("offres"); window.scrollTo(0, 0);
  }

  /* Ouvrir une API : essai (fiche) ou démo. Non connecté → page Offres. */
  function go(type, id) {
    const api = APIS.find(a => a.id === id);
    if (!api) return;
    if (!AUTH.get()) { showGate(type, api); setHash("offres"); return; }
    if (type === "demo") { location.href = demoUrl(id); return; }
    show("api"); setHash("api-" + id); window.scrollTo(0, 0); renderApi(api);
  }

  function route() {
    const h = decodeURIComponent(location.hash.slice(1)) || "catalogue";
    if (h.startsWith("api-")) {
      const id = h.slice(4);
      if (!AUTH.get()) { go("try", id); return; }
      const api = APIS.find(a => a.id === id);
      if (api) { show("api"); renderApi(api); return; }
    }
    if (h === "contact") { show("catalogue"); setTimeout(() => $("#contact").scrollIntoView(), 0); return; }
    if (h !== "offres") $("#gate").hidden = true;
    show(VIEWS.includes(h) ? h : "catalogue");
  }
  window.addEventListener("hashchange", route);

  document.addEventListener("click", e => {
    const t = e.target.closest("[data-go],[data-login],[data-try],[data-demo],[data-link],[data-signup]");
    if (!t) return;
    if (t.dataset.go) {
      e.preventDefault();
      if (t.dataset.go === "contact") { $("#contact").scrollIntoView({ behavior: "smooth" }); return; }
      if (t.dataset.go !== "offres") pending = null;
      $("#gate").hidden = t.dataset.go !== "offres" || !pending;
      show(t.dataset.go); setHash(t.dataset.go); window.scrollTo(0, 0);
    } else if (t.hasAttribute("data-login")) { e.preventDefault(); openLogin(); }
    else if (t.dataset.try) { e.preventDefault(); go("try", t.dataset.try); }
    else if (t.dataset.demo) { e.preventDefault(); go("demo", t.dataset.demo); }
    else if (t.dataset.link) {
      e.preventDefault();
      const u = location.href.split("#")[0] + "#api-" + t.dataset.link;
      copy(u, "Lien de l'API copié.");
    } else if (t.dataset.signup) {
      e.preventDefault();
      if (AUTH.get()) { toast("Vous êtes déjà connecté. Le changement d'offre ouvrira avec la mise en production."); return; }
      toast("L'inscription ouvrira avec la mise en production. Connectez-vous avec le compte de test.");
      openLogin();
    }
  });

  /* ---------- Catalogue ---------- */
  function renderFams() {
    const counts = FAMS.map((_, i) => APIS.filter(a => a.fam === i).length);
    $("#fams").innerHTML = `<button class="chip" type="button" data-fam="-1" aria-pressed="${state.fam === -1}">Toutes <small>${APIS.length}</small></button>` +
      FAMS.map((f, i) => counts[i] ? `<button class="chip" type="button" data-fam="${i}" aria-pressed="${state.fam === i}">${f} <small>${counts[i]}</small></button>` : "").join("");
    document.querySelectorAll("[data-fam]").forEach(b => b.onclick = () => { state.fam = +b.dataset.fam; renderFams(); renderGrid(); });
  }
  const norm = s => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  function renderGrid() {
    const q = norm(state.q);
    const list = APIS.filter(a => (state.fam < 0 || a.fam === state.fam) &&
      (!q || norm([a.name, a.desc, a.mod, FAMS[a.fam], ...a.eps.map(e => e.p + " " + e.t)].join(" ")).includes(q)));
    $("#count").textContent = `${list.length} API${list.length > 1 ? "" : ""} ${state.fam >= 0 ? "· " + FAMS[state.fam] : ""}`;
    $("#grid").innerHTML = list.length ? list.map(a => `
      <article class="card">
        <a class="card-kebab" href="${docUrl(a.id)}" target="_blank" rel="noopener" title="Documentation" aria-label="Documentation de l'API ${esc(a.name)}">${svg("dots", 22)}</a>
        <button class="card-main" type="button" data-try="${a.id}">
          <span class="card-ico">${svg(a.ico, 58)}</span>
          <h2>${esc(a.name)}</h2>
          <p>${esc(a.desc)}</p>
          <span class="card-meta"><span class="pill ${STATUS[a.st][1]}">${STATUS[a.st][0]}</span>${esc(a.mod)}</span>
        </button>
        <div class="card-foot">
          <button class="btn btn-dark" type="button" data-demo="${a.id}">Démo</button>
          <button class="btn btn-primary" type="button" data-try="${a.id}">Essayer</button>
          <button class="icon-btn" type="button" data-link="${a.id}" title="Copier le lien" aria-label="Copier le lien de l'API ${esc(a.name)}">${svg("link", 16)}</button>
        </div>
      </article>`).join("") :
      `<div class="empty">Aucune API ne correspond à « ${esc(state.q)} ». Essayez « adresse », « itinéraire » ou « école ».</div>`;
  }
  $("#q").addEventListener("input", e => { state.q = e.target.value.trim(); renderGrid(); });
  $("#search-form").addEventListener("submit", e => e.preventDefault());

  /* ---------- Fiche API ---------- */
  let cur = { api: null, ep: 0, lang: "curl", tab: "ref" };
  function hlJSON(o) {
    return esc(JSON.stringify(o, null, 2))
      .replace(/(&quot;[^&]*?&quot;)(\s*:)/g, '<span class="k">$1</span>$2')
      .replace(/:\s(&quot;.*?&quot;)/g, ': <span class="s">$1</span>')
      .replace(/([\[,\s])(-?\d+\.?\d*)(?=[,\s\]\n])/g, '$1<span class="n">$2</span>');
  }
  function params() {
    const o = {};
    cur.api.eps[cur.ep].q.forEach(([k, , , , v], i) => { const el = document.getElementById("p-" + i); o[k] = el ? el.value : v; });
    return o;
  }
  function buildUrl(ep, p) {
    const path = ep.p.replace(/\{(\w+)\}/g, (_, k) => encodeURIComponent(p[k] || k));
    const qs = ep.q.filter(([k]) => !ep.p.includes("{" + k + "}") && p[k] !== "").map(([k]) => `${k}=${encodeURIComponent(p[k])}`).join("&");
    return { path, qs, full: BASE + path + (ep.m === "GET" && qs ? "?" + qs : "") };
  }
  function sample(ep, p, lang, key) {
    const u = buildUrl(ep, p);
    const body = Object.fromEntries(ep.q.filter(([k]) => !ep.p.includes("{" + k + "}") && p[k] !== "").map(([k]) => [k, p[k]]));
    const bodyStr = JSON.stringify(body);
    if (lang === "curl") return ep.m === "GET"
      ? `curl "${u.full}" \\\n  -H "X-API-Key: ${key}"`
      : `curl -X POST "${BASE}${u.path}" \\\n  -H "X-API-Key: ${key}" \\\n  -H "Content-Type: application/json" \\\n  -d '${bodyStr}'`;
    if (lang === "python") return `import requests\n\nr = requests.${ep.m.toLowerCase()}(\n    "${BASE}${u.path}",\n    headers={"X-API-Key": "${key}"},\n    ${ep.m === "GET" ? "params" : "json"}=${JSON.stringify(body)},\n    timeout=10,\n)\nr.raise_for_status()\nprint(r.json())`;
    if (lang === "js") return `const res = await fetch(\n  "${ep.m === "GET" ? u.full : BASE + u.path}",\n  {\n    method: "${ep.m}",\n    headers: { "X-API-Key": "${key}"${ep.m === "POST" ? ', "Content-Type": "application/json"' : ""} },${ep.m === "POST" ? `\n    body: JSON.stringify(${bodyStr}),` : ""}\n  }\n);\nconst data = await res.json();`;
    return `# Console Python de QGIS\nimport json\nfrom qgis.core import QgsNetworkAccessManager\nfrom qgis.PyQt.QtNetwork import QNetworkRequest\nfrom qgis.PyQt.QtCore import QUrl\n\nreq = QNetworkRequest(QUrl("${u.full}"))\nreq.setRawHeader(b"X-API-Key", b"${key}")\nrep = QgsNetworkAccessManager.instance().blockingGet(req)\nprint(json.loads(bytes(rep.content())))`;
  }
  const costOf = ep => /isochrone|route|matrix/.test(ep.p) ? 5 : 1;

  function renderApi(a) {
    if (cur.api !== a) cur = { api: a, ep: 0, lang: "curl", tab: "ref" };
    const ep = a.eps[cur.ep];
    $("#api-root").innerHTML = `
      <nav class="crumb" aria-label="Fil d'Ariane"><a href="#catalogue" data-go="catalogue">API</a><span>/</span><span>${FAMS[a.fam]}</span><span>/</span><span>${esc(a.name)}</span></nav>
      <div class="api-head">
        <span class="card-ico">${svg(a.ico, 34)}</span>
        <div style="flex:1;min-width:0"><h1>${esc(a.name)}</h1><p>${esc(a.desc)}</p>
          <div class="meta"><span class="pill ${STATUS[a.st][1]}">${STATUS[a.st][0]}</span><span>${esc(a.mod)}</span>${a.stack.map(s => `<span class="tool">${esc(s)}</span>`).join("")}</div></div>
        <div class="api-actions">
          <a class="btn btn-dark" href="${demoUrl(a.id)}">${svg("play", 16)} Démo cartographique</a>
          <a class="btn btn-ghost" href="${docUrl(a.id)}" target="_blank" rel="noopener">Documentation</a>
        </div>
      </div>
      <div class="api-body">
        <nav class="eps" aria-label="Points d'accès">${a.eps.map((e, i) => `<button class="ep" type="button" data-ep="${i}" aria-pressed="${i === cur.ep}"><span class="m m-${e.m}">${e.m}</span><code>${esc(e.p)}</code></button>`).join("")}</nav>
        <div class="panel">
          <div class="box">
            <h3>${esc(ep.t)}</h3><p>${esc(ep.d)}</p>
            <div class="url"><span class="m m-${ep.m}">${ep.m}</span><span>${esc(ep.p)}</span></div>
            <div class="tbl-wrap"><table><thead><tr><th>Paramètre</th><th>Type</th><th>Description</th></tr></thead><tbody>
              ${ep.q.map(([k, t, d, r]) => `<tr><td><code>${esc(k)}</code>${r ? '<span class="req">requis</span>' : ""}</td><td>${esc(t)}</td><td>${esc(d) || "—"}</td></tr>`).join("")}
            </tbody></table></div>
          </div>
          <div class="box">
            <h3>Essayer</h3>
            <form id="tryform">
              ${ep.q.map(([k, , , , v], i) => `<div class="field"><label for="p-${i}">${esc(k)}</label><input id="p-${i}" value="${esc(v)}" autocomplete="off"></div>`).join("")}
              <button class="btn btn-primary" type="submit">${svg("send", 16)} Envoyer la requête · ${costOf(ep)} crédit${costOf(ep) > 1 ? "s" : ""}</button>
            </form>
            <div class="code-tabs" role="tablist">${[["curl", "cURL"], ["python", "Python"], ["js", "JavaScript"], ["pyqgis", "PyQGIS"]].map(([k, l]) => `<button type="button" role="tab" data-lang="${k}" aria-selected="${cur.lang === k}">${l}</button>`).join("")}</div>
            <div class="code"><button class="copy" type="button" id="copy-code">Copier</button><pre id="code-out"></pre></div>
            <div class="resp-head"><span>Réponse <span class="status" id="resp-status">—</span></span><span class="sim">Réponse simulée, données fictives</span></div>
            <div class="code round"><pre id="resp-out"><span class="d">Envoyez la requête pour afficher la réponse.</span></pre></div>
          </div>
        </div>
      </div>`;
    document.querySelectorAll("[data-ep]").forEach(b => b.onclick = () => { cur.ep = +b.dataset.ep; renderApi(a); });
    document.querySelectorAll("[data-lang]").forEach(b => b.onclick = () => {
      cur.lang = b.dataset.lang;
      document.querySelectorAll("[data-lang]").forEach(x => x.setAttribute("aria-selected", String(x === b)));
      updCode();
    });
    $("#tryform").addEventListener("input", updCode);
    $("#tryform").addEventListener("submit", e => { e.preventDefault(); run(); });
    $("#copy-code").onclick = () => copy(sample(a.eps[cur.ep], params(), cur.lang, AUTH.get()?.apiKey || "VOTRE_CLE"));
    updCode();
  }
  function updCode() { $("#code-out").textContent = sample(cur.api.eps[cur.ep], params(), cur.lang, AUTH.get()?.apiKey || "VOTRE_CLE"); }
  function run() {
    const ep = cur.api.eps[cur.ep], p = params(), st = $("#resp-status");
    const miss = ep.q.filter(([k, , , r]) => r && !p[k]).map(([k]) => k);
    if (miss.length) {
      st.textContent = "400 Bad Request"; st.classList.add("err");
      $("#resp-out").innerHTML = hlJSON({ error: "parametre_manquant", message: `Renseignez : ${miss.join(", ")}` }); return;
    }
    const left = AUTH.spend(costOf(ep));
    st.classList.remove("err"); st.textContent = `200 OK · ${costOf(ep)} crédit${costOf(ep) > 1 ? "s" : ""} · ${left.toLocaleString("fr-FR")} restants`;
    let body; try { body = ep.r(p); } catch (_) { body = { erreur: "exemple indisponible" }; }
    $("#resp-out").innerHTML = hlJSON(body);
    renderSession();
  }

  /* ---------- Démarrage ---------- */
  renderSession(); renderFams(); renderGrid();
  try {
    const pd = JSON.parse(sessionStorage.getItem("cegit.pending") || "null");
    sessionStorage.removeItem("cegit.pending");
    const api = pd && APIS.find(a => a.id === pd.id);
    if (api && !AUTH.get()) { showGate(pd.type, api); }
    else route();
  } catch (_) { route(); }
})();
