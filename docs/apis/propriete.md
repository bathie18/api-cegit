# Informations sur la propriété

> Attributs d'une parcelle et de son bâti : NICAD, titre, superficie, usage, valeur estimée et limites.

| | |
|---|---|
| Module | Modules PatriBâti et CegitCAD+ |
| Famille | Foncier, urbanisme et fiscalité |
| Statut | En spécification |
| Composants | PostGIS, FastAPI, Keycloak |
| Spécification | [`openapi/propriete.yaml`](../../openapi/propriete.yaml) |
| Démonstration | [https://bathie18.github.io/api-cegit/demo.html#propriete](https://bathie18.github.io/api-cegit/demo.html#propriete) (compte requis) |

## Description fonctionnelle

_À compléter : besoin couvert, publics visés, acteurs, règles de gestion._

## Données sources

| Jeu de données | Producteur | Licence | Mise à jour |
|---|---|---|---|
| _à compléter_ | | | |

## Règles d'accès

_À compléter : public, clé simple, ou compte habilité (rôle Keycloak)._

## Points d'accès

### `GET /v1/property` : Attributs de la propriété

Accès restreint aux comptes habilités.

| Paramètre | Type | Requis | Description | Exemple |
|---|---|---|---|---|
| `lat` | décimal | oui | Latitude | `14.6928` |
| `lon` | décimal | oui | Longitude | `-17.4467` |

**Exemple d'appel**

```bash
curl "https://api.cegitgroup.com/v1/property?lat=14.6928&lon=-17.4467" \
  -H "X-API-Key: $CEGIT_KEY"
```

**Exemple de réponse** (fictive)

```json
{
  "nicad": "0000 0000 00000 (donnée de démonstration)",
  "superficie_m2": 300,
  "usage": "habitation",
  "note": "Donnée de démonstration"
}
```

### `GET /v1/property/parcel` : Limite de la parcelle

Géométrie de la parcelle.

| Paramètre | Type | Requis | Description | Exemple |
|---|---|---|---|---|
| `nicad` | texte | oui | Identifiant cadastral | `0000 0000 00000` |

**Exemple d'appel**

```bash
curl "https://api.cegitgroup.com/v1/property/parcel?nicad=0000 0000 00000" \
  -H "X-API-Key: $CEGIT_KEY"
```

**Exemple de réponse** (fictive)

```json
{
  "type": "Feature",
  "properties": {
    "nicad": "0000 0000 00000"
  },
  "geometry": {
    "type": "Polygon",
    "coordinates": "[…]"
  }
}
```

## Historique

| Version | Date | Changement |
|---|---|---|
| 0.2.0 | 2026-10 | Fiche générée depuis le catalogue du portail |
