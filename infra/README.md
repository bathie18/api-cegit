# Infrastructure

| Fichier | Rôle |
|---|---|
| `docker-compose.yml` | Pile complète (phase 1 ; phase 2 avec `--profile phase2`) |
| `caddy/Caddyfile` | HTTPS automatique et routage des sous-domaines |
| `apisix/config.yaml` | Passerelle d'API |
| `postgis/init/` | Scripts exécutés à la création de la base |

Statut : **squelette**, à compléter et tester sur le serveur de préproduction. Voir [../docs/deploiement.md](../docs/deploiement.md).
