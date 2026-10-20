# Routage

> Itinéraires détaillés en français et matrices de temps et de distances entre plusieurs lieux.

| | |
|---|---|
| Module | Mobilité |
| Famille | Mobilité |
| Statut | Bêta |
| Composants | OSRM, Valhalla, OpenStreetMap |
| Spécification | [`openapi/routage.yaml`](../../openapi/routage.yaml) |
| Démonstration | [https://bathie18.github.io/api-cegit/demo.html#routage](https://bathie18.github.io/api-cegit/demo.html#routage) (compte requis) |

## Description fonctionnelle

_À compléter : besoin couvert, publics visés, acteurs, règles de gestion._

## Données sources

| Jeu de données | Producteur | Licence | Mise à jour |
|---|---|---|---|
| _à compléter_ | | | |

## Règles d'accès

_À compléter : public, clé simple, ou compte habilité (rôle Keycloak)._

## Points d'accès

### `POST /v1/route` : Calculer un itinéraire

Itinéraire entre deux points ou plus, avec instructions en français.

| Paramètre | Type | Requis | Description | Exemple |
|---|---|---|---|---|
| `from` | lat,lon | oui | Départ | `14.6928,-17.4467` |
| `to` | lat,lon | oui | Arrivée | `14.7910,-16.9256` |
| `mode` | texte | non | auto, pedestrian | `auto` |

**Exemple d'appel**

```bash
curl -X POST "https://api.cegitgroup.com/v1/route" \
  -H "X-API-Key: $CEGIT_KEY" \
  -H "Content-Type: application/json" \
  -d '{"from": "14.6928,-17.4467", "to": "14.7910,-16.9256", "mode": "auto"}'
```

**Exemple de réponse** (fictive)

```json
{
  "distance_km": 71.8,
  "duree_min": 68,
  "mode": "auto",
  "etapes": [
    {
      "instruction": "Prenez l'autoroute A1 vers Diamniadio",
      "distance_km": 32.1
    },
    {
      "instruction": "Continuez sur la N2 vers Thiès",
      "distance_km": 37.4
    }
  ]
}
```

### `POST /v1/matrix` : Matrice des coûts

Temps et distances entre des sources et des destinations.

| Paramètre | Type | Requis | Description | Exemple |
|---|---|---|---|---|
| `sources` | liste lat,lon | oui | Points de départ | `14.6928,-17.4467` |
| `destinations` | liste lat,lon | oui | Points d'arrivée | `14.7910,-16.9256;16.0326,-16.4818` |

**Exemple d'appel**

```bash
curl -X POST "https://api.cegitgroup.com/v1/matrix" \
  -H "X-API-Key: $CEGIT_KEY" \
  -H "Content-Type: application/json" \
  -d '{"sources": "14.6928,-17.4467", "destinations": "14.7910,-16.9256;16.0326,-16.4818"}'
```

**Exemple de réponse** (fictive)

```json
{
  "distances_km": [
    [
      71.8,
      264.3
    ]
  ],
  "durees_min": [
    [
      68,
      236
    ]
  ]
}
```

## Historique

| Version | Date | Changement |
|---|---|---|
| 0.2.0 | 2026-10 | Fiche générée depuis le catalogue du portail |
