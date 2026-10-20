# Géolocalisation

> Position approximative d'une adresse IP ou d'un point d'accès Wi-Fi.

| | |
|---|---|
| Module | Référentiel CEGIT |
| Famille | Télécoms et vérification |
| Statut | En spécification |
| Composants | FastAPI |
| Spécification | [`openapi/geolocalisation.yaml`](../../openapi/geolocalisation.yaml) |
| Démonstration | [https://bathie18.github.io/api-cegit/demo.html#geolocalisation](https://bathie18.github.io/api-cegit/demo.html#geolocalisation) (compte requis) |

## Description fonctionnelle

_À compléter : besoin couvert, publics visés, acteurs, règles de gestion._

## Données sources

| Jeu de données | Producteur | Licence | Mise à jour |
|---|---|---|---|
| _à compléter_ | | | |

## Règles d'accès

_À compléter : public, clé simple, ou compte habilité (rôle Keycloak)._

## Points d'accès

### `GET /v1/geolocation/ip` : Position d'une adresse IP

Ville, pays et précision estimée.

| Paramètre | Type | Requis | Description | Exemple |
|---|---|---|---|---|
| `ip` | IPv4 | oui | Adresse IP | `41.82.10.20` |

**Exemple d'appel**

```bash
curl "https://api.cegitgroup.com/v1/geolocation/ip?ip=41.82.10.20" \
  -H "X-API-Key: $CEGIT_KEY"
```

**Exemple de réponse** (fictive)

```json
{
  "ip": "41.82.10.20",
  "ville": "Dakar",
  "pays": "SN",
  "precision_km": 25,
  "note": "Donnée de démonstration"
}
```

### `GET /v1/geolocation/wifi` : Position d'un point d'accès Wi-Fi

À partir de l'adresse MAC du point d'accès.

| Paramètre | Type | Requis | Description | Exemple |
|---|---|---|---|---|
| `mac` | texte | oui | Adresse MAC | `00:1A:2B:3C:4D:5E` |

**Exemple d'appel**

```bash
curl "https://api.cegitgroup.com/v1/geolocation/wifi?mac=00:1A:2B:3C:4D:5E" \
  -H "X-API-Key: $CEGIT_KEY"
```

**Exemple de réponse** (fictive)

```json
{
  "mac": "00:1A:2B:3C:4D:5E",
  "precision_m": 60,
  "note": "Donnée de démonstration"
}
```

## Historique

| Version | Date | Changement |
|---|---|---|
| 0.2.0 | 2026-10 | Fiche générée depuis le catalogue du portail |
