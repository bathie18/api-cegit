# Fiscalité locale

> Impôts et taxes applicables à un lieu : TVA, contributions foncières et contribution économique locale.

| | |
|---|---|
| Module | Référentiel CEGIT |
| Famille | Foncier, urbanisme et fiscalité |
| Statut | En spécification |
| Composants | PostGIS, FastAPI |
| Spécification | [`openapi/fiscalite-locale.yaml`](../../openapi/fiscalite-locale.yaml) |
| Démonstration | [https://bathie18.github.io/api-cegit/demo.html#fiscalite-locale](https://bathie18.github.io/api-cegit/demo.html#fiscalite-locale) (compte requis) |

## Description fonctionnelle

_À compléter : besoin couvert, publics visés, acteurs, règles de gestion._

## Données sources

| Jeu de données | Producteur | Licence | Mise à jour |
|---|---|---|---|
| _à compléter_ | | | |

## Règles d'accès

_À compléter : public, clé simple, ou compte habilité (rôle Keycloak)._

## Points d'accès

### `GET /v1/tax/local` : Fiscalité d'un lieu

Taux indicatifs, à confirmer auprès de l'administration fiscale.

| Paramètre | Type | Requis | Description | Exemple |
|---|---|---|---|---|
| `lat` | décimal | oui | Latitude | `14.6928` |
| `lon` | décimal | oui | Longitude | `-17.4467` |
| `type` | texte | non | general, foncier, commune | `general` |

**Exemple d'appel**

```bash
curl "https://api.cegitgroup.com/v1/tax/local?lat=14.6928&lon=-17.4467&type=general" \
  -H "X-API-Key: $CEGIT_KEY"
```

**Exemple de réponse** (fictive)

```json
{
  "commune": "Dakar-Plateau",
  "tva_taux_normal_pct": 18,
  "note": "Taux indicatifs"
}
```

## Historique

| Version | Date | Changement |
|---|---|---|
| 0.2.0 | 2026-10 | Fiche générée depuis le catalogue du portail |
