# Écoles

> Établissements scolaires à proximité : type, cycle, distance et informations de la carte scolaire.

| | |
|---|---|
| Module | Module CartoScol |
| Famille | Équipements et services |
| Statut | Bêta |
| Composants | PostGIS, pygeoapi, OpenStreetMap |
| Spécification | [`openapi/ecoles.yaml`](../../openapi/ecoles.yaml) |
| Démonstration | [https://bathie18.github.io/api-cegit/demo.html#ecoles](https://bathie18.github.io/api-cegit/demo.html#ecoles) (compte requis) |

## Description fonctionnelle

_À compléter : besoin couvert, publics visés, acteurs, règles de gestion._

## Données sources

| Jeu de données | Producteur | Licence | Mise à jour |
|---|---|---|---|
| _à compléter_ | | | |

## Règles d'accès

_À compléter : public, clé simple, ou compte habilité (rôle Keycloak)._

## Points d'accès

### `GET /v1/schools/nearby` : Écoles à proximité

Classées par distance.

| Paramètre | Type | Requis | Description | Exemple |
|---|---|---|---|---|
| `lat` | décimal | oui | Latitude | `14.791` |
| `lon` | décimal | oui | Longitude | `-16.9256` |
| `cycle` | texte | non | elementaire, moyen, secondaire |  |

**Exemple d'appel**

```bash
curl "https://api.cegitgroup.com/v1/schools/nearby?lat=14.791&lon=-16.9256" \
  -H "X-API-Key: $CEGIT_KEY"
```

**Exemple de réponse** (fictive)

```json
{
  "items": [
    {
      "nom": "Lycée Malick Sy",
      "cycle": "secondaire",
      "statut": "public",
      "distance_m": 820
    }
  ]
}
```

## Historique

| Version | Date | Changement |
|---|---|---|
| 0.2.0 | 2026-10 | Fiche générée depuis le catalogue du portail |
