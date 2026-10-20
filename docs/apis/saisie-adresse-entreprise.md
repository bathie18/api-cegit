# Saisie d'adresses Entreprise

> Saisie anticipée, recherche par lieu, par code et par découpage administratif pour les formulaires métiers.

| | |
|---|---|
| Module | Module GINDI |
| Famille | Adresses et géocodage |
| Statut | En spécification |
| Composants | Photon, PostGIS, FastAPI |
| Spécification | [`openapi/saisie-adresse-entreprise.yaml`](../../openapi/saisie-adresse-entreprise.yaml) |
| Démonstration | [https://bathie18.github.io/api-cegit/demo.html#saisie-adresse-entreprise](https://bathie18.github.io/api-cegit/demo.html#saisie-adresse-entreprise) (compte requis) |

## Description fonctionnelle

_À compléter : besoin couvert, publics visés, acteurs, règles de gestion._

## Données sources

| Jeu de données | Producteur | Licence | Mise à jour |
|---|---|---|---|
| _à compléter_ | | | |

## Règles d'accès

_À compléter : public, clé simple, ou compte habilité (rôle Keycloak)._

## Points d'accès

### `GET /v1/enterprise/typeahead` : Saisie anticipée

Complète l'adresse et remplit commune, département et région.

| Paramètre | Type | Requis | Description | Exemple |
|---|---|---|---|---|
| `text` | texte | oui | Début de saisie | `Cité Keur Gorgui` |
| `country` | code ISO | non | Pays | `SN` |

**Exemple d'appel**

```bash
curl "https://api.cegitgroup.com/v1/enterprise/typeahead?text=Cité Keur Gorgui&country=SN" \
  -H "X-API-Key: $CEGIT_KEY"
```

**Exemple de réponse** (fictive)

```json
{
  "query": "Cité Keur Gorgui",
  "results": [
    {
      "label": "Cité Keur Gorgui, Sicap-Liberté, Dakar",
      "commune": "Sicap-Liberté",
      "departement": "Dakar",
      "region": "Dakar"
    }
  ]
}
```

### `GET /v1/enterprise/by-code` : Recherche par code

Code postal ou code d'adresse GINDI.

| Paramètre | Type | Requis | Description | Exemple |
|---|---|---|---|---|
| `code` | texte | oui | Code postal ou code GINDI | `10200` |

**Exemple d'appel**

```bash
curl "https://api.cegitgroup.com/v1/enterprise/by-code?code=10200" \
  -H "X-API-Key: $CEGIT_KEY"
```

**Exemple de réponse** (fictive)

```json
{
  "code": "10200",
  "localite": "Dakar",
  "adresses": 124
}
```

### `GET /v1/enterprise/by-admin` : Recherche administrative

Région, département, commune, quartier et rue.

| Paramètre | Type | Requis | Description | Exemple |
|---|---|---|---|---|
| `region` | texte | oui | Région | `Thiès` |
| `departement` | texte | non | Département | `Mbour` |
| `commune` | texte | non | Commune | `Saly Portudal` |
| `rue` | texte | non | Rue |  |

**Exemple d'appel**

```bash
curl "https://api.cegitgroup.com/v1/enterprise/by-admin?region=Thiès&departement=Mbour&commune=Saly Portudal" \
  -H "X-API-Key: $CEGIT_KEY"
```

**Exemple de réponse** (fictive)

```json
{
  "region": "Thiès",
  "departement": "Mbour",
  "commune": "Saly Portudal",
  "resultats": 18
}
```

## Historique

| Version | Date | Changement |
|---|---|---|
| 0.2.0 | 2026-10 | Fiche générée depuis le catalogue du portail |
