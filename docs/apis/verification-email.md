# Vérification d'e-mail

> Vérifiez la syntaxe et le domaine d'une adresse électronique pour fiabiliser vos fichiers.

| | |
|---|---|
| Module | Vérification |
| Famille | Télécoms et vérification |
| Statut | Prototype |
| Composants | FastAPI |
| Spécification | [`openapi/verification-email.yaml`](../../openapi/verification-email.yaml) |
| Démonstration | [https://bathie18.github.io/api-cegit/demo.html#verification-email](https://bathie18.github.io/api-cegit/demo.html#verification-email) (compte requis) |

## Description fonctionnelle

_À compléter : besoin couvert, publics visés, acteurs, règles de gestion._

## Données sources

| Jeu de données | Producteur | Licence | Mise à jour |
|---|---|---|---|
| _à compléter_ | | | |

## Règles d'accès

_À compléter : public, clé simple, ou compte habilité (rôle Keycloak)._

## Points d'accès

### `GET /v1/verify/email` : Vérifier une adresse e-mail

Syntaxe, domaine, serveur de messagerie, adresse jetable.

| Paramètre | Type | Requis | Description | Exemple |
|---|---|---|---|---|
| `email` | texte | oui | Adresse électronique | `contact@exemple.sn` |

**Exemple d'appel**

```bash
curl "https://api.cegitgroup.com/v1/verify/email?email=contact@exemple.sn" \
  -H "X-API-Key: $CEGIT_KEY"
```

**Exemple de réponse** (fictive)

```json
{
  "email": "contact@exemple.sn",
  "syntaxe": true,
  "domaine_mx": true,
  "jetable": false,
  "verdict": "valide"
}
```

## Historique

| Version | Date | Changement |
|---|---|---|
| 0.2.0 | 2026-10 | Fiche générée depuis le catalogue du portail |
