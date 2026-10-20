/* Espace compte : tableau de bord, mon compte, clés API, administration (comptes admin).
   Démonstration : toutes les données sont gardées dans le navigateur. */
(function () {
  const { APIS, FAMS, STATUS } = window.CEGIT;
  const { svg, AUTH, esc, toast, copy, store } = window.CEGIT_UI;
  const $ = s => document.querySelector(s);
  const nf = (n, d) => Number(n || 0).toLocaleString("fr-FR", { maximumFractionDigits: d == null ? 0 : d });
  const dfmt = (d, o) => new Date(d).toLocaleDateString("fr-FR", o || { day: "numeric", month: "long", year: "numeric" });
  const apiName = id => (APIS.find(a => a.id === id) || { name: id }).name;
  const PLANS = { "Essai": { price: 0, credits: 2500 }, "Essentiel": { price: 25000, credits: 5000 }, "Professionnel": { price: 450000, credits: 100000 }, "Institution": { price: 1500000, credits: 500000 } };

  /* ---------- Graphiques SVG ---------- */
  function donut(used, total) {
    const r = 54, c = 2 * Math.PI * r, f = total ? Math.min(1, used / total) : 0;
    return `<svg viewBox="0 0 140 140" class="donut" role="img" aria-label="${nf(total - used)} crédits restants sur ${nf(total)}">
      <circle cx="70" cy="70" r="${r}" class="d-track"/>
      <circle cx="70" cy="70" r="${r}" class="d-used" stroke-dasharray="${(c * f).toFixed(1)} ${c.toFixed(1)}" transform="rotate(-90 70 70)"/>
      <text x="70" y="66" class="d-big">${nf(Math.max(0, total - used))}</text><text x="70" y="86" class="d-small">crédits restants</text></svg>`;
  }
  function bins(log, period) {
    const now = new Date(), out = [];
    if (period === "1") {
      const start = new Date(now); start.setMinutes(0, 0, 0); start.setHours(start.getHours() - 23);
      for (let i = 0; i < 24; i++) { const t = new Date(start.getTime() + i * 36e5); out.push({ t: t.getTime(), end: t.getTime() + 36e5, lab: t.getHours() + " h", v: 0, c: 0 }); }
    } else {
      const n = +period, start = new Date(now); start.setHours(0, 0, 0, 0); start.setDate(start.getDate() - n + 1);
      for (let i = 0; i < n; i++) { const t = new Date(start); t.setDate(t.getDate() + i); out.push({ t: t.getTime(), end: t.getTime() + 864e5, lab: t.toLocaleDateString("fr-FR", { day: "numeric", month: "short" }), v: 0, c: 0 }); }
    }
    for (const e of log) { const b = out.find(x => e.t >= x.t && e.t < x.end); if (b) { b.v++; b.c += e.c; } }
    return out;
  }
  function chart(data, kind) {
    const W = 900, H = 230, L = 48, B = 30, T = 14, R = 16, max = Math.max(1, ...data.map(d => d.v));
    const step = Math.pow(10, Math.floor(Math.log10(max))), top = Math.ceil(max / step) * step || 1;
    const x = i => L + (W - L - R) * (data.length === 1 ? 0.5 : i / (data.length - 1));
    const y = v => H - B - (H - B - T) * v / top;
    const ticks = [0, top / 2, top];
    let g = ticks.map(v => `<line x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}" class="c-grid"/><text x="${L - 8}" y="${y(v) + 4}" class="c-lab" text-anchor="end">${nf(v)}</text>`).join("");
    const every = Math.ceil(data.length / 8);
    const last = data.length - 1;
    g += data.map((d, i) => {
      const showIt = i === last || (i % every === 0 && last - i >= every * 0.75);
      return showIt ? `<text x="${x(i)}" y="${H - 8}" class="c-lab" text-anchor="${i === last && data.length > 1 ? "end" : i === 0 ? "start" : "middle"}">${esc(d.lab)}</text>` : "";
    }).join("");
    if (kind === "bar") {
      const bw = Math.max(4, (W - L - R) / data.length * 0.6);
      g += data.map((d, i) => `<rect x="${x(i) - bw / 2}" y="${y(d.v)}" width="${bw}" height="${Math.max(0, H - B - y(d.v))}" class="c-bar" rx="2"><title>${esc(d.lab)} : ${nf(d.v)} appels</title></rect>`).join("");
    } else {
      const pts = data.map((d, i) => `${x(i).toFixed(1)},${y(d.v).toFixed(1)}`).join(" ");
      g += `<polygon points="${x(0)},${y(0)} ${pts} ${x(data.length - 1)},${y(0)}" class="c-area"/><polyline points="${pts}" class="c-line"/>`;
      const li = data.length - 1; g += `<circle cx="${x(li)}" cy="${y(data[li].v)}" r="4" class="c-dot"/>`;
    }
    return `<svg viewBox="0 0 ${W} ${H}" class="chart" role="img" aria-label="Appels API sur la période">${g}</svg>`;
  }

  /* ---------- Tableau de bord ---------- */
  function dashboard() {
    const s = AUTH.get(), root = $("#dash-root");
    const st = store.get("cegit.dash", { kind: "area", period: "7", api: "", tperiod: "30" });
    const log = AUTH.usage();
    const used = Math.max(0, (s.creditsTotal || 0) - (s.credits || 0));
    const per = +st.period === 1 ? 864e5 : +st.period * 864e5;
    const inP = log.filter(e => e.t >= Date.now() - per);
    const tper = +st.tperiod * 864e5;
    const tlog = log.filter(e => e.t >= Date.now() - tper && (!st.api || e.api === st.api));
    const rows = (st.api ? APIS.filter(a => a.id === st.api) : APIS).map(a => {
      const l = tlog.filter(e => e.api === a.id);
      return { a, n: l.length, e: l.reduce((x, y) => x + y.e, 0), c: l.reduce((x, y) => x + y.c, 0) };
    }).sort((p, q) => q.c - p.c || q.n - p.n || p.a.name.localeCompare(q.a.name));
    const maxC = Math.max(1, ...rows.map(r => r.c));
    const data = bins(log, st.period);
    root.innerHTML = `
      <div class="acct-head"><h1>Mon tableau de bord</h1><a class="btn btn-ghost" href="#catalogue" data-go="catalogue">Explorer les API</a></div>
      <section class="dash-top">
        <div class="welcome">
          <h2>C'est un plaisir de vous compter parmi nous, ${esc(s.prenom)}.</h2>
          <p>Une question ? Écrivez-nous à <b>api@cegitgroup.com</b>. Bon développement !</p>
          <p>Votre offre <b>${esc(s.plan)}</b> ${s.cancelled ? "a été résiliée et reste active" : "est valable"} jusqu'au <b>${dfmt(s.expires)}</b>.</p>
          <div class="kpis">
            <div><b>${nf(inP.length)}</b><span>appels sur la période</span></div>
            <div><b>${nf(inP.reduce((a, e) => a + e.c, 0))}</b><span>crédits consommés</span></div>
            <div><b>${nf(inP.reduce((a, e) => a + e.e, 0))}</b><span>erreurs</span></div>
            <div><b>${new Set(inP.map(e => e.api)).size}</b><span>API utilisées</span></div>
          </div>
        </div>
        <div class="credit-box">${donut(used, s.creditsTotal || 0)}<p>Du ${dfmt(s.since, { day: "numeric", month: "long" })} au ${dfmt(s.expires)}<br>${esc(s.plan)} · ${nf(s.creditsTotal)} crédits</p></div>
      </section>
      <section class="panel-block">
        <div class="block-head"><h2>Appels API</h2>
          <div class="filters"><label for="d-kind">Type de graphique</label><select id="d-kind"><option value="area">Aires</option><option value="bar">Barres</option></select>
          <label for="d-per" class="sr">Période</label><select id="d-per"><option value="1">24 heures</option><option value="7">7 jours</option><option value="30">30 jours</option></select></div></div>
        ${data.some(d => d.v) ? chart(data, st.kind) : `<div class="no-data">Aucune donnée sur la période. Lancez une <a href="demo.html">démo</a> ou un essai depuis la fiche d'une API pour voir votre consommation.</div>`}
      </section>
      <section class="panel-block">
        <div class="block-head"><h2>Utilisation du crédit</h2>
          <div class="filters"><label for="d-api" class="sr">API</label><select id="d-api"><option value="">Toutes les API</option>${APIS.map(a => `<option value="${a.id}"${a.id === st.api ? " selected" : ""}>${esc(a.name)}</option>`).join("")}</select>
          <label for="d-tper" class="sr">Période</label><select id="d-tper"><option value="1">24 heures</option><option value="7">7 jours</option><option value="30">30 jours</option></select></div></div>
        <div class="tbl-wrap"><table class="usage"><thead><tr><th>API</th><th class="num">Appels</th><th class="num">Erreurs</th><th class="num">Crédits</th><th>Utilisation du crédit</th></tr></thead><tbody>
          ${rows.map(r => `<tr><td>${esc(r.a.name)}</td><td class="num">${nf(r.n)}</td><td class="num">${nf(r.e)}</td><td class="num">${nf(r.c)}</td><td><div class="ubar"><i style="width:${(r.c / maxC * 100).toFixed(1)}%"></i></div></td></tr>`).join("")}
        </tbody></table></div>
      </section>`;
    $("#d-kind").value = st.kind; $("#d-per").value = st.period; $("#d-tper").value = st.tperiod;
    const save = () => { store.set("cegit.dash", { kind: $("#d-kind").value, period: $("#d-per").value, api: $("#d-api").value, tperiod: $("#d-tper").value }); dashboard(); };
    ["#d-kind", "#d-per", "#d-api", "#d-tper"].forEach(id => $(id).onchange = save);
  }

  /* ---------- Mon compte ---------- */
  const COUNTRIES = ["Sénégal", "Gambie", "Mali", "Mauritanie", "Guinée", "Guinée-Bissau", "Côte d'Ivoire", "Burkina Faso", "Niger", "Bénin", "Togo", "Cap-Vert", "France", "Autre"];
  function account() {
    const s = AUTH.get(), root = $("#acct-root"), plan = PLANS[s.plan] || PLANS["Essai"];
    const invoices = s.plan === "Essai" ? [] : [0, 1, 2].map(i => { const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - i); return { n: `F-${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}-0${17 + i}`, d, m: plan.price, st: i === 0 ? "À payer" : "Payée" }; });
    root.innerHTML = `
      <div class="acct-head"><h1>Mon compte</h1></div>
      <div class="acct-grid">
        <section class="sub-card">
          <h2>Abonnement</h2>
          <div class="sub-body">
            <p class="sub-plan">${esc(s.plan)}</p>
            <p class="sub-cred"><b>${nf(s.credits)}</b> crédits restants sur ${nf(s.creditsTotal)}</p>
            <p class="sub-date">${s.cancelled ? "Résilié · actif jusqu'au" : "Valable jusqu'au"} ${dfmt(s.expires)}</p>
            <a class="btn btn-primary" href="#offres" data-go="offres">Changer d'offre</a>
            <div id="cancel-zone">${s.cancelled ? `<button class="link-btn" type="button" id="reactivate">Réactiver l'abonnement</button>` : `<button class="link-btn" type="button" id="cancel">Annuler l'abonnement</button>`}</div>
          </div>
        </section>
        <section class="panel-block">
          <h2>Profil</h2>
          <form id="profile" class="form-grid" autocomplete="on">
            <div class="field"><label for="pf-prenom">Prénom</label><input id="pf-prenom" autocomplete="given-name" value="${esc(s.prenom || "")}" required></div>
            <div class="field"><label for="pf-nom">Nom</label><input id="pf-nom" autocomplete="family-name" value="${esc(s.nom || "")}" required></div>
            <div class="field"><label for="pf-ent">Entreprise ou organisation</label><input id="pf-ent" autocomplete="organization" value="${esc(s.entreprise || "")}"></div>
            <div class="field"><label for="pf-mail">E-mail</label><input id="pf-mail" type="email" autocomplete="email" value="${esc(s.email || "")}" required></div>
            <div class="field"><label for="pf-tel">Téléphone</label><input id="pf-tel" type="tel" autocomplete="tel" placeholder="+221 …" value="${esc(s.telephone || "")}"></div>
            <div class="field"><label for="pf-pays">Pays</label><select id="pf-pays">${COUNTRIES.map(c => `<option${c === (s.pays || "Sénégal") ? " selected" : ""}>${c}</option>`).join("")}</select></div>
            <div class="form-actions"><p class="form-err" id="pf-err"></p><button class="btn btn-primary" type="submit">Enregistrer le profil</button></div>
          </form>
        </section>
      </div>
      <section class="panel-block">
        <h2>Facturation</h2>
        <form id="billing" class="form-grid">
          <fieldset class="field pay"><legend>Moyen de paiement</legend>${["Wave", "Orange Money", "Carte bancaire", "Virement"].map(m => `<label><input type="radio" name="pay" value="${m}"${(s.paiement || "Wave") === m ? " checked" : ""}> ${m}</label>`).join("")}</fieldset>
          <div class="field"><label for="bl-ninea">NINEA (entreprises)</label><input id="bl-ninea" value="${esc(s.ninea || "")}" placeholder="Numéro d'identification fiscale"></div>
          <div class="field wide"><label for="bl-addr">Adresse de facturation</label><input id="bl-addr" autocomplete="street-address" value="${esc(s.adresse || "")}" placeholder="Rue, quartier, ville"></div>
          <div class="form-actions"><span></span><button class="btn btn-ghost" type="submit">Enregistrer la facturation</button></div>
        </form>
        <h3>Factures</h3>
        ${invoices.length ? `<div class="tbl-wrap"><table class="usage"><thead><tr><th>Numéro</th><th>Date</th><th class="num">Montant</th><th>Statut</th></tr></thead><tbody>${invoices.map(v => `<tr><td class="mono">${v.n}</td><td>${dfmt(v.d)}</td><td class="num">${nf(v.m)} FCFA</td><td><span class="pill ${v.st === "Payée" ? "st-proto" : "st-beta"}">${v.st}</span></td></tr>`).join("")}</tbody></table></div><p class="form-note">Factures fictives de démonstration.</p>` : `<p class="no-data small">Aucune facture : l'essai est gratuit.</p>`}
      </section>`;
    $("#profile").addEventListener("submit", e => {
      e.preventDefault();
      const mail = $("#pf-mail").value.trim();
      if (!$("#pf-prenom").value.trim() || !$("#pf-nom").value.trim()) { $("#pf-err").textContent = "Le prénom et le nom sont obligatoires."; return; }
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(mail)) { $("#pf-err").textContent = "Saisissez une adresse e-mail valide."; return; }
      $("#pf-err").textContent = "";
      AUTH.update({ prenom: $("#pf-prenom").value.trim(), nom: $("#pf-nom").value.trim(), entreprise: $("#pf-ent").value.trim(), email: mail, telephone: $("#pf-tel").value.trim(), pays: $("#pf-pays").value });
      window.dispatchEvent(new Event("cegit:session")); toast("Profil enregistré.");
    });
    $("#billing").addEventListener("submit", e => {
      e.preventDefault();
      AUTH.update({ paiement: (document.querySelector('input[name="pay"]:checked') || {}).value, ninea: $("#bl-ninea").value.trim(), adresse: $("#bl-addr").value.trim() });
      toast("Informations de facturation enregistrées.");
    });
    const cz = $("#cancel-zone");
    if ($("#cancel")) $("#cancel").onclick = () => {
      cz.innerHTML = `<p class="confirm">Résilier ? Vos crédits restent utilisables jusqu'au ${dfmt(s.expires)}.</p><div class="confirm-btns"><button class="btn btn-ghost btn-sm" type="button" id="c-no">Garder</button><button class="btn btn-dark btn-sm" type="button" id="c-yes">Résilier</button></div>`;
      $("#c-no").onclick = account; $("#c-yes").onclick = () => { AUTH.update({ cancelled: true }); toast("Abonnement résilié."); account(); };
    };
    if ($("#reactivate")) $("#reactivate").onclick = () => { AUTH.update({ cancelled: false }); toast("Abonnement réactivé."); account(); };
  }

  /* ---------- Clés API ---------- */
  function keys() {
    const s = AUTH.get(), root = $("#keys-root");
    root.innerHTML = `
      <div class="acct-head"><h1>Clés API</h1></div>
      <section class="panel-block keys">
        <p class="lead">Transmettez la clé dans l'en-tête <code>X-API-Key</code>. Le secret sert à obtenir un jeton OAuth2 pour les API à accès restreint. Ne les publiez jamais dans du code côté navigateur.</p>
        <div class="key-row"><label for="k-key">Clé</label><div class="key-field"><input id="k-key" class="mono" readonly value="${esc(s.apiKey)}"><button class="btn btn-ghost" type="button" id="k-copy">Copier</button></div></div>
        <div class="key-row"><label for="k-sec">Secret</label><div class="key-field"><input id="k-sec" class="mono" type="password" readonly value="${esc(s.secret)}"><button class="btn btn-ghost" type="button" id="k-show">Afficher</button><button class="btn btn-ghost" type="button" id="k-copy2">Copier</button></div></div>
        <p class="form-note">Créée le ${dfmt(s.keyCreated, { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
        <div id="regen-zone"><button class="btn btn-primary" type="button" id="k-regen">${svg("reset", 16)} Régénérer la clé</button></div>
        <h3>Exemple d'appel</h3>
        <pre class="snippet">curl "https://api.cegitgroup.com/v1/geocode?q=Thiès" \\\n  -H "X-API-Key: ${esc(s.apiKey)}"</pre>
      </section>`;
    $("#k-copy").onclick = () => copy(s.apiKey, "Clé copiée.");
    $("#k-copy2").onclick = () => copy(s.secret, "Secret copié.");
    $("#k-show").onclick = () => { const i = $("#k-sec"), show = i.type === "password"; i.type = show ? "text" : "password"; $("#k-show").textContent = show ? "Masquer" : "Afficher"; };
    $("#k-regen").onclick = () => {
      $("#regen-zone").innerHTML = `<p class="confirm">L'ancienne clé cessera de fonctionner immédiatement dans toutes vos applications.</p><div class="confirm-btns"><button class="btn btn-ghost btn-sm" type="button" id="r-no">Annuler</button><button class="btn btn-dark btn-sm" type="button" id="r-yes">Régénérer</button></div>`;
      $("#r-no").onclick = keys; $("#r-yes").onclick = () => { AUTH.regenerate(); toast("Nouvelle clé générée."); window.dispatchEvent(new Event("cegit:session")); keys(); };
    };
  }

  /* ---------- Administration ---------- */
  const SEED = [
    ["Awa", "Ndiaye", "Commune de démonstration (exemple)", "a.ndiaye@commune-exemple.sn", "Institution", 412300, 2, "Actif"],
    ["Moussa", "Fall", "Société de livraison (exemple)", "m.fall@livraison-exemple.sn", "Professionnel", 61850, 0, "Actif"],
    ["Fatou", "Sarr", "Microfinance (exemple)", "f.sarr@mf-exemple.sn", "Professionnel", 22400, 1, "Actif"],
    ["Ibrahima", "Diallo", "ONG santé (exemple)", "i.diallo@ong-exemple.org", "Essentiel", 3120, 3, "Actif"],
    ["Mariama", "Ba", "Bureau d'études (exemple)", "m.ba@be-exemple.sn", "Essentiel", 880, 6, "Actif"],
    ["Cheikh", "Sy", "Start-up (exemple)", "c.sy@startup-exemple.sn", "Essai", 1940, 1, "Actif"],
    ["Ndèye", "Gueye", "Université (exemple)", "n.gueye@univ-exemple.sn", "Essai", 2500, 12, "Actif"],
    ["Ousmane", "Kane", "Assurance (exemple)", "o.kane@assur-exemple.sn", "Professionnel", 0, 40, "Suspendu"]
  ].map(([prenom, nom, org, email, plan, credits, days, statut], i) => ({ id: "u" + (i + 1), prenom, nom, org, email, plan, credits, last: Date.now() - days * 864e5, statut }));
  const users = () => store.get("cegit.admin.users", SEED);
  const saveUsers = u => store.set("cegit.admin.users", u);
  const audit = msg => { const l = store.get("cegit.admin.audit", []); l.unshift({ t: Date.now(), who: AUTH.get().user, msg }); store.set("cegit.admin.audit", l.slice(0, 200)); };
  const overrides = () => store.get("cegit.admin.apis", {});
  let adminTab = "overview", ufilter = { q: "", plan: "" };

  function seededCalls() {
    const out = []; let s = 7;
    for (let i = 29; i >= 0; i--) { s = (s * 9301 + 49297) % 233280; const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - i); const wd = d.getDay(); out.push({ lab: d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" }), v: Math.round((wd === 0 || wd === 6 ? 2600 : 5200) * (0.75 + (s / 233280) * 0.5) * (1 + (29 - i) * 0.012)) }); }
    return out;
  }
  function admin() {
    const root = $("#admin-root");
    if (!AUTH.isAdmin()) { root.innerHTML = `<div class="acct-head"><h1>Administration</h1></div><p class="no-data">Cette page est réservée aux administrateurs.</p>`; return; }
    const tabs = [["overview", "Vue d'ensemble"], ["users", "Utilisateurs"], ["apis", "Catalogue des API"], ["audit", "Journal"]];
    root.innerHTML = `<div class="acct-head"><h1>Administration</h1><span class="pill st-beta">Données de démonstration</span></div>
      <div class="adm-tabs" role="tablist">${tabs.map(([k, l]) => `<button type="button" role="tab" data-at="${k}" aria-selected="${k === adminTab}">${l}</button>`).join("")}</div><div id="adm-body"></div>`;
    root.querySelectorAll("[data-at]").forEach(b => b.onclick = () => { adminTab = b.dataset.at; admin(); });
    ({ overview: admOverview, users: admUsers, apis: admApis, audit: admAudit })[adminTab]();
  }
  function admOverview() {
    const u = users(), act = u.filter(x => x.statut === "Actif");
    const mrr = act.reduce((a, x) => a + (PLANS[x.plan] ? PLANS[x.plan].price : 0), 0);
    const calls = seededCalls(), total = calls.reduce((a, d) => a + d.v, 0);
    const mine = AUTH.usage();
    const top = APIS.map((a, i) => ({ a, v: Math.round(total * [0.24, 0.12, 0.03, 0.05, 0.04, 0.06, 0.03, 0.02, 0.01, 0.07, 0.11, 0.02, 0.03, 0.01, 0.05, 0.02, 0.03, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0][i] || 0) + mine.filter(e => e.api === a.id).length })).sort((p, q) => q.v - p.v).slice(0, 6);
    const tmax = top[0].v || 1;
    const byPlan = Object.keys(PLANS).map(p => [p, u.filter(x => x.plan === p).length]);
    $("#adm-body").innerHTML = `
      <div class="kpis big">
        <div><b>${nf(act.length)}</b><span>comptes actifs sur ${nf(u.length)}</span></div>
        <div><b>${nf(total)}</b><span>appels sur 30 jours</span></div>
        <div><b>${nf(total * 1.4)}</b><span>crédits consommés sur 30 jours</span></div>
        <div><b>${nf(mrr)}</b><span>FCFA de revenu mensuel récurrent</span></div>
      </div>
      <section class="panel-block"><div class="block-head"><h2>Appels sur 30 jours, toutes API</h2></div>${chart(calls, "area")}</section>
      <div class="acct-grid even">
        <section class="panel-block"><h2>API les plus utilisées</h2><ul class="hbars">${top.map(t => `<li><span>${esc(t.a.name)}</span><div class="ubar"><i style="width:${(t.v / tmax * 100).toFixed(1)}%"></i></div><b>${nf(t.v)}</b></li>`).join("")}</ul></section>
        <section class="panel-block"><h2>Comptes par offre</h2><ul class="hbars">${byPlan.map(([p, n]) => `<li><span>${p}</span><div class="ubar"><i style="width:${(n / Math.max(1, ...byPlan.map(x => x[1])) * 100).toFixed(1)}%"></i></div><b>${n}</b></li>`).join("")}</ul></section>
      </div>`;
  }
  function admUsers() {
    let u = users();
    const q = ufilter.q.toLowerCase();
    const list = u.filter(x => (!ufilter.plan || x.plan === ufilter.plan) && (!q || [x.prenom, x.nom, x.org, x.email].join(" ").toLowerCase().includes(q)));
    $("#adm-body").innerHTML = `
      <div class="block-head"><div class="filters"><label for="u-q" class="sr">Rechercher</label><input id="u-q" type="search" placeholder="Rechercher un nom, une organisation…" value="${esc(ufilter.q)}">
        <label for="u-plan" class="sr">Offre</label><select id="u-plan"><option value="">Toutes les offres</option>${Object.keys(PLANS).map(p => `<option${p === ufilter.plan ? " selected" : ""}>${p}</option>`).join("")}</select></div>
        <button class="btn btn-primary" type="button" id="u-new">${svg("plus", 16)} Inviter un utilisateur</button></div>
      <form id="invite" class="panel-block form-grid" hidden>
        <div class="field"><label for="i-pre">Prénom</label><input id="i-pre" required></div><div class="field"><label for="i-nom">Nom</label><input id="i-nom" required></div>
        <div class="field"><label for="i-org">Organisation</label><input id="i-org"></div><div class="field"><label for="i-mail">E-mail</label><input id="i-mail" type="email" required></div>
        <div class="field"><label for="i-plan">Offre</label><select id="i-plan">${Object.keys(PLANS).map(p => `<option>${p}</option>`).join("")}</select></div>
        <div class="form-actions"><p class="form-err" id="i-err"></p><button class="btn btn-ghost" type="button" id="i-cancel">Annuler</button><button class="btn btn-primary" type="submit">Envoyer l'invitation</button></div>
      </form>
      <div class="tbl-wrap"><table class="usage users"><thead><tr><th>Utilisateur</th><th>Organisation</th><th>Offre</th><th class="num">Crédits</th><th>Dernière activité</th><th>Statut</th><th>Actions</th></tr></thead><tbody>
        ${list.map(x => `<tr data-u="${x.id}"><td><b>${esc(x.prenom)} ${esc(x.nom)}</b><br><small>${esc(x.email)}</small></td><td>${esc(x.org)}</td>
          <td><label class="sr" for="pl-${x.id}">Offre</label><select id="pl-${x.id}" data-act="plan">${Object.keys(PLANS).map(p => `<option${p === x.plan ? " selected" : ""}>${p}</option>`).join("")}</select></td>
          <td class="num">${nf(x.credits)}</td><td>${x.statut === "Invité" ? "—" : dfmt(x.last, { day: "numeric", month: "short" })}</td>
          <td><span class="pill ${x.statut === "Actif" ? "st-proto" : x.statut === "Invité" ? "st-spec" : "st-beta"}">${x.statut}</span></td>
          <td class="acts"><button class="btn btn-ghost btn-sm" type="button" data-act="credits">+1 000 crédits</button><button class="btn btn-ghost btn-sm" type="button" data-act="toggle">${x.statut === "Suspendu" ? "Réactiver" : "Suspendre"}</button></td></tr>`).join("") || `<tr><td colspan="7" class="no-data small">Aucun utilisateur ne correspond.</td></tr>`}
      </tbody></table></div><p class="form-note">${nf(list.length)} utilisateur${list.length > 1 ? "s" : ""} affiché${list.length > 1 ? "s" : ""}. Comptes fictifs de démonstration.</p>`;
    $("#u-q").addEventListener("input", e => { ufilter.q = e.target.value; const pos = e.target.selectionStart; admUsers(); const i = $("#u-q"); i.focus(); i.setSelectionRange(pos, pos); });
    $("#u-plan").onchange = e => { ufilter.plan = e.target.value; admUsers(); };
    $("#u-new").onclick = () => { $("#invite").hidden = false; $("#i-pre").focus(); };
    $("#i-cancel").onclick = () => { $("#invite").hidden = true; };
    $("#invite").addEventListener("submit", e => {
      e.preventDefault();
      const mail = $("#i-mail").value.trim();
      if (!$("#i-pre").value.trim() || !$("#i-nom").value.trim() || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(mail)) { $("#i-err").textContent = "Renseignez le prénom, le nom et une adresse e-mail valide."; return; }
      if (u.some(x => x.email.toLowerCase() === mail.toLowerCase())) { $("#i-err").textContent = "Un compte existe déjà avec cette adresse."; return; }
      const plan = $("#i-plan").value;
      u.unshift({ id: "u" + Date.now(), prenom: $("#i-pre").value.trim(), nom: $("#i-nom").value.trim(), org: $("#i-org").value.trim() || "—", email: mail, plan, credits: PLANS[plan].credits, last: Date.now(), statut: "Invité" });
      saveUsers(u); audit(`Invitation envoyée à ${mail} (offre ${plan})`); toast(`Invitation envoyée à ${mail}.`); admUsers();
    });
    document.querySelectorAll("#adm-body tr[data-u]").forEach(tr => {
      const x = u.find(y => y.id === tr.dataset.u);
      tr.querySelector('[data-act="plan"]').onchange = e => { x.plan = e.target.value; saveUsers(u); audit(`Offre de ${x.email} passée à ${x.plan}`); toast("Offre modifiée."); };
      tr.querySelector('[data-act="credits"]').onclick = () => { x.credits += 1000; saveUsers(u); audit(`1 000 crédits ajoutés à ${x.email}`); toast("1 000 crédits ajoutés."); admUsers(); };
      tr.querySelector('[data-act="toggle"]').onclick = () => { x.statut = x.statut === "Suspendu" ? "Actif" : "Suspendu"; saveUsers(u); audit(`Compte ${x.email} : ${x.statut === "Actif" ? "réactivé" : "suspendu"}`); toast(x.statut === "Actif" ? "Compte réactivé." : "Compte suspendu."); admUsers(); };
    });
  }
  function admApis() {
    const ov = overrides();
    $("#adm-body").innerHTML = `
      <p class="lead">Modifiez le statut affiché d'une API ou masquez-la du catalogue public. En démonstration, les changements s'appliquent à ce navigateur.</p>
      <div class="tbl-wrap"><table class="usage"><thead><tr><th>API</th><th>Famille</th><th>Statut</th><th>Visible au catalogue</th></tr></thead><tbody>
        ${APIS.map(a => { const o = ov[a.id] || {}, st = o.st || a.st0 || a.st; return `<tr><td><b>${esc(a.name)}</b><br><small>${esc(a.mod)}</small></td><td>${esc(FAMS[a.fam])}</td>
          <td><label class="sr" for="st-${a.id}">Statut</label><select id="st-${a.id}" data-api="${a.id}" data-k="st">${Object.entries(STATUS).map(([k, v]) => `<option value="${k}"${k === st ? " selected" : ""}>${v[0]}</option>`).join("")}</select></td>
          <td><label class="switch"><input type="checkbox" data-api="${a.id}" data-k="hidden"${o.hidden ? "" : " checked"}><span>${o.hidden ? "Masquée" : "Visible"}</span></label></td></tr>`; }).join("")}
      </tbody></table></div>`;
    document.querySelectorAll("#adm-body [data-api]").forEach(el => el.onchange = () => {
      const o = overrides(), id = el.dataset.api; o[id] = o[id] || {};
      if (el.dataset.k === "st") { o[id].st = el.value; audit(`Statut de ${apiName(id)} : ${STATUS[el.value][0]}`); }
      else { o[id].hidden = !el.checked; el.nextElementSibling.textContent = el.checked ? "Visible" : "Masquée"; audit(`${apiName(id)} ${el.checked ? "affichée" : "masquée"} dans le catalogue`); }
      store.set("cegit.admin.apis", o); window.dispatchEvent(new Event("cegit:catalog")); toast("Catalogue mis à jour.");
    });
  }
  function admAudit() {
    const l = store.get("cegit.admin.audit", []);
    $("#adm-body").innerHTML = l.length ? `<div class="tbl-wrap"><table class="usage"><thead><tr><th>Date</th><th>Administrateur</th><th>Action</th></tr></thead><tbody>${l.map(e => `<tr><td>${dfmt(e.t, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</td><td>${esc(e.who)}</td><td>${esc(e.msg)}</td></tr>`).join("")}</tbody></table></div>`
      : `<p class="no-data">Aucune action enregistrée. Les modifications d'utilisateurs et du catalogue apparaîtront ici.</p>`;
  }

  /* Applique les réglages d'administration au catalogue (statut, visibilité). */
  function applyOverrides() {
    const ov = overrides();
    APIS.forEach(a => { if (a.st0 == null) a.st0 = a.st; const o = ov[a.id] || {}; a.st = o.st || a.st0; a.hidden = !!o.hidden; });
  }
  applyOverrides();
  window.addEventListener("cegit:catalog", applyOverrides);

  window.CEGIT_ACCOUNT = {
    render(view) { ({ "tableau-de-bord": dashboard, "mon-compte": account, "cles-api": keys, "administration": admin })[view](); },
    views: ["tableau-de-bord", "mon-compte", "cles-api", "administration"]
  };
})();
