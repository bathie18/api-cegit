# Fonds de plan et tuiles

> Tuiles vectorielles et styles aux couleurs CEGIT pour MapLibre, QGIS et QWC2.

| | |
|---|---|
| Module | Cartographie |
| Famille | Cartographie |
| Statut | Prototype |
| Composants | Martin, MapLibre, OpenMapTiles |
| Spécification | [`openapi/fonds-de-plan.yaml`](../../openapi/fonds-de-plan.yaml) |

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
| `style` | texte | oui | cegit-clair, cegit-sombre | `cegit-clair` |

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

## Historique

| Version | Date | Changement |
|---|---|---|
| 0.1.0 | 2026-10 | Première spécification issue du portail |
