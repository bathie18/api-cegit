# Rues

> Trouvez la voie et l'intersection les plus proches, avec leur classe et leurs caractéristiques.

| | |
|---|---|
| Module | Mobilité |
| Famille | Mobilité |
| Statut | Bêta |
| Composants | OSRM, PostGIS, OpenStreetMap |
| Spécification | [`openapi/rues.yaml`](../../openapi/rues.yaml) |
| Démonstration | [https://bathie18.github.io/api-cegit/demo.html#rues](https://bathie18.github.io/api-cegit/demo.html#rues) (compte requis) |

## Description fonctionnelle

_À compléter : besoin couvert, publics visés, acteurs, règles de gestion._

## Données sources

| Jeu de données | Producteur | Licence | Mise à jour |
|---|---|---|---|
| _à compléter_ | | | |

## Règles d'accès

_À compléter : public, clé simple, ou compte habilité (rôle Keycloak)._

## Points d'accès

### `GET /v1/streets/nearest` : Voie la plus proche

Nom, classe, nombre de voies et vitesse autorisée si connue.

| Paramètre | Type | Requis | Description | Exemple |
|---|---|---|---|---|
| `lat` | décimal | oui | Latitude | `14.6928` |
| `lon` | décimal | oui | Longitude | `-17.4467` |

**Exemple d'appel**

```bash
curl "https://api.cegitgroup.com/v1/streets/nearest?lat=14.6928&lon=-17.4467" \
  -H "X-API-Key: $CEGIT_KEY"
```

**Exemple de réponse** (fictive)

```json
{
  "nom": "Avenue Georges Pompidou",
  "classe": "Principale",
  "voies": 2,
  "vitesse_max_kmh": 50,
  "distance_m": 12
}
```

## Historique

| Version | Date | Changement |
|---|---|---|
| 0.2.0 | 2026-10 | Fiche générée depuis le catalogue du portail |
