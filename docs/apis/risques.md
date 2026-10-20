# Risques

> Exposition aux inondations, à l'érosion côtière, aux feux de brousse et à l'accidentalité routière.

| | |
|---|---|
| Module | Module WALLU |
| Famille | Risques et secours |
| Statut | Bêta |
| Composants | PostGIS, TiTiler, GDAL |
| Spécification | [`openapi/risques.yaml`](../../openapi/risques.yaml) |
| Démonstration | [https://bathie18.github.io/api-cegit/demo.html#risques](https://bathie18.github.io/api-cegit/demo.html#risques) (compte requis) |

## Description fonctionnelle

_À compléter : besoin couvert, publics visés, acteurs, règles de gestion._

## Données sources

| Jeu de données | Producteur | Licence | Mise à jour |
|---|---|---|---|
| _à compléter_ | | | |

## Règles d'accès

_À compléter : public, clé simple, ou compte habilité (rôle Keycloak)._

## Points d'accès

### `GET /v1/risks/flood` : Risque inondation

Niveau d'aléa et événements recensés.

| Paramètre | Type | Requis | Description | Exemple |
|---|---|---|---|---|
| `lat` | décimal | oui | Latitude | `14.7547` |
| `lon` | décimal | oui | Longitude | `-17.39` |

**Exemple d'appel**

```bash
curl "https://api.cegitgroup.com/v1/risks/flood?lat=14.7547&lon=-17.39" \
  -H "X-API-Key: $CEGIT_KEY"
```

**Exemple de réponse** (fictive)

```json
{
  "alea": "fort",
  "hauteur_eau_m": 0.8,
  "evenements_recenses": 3,
  "note": "Donnée de démonstration"
}
```

### `GET /v1/risks/coastal-erosion` : Érosion côtière

Recul du trait de côte et distance au rivage.

| Paramètre | Type | Requis | Description | Exemple |
|---|---|---|---|---|
| `lat` | décimal | oui | Latitude | `14.7158` |
| `lon` | décimal | oui | Longitude | `-17.2733` |

**Exemple d'appel**

```bash
curl "https://api.cegitgroup.com/v1/risks/coastal-erosion?lat=14.7158&lon=-17.2733" \
  -H "X-API-Key: $CEGIT_KEY"
```

**Exemple de réponse** (fictive)

```json
{
  "niveau": "élevé",
  "recul_m_an": 1.2,
  "distance_rivage_m": 180,
  "note": "Donnée de démonstration"
}
```

### `GET /v1/risks/road-safety` : Accidentalité routière

Accidents recensés dans un rayon donné.

| Paramètre | Type | Requis | Description | Exemple |
|---|---|---|---|---|
| `lat` | décimal | oui | Latitude | `14.791` |
| `lon` | décimal | oui | Longitude | `-16.9256` |
| `radius_m` | décimal | non | Rayon | `1000` |

**Exemple d'appel**

```bash
curl "https://api.cegitgroup.com/v1/risks/road-safety?lat=14.791&lon=-16.9256&radius_m=1000" \
  -H "X-API-Key: $CEGIT_KEY"
```

**Exemple de réponse** (fictive)

```json
{
  "accidents_3_ans": 41,
  "dont_mortels": 3,
  "niveau": "au-dessus de la moyenne",
  "note": "Donnée de démonstration"
}
```

## Historique

| Version | Date | Changement |
|---|---|---|
| 0.2.0 | 2026-10 | Fiche générée depuis le catalogue du portail |
