# Passer en production

Le portail publié sur GitHub Pages est une **maquette fonctionnelle** : connexion simulée dans le navigateur, console d'essai aux réponses fictives, démonstrations branchées sur les serveurs publics d'OpenStreetMap. Pour tester la plateforme en conditions réelles, puis l'ouvrir à des clients, voici ce qu'il faut réunir.

## 1. Infrastructure

| Élément | Recommandation | Pourquoi |
|---|---|---|
| Serveur principal | 8 vCPU, 32 Go de RAM, 300 Go SSD NVMe (Sénégal seul) ; 16 vCPU et 64 Go pour l'Afrique de l'Ouest | Nominatim, OSRM, Valhalla et PostGIS chargent les données en mémoire |
| Hébergement | Au Sénégal (datacenter national ou opérateur local) pour les clients publics ; en Europe possible pour démarrer | Souveraineté des données, question posée par les administrations |
| Sauvegardes | `pg_dump` quotidien + copie hors site, restauration testée chaque mois | Les données métier ne se reconstruisent pas |
| Domaines | `api.cegitgroup.com` (API), `developpeurs.cegitgroup.com` (portail), `auth.cegitgroup.com` (identité) | Le portail peut rester sur GitHub Pages avec un domaine personnalisé |
| Supervision | Uptime Kuma (préprod), puis Prometheus et Grafana ; page d'état publique | Le SLA promis dans les offres doit être mesuré |

## 2. Vos propres instances des moteurs OpenStreetMap

Les démonstrations appellent aujourd'hui les serveurs publics d'OpenStreetMap. Leurs règles d'usage interdisent un usage commercial intensif et, pour Nominatim, la saisie semi-automatique. En production, chaque moteur tourne chez vous :

| Moteur | Rôle | API concernées |
|---|---|---|
| Nominatim | Géocodage direct et inverse | Géocodage, Vérification d'adresse, Limites, Quartiers |
| Photon | Suggestions à la frappe | Saisie automatique, Lieux |
| OSRM et Valhalla | Itinéraires, matrices, isochrones | Routage, Zones, Rues, Secours, Santé |
| Martin | Tuiles aux couleurs CEGIT | Cartes |
| PostGIS | Données métier et référentiels | Toutes les API métier |

Données de départ : extrait OpenStreetMap « senegal-and-gambia » de Geofabrik, mis à jour chaque semaine.

## 3. Comptes, clés et crédits réels

- **Keycloak** pour les comptes (inscription, mot de passe oublié, double authentification pour les administrateurs).
- **APISIX** pour les clés d'API, les quotas et le décompte des crédits à chaque appel.
- Un petit service « compte développeur » (FastAPI) qui crée la clé dans APISIX à l'inscription et affiche la consommation dans le portail.
- Le compte de démonstration `admin` et le contrôle dans le navigateur sont **supprimés**.

## 4. Données officielles

Les indicateurs de démonstration (risques, fiscalité, télécoms, propriété, urbanisme) doivent être remplacés par des données sources, sous convention :

- limites administratives : ANAT, ANSD ;
- cadastre et fiscalité : DGID ;
- centres de secours : BNSP ;
- structures de santé et écoles : ministères de la Santé et de l'Éducation nationale ;
- couverture mobile : ARTP et opérateurs ;
- risques : études de vulnérabilité, DPC, ANACIM.

Chaque source est inscrite dans [donnees.md](donnees.md) avec sa licence.

## 5. Cadre juridique

- **Données personnelles** : déclaration ou demande d'autorisation auprès de la Commission de protection des données personnelles (CDP, loi n° 2008-12) pour les API qui en traitent (propriété, vérification d'e-mail et de téléphone, géolocalisation).
- Conditions générales d'utilisation et de vente, mentions légales, politique de confidentialité.
- Respect de la licence ODbL : mention « © contributeurs OpenStreetMap » sur chaque carte et réponse issue d'OSM.

## 6. Paiement

Paiement en francs CFA par mobile money (Wave, Orange Money) et carte via un agrégateur de paiement local, avec facturation automatique des offres.

## 7. Tests avant l'ouverture

1. Tests fonctionnels de chaque API (collection Bruno ou Postman versionnée dans le dépôt).
2. Tests de charge avec k6 : par exemple 50 requêtes par seconde sur le géocodage pendant 10 minutes.
3. Test d'intrusion sur la passerelle et le portail.
4. **Bêta fermée** avec trois à cinq clients pilotes (collectivité, opérateur, ONG), clés limitées, retour d'expérience sur un mois.
5. Ouverture publique.

## Ordre conseillé

| Étape | Contenu | Résultat |
|---|---|---|
| 1 | Serveur, domaines, Keycloak, APISIX, PostGIS | Connexion et clés réelles |
| 2 | Nominatim, Photon, OSRM, Valhalla sur le Sénégal | Démos et API d'adresse et de mobilité réelles |
| 3 | Première API métier avec données officielles | Une offre vendable |
| 4 | Juridique, paiement, bêta fermée | Ouverture publique |
