# Déploiement en préproduction

## Serveur

| Phase | Contenu | Taille conseillée |
|---|---|---|
| 1 | Portail, APISIX, Keycloak, PostGIS, API métier, Martin, pygeoapi | 4 vCPU, 16 Go RAM, 100 Go SSD |
| 2 | Ajout de Nominatim, Photon, OSRM et Valhalla (Sénégal) | 8 vCPU, 32 Go RAM, 200 Go SSD NVMe |

Système : Ubuntu Server 24.04 LTS, Docker Engine et le plugin Docker Compose.

## DNS

| Sous-domaine | Service |
|---|---|
| `api-preprod.cegitgroup.com` | Passerelle APISIX |
| `portail-preprod.cegitgroup.com` | Portail |
| `auth-preprod.cegitgroup.com` | Keycloak |

## Installation

```bash
git clone https://github.com/<compte>/api-cegit.git
cd api-cegit/infra
cp ../.env.example .env      # renseigner les mots de passe
docker compose up -d                       # phase 1
docker compose --profile phase2 up -d      # ajoute les moteurs OSM (phase 2)
```

## Sécurité minimale

- SSH par clé uniquement, pare-feu limité aux ports 22, 80 et 443, fail2ban.
- Portail de préproduction protégé (mot de passe ou liste d'adresses IP) et non indexé.
- `pg_dump` quotidien copié hors du serveur.
- Mises à jour de sécurité automatiques (`unattended-upgrades`).
- Le fichier `.env` n'est **jamais** versionné.

Pour la mise en production (instances propres des moteurs, comptes réels, cadre juridique, paiement), voir [production.md](production.md).
