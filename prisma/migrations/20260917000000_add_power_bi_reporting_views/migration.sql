INSERT INTO reporting.dim_date (
    date_key,
    calendar_year,
    calendar_month,
    calendar_month_name,
    calendar_week,
    is_weekend
)
SELECT
    date_value::date,
    EXTRACT(YEAR FROM date_value)::INTEGER,
    EXTRACT(MONTH FROM date_value)::INTEGER,
    TRIM(TO_CHAR(date_value, 'Month')),
    EXTRACT(WEEK FROM date_value)::INTEGER,
    EXTRACT(ISODOW FROM date_value) IN (6, 7)
FROM generate_series(
    DATE '2024-01-01',
    DATE '2030-12-31',
    INTERVAL '1 day'
) AS date_value
ON CONFLICT (date_key) DO NOTHING;

CREATE OR REPLACE VIEW reporting.vw_application_summary AS
SELECT
    fa.application_id,
    fa.job_role_id,
    fa.user_key,
    fa.status_name,
    fa.submitted_at,
    fa.status_updated_at,
    c.capability_name,
    b.band_name,
    b.band_level,
    l.location_name,
    fa.is_deleted_in_source
FROM reporting.fact_application AS fa
JOIN reporting.dim_capability AS c
    ON c.capability_id = fa.capability_id
JOIN reporting.dim_band AS b
    ON b.band_id = fa.band_id
JOIN reporting.dim_location AS l
    ON l.location_id = fa.location_id
WHERE fa.is_deleted_in_source = FALSE;

CREATE OR REPLACE VIEW reporting.vw_vacancy_summary AS
SELECT
    fvd.snapshot_date,
    fvd.job_role_id,
    fvd.status_name,
    fvd.number_of_open_positions,
    c.capability_name,
    b.band_name,
    b.band_level,
    l.location_name
FROM reporting.fact_vacancy_daily AS fvd
JOIN reporting.dim_capability AS c
    ON c.capability_id = fvd.capability_id
JOIN reporting.dim_band AS b
    ON b.band_id = fvd.band_id
JOIN reporting.dim_location AS l
    ON l.location_id = fvd.location_id;

CREATE OR REPLACE VIEW reporting.vw_current_vacancies AS
SELECT
    vacancy.snapshot_date,
    vacancy.job_role_id,
    vacancy.status_name,
    vacancy.number_of_open_positions,
    vacancy.capability_name,
    vacancy.band_name,
    vacancy.band_level,
    vacancy.location_name
FROM reporting.vw_vacancy_summary AS vacancy
WHERE vacancy.snapshot_date = (
    SELECT MAX(snapshot_date)
    FROM reporting.fact_vacancy_daily
);

CREATE OR REPLACE VIEW reporting.vw_daily_recruitment_metrics AS
SELECT
    d.date_key AS metric_date,
    d.calendar_year,
    d.calendar_month,
    d.calendar_month_name,
    d.calendar_week,
    d.is_weekend,
    COALESCE(applications.application_count, 0)::INTEGER AS application_count
FROM reporting.dim_date AS d
LEFT JOIN (
    SELECT
        submitted_at::DATE AS metric_date,
        COUNT(*)::INTEGER AS application_count
    FROM reporting.vw_application_summary
    GROUP BY submitted_at::DATE
) AS applications
    ON applications.metric_date = d.date_key;

CREATE OR REPLACE VIEW reporting.vw_etl_health AS
SELECT
    run_id,
    run_started_at,
    run_completed_at,
    status,
    rows_processed,
    error_message,
    last_snapshot_date
FROM reporting.etl_run_log;

COMMENT ON VIEW reporting.vw_application_summary IS
    'Power BI application-level reporting view.';
COMMENT ON VIEW reporting.vw_vacancy_summary IS
    'Power BI daily vacancy snapshot reporting view.';
COMMENT ON VIEW reporting.vw_current_vacancies IS
    'Power BI latest vacancy snapshot view; do not sum daily snapshots across dates.';
COMMENT ON VIEW reporting.vw_daily_recruitment_metrics IS
    'Power BI date spine with daily application counts.';
COMMENT ON VIEW reporting.vw_etl_health IS
    'Power BI ETL monitoring view.';
