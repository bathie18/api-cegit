# Cartographie scolaire

> Établissements, effectifs et aires de recrutement pour la planification scolaire.

| | |
|---|---|
| Module | Module CartoScol |
| Famille | Équipements et services |
| Statut | En spécification |
| Composants | PostGIS, pygeoapi |
| Spécification | [`openapi/cartographie-scolaire.yaml`](../../openapi/cartographie-scolaire.yaml) |

## Description fonctionnelle

_À compléter : besoin couvert, publics visés, acteurs, règles de gestion._

## Données sources

| Jeu de données | Producteur | Licence | Mise à jour |
|---|---|---|---|
| _à compléter_ | | | |

## Règles d'accès

_À compléter : public, clé simple, ou compte habilité (rôle Keycloak)._

## Points d'accès

### `GET /v1/schools` : Lister les établissements

Filtrage par commune, cycle et statut.

| Paramètre | Type | Requis | Description | Exemple |
|---|---|---|---|---|
| `commune` | code | oui | Code commune | `01111` |
| `cycle` | texte | non | elementaire, moyen, secondaire | `secondaire` |

**Exemple d'appel**

```bash
curl "https://api.cegitgroup.com/v1/schools?commune=01111&cycle=secondaire" \
  -H "X-API-Key: $CEGIT_KEY"
```

**Exemple de réponse** (fictive)

```json
{
  "commune": "01111",
  "cycle": "secondaire",
  "total": 2,
  "items": [
    {
      "nom": "Lycée (exemple A)",
      "effectif": 1240,
      "statut": "public"
    },
    {
      "nom": "Lycée (exemple B)",
      "effectif": 860,
      "statut": "privé"
    }
  ],
  "note": "Données fictives de démonstration"
}
```

## Historique

| Version | Date | Changement |
|---|---|---|
| 0.1.0 | 2026-10 | Première spécification issue du portail |
