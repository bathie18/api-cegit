# Biodiversité

> Observations de faune et de flore, référentiel taxonomique et sensibilité des espèces.

| | |
|---|---|
| Module | Module NaturaSen |
| Famille | Risques et environnement |
| Statut | En spécification |
| Composants | PostGIS, pygeoapi |
| Spécification | [`openapi/biodiversite.yaml`](../../openapi/biodiversite.yaml) |

## Description fonctionnelle

_À compléter : besoin couvert, publics visés, acteurs, règles de gestion._

## Données sources

| Jeu de données | Producteur | Licence | Mise à jour |
|---|---|---|---|
| _à compléter_ | | | |

## Règles d'accès

_À compléter : public, clé simple, ou compte habilité (rôle Keycloak)._

## Points d'accès

### `GET /v1/taxa/occurrences` : Observations dans une emprise

Les espèces sensibles sont floutées à la maille.

| Paramètre | Type | Requis | Description | Exemple |
|---|---|---|---|---|
| `bbox` | 4 décimaux | oui | ouest,sud,est,nord | `-17.2,14.6,-16.8,14.9` |
| `taxon` | texte | non | Nom scientifique | |

**Exemple d'appel**

```bash
curl "https://api.cegitgroup.com/v1/taxa/occurrences?bbox=-17.2,14.6,-16.8,14.9" \
  -H "X-API-Key: $CEGIT_KEY"
```

**Exemple de réponse** (fictive)

```json
{
  "bbox": "-17.2,14.6,-16.8,14.9",
  "total": 2,
  "items": [
    {
      "taxon": "Adansonia digitata",
      "observations": 42
    },
    {
      "taxon": "Balearica pavonina",
      "observations": 5,
      "floute": true
    }
  ],
  "note": "Données fictives de démonstration"
}
```

## Historique

| Version | Date | Changement |
|---|---|---|
| 0.1.0 | 2026-10 | Première spécification issue du portail |
