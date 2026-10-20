# Télécoms

> Opérateurs et technologies mobiles disponibles en un lieu (2G, 3G, 4G, 5G).

| | |
|---|---|
| Module | Référentiel CEGIT |
| Famille | Télécoms et vérification |
| Statut | En spécification |
| Composants | PostGIS, FastAPI |
| Spécification | [`openapi/telecoms.yaml`](../../openapi/telecoms.yaml) |
| Démonstration | [https://bathie18.github.io/api-cegit/demo.html#telecoms](https://bathie18.github.io/api-cegit/demo.html#telecoms) (compte requis) |

## Description fonctionnelle

_À compléter : besoin couvert, publics visés, acteurs, règles de gestion._

## Données sources

| Jeu de données | Producteur | Licence | Mise à jour |
|---|---|---|---|
| _à compléter_ | | | |

## Règles d'accès

_À compléter : public, clé simple, ou compte habilité (rôle Keycloak)._

## Points d'accès

### `GET /v1/telecom/coverage` : Couverture d'un lieu

Par opérateur et par technologie.

| Paramètre | Type | Requis | Description | Exemple |
|---|---|---|---|---|
| `lat` | décimal | oui | Latitude | `14.6928` |
| `lon` | décimal | oui | Longitude | `-17.4467` |

**Exemple d'appel**

```bash
curl "https://api.cegitgroup.com/v1/telecom/coverage?lat=14.6928&lon=-17.4467" \
  -H "X-API-Key: $CEGIT_KEY"
```

**Exemple de réponse** (fictive)

```json
{
  "operateurs": [
    {
      "nom": "Orange (Sonatel)",
      "technologies": [
        "2G",
        "3G",
        "4G"
      ]
    }
  ],
  "note": "Donnée de démonstration"
}
```

## Historique

| Version | Date | Changement |
|---|---|---|
| 0.2.0 | 2026-10 | Fiche générée depuis le catalogue du portail |
