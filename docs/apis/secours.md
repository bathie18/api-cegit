# Secours 18

> Centre de secours compétent et services d'urgence d'un lieu, pour les plateformes d'appel et la cartographie opérationnelle.

| | |
|---|---|
| Module | Module WALLU |
| Famille | Risques et secours |
| Statut | En spécification |
| Composants | PostGIS, OSRM |
| Spécification | [`openapi/secours.yaml`](../../openapi/secours.yaml) |
| Démonstration | [https://bathie18.github.io/api-cegit/demo.html#secours](https://bathie18.github.io/api-cegit/demo.html#secours) (compte requis) |

## Description fonctionnelle

_À compléter : besoin couvert, publics visés, acteurs, règles de gestion._

## Données sources

| Jeu de données | Producteur | Licence | Mise à jour |
|---|---|---|---|
| _à compléter_ | | | |

## Règles d'accès

_À compléter : public, clé simple, ou compte habilité (rôle Keycloak)._

## Points d'accès

### `GET /v1/emergency/competent-center` : Centre de secours compétent

Centre de la BNSP le plus rapide à rejoindre le lieu.

| Paramètre | Type | Requis | Description | Exemple |
|---|---|---|---|---|
| `lat` | décimal | oui | Latitude | `14.791` |
| `lon` | décimal | oui | Longitude | `-16.9256` |

**Exemple d'appel**

```bash
curl "https://api.cegitgroup.com/v1/emergency/competent-center?lat=14.791&lon=-16.9256" \
  -H "X-API-Key: $CEGIT_KEY"
```

**Exemple de réponse** (fictive)

```json
{
  "centre": "Centre de secours de Thiès (donnée de démonstration)",
  "numero_urgence": "18",
  "delai_min": 7,
  "distance_km": 3.4
}
```

### `GET /v1/emergency/services` : Services d'urgence

Sapeurs-pompiers, SAMU, police ou gendarmerie compétents.

| Paramètre | Type | Requis | Description | Exemple |
|---|---|---|---|---|
| `lat` | décimal | oui | Latitude | `14.791` |
| `lon` | décimal | oui | Longitude | `-16.9256` |

**Exemple d'appel**

```bash
curl "https://api.cegitgroup.com/v1/emergency/services?lat=14.791&lon=-16.9256" \
  -H "X-API-Key: $CEGIT_KEY"
```

**Exemple de réponse** (fictive)

```json
{
  "services": [
    {
      "type": "Sapeurs-pompiers",
      "numero": "18"
    },
    {
      "type": "SAMU",
      "numero": "1515"
    },
    {
      "type": "Police",
      "numero": "17"
    }
  ]
}
```

## Historique

| Version | Date | Changement |
|---|---|---|
| 0.2.0 | 2026-10 | Fiche générée depuis le catalogue du portail |
