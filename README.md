# api-cegit

**API géospatiales et portail développeurs du CEGIT**, Centre d'Expertise en Géomatique et Ingénierie Territoriale.

Des services REST documentés pour localiser, enrichir et analyser les données territoriales du Sénégal et de l'Afrique de l'Ouest, bâtis sur une pile entièrement open source.

- **Portail** : https://bathie18.github.io/api-cegit/
- **Démonstrations cartographiques** : https://bathie18.github.io/api-cegit/demo.html (compte requis)
- **Site du CEGIT** : https://cegitgroup.com/fr

> **Statut : prototype.** Le portail est une maquette fonctionnelle. Les démonstrations interrogent directement les services publics OpenStreetMap (Nominatim, Photon, OSRM, Valhalla, Overpass) et basculent sur des données de démonstration s'ils ne répondent pas. La console d'essai renvoie des réponses simulées.

> **Connexion de démonstration.** Sur un site statique, le contrôle de connexion se fait dans le navigateur : il simule le parcours utilisateur mais ne protège rien. La vraie authentification passera par Keycloak et la passerelle APISIX en préproduction.

## Catalogue

<!-- catalogue:debut -->
| API | Module | Famille | Statut | Spécification |
|---|---|---|---|---|
| [Géocodage](docs/apis/geocodage.md) | Module GINDI | Adresses et géocodage | Prototype | [YAML](openapi/geocodage.yaml) |
| [Saisie automatique d'adresse](docs/apis/saisie-adresse.md) | Module GINDI | Adresses et géocodage | Bêta | [YAML](openapi/saisie-adresse.yaml) |
| [Saisie d'adresses Entreprise](docs/apis/saisie-adresse-entreprise.md) | Module GINDI | Adresses et géocodage | En spécification | [YAML](openapi/saisie-adresse-entreprise.yaml) |
| [Vérification d'adresse](docs/apis/verification-adresse.md) | Module GINDI | Adresses et géocodage | En spécification | [YAML](openapi/verification-adresse.yaml) |
| [Adresses](docs/apis/adresses.md) | Module GINDI | Adresses et géocodage | Bêta | [YAML](openapi/adresses.yaml) |
| [Cartes](docs/apis/cartes.md) | Cartographie | Cartographie et territoires | Prototype | [YAML](openapi/cartes.yaml) |
| [Limites administratives](docs/apis/limites-administratives.md) | Référentiel CEGIT | Cartographie et territoires | Prototype | [YAML](openapi/limites-administratives.yaml) |
| [Quartiers](docs/apis/quartiers.md) | Référentiel CEGIT | Cartographie et territoires | En spécification | [YAML](openapi/quartiers.yaml) |
| [Fuseau horaire](docs/apis/fuseau-horaire.md) | Référentiel CEGIT | Cartographie et territoires | Prototype | [YAML](openapi/fuseau-horaire.yaml) |
| [Zones](docs/apis/zones.md) | Mobilité | Mobilité | Bêta | [YAML](openapi/zones.yaml) |
| [Routage](docs/apis/routage.md) | Mobilité | Mobilité | Bêta | [YAML](openapi/routage.yaml) |
| [Rues](docs/apis/rues.md) | Mobilité | Mobilité | Bêta | [YAML](openapi/rues.yaml) |
| [Risques](docs/apis/risques.md) | Module WALLU | Risques et secours | Bêta | [YAML](openapi/risques.yaml) |
| [Secours 18](docs/apis/secours.md) | Module WALLU | Risques et secours | En spécification | [YAML](openapi/secours.yaml) |
| [Lieux](docs/apis/lieux.md) | Référentiel CEGIT | Équipements et services | Bêta | [YAML](openapi/lieux.yaml) |
| [Écoles](docs/apis/ecoles.md) | Module CartoScol | Équipements et services | Bêta | [YAML](openapi/ecoles.yaml) |
| [Santé](docs/apis/sante.md) | Module C-Health | Équipements et services | Bêta | [YAML](openapi/sante.yaml) |
| [Informations sur la propriété](docs/apis/propriete.md) | Modules PatriBâti et CegitCAD+ | Foncier, urbanisme et fiscalité | En spécification | [YAML](openapi/propriete.yaml) |
| [Urbanisme](docs/apis/urbanisme.md) | Module CEGIT-URBA | Foncier, urbanisme et fiscalité | En spécification | [YAML](openapi/urbanisme.yaml) |
| [Fiscalité locale](docs/apis/fiscalite-locale.md) | Référentiel CEGIT | Foncier, urbanisme et fiscalité | En spécification | [YAML](openapi/fiscalite-locale.yaml) |
| [Télécoms](docs/apis/telecoms.md) | Référentiel CEGIT | Télécoms et vérification | En spécification | [YAML](openapi/telecoms.yaml) |
| [Géolocalisation](docs/apis/geolocalisation.md) | Référentiel CEGIT | Télécoms et vérification | En spécification | [YAML](openapi/geolocalisation.yaml) |
| [Vérification d'e-mail](docs/apis/verification-email.md) | Vérification | Télécoms et vérification | Prototype | [YAML](openapi/verification-email.yaml) |
| [Vérification téléphonique](docs/apis/verification-telephone.md) | Vérification | Télécoms et vérification | Prototype | [YAML](openapi/verification-telephone.yaml) |
| [Biodiversité](docs/apis/biodiversite.md) | Module NaturaSen | Environnement | En spécification | [YAML](openapi/biodiversite.yaml) |
<!-- catalogue:fin -->

## Parcours utilisateur

| Action | Non connecté | Connecté |
|---|---|---|
| Clic sur une fiche ou « Essayer » | Page Offres, avec invitation à se connecter | Fiche de l'API : points d'accès, console d'essai, exemples de code |
| « Démo » | Page Offres | Démonstration cartographique sur fond OpenStreetMap |
| Menu ⋮ d'une fiche | Documentation de l'API (`docs/apis/<id>.md`) | Idem |
| Icône lien | Copie le lien direct vers l'API | Idem |

## Organisation du dépôt

```
api-cegit/
├── portal/                   Portail développeurs (publié sur GitHub Pages)
│   ├── index.html            Catalogue, offres, fiches API, documentation
│   ├── demo.html             Démonstrations cartographiques (Leaflet + OSM)
│   └── assets/
│       ├── catalog.js        Catalogue des API (source unique)
│       ├── geo.js            Accès aux services OSM et repli de démonstration
│       ├── demo.js           Démonstrations, API par API
│       ├── portal.js         Catalogue, connexion, console d'essai
│       ├── common.js         Pictogrammes, session, utilitaires
│       └── *.css             Charte CEGIT
├── docs/
│   ├── architecture.md       Architecture technique et choix open source
│   ├── demarrage.md          Authentification, formats, codes d'erreur
│   ├── donnees.md            Sources de données et licences
│   ├── deploiement.md        Préproduction et production
│   ├── feuille-de-route.md   Phases et jalons
│   └── apis/                 Une fiche par API (générée, sections métier à compléter)
├── openapi/                  Une spécification OpenAPI 3.1 par API (générée)
├── tools/generer_docs.py     Régénère docs/apis et openapi depuis le catalogue
├── services/                 Code des API (un dossier par service)
├── infra/                    Docker Compose et configurations
└── .github/workflows/        Publication du portail et contrôles
```

## Démarrer

- Consulter la [documentation](docs/README.md).
- Prévisualiser le portail en local : `python3 -m http.server -d portal 8080`, puis ouvrir http://localhost:8080.
- Ajouter ou modifier une API : éditer `portal/assets/catalog.js`, puis lancer `python3 tools/generer_docs.py`.
- Lancer la pile de préproduction : voir [docs/deploiement.md](docs/deploiement.md).

## Pile technique

PostgreSQL/PostGIS · FastAPI · pygeoapi · Nominatim · Photon · OSRM · Valhalla · Martin · Apache APISIX · Keycloak · Caddy · Leaflet · Docker Compose. Détails dans [docs/architecture.md](docs/architecture.md).

## Contact

CEGIT · api@cegitgroup.com · https://cegitgroup.com/fr
