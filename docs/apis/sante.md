# Santé

> Hôpitaux, centres et postes de santé, pharmacies : structures les plus proches et temps d'accès.

| | |
|---|---|
| Module | Module C-Health |
| Famille | Équipements et services |
| Statut | Bêta |
| Composants | PostGIS, OSRM, OpenStreetMap |
| Spécification | [`openapi/sante.yaml`](../../openapi/sante.yaml) |
| Démonstration | [https://bathie18.github.io/api-cegit/demo.html#sante](https://bathie18.github.io/api-cegit/demo.html#sante) (compte requis) |

## Description fonctionnelle

_À compléter : besoin couvert, publics visés, acteurs, règles de gestion._

## Données sources

| Jeu de données | Producteur | Licence | Mise à jour |
|---|---|---|---|
| _à compléter_ | | | |

## Règles d'accès

_À compléter : public, clé simple, ou compte habilité (rôle Keycloak)._

## Points d'accès

### `GET /v1/health/facilities/nearby` : Structures les plus proches

Classées par temps d'accès réel.

| Paramètre | Type | Requis | Description | Exemple |
|---|---|---|---|---|
| `lat` | décimal | oui | Latitude | `14.791` |
| `lon` | décimal | oui | Longitude | `-16.9256` |
| `type` | texte | non | hopital, centre, poste, pharmacie | `hopital` |

**Exemple d'appel**

```bash
curl "https://api.cegitgroup.com/v1/health/facilities/nearby?lat=14.791&lon=-16.9256&type=hopital" \
  -H "X-API-Key: $CEGIT_KEY"
```

**Exemple de réponse** (fictive)

```json
{
  "items": [
    {
      "nom": "Hôpital régional de Thiès",
      "type": "hôpital",
      "acces_min": 6
    }
  ]
}
```

## Historique

| Version | Date | Changement |
|---|---|---|
| 0.2.0 | 2026-10 | Fiche générée depuis le catalogue du portail |
