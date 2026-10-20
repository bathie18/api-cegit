# Adresses

> Listez les adresses d'une région, d'un département, d'une commune ou d'une zone dessinée.

| | |
|---|---|
| Module | Module GINDI |
| Famille | Adresses et géocodage |
| Statut | Bêta |
| Composants | PostGIS, OpenStreetMap |
| Spécification | [`openapi/adresses.yaml`](../../openapi/adresses.yaml) |
| Démonstration | [https://bathie18.github.io/api-cegit/demo.html#adresses](https://bathie18.github.io/api-cegit/demo.html#adresses) (compte requis) |

## Description fonctionnelle

_À compléter : besoin couvert, publics visés, acteurs, règles de gestion._

## Données sources

| Jeu de données | Producteur | Licence | Mise à jour |
|---|---|---|---|
| _à compléter_ | | | |

## Règles d'accès

_À compléter : public, clé simple, ou compte habilité (rôle Keycloak)._

## Points d'accès

### `GET /v1/addresses/by-boundary-name` : Adresses par nom de limite

Région, département ou commune.

| Paramètre | Type | Requis | Description | Exemple |
|---|---|---|---|---|
| `region` | texte | oui | Région | `Dakar` |
| `departement` | texte | non | Département | `Pikine` |
| `limit` | entier | non | Nombre maximum | `20` |

**Exemple d'appel**

```bash
curl "https://api.cegitgroup.com/v1/addresses/by-boundary-name?region=Dakar&departement=Pikine&limit=20" \
  -H "X-API-Key: $CEGIT_KEY"
```

**Exemple de réponse** (fictive)

```json
{
  "limite": "Pikine",
  "total": 1840,
  "items": [
    {
      "label": "Rue PK-12, Pikine"
    },
    {
      "label": "Avenue Cheikh Ahmadou Bamba, Pikine"
    }
  ]
}
```

### `POST /v1/addresses/by-boundary` : Adresses dans un polygone

Géométrie GeoJSON en WGS 84.

| Paramètre | Type | Requis | Description | Exemple |
|---|---|---|---|---|
| `geometry` | GeoJSON | oui | Polygone | `{"type":"Polygon","coordinates":[[[-17.46,14.69],[-17.44,14.69],[-17.44,14.70],[-17.46,14.69]]]}` |
| `limit` | entier | non | Nombre maximum | `20` |

**Exemple d'appel**

```bash
curl -X POST "https://api.cegitgroup.com/v1/addresses/by-boundary" \
  -H "X-API-Key: $CEGIT_KEY" \
  -H "Content-Type: application/json" \
  -d '{"geometry": "{\"type\":\"Polygon\",\"coordinates\":[[[-17.46,14.69],[-17.44,14.69],[-17.44,14.70],[-17.46,14.69]]]}", "limit": "20"}'
```

**Exemple de réponse** (fictive)

```json
{
  "total": 212,
  "items": [
    {
      "label": "Rue 6, Médina, Dakar"
    },
    {
      "label": "Rue 11, Médina, Dakar"
    }
  ]
}
```

## Historique

| Version | Date | Changement |
|---|---|---|
| 0.2.0 | 2026-10 | Fiche générée depuis le catalogue du portail |
