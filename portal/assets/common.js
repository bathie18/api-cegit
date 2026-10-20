/* Éléments partagés par le portail et les démos : pictogrammes, session, utilitaires. */
(function () {
  const REPO = "https://github.com/bathie18/api-cegit";

  const ICONS = {
    globe: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM3.6 9h16.8M3.6 15h16.8M12 3c2.5 2.5 3.5 5.5 3.5 9s-1 6.5-3.5 9M12 3c-2.5 2.5-3.5 5.5-3.5 9s1 6.5 3.5 9",
    gauge: "M12 21a9 9 0 1 1 0-18 9 9 0 0 1 0 18zM12 14l4-5M10.5 14a1.5 1.5 0 1 0 3 0 1.5 1.5 0 0 0-3 0M6.5 15.5h1M16.5 15.5h1",
    building: "M4 21V5l8-2v18M12 8h8v13M7 8h2M7 12h2M7 16h2M15 12h2M15 16h2M2 21h20",
    mapcheck: "M3 6l6-2 6 2 6-2v8M3 6v14l6-2 6 2M9 4v14M15 6v6M14 17l2 2 4-4",
    mappin: "M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2zM9 4v14M15 6v14M12 13.5s3-2.5 3-5a3 3 0 0 0-6 0c0 2.5 3 5 3 5z",
    map: "M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2zM9 4v14M15 6v14",
    shape: "M4 4l7 3 9-2-2 9 2 6-8-2-8 2 2-8z",
    quarter: "M3 21V11l5-4 5 4v10M13 21v-7l4-3 4 3v7M6 21v-4h4v4M2 21h20",
    clock: "M12 21a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM12 9v4l3 2M9 2h6",
    target: "M11 12a1 1 0 1 0 2 0 1 1 0 0 0-2 0M7 12a5 5 0 1 0 10 0 5 5 0 0 0-10 0M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0",
    arrow: "M3 11l18-8-8 18-2-8z",
    road: "M8 3L4 21M16 3l4 18M12 4v3M12 10v3M12 16v4",
    alert: "M12 3L2 20h20zM12 9v5M12 17v.5",
    aid: "M3 8h18v12H3zM8 8V5h8v3M12 11v6M9 14h6",
    pin: "M12 21s7-6 7-12a7 7 0 0 0-14 0c0 6 7 12 7 12zM12 11a2 2 0 1 0 0-4 2 2 0 0 0 0 4z",
    school: "M2 9l10-5 10 5-10 5zM6 11v5c3 2 9 2 12 0v-5M22 9v6",
    health: "M10 4h4v6h6v4h-6v6h-4v-6H4v-4h6z",
    house: "M3 11l9-8 9 8M5 9v12h14V9M10 21v-6h4v6",
    city: "M3 21h18M5 21V10h4v11M10 21V4h4v17M15 21v-8h4v8",
    coin: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM15 8.5c-.6-1-1.7-1.5-3-1.5-1.7 0-3 .9-3 2.2 0 3 6 1.6 6 4.6 0 1.3-1.3 2.2-3 2.2-1.4 0-2.5-.6-3.1-1.6M12 5.5v13",
    phone: "M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2zM15 3a6 6 0 0 1 6 6M15 7a2 2 0 0 1 2 2",
    compass: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM15.5 8.5l-2 5-5 2 2-5z",
    mail: "M3 4h18v16H3zM3 8h18M15 14a3 3 0 1 1-1-2.2V15a1.5 1.5 0 0 0 3 0v-1a5 5 0 1 0-2 4",
    phonecheck: "M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2zM14 6l2 2 4-4",
    leaf: "M5 19c0-9 6-14 15-14 0 9-5 15-14 15M5 19l7-7",
    /* interface */
    search: "M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM20 20l-4-4",
    link: "M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1",
    dots: "M12 5.5v.01M12 12v.01M12 18.5v.01",
    chevron: "M6 9l6 6 6-6",
    lock: "M7 11V8a5 5 0 0 1 10 0v3M5 11h14v10H5z",
    user: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0",
    close: "M6 6l12 12M18 6L6 18",
    play: "M7 5v14l11-7z",
    send: "M5 12h14M13 6l6 6-6 6",
    back: "M19 12H5M11 18l-6-6 6-6",
    plus: "M12 5v14M5 12h14",
    draw: "M3 17L17 3l4 4L7 21H3zM14 6l4 4",
    reset: "M4 4v6h6M20 20v-6h-6M5.5 15a7 7 0 0 0 12.4 1.6M18.5 9A7 7 0 0 0 6.1 7.4",
    chart: "M4 20V10M10 20V4M16 20v-7M22 20H2",
    key: "M14 10a4 4 0 1 0-1.2 2.8L21 21M17 17l2-2M19 19l2-2",
    settings: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.6 1.6 0 0 0-1-1.5 1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.6 1.6 0 0 0 1.5-1 1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H9a1.6 1.6 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V9a1.6 1.6 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1z"
  };

  function svg(name, size, cls) {
    const d = ICONS[name] || ICONS.pin;
    return `<svg viewBox="0 0 24 24" width="${size || 20}" height="${size || 20}" class="ico ${cls || ""}" aria-hidden="true"><path d="${d}"/></svg>`;
  }

  /* Session de démonstration.
     ATTENTION : sur un site statique, ce contrôle se fait dans le navigateur et ne protège rien.
     Il simule le parcours utilisateur ; la vraie authentification passera par Keycloak. */
  const ACCOUNTS = {
    "8da193366e1554c08b2870c50f737b9587c3372b656151c4a96028af26f51334": { role: "admin", prenom: "Administrateur", nom: "CEGIT", entreprise: "CEGIT", email: "admin@cegitgroup.com", plan: "Institution", credits: 100000 },
    "6fbb5505b4e31dd25f86218c40e414d668ec947ba987db98414e0845c35d7ff2": { role: "user", prenom: "Utilisateur", nom: "Démo", entreprise: "Entreprise de démonstration", email: "client@exemple.sn", plan: "Essai", credits: 2500 }
  };
  const SKEY = "cegit.session";
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (_) { return (store.mem && k in store.mem) ? store.mem[k] : d; } },
    set(k, v) { store.mem = store.mem || {}; store.mem[k] = v; try { localStorage.setItem(k, JSON.stringify(v)); } catch (_) {} },
    del(k) { if (store.mem) delete store.mem[k]; try { localStorage.removeItem(k); } catch (_) {} }
  };

  async function sha256(text) {
    const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
  }
  function randKey(n) {
    const abc = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
    const a = new Uint32Array(n); (window.crypto || {}).getRandomValues ? crypto.getRandomValues(a) : a.forEach((_, i) => { a[i] = Math.random() * 1e9; });
    return Array.from(a, x => abc[x % abc.length]).join("");
  }

  const AUTH = {
    get() { return store.get(SKEY, null); },
    save(s) { store.set(SKEY, s); },
    isAdmin() { const s = AUTH.get(); return !!s && s.role === "admin"; },
    async login(user, pass) {
      const u = String(user).trim().toLowerCase();
      const h = await sha256(u + ":" + pass);
      const acc = ACCOUNTS[h];
      if (!acc) return false;
      const prev = store.get("cegit.profile." + u, null);
      const since = new Date(), exp = new Date(since.getTime() + 30 * 864e5);
      AUTH.save(Object.assign({ user: u, creditsTotal: acc.credits, apiKey: randKey(32), secret: randKey(18), keyCreated: since.toISOString(), since: since.toISOString(), expires: exp.toISOString() }, acc, prev || {}, { user: u, role: acc.role }));
      AUTH.update({});
      return true;
    },
    update(patch) {
      const s = AUTH.get(); if (!s) return null;
      Object.assign(s, patch); AUTH.save(s);
      const keep = ["prenom", "nom", "entreprise", "email", "telephone", "pays", "ninea", "adresse", "paiement", "plan", "credits", "creditsTotal", "apiKey", "secret", "keyCreated", "since", "expires", "cancelled"];
      store.set("cegit.profile." + s.user, Object.fromEntries(keep.filter(k => k in s).map(k => [k, s[k]])));
      return s;
    },
    logout() { store.del(SKEY); },
    spend(n) {
      const s = AUTH.get(); if (!s) return 0;
      return AUTH.update({ credits: Math.max(0, (s.credits || 0) - (n || 1)) }).credits;
    },
    /* Journal de consommation : un enregistrement par appel (console ou démo). */
    record(api, credits, error) {
      const s = AUTH.get(); if (!s) return;
      const k = "cegit.usage." + s.user, log = store.get(k, []);
      log.push({ t: Date.now(), api, c: credits || 0, e: error ? 1 : 0 });
      store.set(k, log.slice(-3000));
      if (credits) AUTH.spend(credits);
    },
    usage() { const s = AUTH.get(); return s ? store.get("cegit.usage." + s.user, []) : []; },
    regenerate() { return AUTH.update({ apiKey: randKey(32), secret: randKey(18), keyCreated: new Date().toISOString() }); }
  };

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  function toast(text) {
    let el = document.getElementById("toast");
    if (!el) { el = document.createElement("div"); el.id = "toast"; el.className = "toast"; el.setAttribute("role", "status"); document.body.appendChild(el); }
    el.textContent = text; el.hidden = false;
    clearTimeout(toast.t); toast.t = setTimeout(() => { el.hidden = true; }, 2800);
  }

  function copy(text, okMsg) {
    try {
      navigator.clipboard.writeText(text).then(() => toast(okMsg || "Copié dans le presse-papiers."), () => toast("Copie refusée : sélectionnez le texte manuellement."));
    } catch (_) { toast("Copie refusée : sélectionnez le texte manuellement."); }
  }

  const docUrl = id => `${REPO}/blob/main/docs/apis/${id}.md`;

  window.CEGIT_UI = { REPO, ICONS, svg, AUTH, esc, toast, copy, docUrl, store };
})();
