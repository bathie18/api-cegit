/* Catalogue des API CEGIT.
   Source unique utilisée par le portail (index.html), les démos (demo.html)
   et le générateur de documentation (tools/generer-docs.js).
   Les réponses d'exemple sont fictives. */
(function (root) {
  const STATUS = {
    proto: ["Prototype", "st-proto"],
    beta: ["Bêta", "st-beta"],
    spec: ["En spécification", "st-spec"]
  };

  const FAMS = [
    "Adresses et géocodage",
    "Cartographie et territoires",
    "Mobilité",
    "Risques et secours",
    "Équipements et services",
    "Foncier, urbanisme et fiscalité",
    "Télécoms et vérification",
    "Environnement"
  ];

  const LAYERS = [
    ["Passerelle d'API", "Clés, quotas, journalisation", [["Apache APISIX", "Apache-2.0"]]],
    ["Identité", "Comptes, OAuth2, rôles", [["Keycloak", "Apache-2.0"]]],
    ["Services", "Logique métier et OpenAPI", [["FastAPI", "MIT"], ["pygeoapi", "MIT"], ["pg_featureserv", "Apache-2.0"]]],
    ["Moteurs spécialisés", "Géocodage, routage, tuiles, rasters", [["Nominatim", "GPL-2.0"], ["Photon", "Apache-2.0"], ["OSRM", "BSD-2"], ["Valhalla", "MIT"], ["Martin", "Apache-2.0"], ["TiTiler", "MIT"]]],
    ["Données", "Stockage et traitements", [["PostgreSQL / PostGIS", "PostgreSQL / GPL-2"], ["GDAL", "MIT"], ["OpenStreetMap", "ODbL"]]],
    ["Portail et documentation", "Cette interface, spécifications", [["Leaflet", "BSD-2"], ["OpenAPI 3.1", "Apache-2.0"]]],
    ["Exploitation", "Déploiement, supervision", [["Docker Compose", "Apache-2.0"], ["Prometheus", "Apache-2.0"], ["Grafana", "AGPL-3.0"]]]
  ];

  const P = (name, type, desc, req, ex) => [name, type, desc, !!req, ex === undefined ? "" : String(ex)];
  const DEMO = " (donnée de démonstration)";

  const APIS = [
    /* ---------- Adresses et géocodage ---------- */
    {
      id: "geocodage", name: "Géocodage", mod: "Module GINDI", fam: 0, ico: "globe", st: "proto",
      desc: "Convertissez une adresse, un lieu-dit ou un repère en coordonnées, et inversement.",
      stack: ["Nominatim", "PostGIS", "FastAPI"],
      eps: [
        { m: "GET", p: "/v1/geocode", t: "Géocodage direct", d: "Renvoie les candidats classés par score de confiance.",
          q: [P("q", "texte", "Adresse, lieu-dit ou repère", 1, "Avenue Léopold Sédar Senghor, Thiès"), P("country", "code ISO", "Pays de recherche", 0, "SN"), P("limit", "entier", "Nombre de résultats (1 à 20)", 0, 3)],
          r: p => ({ type: "FeatureCollection", query: p.q, features: [{ type: "Feature", geometry: { type: "Point", coordinates: [-16.9256, 14.791] }, properties: { label: "Avenue Léopold Sédar Senghor, Thiès", commune: "Thiès-Nord", departement: "Thiès", region: "Thiès", precision: "rue", score: 0.94, gindi_code: "TH-N-0412" } }] }) },
        { m: "GET", p: "/v1/reverse", t: "Géocodage inverse", d: "Renvoie l'adresse la plus proche d'un point.",
          q: [P("lat", "décimal", "Latitude WGS 84", 1, 14.791), P("lon", "décimal", "Longitude WGS 84", 1, -16.9256)],
          r: p => ({ type: "Feature", geometry: { type: "Point", coordinates: [+p.lon, +p.lat] }, properties: { label: "Avenue Léopold Sédar Senghor, Thiès", distance_m: 18, commune: "Thiès-Nord", gindi_code: "TH-N-0412" } }) }
      ]
    },
    {
      id: "saisie-adresse", name: "Saisie automatique d'adresse", mod: "Module GINDI", fam: 0, ico: "gauge", st: "beta",
      desc: "Intégrez la recherche d'adresses avec suggestions à la frappe dans vos sites et applications mobiles.",
      stack: ["Photon", "OpenSearch"],
      eps: [
        { m: "GET", p: "/v1/autocomplete", t: "Suggérer des adresses", d: "Réponse en moins de 100 ms, pensée pour un appel à chaque frappe.",
          q: [P("text", "texte", "Début de saisie", 1, "Marché Mo"), P("country", "code ISO", "Pays", 0, "SN"), P("admin_only", "booléen", "Uniquement les zones administratives", 0, "false")],
          r: p => ({ query: p.text, suggestions: [{ label: "Marché Moussanté, Thiès", type: "lieu", score: 0.91 }, { label: "Rue du Marché Moussanté, Thiès", type: "rue", score: 0.84 }, { label: "Marché Moderne, Mbour", type: "lieu", score: 0.62 }] }) },
        { m: "GET", p: "/v1/autocomplete/ip", t: "Suggestions autour d'une adresse IP", d: "Priorise les résultats proches de la position déduite de l'adresse IP.",
          q: [P("text", "texte", "Début de saisie", 1, "Lycée"), P("ip", "IPv4", "Adresse IP (sinon celle de l'appelant)", 0, "41.82.10.20"), P("radius_km", "décimal", "Rayon de recherche", 0, 15)],
          r: p => ({ query: p.text, centre: { ville: "Dakar", source: "ip" }, suggestions: [{ label: "Lycée Lamine Guèye, Dakar-Plateau", distance_km: 2.1 }, { label: "Lycée Blaise Diagne, Fann", distance_km: 4.6 }] }) }
      ]
    },
    {
      id: "saisie-adresse-entreprise", name: "Saisie d'adresses Entreprise", mod: "Module GINDI", fam: 0, ico: "building", st: "spec",
      desc: "Saisie anticipée, recherche par lieu, par code et par découpage administratif pour les formulaires métiers.",
      stack: ["Photon", "PostGIS", "FastAPI"],
      eps: [
        { m: "GET", p: "/v1/enterprise/typeahead", t: "Saisie anticipée", d: "Complète l'adresse et remplit commune, département et région.",
          q: [P("text", "texte", "Début de saisie", 1, "Cité Keur Gorgui"), P("country", "code ISO", "Pays", 0, "SN")],
          r: p => ({ query: p.text, results: [{ label: "Cité Keur Gorgui, Sicap-Liberté, Dakar", commune: "Sicap-Liberté", departement: "Dakar", region: "Dakar" }] }) },
        { m: "GET", p: "/v1/enterprise/by-code", t: "Recherche par code", d: "Code postal ou code d'adresse GINDI.",
          q: [P("code", "texte", "Code postal ou code GINDI", 1, "10200")],
          r: p => ({ code: p.code, localite: "Dakar", adresses: 124 }) },
        { m: "GET", p: "/v1/enterprise/by-admin", t: "Recherche administrative", d: "Région, département, commune, quartier et rue.",
          q: [P("region", "texte", "Région", 1, "Thiès"), P("departement", "texte", "Département", 0, "Mbour"), P("commune", "texte", "Commune", 0, "Saly Portudal"), P("rue", "texte", "Rue", 0, "")],
          r: p => ({ region: p.region, departement: p.departement, commune: p.commune, resultats: 18 }) }
      ]
    },
    {
      id: "verification-adresse", name: "Vérification d'adresse", mod: "Module GINDI", fam: 0, ico: "mapcheck", st: "spec",
      desc: "Vérifiez qu'une adresse existe, normalisez-la et assurez la bonne remise des courriers et colis.",
      stack: ["Nominatim", "PostGIS"],
      eps: [
        { m: "POST", p: "/v1/address/verify", t: "Vérifier une adresse", d: "Renvoie l'adresse normalisée, sa position et un indice de confiance.",
          q: [P("adresse", "texte", "Ligne d'adresse", 1, "Rue 10 x 13, Médina"), P("complement", "texte", "Complément", 0, ""), P("commune", "texte", "Commune", 0, "Dakar"), P("country", "code ISO", "Pays", 0, "SN")],
          r: p => ({ statut: "verifiee", adresse_normalisee: "Rue 10 angle Rue 13, Médina, Dakar", confiance: 0.82, coordinates: [-17.4497, 14.6808] }) }
      ]
    },
    {
      id: "adresses", name: "Adresses", mod: "Module GINDI", fam: 0, ico: "mappin", st: "beta",
      desc: "Listez les adresses d'une région, d'un département, d'une commune ou d'une zone dessinée.",
      stack: ["PostGIS", "OpenStreetMap"],
      eps: [
        { m: "GET", p: "/v1/addresses/by-boundary-name", t: "Adresses par nom de limite", d: "Région, département ou commune.",
          q: [P("region", "texte", "Région", 1, "Dakar"), P("departement", "texte", "Département", 0, "Pikine"), P("limit", "entier", "Nombre maximum", 0, 20)],
          r: p => ({ limite: p.departement || p.region, total: 1840, items: [{ label: "Rue PK-12, Pikine" }, { label: "Avenue Cheikh Ahmadou Bamba, Pikine" }] }) },
        { m: "POST", p: "/v1/addresses/by-boundary", t: "Adresses dans un polygone", d: "Géométrie GeoJSON en WGS 84.",
          q: [P("geometry", "GeoJSON", "Polygone", 1, '{"type":"Polygon","coordinates":[[[-17.46,14.69],[-17.44,14.69],[-17.44,14.70],[-17.46,14.69]]]}'), P("limit", "entier", "Nombre maximum", 0, 20)],
          r: p => ({ total: 212, items: [{ label: "Rue 6, Médina, Dakar" }, { label: "Rue 11, Médina, Dakar" }] }) }
      ]
    },

    /* ---------- Cartographie et territoires ---------- */
    {
      id: "cartes", name: "Cartes", mod: "Cartographie", fam: 1, ico: "map", st: "proto",
      desc: "Fonds de plan OpenStreetMap et styles aux couleurs CEGIT pour vos sites, QGIS et QWC2.",
      stack: ["Martin", "MapLibre", "OpenStreetMap"],
      eps: [
        { m: "GET", p: "/v1/tiles/{style}/style.json", t: "Style de carte", d: "Style MapLibre prêt à l'emploi.",
          q: [P("style", "texte", "osm, cegit-clair, cegit-sombre", 1, "cegit-clair")],
          r: p => ({ version: 8, name: p.style, sources: { cegit: { type: "vector", tiles: ["https://api.cegitgroup.com/v1/tiles/{z}/{x}/{y}.pbf"] } }, layers: "[…]" }) },
        { m: "GET", p: "/v1/tiles/{style}/{z}/{x}/{y}.png", t: "Tuile raster", d: "Tuiles 256 px, compatibles Leaflet et QGIS (XYZ).",
          q: [P("style", "texte", "Style", 1, "osm"), P("z", "entier", "Zoom", 1, 10), P("x", "entier", "Colonne", 1, 461), P("y", "entier", "Ligne", 1, 470)],
          r: p => ({ contenu: "image/png" }) }
      ]
    },
    {
      id: "limites-administratives", name: "Limites administratives", mod: "Référentiel CEGIT", fam: 1, ico: "shape", st: "proto",
      desc: "Région, département, arrondissement et commune d'un point, avec la géométrie de chaque entité.",
      stack: ["PostGIS", "pygeoapi", "OGC API Features"],
      eps: [
        { m: "GET", p: "/v1/boundaries/lookup", t: "Entités d'un point", d: "Intersection sur tous les niveaux administratifs.",
          q: [P("lat", "décimal", "Latitude", 1, 14.6928), P("lon", "décimal", "Longitude", 1, -17.4467)],
          r: p => ({ point: [+p.lon, +p.lat], region: { code: "01", nom: "Dakar" }, departement: { code: "011", nom: "Dakar" }, arrondissement: { nom: "Dakar-Plateau" }, commune: { nom: "Dakar-Plateau" } }) },
        { m: "GET", p: "/v1/boundaries/{niveau}/{code}", t: "Géométrie d'une entité", d: "Géométrie simplifiée ou complète.",
          q: [P("niveau", "texte", "region, departement, commune", 1, "commune"), P("code", "texte", "Code de l'entité", 1, "01111"), P("simplify", "mètres", "Tolérance de simplification", 0, 50)],
          r: p => ({ type: "Feature", id: p.code, properties: { niveau: p.niveau, nom: "Dakar-Plateau", superficie_km2: 5.4 }, geometry: { type: "MultiPolygon", coordinates: "[…]" } }) }
      ]
    },
    {
      id: "quartiers", name: "Quartiers", mod: "Référentiel CEGIT", fam: 1, ico: "quarter", st: "spec",
      desc: "Nom du quartier ou du village d'un point, avec sa typologie urbaine (centre, résidentiel, périurbain, rural).",
      stack: ["PostGIS", "OpenStreetMap"],
      eps: [
        { m: "GET", p: "/v1/neighborhoods/lookup", t: "Quartier d'un point", d: "Nom, commune et typologie.",
          q: [P("lat", "décimal", "Latitude", 1, 14.7180), P("lon", "décimal", "Longitude", 1, -17.4560)],
          r: p => ({ quartier: "Sicap Liberté", commune: "Sicap-Liberté", typologie: "Résidentiel dense", source: "OpenStreetMap + CEGIT" }) }
      ]
    },
    {
      id: "fuseau-horaire", name: "Fuseau horaire", mod: "Référentiel CEGIT", fam: 1, ico: "clock", st: "proto",
      desc: "Fuseau horaire, heure locale et décalage UTC d'un lieu, pour vos applications et traitements.",
      stack: ["FastAPI", "tz database"],
      eps: [
        { m: "GET", p: "/v1/timezone", t: "Fuseau d'un point", d: "Nom IANA, décalage UTC et heure d'été éventuelle.",
          q: [P("lat", "décimal", "Latitude", 1, 14.6928), P("lon", "décimal", "Longitude", 1, -17.4467)],
          r: p => ({ fuseau: "Africa/Dakar", nom: "Temps universel coordonné (GMT)", decalage_utc_s: 0, heure_ete: false }) }
      ]
    },

    /* ---------- Mobilité ---------- */
    {
      id: "zones", name: "Zones", mod: "Mobilité", fam: 2, ico: "target", st: "beta",
      desc: "Zones accessibles en temps ou en distance de trajet, zones tampons et zones autour d'un lieu.",
      stack: ["Valhalla", "OpenStreetMap"],
      eps: [
        { m: "GET", p: "/v1/isochrone", t: "Zone accessible en N minutes", d: "Polygones d'accessibilité pour plusieurs durées.",
          q: [P("lat", "décimal", "Latitude", 1, 14.791), P("lon", "décimal", "Longitude", 1, -16.9256), P("minutes", "liste", "Durées séparées par des virgules", 1, "10,20"), P("mode", "texte", "auto, pedestrian", 0, "auto")],
          r: p => ({ type: "FeatureCollection", features: String(p.minutes).split(",").map(m => ({ type: "Feature", properties: { minutes: +m, mode: p.mode }, geometry: { type: "Polygon", coordinates: "[…]" } })) }) },
        { m: "GET", p: "/v1/buffer", t: "Zone tampon", d: "Cercle géodésique autour d'un point.",
          q: [P("lat", "décimal", "Latitude", 1, 14.791), P("lon", "décimal", "Longitude", 1, -16.9256), P("radius_m", "décimal", "Rayon en mètres", 1, 1000)],
          r: p => ({ type: "Feature", properties: { rayon_m: +p.radius_m, surface_km2: 3.14 }, geometry: { type: "Polygon", coordinates: "[…]" } }) }
      ]
    },
    {
      id: "routage", name: "Routage", mod: "Mobilité", fam: 2, ico: "arrow", st: "beta",
      desc: "Itinéraires détaillés en français et matrices de temps et de distances entre plusieurs lieux.",
      stack: ["OSRM", "Valhalla", "OpenStreetMap"],
      eps: [
        { m: "POST", p: "/v1/route", t: "Calculer un itinéraire", d: "Itinéraire entre deux points ou plus, avec instructions en français.",
          q: [P("from", "lat,lon", "Départ", 1, "14.6928,-17.4467"), P("to", "lat,lon", "Arrivée", 1, "14.7910,-16.9256"), P("mode", "texte", "auto, pedestrian", 0, "auto")],
          r: p => ({ distance_km: 71.8, duree_min: 68, mode: p.mode, etapes: [{ instruction: "Prenez l'autoroute A1 vers Diamniadio", distance_km: 32.1 }, { instruction: "Continuez sur la N2 vers Thiès", distance_km: 37.4 }] }) },
        { m: "POST", p: "/v1/matrix", t: "Matrice des coûts", d: "Temps et distances entre des sources et des destinations.",
          q: [P("sources", "liste lat,lon", "Points de départ", 1, "14.6928,-17.4467"), P("destinations", "liste lat,lon", "Points d'arrivée", 1, "14.7910,-16.9256;16.0326,-16.4818")],
          r: p => ({ distances_km: [[71.8, 264.3]], durees_min: [[68, 236]] }) }
      ]
    },
    {
      id: "rues", name: "Rues", mod: "Mobilité", fam: 2, ico: "road", st: "beta",
      desc: "Trouvez la voie et l'intersection les plus proches, avec leur classe et leurs caractéristiques.",
      stack: ["OSRM", "PostGIS", "OpenStreetMap"],
      eps: [
        { m: "GET", p: "/v1/streets/nearest", t: "Voie la plus proche", d: "Nom, classe, nombre de voies et vitesse autorisée si connue.",
          q: [P("lat", "décimal", "Latitude", 1, 14.6928), P("lon", "décimal", "Longitude", 1, -17.4467)],
          r: p => ({ nom: "Avenue Georges Pompidou", classe: "Principale", voies: 2, vitesse_max_kmh: 50, distance_m: 12 }) }
      ]
    },

    /* ---------- Risques et secours ---------- */
    {
      id: "risques", name: "Risques", mod: "Module WALLU", fam: 3, ico: "alert", st: "beta",
      desc: "Exposition aux inondations, à l'érosion côtière, aux feux de brousse et à l'accidentalité routière.",
      stack: ["PostGIS", "TiTiler", "GDAL"],
      eps: [
        { m: "GET", p: "/v1/risks/flood", t: "Risque inondation", d: "Niveau d'aléa et événements recensés.",
          q: [P("lat", "décimal", "Latitude", 1, 14.7547), P("lon", "décimal", "Longitude", 1, -17.39)],
          r: p => ({ alea: "fort", hauteur_eau_m: 0.8, evenements_recenses: 3, note: "Donnée de démonstration" }) },
        { m: "GET", p: "/v1/risks/coastal-erosion", t: "Érosion côtière", d: "Recul du trait de côte et distance au rivage.",
          q: [P("lat", "décimal", "Latitude", 1, 14.7158), P("lon", "décimal", "Longitude", 1, -17.2733)],
          r: p => ({ niveau: "élevé", recul_m_an: 1.2, distance_rivage_m: 180, note: "Donnée de démonstration" }) },
        { m: "GET", p: "/v1/risks/road-safety", t: "Accidentalité routière", d: "Accidents recensés dans un rayon donné.",
          q: [P("lat", "décimal", "Latitude", 1, 14.791), P("lon", "décimal", "Longitude", 1, -16.9256), P("radius_m", "décimal", "Rayon", 0, 1000)],
          r: p => ({ accidents_3_ans: 41, dont_mortels: 3, niveau: "au-dessus de la moyenne", note: "Donnée de démonstration" }) }
      ]
    },
    {
      id: "secours", name: "Secours 18", mod: "Module WALLU", fam: 3, ico: "aid", st: "spec",
      desc: "Centre de secours compétent et services d'urgence d'un lieu, pour les plateformes d'appel et la cartographie opérationnelle.",
      stack: ["PostGIS", "OSRM"],
      eps: [
        { m: "GET", p: "/v1/emergency/competent-center", t: "Centre de secours compétent", d: "Centre de la BNSP le plus rapide à rejoindre le lieu.",
          q: [P("lat", "décimal", "Latitude", 1, 14.791), P("lon", "décimal", "Longitude", 1, -16.9256)],
          r: p => ({ centre: "Centre de secours de Thiès" + DEMO, numero_urgence: "18", delai_min: 7, distance_km: 3.4 }) },
        { m: "GET", p: "/v1/emergency/services", t: "Services d'urgence", d: "Sapeurs-pompiers, SAMU, police ou gendarmerie compétents.",
          q: [P("lat", "décimal", "Latitude", 1, 14.791), P("lon", "décimal", "Longitude", 1, -16.9256)],
          r: p => ({ services: [{ type: "Sapeurs-pompiers", numero: "18" }, { type: "SAMU", numero: "1515" }, { type: "Police", numero: "17" }] }) }
      ]
    },

    /* ---------- Équipements et services ---------- */
    {
      id: "lieux", name: "Lieux", mod: "Référentiel CEGIT", fam: 4, ico: "pin", st: "beta",
      desc: "Recherchez marchés, mosquées, gares routières, banques, administrations et autres points d'intérêt.",
      stack: ["Overpass", "Photon", "OpenStreetMap"],
      eps: [
        { m: "GET", p: "/v1/poi/nearby", t: "Points d'intérêt autour d'une adresse", d: "Filtrage par type et par nom.",
          q: [P("lat", "décimal", "Latitude", 1, 14.791), P("lon", "décimal", "Longitude", 1, -16.9256), P("type", "texte", "marche, banque, gare_routiere…", 0, "marche"), P("radius_m", "décimal", "Rayon", 0, 2000)],
          r: p => ({ items: [{ nom: "Marché Central de Thiès", type: "marché", distance_m: 640 }] }) },
        { m: "POST", p: "/v1/poi/by-boundary", t: "Points d'intérêt dans un polygone", d: "Géométrie GeoJSON en WGS 84.",
          q: [P("geometry", "GeoJSON", "Polygone", 1, "{…}"), P("type", "texte", "Type", 0, "banque")],
          r: p => ({ total: 12, items: [{ nom: "Banque (exemple)", type: "banque" }] }) }
      ]
    },
    {
      id: "ecoles", name: "Écoles", mod: "Module CartoScol", fam: 4, ico: "school", st: "beta",
      desc: "Établissements scolaires à proximité : type, cycle, distance et informations de la carte scolaire.",
      stack: ["PostGIS", "pygeoapi", "OpenStreetMap"],
      eps: [
        { m: "GET", p: "/v1/schools/nearby", t: "Écoles à proximité", d: "Classées par distance.",
          q: [P("lat", "décimal", "Latitude", 1, 14.791), P("lon", "décimal", "Longitude", 1, -16.9256), P("cycle", "texte", "elementaire, moyen, secondaire", 0, "")],
          r: p => ({ items: [{ nom: "Lycée Malick Sy", cycle: "secondaire", statut: "public", distance_m: 820 }] }) }
      ]
    },
    {
      id: "sante", name: "Santé", mod: "Module C-Health", fam: 4, ico: "health", st: "beta",
      desc: "Hôpitaux, centres et postes de santé, pharmacies : structures les plus proches et temps d'accès.",
      stack: ["PostGIS", "OSRM", "OpenStreetMap"],
      eps: [
        { m: "GET", p: "/v1/health/facilities/nearby", t: "Structures les plus proches", d: "Classées par temps d'accès réel.",
          q: [P("lat", "décimal", "Latitude", 1, 14.791), P("lon", "décimal", "Longitude", 1, -16.9256), P("type", "texte", "hopital, centre, poste, pharmacie", 0, "hopital")],
          r: p => ({ items: [{ nom: "Hôpital régional de Thiès", type: "hôpital", acces_min: 6 }] }) }
      ]
    },

    /* ---------- Foncier, urbanisme et fiscalité ---------- */
    {
      id: "propriete", name: "Informations sur la propriété", mod: "Modules PatriBâti et CegitCAD+", fam: 5, ico: "house", st: "spec",
      desc: "Attributs d'une parcelle et de son bâti : NICAD, titre, superficie, usage, valeur estimée et limites.",
      stack: ["PostGIS", "FastAPI", "Keycloak"],
      eps: [
        { m: "GET", p: "/v1/property", t: "Attributs de la propriété", d: "Accès restreint aux comptes habilités.",
          q: [P("lat", "décimal", "Latitude", 1, 14.6928), P("lon", "décimal", "Longitude", 1, -17.4467)],
          r: p => ({ nicad: "0000 0000 00000" + DEMO, superficie_m2: 300, usage: "habitation", note: "Donnée de démonstration" }) },
        { m: "GET", p: "/v1/property/parcel", t: "Limite de la parcelle", d: "Géométrie de la parcelle.",
          q: [P("nicad", "texte", "Identifiant cadastral", 1, "0000 0000 00000")],
          r: p => ({ type: "Feature", properties: { nicad: p.nicad }, geometry: { type: "Polygon", coordinates: "[…]" } }) }
      ]
    },
    {
      id: "urbanisme", name: "Urbanisme", mod: "Module CEGIT-URBA", fam: 5, ico: "city", st: "spec",
      desc: "Zone du plan d'urbanisme applicable à un lieu et règles associées, pour l'instruction des autorisations.",
      stack: ["PostGIS", "pygeoapi"],
      eps: [
        { m: "GET", p: "/v1/zoning", t: "Zone applicable", d: "Document d'urbanisme, zone et règles principales.",
          q: [P("lat", "décimal", "Latitude", 1, 14.791), P("lon", "décimal", "Longitude", 1, -16.9256)],
          r: p => ({ document: "Plan directeur d'urbanisme" + DEMO, zone: "UA", libelle: "Zone urbaine dense" }) }
      ]
    },
    {
      id: "fiscalite-locale", name: "Fiscalité locale", mod: "Référentiel CEGIT", fam: 5, ico: "coin", st: "spec",
      desc: "Impôts et taxes applicables à un lieu : TVA, contributions foncières et contribution économique locale.",
      stack: ["PostGIS", "FastAPI"],
      eps: [
        { m: "GET", p: "/v1/tax/local", t: "Fiscalité d'un lieu", d: "Taux indicatifs, à confirmer auprès de l'administration fiscale.",
          q: [P("lat", "décimal", "Latitude", 1, 14.6928), P("lon", "décimal", "Longitude", 1, -17.4467), P("type", "texte", "general, foncier, commune", 0, "general")],
          r: p => ({ commune: "Dakar-Plateau", tva_taux_normal_pct: 18, note: "Taux indicatifs" }) }
      ]
    },

    /* ---------- Télécoms et vérification ---------- */
    {
      id: "telecoms", name: "Télécoms", mod: "Référentiel CEGIT", fam: 6, ico: "phone", st: "spec",
      desc: "Opérateurs et technologies mobiles disponibles en un lieu (2G, 3G, 4G, 5G).",
      stack: ["PostGIS", "FastAPI"],
      eps: [
        { m: "GET", p: "/v1/telecom/coverage", t: "Couverture d'un lieu", d: "Par opérateur et par technologie.",
          q: [P("lat", "décimal", "Latitude", 1, 14.6928), P("lon", "décimal", "Longitude", 1, -17.4467)],
          r: p => ({ operateurs: [{ nom: "Orange (Sonatel)", technologies: ["2G", "3G", "4G"] }], note: "Donnée de démonstration" }) }
      ]
    },
    {
      id: "geolocalisation", name: "Géolocalisation", mod: "Référentiel CEGIT", fam: 6, ico: "compass", st: "spec",
      desc: "Position approximative d'une adresse IP ou d'un point d'accès Wi-Fi.",
      stack: ["FastAPI"],
      eps: [
        { m: "GET", p: "/v1/geolocation/ip", t: "Position d'une adresse IP", d: "Ville, pays et précision estimée.",
          q: [P("ip", "IPv4", "Adresse IP", 1, "41.82.10.20")],
          r: p => ({ ip: p.ip, ville: "Dakar", pays: "SN", precision_km: 25, note: "Donnée de démonstration" }) },
        { m: "GET", p: "/v1/geolocation/wifi", t: "Position d'un point d'accès Wi-Fi", d: "À partir de l'adresse MAC du point d'accès.",
          q: [P("mac", "texte", "Adresse MAC", 1, "00:1A:2B:3C:4D:5E")],
          r: p => ({ mac: p.mac, precision_m: 60, note: "Donnée de démonstration" }) }
      ]
    },
    {
      id: "verification-email", name: "Vérification d'e-mail", mod: "Vérification", fam: 6, ico: "mail", st: "proto",
      desc: "Vérifiez la syntaxe et le domaine d'une adresse électronique pour fiabiliser vos fichiers.",
      stack: ["FastAPI"],
      eps: [
        { m: "GET", p: "/v1/verify/email", t: "Vérifier une adresse e-mail", d: "Syntaxe, domaine, serveur de messagerie, adresse jetable.",
          q: [P("email", "texte", "Adresse électronique", 1, "contact@exemple.sn")],
          r: p => ({ email: p.email, syntaxe: true, domaine_mx: true, jetable: false, verdict: "valide" }) }
      ]
    },
    {
      id: "verification-telephone", name: "Vérification téléphonique", mod: "Vérification", fam: 6, ico: "phonecheck", st: "proto",
      desc: "Vérifiez le format d'un numéro et identifiez l'opérateur et le type de ligne.",
      stack: ["FastAPI"],
      eps: [
        { m: "GET", p: "/v1/verify/phone", t: "Vérifier un numéro", d: "Notation E.164, opérateur d'attribution, mobile ou fixe.",
          q: [P("phone", "texte", "Numéro avec indicatif", 1, "+221 77 000 00 00")],
          r: p => ({ numero: "+221770000000", valide: true, operateur: "Orange (Sonatel)", type: "mobile" }) }
      ]
    },

    /* ---------- Environnement ---------- */
    {
      id: "biodiversite", name: "Biodiversité", mod: "Module NaturaSen", fam: 7, ico: "leaf", st: "spec",
      desc: "Aires protégées et observations de faune et de flore autour d'un lieu.",
      stack: ["PostGIS", "pygeoapi", "OpenStreetMap"],
      eps: [
        { m: "GET", p: "/v1/biodiversity/protected-areas", t: "Aires protégées proches", d: "Parcs, réserves et forêts classées.",
          q: [P("lat", "décimal", "Latitude", 1, 14.791), P("lon", "décimal", "Longitude", 1, -16.9256), P("radius_km", "décimal", "Rayon", 0, 50)],
          r: p => ({ items: [{ nom: "Réserve de Bandia", distance_km: 38 }] }) }
      ]
    }
  ];

  const out = { STATUS, FAMS, LAYERS, APIS };
  if (typeof module !== "undefined" && module.exports) module.exports = out;
  else root.CEGIT = out;
})(typeof window !== "undefined" ? window : globalThis);
