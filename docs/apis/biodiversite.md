# Biodiversité

> Aires protégées et observations de faune et de flore autour d'un lieu.

| | |
|---|---|
| Module | Module NaturaSen |
| Famille | Environnement |
| Statut | En spécification |
| Composants | PostGIS, pygeoapi, OpenStreetMap |
| Spécification | [`openapi/biodiversite.yaml`](../../openapi/biodiversite.yaml) |
| Démonstration | [https://bathie18.github.io/api-cegit/demo.html#biodiversite](https://bathie18.github.io/api-cegit/demo.html#biodiversite) (compte requis) |

## Description fonctionnelle

_À compléter : besoin couvert, publics visés, acteurs, règles de gestion._

## Données sources

| Jeu de données | Producteur | Licence | Mise à jour |
|---|---|---|---|
| _à compléter_ | | | |

## Règles d'accès

_À compléter : public, clé simple, ou compte habilité (rôle Keycloak)._

## Points d'accès

### `GET /v1/biodiversity/protected-areas` : Aires protégées proches

Parcs, réserves et forêts classées.

| Paramètre | Type | Requis | Description | Exemple |
|---|---|---|---|---|
| `lat` | décimal | oui | Latitude | `14.791` |
| `lon` | décimal | oui | Longitude | `-16.9256` |
| `radius_km` | décimal | non | Rayon | `50` |

**Exemple d'appel**

```bash
curl "https://api.cegitgroup.com/v1/biodiversity/protected-areas?lat=14.791&lon=-16.9256&radius_km=50" \
  -H "X-API-Key: $CEGIT_KEY"
```

**Exemple de réponse** (fictive)

```json
{
  "items": [
    {
      "nom": "Réserve de Bandia",
      "distance_km": 38
    }
  ]
}
```

## Historique

| Version | Date | Changement |
|---|---|---|
| 0.1.0 | 2026-10 | Première spécification issue du portail |
