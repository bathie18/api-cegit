# Limites administratives

> Région, département, arrondissement et commune d'un point, ou géométrie d'une entité.

| | |
|---|---|
| Module | Référentiel CEGIT |
| Famille | Référentiels territoriaux |
| Statut | Prototype |
| Composants | PostGIS, pygeoapi, OGC API Features |
| Spécification | [`openapi/limites-administratives.yaml`](../../openapi/limites-administratives.yaml) |

## Description fonctionnelle

_À compléter : besoin couvert, publics visés, acteurs, règles de gestion._

## Données sources

| Jeu de données | Producteur | Licence | Mise à jour |
|---|---|---|---|
| _à compléter_ | | | |

## Règles d'accès

_À compléter : public, clé simple, ou compte habilité (rôle Keycloak)._

## Points d'accès

### `GET /v1/boundaries/lookup` : Trouver les entités d'un point

Intersection point dans polygone sur tous les niveaux administratifs.

| Paramètre | Type | Requis | Description | Exemple |
|---|---|---|---|---|
| `lat` | décimal | oui | Latitude | `14.6928` |
| `lon` | décimal | oui | Longitude | `-17.4467` |

**Exemple d'appel**

```bash
curl "https://api.cegitgroup.com/v1/boundaries/lookup?lat=14.6928&lon=-17.4467" \
  -H "X-API-Key: $CEGIT_KEY"
```

**Exemple de réponse** (fictive)

```json
{
  "point": [
    -17.4467,
    14.6928
  ],
  "region": {
    "code": "01",
    "nom": "Dakar"
  },
  "departement": {
    "code": "011",
    "nom": "Dakar"
  },
  "arrondissement": {
    "nom": "Dakar-Plateau"
  },
  "commune": {
    "code": "01111",
    "nom": "Dakar-Plateau"
  },
  "millesime": "2024"
}
```

### `GET /v1/boundaries/{niveau}/{code}` : Géométrie d'une entité

Renvoie la géométrie simplifiée ou complète.

| Paramètre | Type | Requis | Description | Exemple |
|---|---|---|---|---|
| `niveau` | texte | oui | region, departement, commune | `commune` |
| `code` | texte | oui | Code de l'entité | `01111` |
| `simplify` | mètres | non | Tolérance de simplification | `50` |

**Exemple d'appel**

```bash
curl "https://api.cegitgroup.com/v1/boundaries/commune/01111?simplify=50" \
  -H "X-API-Key: $CEGIT_KEY"
```

**Exemple de réponse** (fictive)

```json
{
  "type": "Feature",
  "id": "01111",
  "properties": {
    "niveau": "commune",
    "nom": "Dakar-Plateau",
    "superficie_km2": 5.4
  },
  "geometry": {
    "type": "MultiPolygon",
    "coordinates": "[…]"
  }
}
```

## Historique

| Version | Date | Changement |
|---|---|---|
| 0.1.0 | 2026-10 | Première spécification issue du portail |
