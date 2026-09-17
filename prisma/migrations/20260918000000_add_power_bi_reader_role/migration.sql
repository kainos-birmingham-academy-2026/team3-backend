DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_roles
        WHERE rolname = 'power_bi_reader'
    ) THEN
        CREATE ROLE power_bi_reader
            NOLOGIN
            NOSUPERUSER
            NOCREATEDB
            NOCREATEROLE
            NOINHERIT
            NOREPLICATION;
    END IF;
END $$;

GRANT USAGE ON SCHEMA reporting TO power_bi_reader;

GRANT SELECT ON TABLE
    reporting.vw_application_summary,
    reporting.vw_vacancy_summary,
    reporting.vw_current_vacancies,
    reporting.vw_daily_recruitment_metrics,
    reporting.vw_etl_health
TO power_bi_reader;