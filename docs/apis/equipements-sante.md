# Équipements de santé

> Structures sanitaires, plateaux techniques et accessibilité de la population aux soins.

| | |
|---|---|
| Module | Module C-Health |
| Famille | Équipements et services |
| Statut | En spécification |
| Composants | PostGIS, pg_featureserv, Valhalla |
| Spécification | [`openapi/equipements-sante.yaml`](../../openapi/equipements-sante.yaml) |

## Description fonctionnelle

_À compléter : besoin couvert, publics visés, acteurs, règles de gestion._

## Données sources

| Jeu de données | Producteur | Licence | Mise à jour |
|---|---|---|---|
| _à compléter_ | | | |

## Règles d'accès

_À compléter : public, clé simple, ou compte habilité (rôle Keycloak)._

## Points d'accès

### `GET /v1/health/facilities/nearby` : Structures les plus proches

Classées par temps d'accès réel, pas à vol d'oiseau.

| Paramètre | Type | Requis | Description | Exemple |
|---|---|---|---|---|
| `lat` | décimal | oui | Latitude | `14.7910` |
| `lon` | décimal | oui | Longitude | `-16.9256` |
| `type` | texte | non | hopital, centre, poste | `centre` |
| `limit` | entier | non | — | `3` |

**Exemple d'appel**

```bash
curl "https://api.cegitgroup.com/v1/health/facilities/nearby?lat=14.7910&lon=-16.9256&type=centre&limit=3" \
  -H "X-API-Key: $CEGIT_KEY"
```

**Exemple de réponse** (fictive)

```json
{
  "results": [
    {
      "nom": "Centre de santé (exemple A)",
      "type": "centre",
      "acces_min": 6
    },
    {
      "nom": "Centre de santé (exemple B)",
      "type": "centre",
      "acces_min": 11
    }
  ],
  "note": "Données fictives de démonstration"
}
```

## Historique

| Version | Date | Changement |
|---|---|---|
| 0.1.0 | 2026-10 | Première spécification issue du portail |
