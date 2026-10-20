#!/usr/bin/env python3
"""Génère docs/apis/<id>.md et openapi/<id>.yaml à partir de portal/assets/catalog.js.

Usage : python3 tools/generer_docs.py   (nécessite Node.js et PyYAML)
Les sections « À compléter » des fiches existantes sont conservées.
"""
import json, os, re, subprocess, sys
import yaml

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BASE = "https://api.cegitgroup.com"
PORTAL = "https://bathie18.github.io/api-cegit/"

JS = r"""
const c = require(process.argv[1]);
const out = { STATUS: c.STATUS, FAMS: c.FAMS, APIS: c.APIS.map(a => ({ ...a, eps: a.eps.map(e => {
  const p = Object.fromEntries(e.q.map(q => [q[0], q[4]]));
  let ex; try { ex = e.r(p); } catch (_) { ex = {}; }
  return { m: e.m, p: e.p, t: e.t, d: e.d, q: e.q, ex };
}) })) };
process.stdout.write(JSON.stringify(out));
"""

def load_catalog():
    path = os.path.join(ROOT, "portal", "assets", "catalog.js")
    res = subprocess.run(["node", "-e", JS, path], capture_output=True, text=True, check=True)
    return json.loads(res.stdout)

def typ(t):
    if "entier" in t: return "integer"
    if t == "décimal": return "number"
    if t == "booléen": return "boolean"
    return "string"

def spec_for(a, status):
    paths = {}
    for e in a["eps"]:
        params, body, req_body = [], {}, []
        for k, t, desc, req, ex in e["q"]:
            inpath = "{" + k + "}" in e["p"]
            if e["m"] == "POST" and not inpath:
                body[k] = {"type": typ(t), "description": desc or k, "example": ex}
                if req: req_body.append(k)
                continue
            params.append({"name": k, "in": "path" if inpath else "query", "required": bool(req) or inpath,
                           "description": f"{desc or k} ({t})", "schema": {"type": typ(t)}, "example": ex})
        op = {
            "summary": e["t"], "description": e["d"],
            "operationId": re.sub(r"[^a-zA-Z0-9]+", "_", e["p"]).strip("_") + "_" + e["m"].lower(),
            "tags": [a["name"]],
            "responses": {
                "200": {"description": "Succès", "content": {"application/json": {"example": e["ex"]}}},
                "400": {"$ref": "#/components/responses/BadRequest"},
                "401": {"$ref": "#/components/responses/Unauthorized"},
                "429": {"$ref": "#/components/responses/TooManyRequests"},
            },
        }
        if params: op["parameters"] = params
        if body:
            op["requestBody"] = {"required": True, "content": {"application/json": {"schema": {"type": "object", "properties": body, "required": req_body}}}}
        paths.setdefault(e["p"], {})[e["m"].lower()] = op
    err = {"description": "", "content": {"application/json": {"schema": {"$ref": "#/components/schemas/Error"}}}}
    return {
        "openapi": "3.1.0",
        "info": {"title": f"CEGIT – {a['name']}", "version": "0.2.0",
                 "description": f"{a['desc']}\n\nStatut : {status}. Exemples de réponses fictifs.",
                 "contact": {"name": "CEGIT", "url": "https://cegitgroup.com/fr", "email": "api@cegitgroup.com"}},
        "servers": [{"url": BASE, "description": "Production (cible)"}, {"url": "https://api-preprod.cegitgroup.com", "description": "Préproduction"}],
        "security": [{"apiKey": []}],
        "tags": [{"name": a["name"], "description": a["mod"]}],
        "paths": paths,
        "components": {
            "securitySchemes": {"apiKey": {"type": "apiKey", "in": "header", "name": "X-API-Key"}},
            "schemas": {"Error": {"type": "object", "properties": {"error": {"type": "string"}, "message": {"type": "string"}}}},
            "responses": {
                "BadRequest": {**err, "description": "Paramètre manquant ou invalide"},
                "Unauthorized": {**err, "description": "Clé absente ou invalide"},
                "TooManyRequests": {**err, "description": "Quota dépassé (voir l'en-tête Retry-After)"},
            },
        },
    }

def keep_section(old, title, default):
    if not old: return default
    m = re.search(rf"## {re.escape(title)}\n\n(.*?)(?=\n## )", old, re.S)
    return m.group(1).strip() + "\n" if m else default

