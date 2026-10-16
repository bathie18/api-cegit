# Risque inondation

> Exposition d'un point ou d'un bâtiment aux zones inondables et historique des événements.

| | |
|---|---|
| Module | Module WALLU |
| Famille | Risques et environnement |
| Statut | Bêta |
| Composants | PostGIS, TiTiler, GDAL |
| Spécification | [`openapi/risque-inondation.yaml`](../../openapi/risque-inondation.yaml) |

## Description fonctionnelle

_À compléter : besoin couvert, publics visés, acteurs, règles de gestion._

## Données sources

| Jeu de données | Producteur | Licence | Mise à jour |
|---|---|---|---|
| _à compléter_ | | | |

## Règles d'accès

_À compléter : public, clé simple, ou compte habilité (rôle Keycloak)._

## Points d'accès

### `GET /v1/risks/flood` : Exposition d'un point

Niveau d'aléa, hauteur d'eau modélisée et événements recensés.

| Paramètre | Type | Requis | Description | Exemple |
|---|---|---|---|---|
| `lat` | décimal | oui | Latitude | `14.7600` |
| `lon` | décimal | oui | Longitude | `-17.3900` |

**Exemple d'appel**

```bash
curl "https://api.cegitgroup.com/v1/risks/flood?lat=14.7600&lon=-17.3900" \
  -H "X-API-Key: $CEGIT_KEY"
```

**Exemple de réponse** (fictive)

```json
{
  "point": [
    -17.39,
    14.76
  ],
  "alea": "fort",
  "hauteur_eau_m": 0.8,
  "evenements_recenses": 3,
  "source": "Modèle de démonstration",
  "note": "Données fictives de démonstration"
}
```

## Historique

| Version | Date | Changement |
|---|---|---|
| 0.1.0 | 2026-10 | Première spécification issue du portail |
