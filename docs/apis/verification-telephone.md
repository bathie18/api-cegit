# Vérification téléphonique

> Vérifiez le format d'un numéro et identifiez l'opérateur et le type de ligne.

| | |
|---|---|
| Module | Vérification |
| Famille | Télécoms et vérification |
| Statut | Prototype |
| Composants | FastAPI |
| Spécification | [`openapi/verification-telephone.yaml`](../../openapi/verification-telephone.yaml) |
| Démonstration | [https://bathie18.github.io/api-cegit/demo.html#verification-telephone](https://bathie18.github.io/api-cegit/demo.html#verification-telephone) (compte requis) |

## Description fonctionnelle

_À compléter : besoin couvert, publics visés, acteurs, règles de gestion._

## Données sources

| Jeu de données | Producteur | Licence | Mise à jour |
|---|---|---|---|
| _à compléter_ | | | |

## Règles d'accès

_À compléter : public, clé simple, ou compte habilité (rôle Keycloak)._

## Points d'accès

### `GET /v1/verify/phone` : Vérifier un numéro

Notation E.164, opérateur d'attribution, mobile ou fixe.

| Paramètre | Type | Requis | Description | Exemple |
|---|---|---|---|---|
| `phone` | texte | oui | Numéro avec indicatif | `+221 77 000 00 00` |

**Exemple d'appel**

```bash
curl "https://api.cegitgroup.com/v1/verify/phone?phone=+221 77 000 00 00" \
  -H "X-API-Key: $CEGIT_KEY"
```

**Exemple de réponse** (fictive)

```json
{
  "numero": "+221770000000",
  "valide": true,
  "operateur": "Orange (Sonatel)",
  "type": "mobile"
}
```

## Historique

| Version | Date | Changement |
|---|---|---|
| 0.2.0 | 2026-10 | Fiche générée depuis le catalogue du portail |
