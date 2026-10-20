# Urbanisme

> Zone du plan d'urbanisme applicable à un lieu et règles associées, pour l'instruction des autorisations.

| | |
|---|---|
| Module | Module CEGIT-URBA |
| Famille | Foncier, urbanisme et fiscalité |
| Statut | En spécification |
| Composants | PostGIS, pygeoapi |
| Spécification | [`openapi/urbanisme.yaml`](../../openapi/urbanisme.yaml) |
| Démonstration | [https://bathie18.github.io/api-cegit/demo.html#urbanisme](https://bathie18.github.io/api-cegit/demo.html#urbanisme) (compte requis) |

## Description fonctionnelle

_À compléter : besoin couvert, publics visés, acteurs, règles de gestion._

## Données sources

| Jeu de données | Producteur | Licence | Mise à jour |
|---|---|---|---|
| _à compléter_ | | | |

## Règles d'accès

_À compléter : public, clé simple, ou compte habilité (rôle Keycloak)._

## Points d'accès

### `GET /v1/zoning` : Zone applicable

Document d'urbanisme, zone et règles principales.

| Paramètre | Type | Requis | Description | Exemple |
|---|---|---|---|---|
| `lat` | décimal | oui | Latitude | `14.791` |
| `lon` | décimal | oui | Longitude | `-16.9256` |

**Exemple d'appel**

```bash
curl "https://api.cegitgroup.com/v1/zoning?lat=14.791&lon=-16.9256" \
  -H "X-API-Key: $CEGIT_KEY"
```

**Exemple de réponse** (fictive)

```json
{
  "document": "Plan directeur d'urbanisme (donnée de démonstration)",
  "zone": "UA",
  "libelle": "Zone urbaine dense"
}
```

## Historique

| Version | Date | Changement |
|---|---|---|
| 0.2.0 | 2026-10 | Fiche générée depuis le catalogue du portail |
