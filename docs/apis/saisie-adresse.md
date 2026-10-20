# Saisie automatique d'adresse

> Intégrez la recherche d'adresses avec suggestions à la frappe dans vos sites et applications mobiles.

| | |
|---|---|
| Module | Module GINDI |
| Famille | Adresses et géocodage |
| Statut | Bêta |
| Composants | Photon, OpenSearch |
| Spécification | [`openapi/saisie-adresse.yaml`](../../openapi/saisie-adresse.yaml) |
| Démonstration | [https://bathie18.github.io/api-cegit/demo.html#saisie-adresse](https://bathie18.github.io/api-cegit/demo.html#saisie-adresse) (compte requis) |

## Description fonctionnelle

_À compléter : besoin couvert, publics visés, acteurs, règles de gestion._

## Données sources

| Jeu de données | Producteur | Licence | Mise à jour |
|---|---|---|---|
| _à compléter_ | | | |

## Règles d'accès

_À compléter : public, clé simple, ou compte habilité (rôle Keycloak)._

## Points d'accès

### `GET /v1/autocomplete` : Suggérer des adresses

Réponse en moins de 100 ms, pensée pour un appel à chaque frappe.

| Paramètre | Type | Requis | Description | Exemple |
|---|---|---|---|---|
| `text` | texte | oui | Début de saisie | `Marché Mo` |
| `country` | code ISO | non | Pays | `SN` |
| `admin_only` | booléen | non | Uniquement les zones administratives | `false` |

**Exemple d'appel**

```bash
curl "https://api.cegitgroup.com/v1/autocomplete?text=Marché Mo&country=SN&admin_only=false" \
  -H "X-API-Key: $CEGIT_KEY"
```

**Exemple de réponse** (fictive)

```json
{
  "query": "Marché Mo",
  "suggestions": [
    {
      "label": "Marché Moussanté, Thiès",
      "type": "lieu",
      "score": 0.91
    },
    {
      "label": "Rue du Marché Moussanté, Thiès",
      "type": "rue",
      "score": 0.84
    },
    {
      "label": "Marché Moderne, Mbour",
      "type": "lieu",
      "score": 0.62
    }
  ]
}
```

### `GET /v1/autocomplete/ip` : Suggestions autour d'une adresse IP

Priorise les résultats proches de la position déduite de l'adresse IP.

| Paramètre | Type | Requis | Description | Exemple |
|---|---|---|---|---|
| `text` | texte | oui | Début de saisie | `Lycée` |
| `ip` | IPv4 | non | Adresse IP (sinon celle de l'appelant) | `41.82.10.20` |
| `radius_km` | décimal | non | Rayon de recherche | `15` |

**Exemple d'appel**

```bash
curl "https://api.cegitgroup.com/v1/autocomplete/ip?text=Lycée&ip=41.82.10.20&radius_km=15" \
  -H "X-API-Key: $CEGIT_KEY"
```

**Exemple de réponse** (fictive)

```json
{
  "query": "Lycée",
  "centre": {
    "ville": "Dakar",
    "source": "ip"
  },
  "suggestions": [
    {
      "label": "Lycée Lamine Guèye, Dakar-Plateau",
      "distance_km": 2.1
    },
    {
      "label": "Lycée Blaise Diagne, Fann",
      "distance_km": 4.6
    }
  ]
}
```

## Historique

| Version | Date | Changement |
|---|---|---|
| 0.2.0 | 2026-10 | Fiche générée depuis le catalogue du portail |
