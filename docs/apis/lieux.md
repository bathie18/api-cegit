# Lieux

> Recherchez marchés, mosquées, gares routières, banques, administrations et autres points d'intérêt.

| | |
|---|---|
| Module | Référentiel CEGIT |
| Famille | Équipements et services |
| Statut | Bêta |
| Composants | Overpass, Photon, OpenStreetMap |
| Spécification | [`openapi/lieux.yaml`](../../openapi/lieux.yaml) |
| Démonstration | [https://bathie18.github.io/api-cegit/demo.html#lieux](https://bathie18.github.io/api-cegit/demo.html#lieux) (compte requis) |

## Description fonctionnelle

_À compléter : besoin couvert, publics visés, acteurs, règles de gestion._

## Données sources

| Jeu de données | Producteur | Licence | Mise à jour |
|---|---|---|---|
| _à compléter_ | | | |

## Règles d'accès

_À compléter : public, clé simple, ou compte habilité (rôle Keycloak)._

## Points d'accès

### `GET /v1/poi/nearby` : Points d'intérêt autour d'une adresse

Filtrage par type et par nom.

| Paramètre | Type | Requis | Description | Exemple |
|---|---|---|---|---|
| `lat` | décimal | oui | Latitude | `14.791` |
| `lon` | décimal | oui | Longitude | `-16.9256` |
| `type` | texte | non | marche, banque, gare_routiere… | `marche` |
| `radius_m` | décimal | non | Rayon | `2000` |

**Exemple d'appel**

```bash
curl "https://api.cegitgroup.com/v1/poi/nearby?lat=14.791&lon=-16.9256&type=marche&radius_m=2000" \
  -H "X-API-Key: $CEGIT_KEY"
```

**Exemple de réponse** (fictive)

```json
{
  "items": [
    {
      "nom": "Marché Central de Thiès",
      "type": "marché",
      "distance_m": 640
    }
  ]
}
```

### `POST /v1/poi/by-boundary` : Points d'intérêt dans un polygone

Géométrie GeoJSON en WGS 84.

| Paramètre | Type | Requis | Description | Exemple |
|---|---|---|---|---|
| `geometry` | GeoJSON | oui | Polygone | `{…}` |
| `type` | texte | non | Type | `banque` |

**Exemple d'appel**

```bash
curl -X POST "https://api.cegitgroup.com/v1/poi/by-boundary" \
  -H "X-API-Key: $CEGIT_KEY" \
  -H "Content-Type: application/json" \
  -d '{"geometry": "{…}", "type": "banque"}'
```

**Exemple de réponse** (fictive)

```json
{
  "total": 12,
  "items": [
    {
      "nom": "Banque (exemple)",
      "type": "banque"
    }
  ]
}
```

## Historique

| Version | Date | Changement |
|---|---|---|
| 0.2.0 | 2026-10 | Fiche générée depuis le catalogue du portail |
