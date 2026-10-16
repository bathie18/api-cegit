# GINDI Géocodage

> Convertit une adresse, un lieu-dit ou un repère en coordonnées, et l'inverse.

| | |
|---|---|
| Module | Module GINDI |
| Famille | Adresse et localisation |
| Statut | Prototype |
| Composants | Pelias, PostGIS, FastAPI |
| Spécification | [`openapi/gindi-geocodage.yaml`](../../openapi/gindi-geocodage.yaml) |

## Description fonctionnelle

_À compléter : besoin couvert, publics visés, acteurs, règles de gestion._

## Données sources

| Jeu de données | Producteur | Licence | Mise à jour |
|---|---|---|---|
| _à compléter_ | | | |

## Règles d'accès

_À compléter : public, clé simple, ou compte habilité (rôle Keycloak)._

## Points d'accès

### `GET /v1/geocode` : Géocoder une adresse

Renvoie les candidats classés par score de confiance.

| Paramètre | Type | Requis | Description | Exemple |
|---|---|---|---|---|
| `q` | texte | oui | Adresse ou nom de lieu | `Avenue Léopold Sédar Senghor, Thiès` |
| `country` | code ISO | non | Pays de recherche | `SN` |
| `limit` | entier | non | Nombre de résultats (1 à 20) | `3` |

**Exemple d'appel**

```bash
curl "https://api.cegitgroup.com/v1/geocode?q=Avenue Léopold Sédar Senghor, Thiès&country=SN&limit=3" \
  -H "X-API-Key: $CEGIT_KEY"
```

**Exemple de réponse** (fictive)

```json
{
  "type": "FeatureCollection",
  "query": "Avenue Léopold Sédar Senghor, Thiès",
  "features": [
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [
          -16.9256,
          14.791
        ]
      },
      "properties": {
        "label": "Avenue Léopold Sédar Senghor, Thiès",
        "commune": "Thiès-Nord",
        "departement": "Thiès",
        "region": "Thiès",
        "precision": "rue",
        "score": 0.94,
        "gindi_code": "TH-N-0412"
      }
    }
  ]
}
```

### `GET /v1/reverse` : Géocodage inverse

Renvoie l'adresse la plus proche d'un point.

| Paramètre | Type | Requis | Description | Exemple |
|---|---|---|---|---|
| `lat` | décimal | oui | Latitude WGS 84 | `14.7910` |
| `lon` | décimal | oui | Longitude WGS 84 | `-16.9256` |

**Exemple d'appel**

```bash
curl "https://api.cegitgroup.com/v1/reverse?lat=14.7910&lon=-16.9256" \
  -H "X-API-Key: $CEGIT_KEY"
```

**Exemple de réponse** (fictive)

```json
{
  "type": "Feature",
  "geometry": {
    "type": "Point",
    "coordinates": [
      -16.9256,
      14.791
    ]
  },
  "properties": {
    "label": "Avenue Léopold Sédar Senghor, Thiès",
    "distance_m": 18,
    "commune": "Thiès-Nord",
    "gindi_code": "TH-N-0412"
  }
}
```

## Historique

| Version | Date | Changement |
|---|---|---|
| 0.1.0 | 2026-10 | Première spécification issue du portail |
