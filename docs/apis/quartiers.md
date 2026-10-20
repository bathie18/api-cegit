# Quartiers

> Nom du quartier ou du village d'un point, avec sa typologie urbaine (centre, résidentiel, périurbain, rural).

| | |
|---|---|
| Module | Référentiel CEGIT |
| Famille | Cartographie et territoires |
| Statut | En spécification |
| Composants | PostGIS, OpenStreetMap |
| Spécification | [`openapi/quartiers.yaml`](../../openapi/quartiers.yaml) |
| Démonstration | [https://bathie18.github.io/api-cegit/demo.html#quartiers](https://bathie18.github.io/api-cegit/demo.html#quartiers) (compte requis) |

## Description fonctionnelle

_À compléter : besoin couvert, publics visés, acteurs, règles de gestion._

## Données sources

| Jeu de données | Producteur | Licence | Mise à jour |
|---|---|---|---|
| _à compléter_ | | | |

## Règles d'accès

_À compléter : public, clé simple, ou compte habilité (rôle Keycloak)._

## Points d'accès

### `GET /v1/neighborhoods/lookup` : Quartier d'un point

Nom, commune et typologie.

| Paramètre | Type | Requis | Description | Exemple |
|---|---|---|---|---|
| `lat` | décimal | oui | Latitude | `14.718` |
| `lon` | décimal | oui | Longitude | `-17.456` |

**Exemple d'appel**

```bash
curl "https://api.cegitgroup.com/v1/neighborhoods/lookup?lat=14.718&lon=-17.456" \
  -H "X-API-Key: $CEGIT_KEY"
```

**Exemple de réponse** (fictive)

```json
{
  "quartier": "Sicap Liberté",
  "commune": "Sicap-Liberté",
  "typologie": "Résidentiel dense",
  "source": "OpenStreetMap + CEGIT"
}
```

## Historique

| Version | Date | Changement |
|---|---|---|
| 0.2.0 | 2026-10 | Fiche générée depuis le catalogue du portail |
