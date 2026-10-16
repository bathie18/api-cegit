# Foncier et parcelles

> Recherche de parcelles par point ou identifiant, avec contenance et références.

| | |
|---|---|
| Module | Module CegitCAD+ |
| Famille | Foncier et urbanisme |
| Statut | En spécification |
| Composants | PostGIS, pg_featureserv |
| Spécification | [`openapi/foncier-parcelles.yaml`](../../openapi/foncier-parcelles.yaml) |

## Description fonctionnelle

_À compléter : besoin couvert, publics visés, acteurs, règles de gestion._

## Données sources

| Jeu de données | Producteur | Licence | Mise à jour |
|---|---|---|---|
| _à compléter_ | | | |

## Règles d'accès

_À compléter : public, clé simple, ou compte habilité (rôle Keycloak)._

## Points d'accès

### `GET /v1/parcels` : Parcelle d'un point

Renvoie la parcelle et ses voisines immédiates.

| Paramètre | Type | Requis | Description | Exemple |
|---|---|---|---|---|
| `lat` | décimal | oui | Latitude | `14.7910` |
| `lon` | décimal | oui | Longitude | `-16.9256` |

**Exemple d'appel**

```bash
curl "https://api.cegitgroup.com/v1/parcels?lat=14.7910&lon=-16.9256" \
  -H "X-API-Key: $CEGIT_KEY"
```

**Exemple de réponse** (fictive)

```json
{
  "parcelle": {
    "reference": "TH-000-0000",
    "contenance_m2": 300
  },
  "voisines": 3,
  "note": "Données fictives de démonstration"
}
```

## Historique

| Version | Date | Changement |
|---|---|---|
| 0.1.0 | 2026-10 | Première spécification issue du portail |
