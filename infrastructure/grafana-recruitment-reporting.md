# Grafana Recruitment Reporting

Azure Managed Grafana is already provisioned for the dev and test environments. Use the PostgreSQL reporting views created by the reporting migrations.

## PostgreSQL data source

In Grafana, add a **PostgreSQL** data source with:

- Host: `psql-team3-<environment>.postgres.database.azure.com:5432`
- Database: `jobRoles`
- User: a read-only reporting user
- SSL mode: `require`
- PostgreSQL version: match the deployed server

The Grafana service must have network access to PostgreSQL. For private PostgreSQL, configure the approved VNet/private connectivity before adding the data source. Do not open the database broadly just for dashboard testing.

## Views to use

Use these views instead of the transactional application tables:

- `reporting.vw_application_summary`
- `reporting.vw_vacancy_summary`
- `reporting.vw_current_vacancies`
- `reporting.vw_daily_recruitment_metrics`
- `reporting.vw_etl_health`

## Starter panel queries

### Applications by status

```sql
SELECT
  status_name AS status,
  COUNT(*) AS applications
FROM reporting.vw_application_summary
GROUP BY status_name
ORDER BY applications DESC;
```

### Applications over time

```sql
SELECT
  submitted_at AS time,
  COUNT(*) AS applications
FROM reporting.vw_application_summary
WHERE $__timeFilter(submitted_at)
GROUP BY submitted_at
ORDER BY submitted_at;
```

### Applications by capability

```sql
SELECT
  capability_name AS capability,
  COUNT(*) AS applications
FROM reporting.vw_application_summary
GROUP BY capability_name
ORDER BY applications DESC;
```

### Current open positions by location

```sql
SELECT
  location_name AS location,
  SUM(number_of_open_positions) AS open_positions
FROM reporting.vw_current_vacancies
WHERE status_name = 'OPEN'
GROUP BY location_name
ORDER BY open_positions DESC;
```

### Current open positions by capability

```sql
SELECT
  capability_name AS capability,
  SUM(number_of_open_positions) AS open_positions
FROM reporting.vw_current_vacancies
WHERE status_name = 'OPEN'
GROUP BY capability_name
ORDER BY open_positions DESC;
```

### ETL health

```sql
SELECT
  run_started_at AS time,
  status,
  rows_processed,
  last_snapshot_date
FROM reporting.vw_etl_health
ORDER BY run_started_at DESC
LIMIT 20;
```

Do not sum `fact_vacancy_daily` across dates for a current vacancy total. Use `vw_current_vacancies` for the latest snapshot.
