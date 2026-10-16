# api-cegit

**API géospatiales et portail développeurs du CEGIT**, Centre d'Expertise en Géomatique et Ingénierie Territoriale.

Des services REST documentés pour localiser, enrichir et analyser les données territoriales du Sénégal et de l'Afrique de l'Ouest, bâtis sur une pile entièrement open source.

- **Portail de démonstration** : https://&lt;compte&gt;.github.io/api-cegit/
- **Site du CEGIT** : https://cegitgroup.com/fr

> **Statut : prototype.** Le portail fonctionne avec des réponses simulées. Les services sont en cours de spécification.

## Catalogue

| API | Module | Famille | Statut | Spécification |
|---|---|---|---|---|
| [GINDI Géocodage](docs/apis/gindi-geocodage.md) | Module GINDI | Adresse et localisation | Prototype | [YAML](openapi/gindi-geocodage.yaml) |
| [GINDI Autocomplétion](docs/apis/gindi-autocompletion.md) | Module GINDI | Adresse et localisation | Bêta | [YAML](openapi/gindi-autocompletion.yaml) |
| [Limites administratives](docs/apis/limites-administratives.md) | Référentiel CEGIT | Référentiels territoriaux | Prototype | [YAML](openapi/limites-administratives.yaml) |
| [Itinéraires et isochrones](docs/apis/itineraires-isochrones.md) | Mobilité | Mobilité | Bêta | [YAML](openapi/itineraires-isochrones.yaml) |
| [Équipements de santé](docs/apis/equipements-sante.md) | Module C-Health | Équipements et services | En spécification | [YAML](openapi/equipements-sante.yaml) |
| [Cartographie scolaire](docs/apis/cartographie-scolaire.md) | Module CartoScol | Équipements et services | En spécification | [YAML](openapi/cartographie-scolaire.yaml) |
| [Patrimoine bâti](docs/apis/patrimoine-bati.md) | Module PatriBâti | Foncier et urbanisme | En spécification | [YAML](openapi/patrimoine-bati.yaml) |
| [Foncier et parcelles](docs/apis/foncier-parcelles.md) | Module CegitCAD+ | Foncier et urbanisme | En spécification | [YAML](openapi/foncier-parcelles.yaml) |
| [Zonage d'urbanisme](docs/apis/zonage-urbanisme.md) | Module CEGIT-URBA | Foncier et urbanisme | En spécification | [YAML](openapi/zonage-urbanisme.yaml) |
| [Risque inondation](docs/apis/risque-inondation.md) | Module WALLU | Risques et environnement | Bêta | [YAML](openapi/risque-inondation.yaml) |
| [Biodiversité](docs/apis/biodiversite.md) | Module NaturaSen | Risques et environnement | En spécification | [YAML](openapi/biodiversite.yaml) |
| [Fonds de plan et tuiles](docs/apis/fonds-de-plan.md) | Cartographie | Cartographie | Prototype | [YAML](openapi/fonds-de-plan.yaml) |

## Organisation du dépôt

```
api-cegit/
├── portal/                 Portail développeurs (publié sur GitHub Pages)
├── docs/
│   ├── architecture.md     Architecture technique et choix open source
│   ├── demarrage.md        Authentification, formats, codes d'erreur
│   ├── donnees.md          Sources de données et licences
│   ├── deploiement.md      Mise en préproduction
│   ├── feuille-de-route.md Phases et jalons
│   └── apis/               Une fiche par API
├── openapi/                Une spécification OpenAPI 3.1 par API
├── services/               Code des API (un dossier par service)
├── infra/                  Docker Compose et configurations
└── .github/workflows/      Publication du portail et contrôles
```

## Démarrer

- Consulter la [documentation](docs/README.md).
- Prévisualiser le portail en local : `python3 -m http.server -d portal 8080`, puis ouvrir http://localhost:8080.
- Lancer la pile de préproduction : voir [docs/deploiement.md](docs/deploiement.md).

## Pile technique

PostgreSQL/PostGIS · FastAPI · pygeoapi · Pelias · Valhalla · Martin · Apache APISIX · Keycloak · Caddy · Docker Compose. Détails dans [docs/architecture.md](docs/architecture.md).

## Contact

CEGIT · api@cegitgroup.com · https://cegitgroup.com/fr
