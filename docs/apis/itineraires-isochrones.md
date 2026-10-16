# Itinéraires et isochrones

> Temps de parcours, itinéraires et zones accessibles en voiture, à pied ou en deux-roues.

| | |
|---|---|
| Module | Mobilité |
| Famille | Mobilité |
| Statut | Bêta |
| Composants | Valhalla, OSRM, OpenStreetMap |
| Spécification | [`openapi/itineraires-isochrones.yaml`](../../openapi/itineraires-isochrones.yaml) |

## Description fonctionnelle

_À compléter : besoin couvert, publics visés, acteurs, règles de gestion._

## Données sources

| Jeu de données | Producteur | Licence | Mise à jour |
|---|---|---|---|
| _à compléter_ | | | |

## Règles d'accès

_À compléter : public, clé simple, ou compte habilité (rôle Keycloak)._

## Points d'accès

### `GET /v1/isochrone` : Zone accessible en N minutes

Polygones d'accessibilité depuis un point, pour plusieurs durées.

| Paramètre | Type | Requis | Description | Exemple |
|---|---|---|---|---|
| `lat` | décimal | oui | Latitude | `14.7910` |
| `lon` | décimal | oui | Longitude | `-16.9256` |
| `minutes` | liste | oui | Durées séparées par des virgules | `10,20,30` |
| `mode` | texte | non | auto, pedestrian, motorcycle | `auto` |

**Exemple d'appel**

```bash
curl "https://api.cegitgroup.com/v1/isochrone?lat=14.7910&lon=-16.9256&minutes=10,20,30&mode=auto" \
  -H "X-API-Key: $CEGIT_KEY"
```

**Exemple de réponse** (fictive)

```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {
        "minutes": 10,
        "mode": "auto",
        "population_estimee": 90000
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": "[…]"
      }
    },
    {
      "type": "Feature",
      "properties": {
        "minutes": 20,
        "mode": "auto",
        "population_estimee": 360000
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": "[…]"
      }
    },
    {
      "type": "Feature",
      "properties": {
        "minutes": 30,
        "mode": "auto",
        "population_estimee": 810000
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": "[…]"
      }
    }
  ]
}
```

### `POST /v1/route` : Calculer un itinéraire

Itinéraire entre deux points ou plus, avec instructions en français.

| Paramètre | Type | Requis | Description | Exemple |
|---|---|---|---|---|
| `from` | lat,lon | oui | Départ | `14.6928,-17.4467` |
| `to` | lat,lon | oui | Arrivée | `14.7910,-16.9256` |
| `mode` | texte | non | auto, pedestrian | `auto` |

**Exemple d'appel**

```bash
curl -X POST "https://api.cegitgroup.com/v1/route" \
  -H "X-API-Key: $CEGIT_KEY" \
  -H "Content-Type: application/json" \
  -d '{"from": "14.6928,-17.4467", "to": "14.7910,-16.9256", "mode": "auto"}'
```

**Exemple de réponse** (fictive)

```json
{
  "distance_km": 71.8,
  "duree_min": 68,
  "mode": "auto",
  "etapes": [
    {
      "instruction": "Prendre l'autoroute A1 vers Diamniadio",
      "distance_km": 32.1
    },
    {
      "instruction": "Continuer sur la N2 vers Thiès",
      "distance_km": 37.4
    }
  ],
  "geometry": {
    "type": "LineString",
    "coordinates": "[…]"
  }
}
```

## Historique

| Version | Date | Changement |
|---|---|---|
| 0.1.0 | 2026-10 | Première spécification issue du portail |
