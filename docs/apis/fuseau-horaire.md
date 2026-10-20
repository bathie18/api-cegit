# Fuseau horaire

> Fuseau horaire, heure locale et décalage UTC d'un lieu, pour vos applications et traitements.

| | |
|---|---|
| Module | Référentiel CEGIT |
| Famille | Cartographie et territoires |
| Statut | Prototype |
| Composants | FastAPI, tz database |
| Spécification | [`openapi/fuseau-horaire.yaml`](../../openapi/fuseau-horaire.yaml) |
| Démonstration | [https://bathie18.github.io/api-cegit/demo.html#fuseau-horaire](https://bathie18.github.io/api-cegit/demo.html#fuseau-horaire) (compte requis) |

## Description fonctionnelle

_À compléter : besoin couvert, publics visés, acteurs, règles de gestion._

## Données sources

| Jeu de données | Producteur | Licence | Mise à jour |
|---|---|---|---|
| _à compléter_ | | | |

## Règles d'accès

_À compléter : public, clé simple, ou compte habilité (rôle Keycloak)._

## Points d'accès

### `GET /v1/timezone` : Fuseau d'un point

Nom IANA, décalage UTC et heure d'été éventuelle.

| Paramètre | Type | Requis | Description | Exemple |
|---|---|---|---|---|
| `lat` | décimal | oui | Latitude | `14.6928` |
| `lon` | décimal | oui | Longitude | `-17.4467` |

**Exemple d'appel**

```bash
curl "https://api.cegitgroup.com/v1/timezone?lat=14.6928&lon=-17.4467" \
  -H "X-API-Key: $CEGIT_KEY"
```

**Exemple de réponse** (fictive)

```json
{
  "fuseau": "Africa/Dakar",
  "nom": "Temps universel coordonné (GMT)",
  "decalage_utc_s": 0,
  "heure_ete": false
}
```

## Historique

| Version | Date | Changement |
|---|---|---|
| 0.2.0 | 2026-10 | Fiche générée depuis le catalogue du portail |
