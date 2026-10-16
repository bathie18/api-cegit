# Zonage d'urbanisme

> Zone du plan d'urbanisme applicable à un point et règles associées.

| | |
|---|---|
| Module | Module CEGIT-URBA |
| Famille | Foncier et urbanisme |
| Statut | En spécification |
| Composants | PostGIS, pygeoapi |
| Spécification | [`openapi/zonage-urbanisme.yaml`](../../openapi/zonage-urbanisme.yaml) |

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

Pour l'instruction des autorisations d'urbanisme.

| Paramètre | Type | Requis | Description | Exemple |
|---|---|---|---|---|
| `lat` | décimal | oui | Latitude | `14.7910` |
| `lon` | décimal | oui | Longitude | `-16.9256` |

**Exemple d'appel**

```bash
curl "https://api.cegitgroup.com/v1/zoning?lat=14.7910&lon=-16.9256" \
  -H "X-API-Key: $CEGIT_KEY"
```

**Exemple de réponse** (fictive)

```json
{
  "document": "Plan d'urbanisme (exemple)",
  "zone": "UA",
  "libelle": "Zone urbaine dense",
  "note": "Données fictives de démonstration"
}
```

## Historique

| Version | Date | Changement |
|---|---|---|
| 0.1.0 | 2026-10 | Première spécification issue du portail |
