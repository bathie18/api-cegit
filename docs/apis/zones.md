# Zones

> Zones accessibles en temps ou en distance de trajet, zones tampons et zones autour d'un lieu.

| | |
|---|---|
| Module | Mobilité |
| Famille | Mobilité |
| Statut | Bêta |
| Composants | Valhalla, OpenStreetMap |
| Spécification | [`openapi/zones.yaml`](../../openapi/zones.yaml) |
| Démonstration | [https://bathie18.github.io/api-cegit/demo.html#zones](https://bathie18.github.io/api-cegit/demo.html#zones) (compte requis) |

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

Polygones d'accessibilité pour plusieurs durées.

| Paramètre | Type | Requis | Description | Exemple |
|---|---|---|---|---|
| `lat` | décimal | oui | Latitude | `14.791` |
| `lon` | décimal | oui | Longitude | `-16.9256` |
| `minutes` | liste | oui | Durées séparées par des virgules | `10,20` |
| `mode` | texte | non | auto, pedestrian | `auto` |

**Exemple d'appel**

```bash
curl "https://api.cegitgroup.com/v1/isochrone?lat=14.791&lon=-16.9256&minutes=10,20&mode=auto" \
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
        "mode": "auto"
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
        "mode": "auto"
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": "[…]"
      }
    }
  ]
}
```

### `GET /v1/buffer` : Zone tampon

Cercle géodésique autour d'un point.

| Paramètre | Type | Requis | Description | Exemple |
|---|---|---|---|---|
| `lat` | décimal | oui | Latitude | `14.791` |
| `lon` | décimal | oui | Longitude | `-16.9256` |
| `radius_m` | décimal | oui | Rayon en mètres | `1000` |

**Exemple d'appel**

```bash
curl "https://api.cegitgroup.com/v1/buffer?lat=14.791&lon=-16.9256&radius_m=1000" \
  -H "X-API-Key: $CEGIT_KEY"
```

**Exemple de réponse** (fictive)

```json
{
  "type": "Feature",
  "properties": {
    "rayon_m": 1000,
    "surface_km2": 3.14
  },
  "geometry": {
    "type": "Polygon",
    "coordinates": "[…]"
  }
}
```

## Historique

| Version | Date | Changement |
|---|---|---|
| 0.2.0 | 2026-10 | Fiche générée depuis le catalogue du portail |