def doc_for(a, fam, status, old):
    md = [f"# {a['name']}\n", f"> {a['desc']}\n",
          "| | |\n|---|---|", f"| Module | {a['mod']} |", f"| Famille | {fam} |", f"| Statut | {status} |",
          f"| Composants | {', '.join(a['stack'])} |", f"| Spécification | [`openapi/{a['id']}.yaml`](../../openapi/{a['id']}.yaml) |",
          f"| Démonstration | [{PORTAL}demo.html#{a['id']}]({PORTAL}demo.html#{a['id']}) (compte requis) |\n",
          "## Description fonctionnelle\n", keep_section(old, "Description fonctionnelle", "_À compléter : besoin couvert, publics visés, acteurs, règles de gestion._\n"),
          "## Données sources\n", keep_section(old, "Données sources", "| Jeu de données | Producteur | Licence | Mise à jour |\n|---|---|---|---|\n| _à compléter_ | | | |\n"),
          "## Règles d'accès\n", keep_section(old, "Règles d'accès", "_À compléter : public, clé simple, ou compte habilité (rôle Keycloak)._\n"),
          "## Points d'accès\n"]
    for e in a["eps"]:
        md.append(f"### `{e['m']} {e['p']}` : {e['t']}\n\n{e['d']}\n")
        md.append("| Paramètre | Type | Requis | Description | Exemple |\n|---|---|---|---|---|")
        for k, t, desc, req, ex in e["q"]:
            r = "oui" if (req or "{" + k + "}" in e["p"]) else "non"
            exs = f"`{ex}`" if ex else ""
            md.append(f"| `{k}` | {t} | {r} | {desc or '—'} | {exs} |")
        p = {k: ex for k, t, d, req, ex in e["q"] if ex}
        path = e["p"]
        for k in list(p):
            if "{" + k + "}" in path: path = path.replace("{" + k + "}", p.pop(k))
        if e["m"] == "GET":
            qs = "&".join(f"{k}={v}" for k, v in p.items())
            curl = f'curl "{BASE}{path}{"?" + qs if qs else ""}" \\\n  -H "X-API-Key: $CEGIT_KEY"'
        else:
            curl = f'curl -X POST "{BASE}{path}" \\\n  -H "X-API-Key: $CEGIT_KEY" \\\n  -H "Content-Type: application/json" \\\n  -d \'{json.dumps(p, ensure_ascii=False)}\''
        md.append("\n**Exemple d'appel**\n\n```bash\n" + curl + "\n```\n")
        md.append("**Exemple de réponse** (fictive)\n\n```json\n" + json.dumps(e["ex"], ensure_ascii=False, indent=2) + "\n```\n")
    md.append(keep_section(old, "Historique", "") and ("## Historique\n\n" + keep_section(old, "Historique", "")) or
              "## Historique\n\n| Version | Date | Changement |\n|---|---|---|\n| 0.2.0 | 2026-10 | Fiche générée depuis le catalogue du portail |\n")
    return "\n".join(md)

def main():
    c = load_catalog()
    docs, specs = os.path.join(ROOT, "docs", "apis"), os.path.join(ROOT, "openapi")
    os.makedirs(docs, exist_ok=True); os.makedirs(specs, exist_ok=True)
    ids = {a["id"] for a in c["APIS"]}
    for d, ext in ((docs, ".md"), (specs, ".yaml")):
        for f in os.listdir(d):
            if f.endswith(ext) and not f.startswith("_") and f[: -len(ext)] not in ids:
                os.remove(os.path.join(d, f)); print("supprimé", f)
    for a in c["APIS"]:
        status = c["STATUS"][a["st"]][0]
        mdp = os.path.join(docs, a["id"] + ".md")
        old = open(mdp, encoding="utf-8").read() + "\n## " if os.path.exists(mdp) else None
        open(mdp, "w", encoding="utf-8").write(doc_for(a, c["FAMS"][a["fam"]], status, old))
        y = "# Généré depuis portal/assets/catalog.js par tools/generer_docs.py.\n" + yaml.safe_dump(spec_for(a, status), allow_unicode=True, sort_keys=False, width=110)
        open(os.path.join(specs, a["id"] + ".yaml"), "w", encoding="utf-8").write(y)
    # Tableau du README
    rows = "\n".join(f"| [{a['name']}](docs/apis/{a['id']}.md) | {a['mod']} | {c['FAMS'][a['fam']]} | {c['STATUS'][a['st']][0]} | [YAML](openapi/{a['id']}.yaml) |" for a in c["APIS"])
    table = "| API | Module | Famille | Statut | Spécification |\n|---|---|---|---|---|\n" + rows
    rp = os.path.join(ROOT, "README.md"); r = open(rp, encoding="utf-8").read()
    r = re.sub(r"<!-- catalogue:debut -->.*?<!-- catalogue:fin -->", f"<!-- catalogue:debut -->\n{table}\n<!-- catalogue:fin -->", r, flags=re.S)
    open(rp, "w", encoding="utf-8").write(r)
    print(f"{len(c['APIS'])} API documentées.")

if __name__ == "__main__":
    sys.exit(main())
