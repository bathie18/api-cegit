# Documentation

| Document | Contenu |
|---|---|
| [Architecture](architecture.md) | Composants, flux, choix open source |
| [Bien démarrer](demarrage.md) | Clé d'API, formats, systèmes de coordonnées, erreurs |
| [Données](donnees.md) | Sources, producteurs, licences, mises à jour |
| [Déploiement](deploiement.md) | Serveur de préproduction et installation |
| [Production](production.md) | Ce qu'il faut réunir pour tester et ouvrir la plateforme en conditions réelles |
| [Feuille de route](feuille-de-route.md) | Phases et jalons |
| [Fiches API](apis/) | Une fiche par API |

## Rédiger la fiche d'une nouvelle API

1. Ajouter l'API dans `portal/assets/catalog.js` (et, si besoin, sa démo dans `portal/assets/demo.js`).
2. Lancer `python3 tools/generer_docs.py` : la fiche, la spécification OpenAPI et le tableau du README sont générés.
3. Compléter dans la fiche les sections « Description fonctionnelle », « Données sources » et « Règles d'accès » (elles sont conservées lors des régénérations).
