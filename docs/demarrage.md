# Bien démarrer

## 1. Obtenir une clé

Créez un compte sur le portail, puis générez une clé par application. Une clé est révocable à tout moment.

## 2. Authentification

Transmettez la clé dans l'en-tête `X-API-Key` :

```bash
curl "https://api.cegitgroup.com/v1/geocode?q=Thiès" -H "X-API-Key: $CEGIT_KEY"
```

Les applications serveur accédant à des données restreintes utilisent un jeton OAuth2 (flux *client credentials*) délivré par Keycloak, transmis dans `Authorization: Bearer <jeton>`.

## 3. Formats

- Réponses en JSON, objets géographiques en GeoJSON (RFC 7946).
- Coordonnées en WGS 84 (EPSG:4326), ordre `[longitude, latitude]`.
- `crs=32628` renvoie les coordonnées en UTM zone 28N.
- Textes en UTF-8, libellés en français.

## 4. Quotas et crédits

| Type d'appel | Crédits |
|---|---|
| Appel simple (géocodage, recherche, fiche) | 1 |
| Calcul d'itinéraire ou d'isochrone | 5 |

Chaque réponse porte les en-têtes `X-RateLimit-Limit`, `X-RateLimit-Remaining` et `X-Credits-Used`.

## 5. Codes d'erreur

| Code | Signification |
|---|---|
| 400 | Paramètre manquant ou mal formé. Le message précise lequel. |
| 401 | Clé absente ou invalide. |
| 403 | Clé valide mais API non incluse dans votre offre. |
| 404 | Ressource introuvable. |
| 429 | Quota dépassé. L'en-tête `Retry-After` indique le délai. |
| 503 | Service en maintenance. |

Format d'erreur :

```json
{ "error": "parametre_manquant", "message": "Renseignez : q" }
```
