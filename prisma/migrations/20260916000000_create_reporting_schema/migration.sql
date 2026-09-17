CREATE SCHEMA IF NOT EXISTS reporting;

CREATE TABLE IF NOT EXISTS reporting.dim_date (
    date_key DATE PRIMARY KEY,
    calendar_year INTEGER NOT NULL,
    calendar_month INTEGER NOT NULL,
    calendar_month_name VARCHAR(9) NOT NULL,
    calendar_week INTEGER NOT NULL,
    is_weekend BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS reporting.dim_capability (
    capability_id INTEGER PRIMARY KEY,
    capability_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS reporting.dim_band (
    band_id INTEGER PRIMARY KEY,
    band_name VARCHAR(100) NOT NULL,
    band_level INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS reporting.dim_location (
    location_id INTEGER PRIMARY KEY,
    location_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS reporting.fact_application (
    application_id INTEGER PRIMARY KEY,
    job_role_id INTEGER NOT NULL,
    user_key INTEGER NOT NULL,
    capability_id INTEGER NOT NULL,
    band_id INTEGER NOT NULL,
    location_id INTEGER NOT NULL,
    status_name VARCHAR(20) NOT NULL CHECK (status_name IN ('IN_PROGRESS', 'HIRED', 'REJECTED', 'WITHDRAWN')),
    submitted_at TIMESTAMPTZ NOT NULL,
    status_updated_at TIMESTAMPTZ NOT NULL,
    is_deleted_in_source BOOLEAN NOT NULL DEFAULT FALSE,
    source_updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_fact_application_capability
        FOREIGN KEY (capability_id) REFERENCES reporting.dim_capability(capability_id),
    CONSTRAINT fk_fact_application_band
        FOREIGN KEY (band_id) REFERENCES reporting.dim_band(band_id),
    CONSTRAINT fk_fact_application_location
        FOREIGN KEY (location_id) REFERENCES reporting.dim_location(location_id)
);

CREATE TABLE IF NOT EXISTS reporting.fact_vacancy_daily (
    snapshot_date DATE NOT NULL,
    job_role_id INTEGER NOT NULL,
    capability_id INTEGER NOT NULL,
    band_id INTEGER NOT NULL,
    location_id INTEGER NOT NULL,
    status_name VARCHAR(20) NOT NULL CHECK (status_name IN ('OPEN', 'CLOSED')),
    number_of_open_positions INTEGER NOT NULL,
    PRIMARY KEY (snapshot_date, job_role_id),
    CONSTRAINT fk_fact_vacancy_daily_capability
        FOREIGN KEY (capability_id) REFERENCES reporting.dim_capability(capability_id),
    CONSTRAINT fk_fact_vacancy_daily_band
        FOREIGN KEY (band_id) REFERENCES reporting.dim_band(band_id),
    CONSTRAINT fk_fact_vacancy_daily_location
        FOREIGN KEY (location_id) REFERENCES reporting.dim_location(location_id)
);

CREATE TABLE IF NOT EXISTS reporting.etl_run_log (
    run_id SERIAL PRIMARY KEY,
    run_started_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    run_completed_at TIMESTAMPTZ,
    status VARCHAR(20) NOT NULL CHECK (status IN ('RUNNING', 'SUCCESS', 'FAILED')),
    rows_processed INTEGER NOT NULL DEFAULT 0,
    error_message TEXT,
    last_snapshot_date DATE
);

CREATE INDEX IF NOT EXISTS idx_fact_application_status
    ON reporting.fact_application (status_name);

CREATE INDEX IF NOT EXISTS idx_fact_application_job_role
    ON reporting.fact_application (job_role_id);

CREATE INDEX IF NOT EXISTS idx_fact_vacancy_daily_snapshot
    ON reporting.fact_vacancy_daily (snapshot_date);

CREATE INDEX IF NOT EXISTS idx_fact_vacancy_daily_role
    ON reporting.fact_vacancy_daily (job_role_id);
