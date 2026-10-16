-- Extensions et un schéma par module
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS unaccent;

CREATE SCHEMA IF NOT EXISTS ref_admin;   -- limites administratives
CREATE SCHEMA IF NOT EXISTS gindi;       -- adresses
CREATE SCHEMA IF NOT EXISTS chealth;     -- santé
CREATE SCHEMA IF NOT EXISTS cartoscol;   -- cartographie scolaire
CREATE SCHEMA IF NOT EXISTS patribati;   -- patrimoine bâti
CREATE SCHEMA IF NOT EXISTS cegitcad;    -- foncier
CREATE SCHEMA IF NOT EXISTS urba;        -- urbanisme
CREATE SCHEMA IF NOT EXISTS wallu;       -- risques et sécurité civile
CREATE SCHEMA IF NOT EXISTS naturasen;   -- biodiversité
