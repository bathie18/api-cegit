# Cartes

> Fonds de plan OpenStreetMap et styles aux couleurs CEGIT pour vos sites, QGIS et QWC2.

| | |
|---|---|
| Module | Cartographie |
| Famille | Cartographie et territoires |
| Statut | Prototype |
| Composants | Martin, MapLibre, OpenStreetMap |
| Spécification | [`openapi/cartes.yaml`](../../openapi/cartes.yaml) |
| Démonstration | [https://bathie18.github.io/api-cegit/demo.html#cartes](https://bathie18.github.io/api-cegit/demo.html#cartes) (compte requis) |

## Description fonctionnelle

_À compléter : besoin couvert, publics visés, acteurs, règles de gestion._

## Données sources

| Jeu de données | Producteur | Licence | Mise à jour |
|---|---|---|---|
| _à compléter_ | | | |

## Règles d'accès

_À compléter : public, clé simple, ou compte habilité (rôle Keycloak)._

## Points d'accès

### `GET /v1/tiles/{style}/style.json` : Style de carte

Style MapLibre prêt à l'emploi.

| Paramètre | Type | Requis | Description | Exemple |
|---|---|---|---|---|
| `style` | texte | oui | osm, cegit-clair, cegit-sombre | `cegit-clair` |

**Exemple d'appel**

```bash
curl "https://api.cegitgroup.com/v1/tiles/cegit-clair/style.json" \
  -H "X-API-Key: $CEGIT_KEY"
```

**Exemple de réponse** (fictive)

```json
{
  "version": 8,
  "name": "cegit-clair",
  "sources": {
    "cegit": {
      "type": "vector",
      "tiles": [
        "https://api.cegitgroup.com/v1/tiles/{z}/{x}/{y}.pbf"
      ]
    }
  },
  "layers": "[…]"
}
```

### `GET /v1/tiles/{style}/{z}/{x}/{y}.png` : Tuile raster

Tuiles 256 px, compatibles Leaflet et QGIS (XYZ).

| Paramètre | Type | Requis | Description | Exemple |
|---|---|---|---|---|
| `style` | texte | oui | Style | `osm` |
| `z` | entier | oui | Zoom | `10` |
| `x` | entier | oui | Colonne | `461` |
| `y` | entier | oui | Ligne | `470` |

**Exemple d'appel**

```bash
curl "https://api.cegitgroup.com/v1/tiles/osm/10/461/470.png" \
  -H "X-API-Key: $CEGIT_KEY"
```

**Exemple de réponse** (fictive)

```json
{
  "contenu": "image/png"
}
```

## Historique

| Version | Date | Changement |
|---|---|---|
| 0.2.0 | 2026-10 | Fiche générée depuis le catalogue du portail |
