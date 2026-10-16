# GINDI Autocomplétion

> Suggestions d'adresses à la frappe pour les formulaires web et mobiles.

| | |
|---|---|
| Module | Module GINDI |
| Famille | Adresse et localisation |
| Statut | Bêta |
| Composants | Pelias, Elasticsearch / OpenSearch |
| Spécification | [`openapi/gindi-autocompletion.yaml`](../../openapi/gindi-autocompletion.yaml) |

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
| `focus.lat` | décimal | non | Point de priorité | `14.7910` |
| `focus.lon` | décimal | non | — | `-16.9256` |

**Exemple d'appel**

```bash
curl "https://api.cegitgroup.com/v1/autocomplete?text=Marché Mo&focus.lat=14.7910&focus.lon=-16.9256" \
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

## Historique

| Version | Date | Changement |
|---|---|---|
| 0.1.0 | 2026-10 | Première spécification issue du portail |
