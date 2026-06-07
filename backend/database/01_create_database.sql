-- Run as PostgreSQL superuser (e.g. psql -U postgres -f 01_create_database.sql)

SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE datname = 'farmsetu' AND pid <> pg_backend_pid();

DROP DATABASE IF EXISTS farmsetu;

CREATE DATABASE farmsetu
    ENCODING 'UTF8';

COMMENT ON DATABASE farmsetu IS 'FarmSetu agricultural platform';
