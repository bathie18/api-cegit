# Journal des modifications

## 0.3.0 (2026-10)

- Bouton « Réinitialiser » sur toutes les démos (et dans les formulaires de la démo Adresses).
- Espace compte : menu utilisateur, tableau de bord (consommation, crédits, appels par API), mon compte (abonnement, profil, facturation), clés API (copie, secret masqué, régénération).
- Module d'administration réservé au rôle admin : vue d'ensemble, utilisateurs (offre, crédits, suspension, invitation), catalogue (statut, visibilité), journal des actions.
- Deux comptes de test : un administrateur et un utilisateur standard.

## 0.2.1 (2026-10)

- Démo Adresses : saisie semi-automatique des communes et localités, emprise dessinée ou collée visible avant la recherche, zoom sur l'adresse au clic, export CSV de la liste.

## 0.2.0 (2026-10)

- Catalogue étendu à 25 API adaptées au Sénégal, inspiré du portail Precisely.
- Fiches en grille avec boutons Démo, Essayer, lien et menu vers la documentation.
- Page Offres (Essai, Essentiel, Professionnel, Institution) en FCFA.
- Connexion de démonstration : sans compte, l'accès à une API mène à la page Offres.
- Démonstrations cartographiques sur fond OpenStreetMap (Leaflet) avec sélecteur d'API et onglets.
- Génération automatique des fiches et spécifications OpenAPI (`tools/generer_docs.py`).
- Guide de passage en production (`docs/production.md`).

## 0.1.0 (2026-10)

- Portail développeurs de démonstration.
- Catalogue de 12 API et spécifications OpenAPI initiales.
- Documentation : architecture, démarrage, données, déploiement, feuille de route.
- Squelette d'infrastructure Docker Compose.
