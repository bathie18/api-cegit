# Vérification d'adresse

> Vérifiez qu'une adresse existe, normalisez-la et assurez la bonne remise des courriers et colis.

| | |
|---|---|
| Module | Module GINDI |
| Famille | Adresses et géocodage |
| Statut | En spécification |
| Composants | Nominatim, PostGIS |
| Spécification | [`openapi/verification-adresse.yaml`](../../openapi/verification-adresse.yaml) |
| Démonstration | [https://bathie18.github.io/api-cegit/demo.html#verification-adresse](https://bathie18.github.io/api-cegit/demo.html#verification-adresse) (compte requis) |

## Description fonctionnelle

_À compléter : besoin couvert, publics visés, acteurs, règles de gestion._

## Données sources

| Jeu de données | Producteur | Licence | Mise à jour |
|---|---|---|---|
| _à compléter_ | | | |

## Règles d'accès

_À compléter : public, clé simple, ou compte habilité (rôle Keycloak)._

## Points d'accès

### `POST /v1/address/verify` : Vérifier une adresse

Renvoie l'adresse normalisée, sa position et un indice de confiance.

| Paramètre | Type | Requis | Description | Exemple |
|---|---|---|---|---|
| `adresse` | texte | oui | Ligne d'adresse | `Rue 10 x 13, Médina` |
| `complement` | texte | non | Complément |  |
| `commune` | texte | non | Commune | `Dakar` |
| `country` | code ISO | non | Pays | `SN` |

**Exemple d'appel**

```bash
curl -X POST "https://api.cegitgroup.com/v1/address/verify" \
  -H "X-API-Key: $CEGIT_KEY" \
  -H "Content-Type: application/json" \
  -d '{"adresse": "Rue 10 x 13, Médina", "commune": "Dakar", "country": "SN"}'
```

**Exemple de réponse** (fictive)

```json
{
  "statut": "verifiee",
  "adresse_normalisee": "Rue 10 angle Rue 13, Médina, Dakar",
  "confiance": 0.82,
  "coordinates": [
    -17.4497,
    14.6808
  ]
}
```

## Historique

| Version | Date | Changement |
|---|---|---|
| 0.2.0 | 2026-10 | Fiche générée depuis le catalogue du portail |
