# Services

Un dossier par service, chacun avec son `Dockerfile`, ses tests et sa propre documentation.

| Dossier | Technologie | API servies |
|---|---|---|
| `metier/` | FastAPI + PostGIS | PatriBâti, C-Health, CartoScol, CegitCAD+, CEGIT-URBA, WALLU, NaturaSen |
| `referentiels/` | pygeoapi (configuration) | Limites administratives |
| `geocodage/` | Nominatim et Photon (configuration et import) | Géocodage, Saisie automatique, Adresses |
| `routage/` | Valhalla (configuration et graphe) | Itinéraires et isochrones |
| `tuiles/` | Martin (configuration et styles) | Fonds de plan |

Ces dossiers seront créés au fur et à mesure des spécifications.
