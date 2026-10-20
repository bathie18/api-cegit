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
    draw: "M3 17L17 3l4 4L7 21H3zM14 6l4 4"
  };

  function svg(name, size, cls) {
    const d = ICONS[name] || ICONS.pin;
    return `<svg viewBox="0 0 24 24" width="${size || 20}" height="${size || 20}" class="ico ${cls || ""}" aria-hidden="true"><path d="${d}"/></svg>`;
  }

  /* Session de démonstration.
     ATTENTION : sur un site statique, ce contrôle se fait dans le navigateur et ne protège rien.
     Il simule le parcours utilisateur ; la vraie authentification passera par Keycloak. */
  const DEMO_HASHES = ["8da193366e1554c08b2870c50f737b9587c3372b656151c4a96028af26f51334"];
  const SKEY = "cegit.session";

  async function sha256(text) {
    const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
  }

  const AUTH = {
    get() {
      try { return JSON.parse(localStorage.getItem(SKEY)) || null; } catch (_) { return AUTH._mem || null; }
    },
    save(s) {
      AUTH._mem = s;
      try { localStorage.setItem(SKEY, JSON.stringify(s)); } catch (_) {}
    },
    async login(user, pass) {
      const h = await sha256(String(user).trim().toLowerCase() + ":" + pass);
      if (!DEMO_HASHES.includes(h)) return false;
      const key = "cegit_demo_" + h.slice(0, 16);
      AUTH.save({ user: String(user).trim(), plan: "Essai", credits: 2500, apiKey: key, since: new Date().toISOString() });
      return true;
    },
    logout() {
      AUTH._mem = null;
      try { localStorage.removeItem(SKEY); } catch (_) {}
    },
    spend(n) {
      const s = AUTH.get(); if (!s) return 0;
      s.credits = Math.max(0, (s.credits || 0) - (n || 1)); AUTH.save(s); return s.credits;
    }
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

  window.CEGIT_UI = { REPO, ICONS, svg, AUTH, esc, toast, copy, docUrl };
})();
