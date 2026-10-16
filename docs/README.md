# Documentation

| Document | Contenu |
|---|---|
| [Architecture](architecture.md) | Composants, flux, choix open source |
| [Bien démarrer](demarrage.md) | Clé d'API, formats, systèmes de coordonnées, erreurs |
| [Données](donnees.md) | Sources, producteurs, licences, mises à jour |
| [Déploiement](deploiement.md) | Serveur de préproduction et installation |
| [Feuille de route](feuille-de-route.md) | Phases et jalons |
| [Fiches API](apis/) | Une fiche par API |

## Rédiger la fiche d'une nouvelle API

1. Copier `apis/_modele.md` sous `apis/<identifiant>.md`.
2. Créer `../openapi/<identifiant>.yaml`.
3. Ajouter l'API au catalogue du portail (`portal/index.html`, tableau `APIS`) et au README.
