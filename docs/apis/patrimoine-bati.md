# Patrimoine bâti

> Inventaire et état du patrimoine bâti public : fiches bâtiments, occupation, diagnostics.

| | |
|---|---|
| Module | Module PatriBâti |
| Famille | Foncier et urbanisme |
| Statut | En spécification |
| Composants | PostGIS, FastAPI, Keycloak |
| Spécification | [`openapi/patrimoine-bati.yaml`](../../openapi/patrimoine-bati.yaml) |

## Description fonctionnelle

_À compléter : besoin couvert, publics visés, acteurs, règles de gestion._

## Données sources

| Jeu de données | Producteur | Licence | Mise à jour |
|---|---|---|---|
| _à compléter_ | | | |

## Règles d'accès

_À compléter : public, clé simple, ou compte habilité (rôle Keycloak)._

## Points d'accès

### `GET /v1/buildings/{id}` : Fiche d'un bâtiment

Accès restreint aux comptes habilités du gestionnaire.

| Paramètre | Type | Requis | Description | Exemple |
|---|---|---|---|---|
| `id` | texte | oui | Identifiant du bâtiment | `BAT-DK-000127` |

**Exemple d'appel**

```bash
curl "https://api.cegitgroup.com/v1/buildings/BAT-DK-000127" \
  -H "X-API-Key: $CEGIT_KEY"
```

**Exemple de réponse** (fictive)

```json
{
  "id": "BAT-DK-000127",
  "usage": "bureaux administratifs",
  "surface_m2": 1840,
  "etat": "moyen",
  "dernier_diagnostic": "2025-11-04",
  "note": "Données fictives de démonstration"
}
```

## Historique

| Version | Date | Changement |
|---|---|---|
| 0.1.0 | 2026-10 | Première spécification issue du portail |
