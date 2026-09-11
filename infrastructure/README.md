# Infrastructure

Terraform deploys the backend's Azure resources. The independent `dev`, `test`,
and `prod` roots live under `environments/` and reuse modules from `modules/`.
Each root uses a separate remote-state key in the shared `tfstate` container:

- `dev` uses `team3-backend-dev.tfstate`.
- `test` uses `team3-backend-test.tfstate`.
- `prod` uses `team3-backend-prod.tfstate`.

The backend state owns the shared platform resources declared by each root,
including the resource group, Key Vault, Container Apps Environment, backend
identity, and backend Container App. Dev and test also own the database and
monitoring, plus the Service Bus and email notification platform. The frontend
has a separate state key because it is deployed from another repository and
owns only its identity, role assignments, and Container App. This prevents
either workflow from locking or planning changes against resources owned by the
other repository.

## Platform architecture

The diagram represents the complete dev and test environments. Production is
currently a partial root, described separately below. The shared container
registry is managed outside this Terraform root.

```mermaid
flowchart LR
	user[Browser]

	subgraph azure[Azure subscription]
		acr["Shared Azure Container Registry<br/>acraiacademy26"]

		subgraph rg["Resource Group: rg-team3-&lt;env&gt;"]
			vault["Key Vault<br/>kv-team3-&lt;env&gt;"]
			postgres[("Azure PostgreSQL<br/>psql-team3-&lt;env&gt;")]
			openai["Azure OpenAI<br/>dev-owned, shared with test"]

			subgraph cae["Container Apps Environment: cae-team3-&lt;env&gt;"]
				frontend["Frontend Container App<br/>ca-team3-frontend-&lt;env&gt;<br/>public :3000"]
				backend["Backend Container App<br/>ca-team3-backend-&lt;env&gt;<br/>internal :4000"]
			end

			frontendIdentity["Frontend managed identity<br/>id-team3-frontend-&lt;env&gt;"]
			backendIdentity["Backend managed identity<br/>id-team3-backend-&lt;env&gt;"]
			logs["Log Analytics Workspace<br/>dev and test"]
			grafana["Azure Managed Grafana<br/>dev and test"]
		end
	end

	user -->|HTTPS| frontend
	frontend -->|"API_BASE_URL<br/>internal FQDN"| backend
	backend -->|DATABASE_URL| postgres
	backend -->|managed identity| openai

	frontend -->|uses| frontendIdentity
	backend -->|uses| backendIdentity
	frontendIdentity -->|"AcrPull<br/>frontend image"| acr
	backendIdentity -->|"AcrPull<br/>backend image"| acr
	frontendIdentity -->|"Key Vault Secrets User<br/>session-secret"| vault
	backendIdentity -->|"Key Vault Secrets User<br/>database-url, jwt-secret"| vault

	frontend -. platform logs .-> logs
	backend -. platform logs .-> logs
	grafana -. Monitoring Reader .-> logs

	classDef public fill:#d8f3dc,stroke:#2d6a4f,color:#1b4332
	classDef private fill:#dbeafe,stroke:#1d4ed8,color:#1e3a8a
	classDef external fill:#f3f4f6,stroke:#4b5563,color:#1f2937
	classDef monitored fill:#fff7ed,stroke:#c2410c,stroke-dasharray:5 5,color:#7c2d12
	class frontend public
	class backend,vault private
	class acr external
	class logs,grafana monitored
```

## Dev architecture

The `dev` root manages:

- Resource group `rg-team3-dev`.
- Key Vault `kv-team3-dev`.
- User-assigned managed identity `id-team3-backend-dev`.
- Container App Environment `cae-team3-dev`.
- PostgreSQL Flexible Server `psql-team3-dev` and database `jobRoles`.
- Internal-only backend Container App `ca-team3-backend-dev` on port `4000`.
- `AcrPull` and `Key Vault Secrets User` role assignments for the managed
	identity.

The Container App pulls `team3-backend:<commit-sha>` from the shared ACR. It
reads Terraform-managed `database-url`, `jwt-secret`, and
`service-bus-connection-string` values from Key Vault.
The backend is not exposed through public ingress. The backend root also owns
the frontend's `session-secret`, keeping application secret ownership in one
state.

The PostgreSQL administrator password is supplied through a sensitive Terraform
write-only variable. Key Vault values use write-only arguments, so neither that
password nor the constructed database URL is stored in state. Generated JWT and
session credentials are stored as sensitive values in the encrypted remote
state so Terraform can recreate them after resource loss.

The dev container runs `prisma migrate deploy` and the idempotent Prisma seed
before starting the API, so a recreated empty database receives its schema and
development reference data.

Dev owns the Azure OpenAI account `aoai-team3-chatbot-dev` and its
`team3-chatbot-gpt5-nano` deployment. Test consumes this shared deployment.
Terraform grants each backend identity `Cognitive Services OpenAI User` and
configures the containers to authenticate with their managed identities.

Dev and test each provision a Standard Service Bus namespace with the
`notifications` topic and `email-processor` subscription. Separate Send-only
and Listen-only policies provide credentials for the backend and notification
Function. Terraform stores those credentials and the Azure Communication
Services credential in Key Vault and configures both workloads to read them.

The notification platform also includes a Flex Consumption Node.js Function
App, storage, Application Insights, Azure Communication Services, Email
Communication Services, an Azure-managed email domain, and the domain
association. CI builds and deploys `functions/notifications` after each
successful dev or test Terraform apply.

### Dev service automation

Only the dev root provisions Automation Account `aa-team3-dev`, with a
system-assigned managed identity and two published PowerShell 5.1 runbooks:

- `Start-Team3-Services`: starts the backend, then the frontend.
- `Stop-Team3-Services`: stops the frontend, then the backend.

Terraform imports `Az.Accounts` 5.3.0 before `Az.App` 2.0.0. The identity has a
custom role permitting resource-group read and Container App read/start/stop
only within `rg-team3-dev`. The deployment principal must be allowed to create
custom role definitions and role assignments in that scope.

Deploy through the existing dev Terraform workflow. Subsequent dev applies
recreate deleted automation resources while the remote state is retained.
If resources with these names already exist outside Terraform, import them
into the dev state before applying instead of deleting them.

Both dev Container Apps must exist before running either runbook; the frontend
is deployed by its separate repository. After deployment and RBAC propagation,
run either published runbook from `aa-team3-dev` in the Azure portal and inspect
its job output. No schedules or automatic job execution are configured. These
runbooks do not start or stop PostgreSQL or other platform services. Test and
prod do not provision this automation.

## Test architecture

The `test` root creates the same isolated platform shape as dev in
`rg-team3-test`, including PostgreSQL, Log Analytics, Grafana, generated
application secrets, and the backend Container App. Its PostgreSQL administrator
password is also generated by Terraform. Test data seeding is enabled.

The test provider recovers the same Key Vault name if Azure still holds a
soft-deleted, purge-protected `kv-team3-test`. It also permits resource-group
deletion to remove Azure resources that finished creating after a cancelled
Terraform run. These recovery settings apply only to test.

## Production status

The `prod` root currently defines the resource group, Key Vault, backend
identity, Container Apps Environment, RBAC, and backend Container App. It does
not define PostgreSQL, application secrets, monitoring, or a CI/CD deployment
job. The Container App expects `database-url`, `jwt-secret`, and
`service-bus-connection-string` to exist, so this root is not yet an end-to-end
production deployment.

Before deploying production, add the missing database and secret ownership,
grant production-scoped permissions, and introduce a protected workflow with
manual approval. Production requires an immutable image tag and disables
Swagger by default.

## Prerequisites

Before deploying dev or test:

- Create the remote-state resource group, storage account, and blob container.
- Set `POSTGRESQL_ADMINISTRATOR_PASSWORD` for dev. Test generates its own
	PostgreSQL administrator password.
- Configure the GitHub Actions secrets listed below.

### Adopt the existing Azure OpenAI resources

The Azure OpenAI account and model deployment existed before Terraform began
managing them. Before the first apply containing these resource declarations,
import both resources into the dev state:

```bash
terraform -chdir=infrastructure/environments/dev import \
	azurerm_cognitive_account.openai \
	/subscriptions/<subscription-id>/resourceGroups/rg-team3-dev/providers/Microsoft.CognitiveServices/accounts/aoai-team3-chatbot-dev
terraform -chdir=infrastructure/environments/dev import \
	azurerm_cognitive_deployment.openai \
	/subscriptions/<subscription-id>/resourceGroups/rg-team3-dev/providers/Microsoft.CognitiveServices/accounts/aoai-team3-chatbot-dev/deployments/team3-chatbot-gpt5-nano
```

This is a one-time state migration. After import, Terraform recreates both
resources if they are deleted while the remote state is retained.

## GitHub configuration

The repository uses these existing Actions secrets:

| Secret | Purpose |
| --- | --- |
| `AZURE_CLIENT_ID` | Application/client ID of the deployment service principal |
| `AZURE_TENANT_ID` | Azure tenant ID |
| `AZURE_SUBSCRIPTION_ID` | Azure subscription ID |
| `DATABASE_URL` | Optional test database URL for CI; tests fall back to local SQLite when absent |
| `POSTGRESQL_ADMINISTRATOR_PASSWORD` | Dev PostgreSQL administrator password used by Terraform |
| `FRONTEND_REPOSITORY_DISPATCH_TOKEN` | Fine-grained token with Contents write permission on `team3-frontend`, used to start frontend deployment after backend succeeds |

Azure federated credentials trust pull requests and the `main` branch from this
repository, so the workflow uses short-lived OIDC tokens instead of a client
secret. The workflow contains the non-sensitive Terraform state resource names.
Grant the service principal only the roles it needs:

- `AcrPush` on the container registry.
- `Storage Blob Data Contributor` on the Terraform state storage account.
- `Contributor` on the subscription so Terraform can recreate `rg-team3-dev`
	after deletion.
- `Role Based Access Control Administrator` on the subscription, conditioned to
	allow `AcrPull`, `Key Vault Secrets User`, `Key Vault Secrets Officer`,
	`Monitoring Reader`, and `Grafana Admin` assignments.

The configuration contains no permanent import blocks, so missing resources
are recreated. Resource-group-scoped permissions alone are not sufficient for
recovery because those assignments are deleted with the resource group.

## Terraform variables

| Variable | Purpose |
| --- | --- |
| `project_name` | Short name used in Azure resource names |
| `environment` | Deployment environment: `dev`, `test`, or `prod` for the matching root |
| `location` | Azure region, currently `uksouth` for dev |
| `deployment_principal_object_id` | Object ID granted vault-scoped Secrets Officer so Terraform can write application secrets |
| `postgresql_administrator_password` | Sensitive dev PostgreSQL administrator password supplied by GitHub Actions; test generates its password |
| `postgresql_administrator_password_version` | Rotation counter for the write-only PostgreSQL password; increment when changing it |
| `application_secret_version` | Rotation counter for generated JWT and session credentials |
| `acr_name` | Existing shared ACR name |
| `acr_resource_group_name` | Resource group containing the shared ACR |
| `backend_image_tag` | Immutable commit SHA in dev, `test-<commit-sha>` in test, or an immutable SHA/release tag in prod |
| `container_revision_suffix` | Optional revision suffix; CI uses the workflow run ID |
| `enable_swagger_docs` | Exposes `/docs` and `/docs.json` when `true`; defaults to `false` |

GitHub Actions currently sets `enable_swagger_docs` to `true` for dev.

## CI/CD behaviour

Every pull request runs linting, tests, a container build, Terraform format
checks, validation, and a dev plan. Feature-branch pushes do not run CI until a
pull request is opened. A push to `main`:

1. Builds and pushes SHA-tagged and `dev-latest` images to ACR.
2. Creates the Key Vault and deployment-principal Secrets Officer assignment if
	they are missing.
3. Creates and applies a complete Terraform plan for dev using the immutable
	commit SHA image.
4. Dispatches the frontend workflow only after the backend apply succeeds.

Feature branches do not push images or deploy infrastructure automatically.

### Run a test deployment

Run the backend [CI workflow](https://github.com/kainos-birmingham-academy-2026/team3-backend/actions/workflows/ci.yml)
manually from the `main` branch and enable `deploy_test`. Running the workflow
from `main` ensures the infrastructure and workflow definitions are trusted and
current.

Choose the application refs according to what you need to verify:

| Goal | `backend_ref` | `frontend_ref` |
| --- | --- | --- |
| Validate the integrated current code | `main` | `main` |
| Test a backend feature with the current frontend | Backend feature branch, tag, or SHA | `main` |
| Test a frontend feature with the current backend | `main` | Frontend feature branch, tag, or SHA |
| Test coordinated changes | Matching backend ref | Matching frontend ref |

The inputs have these effects:

- **test_environment** selects `test1` (default), `test2`, or `test3`.
	Selecting an occupied slot updates it; there is no automatic free-slot
	allocation. Agree slot ownership with the team before deploying.
- **backend_ref** selects the backend branch, tag, or commit built and deployed
	as `test-<commit-sha>`.
- **frontend_ref** selects the frontend branch, tag, or commit passed to the
	frontend deployment.

Both references are resolved to exact commit SHAs in the first workflow job. An
unknown branch, tag, or SHA fails the run before tests, image pushes, or
Terraform changes begin.

Each slot reuses `infrastructure/environments/test` with `TF_VAR_environment`
set to the selected name. It uses `team3-backend-<slot>.tfstate` and creates
resources in `rg-team3-<slot>`. The frontend receives the same slot and resolved
commit in the dispatch payload and uses `team3-frontend-<slot>.tfstate`.
Never reuse one slot's state key with another slot's environment value.

Run the workflow from `main` for trusted workflow and Terraform configuration;
the application refs can select other branches. Dev state is unchanged.
Concurrency groups are slot-specific, allowing different slots to deploy in
parallel. Existing slots retain warm frontend dispatch; missing prerequisites
keep backend-first ordering. Image tags remain `test-<commit-sha>` and can be
reused by multiple slots without sharing their databases or application secrets.

Merge the frontend slot support before the backend workflow changes. Dispatches
without a valid numbered slot now fail validation. Avoid Test deployments
between these merges. The existing `rg-team3-test` and its state are not renamed,
migrated or deleted by this change; retire them separately when no longer needed.
Local Terraform defaults to `test1`. Reinitialise with `-reconfigure` and the
matching `team3-backend-<slot>.tfstate` key before planning if the directory was
previously initialised against legacy `test`. Do not migrate legacy state into
a numbered slot.
All slots still depend on the shared ACR, remote state storage and the OpenAI
account/model in Dev. Additional slots consume Azure quota and incur costs.

### Scheduled lifecycle

The **Test environment lifecycle** workflow accepts `start` or `stop` and a slot
dropdown for manual runs. Weekday schedules request `test1` startup at roughly
08:05 UK time and delete `test1`, `test2` and `test3` at roughly 18:05 UK
time. GMT/BST is handled by the local-time gate; GitHub schedules can be delayed.
Only `test1` starts automatically. Other slots are created on demand.

Deletion uses the selected slot's deployment lock and conservatively waits for
active or queued frontend repository-dispatch runs, including other slots.
GitHub concurrency groups are repository-scoped; this check is not a distributed
lock and does not cover every possible manually queued or rerun frontend job.
Do not trigger independent frontend deployments while teardown is running.
The dispatch token needs frontend Actions read permission for this check, in
addition to Contents write permission for repository dispatch.

Deleting a slot removes its database contents and queued notifications. The
next deployment provisions/seeds the database; it does not restore test data.
Keep the remote state and Dev OpenAI resources. Purge-protected Key Vaults are
soft-deleted and recovered by the Test provider. No slot is deleted simply by
merging the Terraform changes, but the scheduled lifecycle will delete slots
once the workflow is active on the default branch.

### Adding test slots

Adding `test4` or `test5` needs no new Terraform directories or modules. Update
these explicit lists together:

1. The backend CI `test_environment` dropdown and shell allowlist.
2. The lifecycle workflow dropdown, shell allowlist and evening `slots` array.
3. The frontend CI dispatch shell allowlist.
4. The `environment` validation list in both Test Terraform roots.

Resource names, state keys, Function targets, dispatch payloads and concurrency
groups already derive from the selected slot. Keep `test1` as the default and
morning startup slot unless the scheduling policy changes. Check Azure quotas
and global resource-name availability before provisioning more slots. Merge
frontend acceptance first, then expose the new backend dropdown choices.

## Local Terraform checks

Authenticate with Azure, export the required `TF_VAR_*` values, then run:

```bash
terraform -chdir=infrastructure/environments/dev init \
	-backend-config="resource_group_name=rg-team3-tfstate" \
	-backend-config="storage_account_name=stteam3tfstate26" \
	-backend-config="container_name=tfstate" \
	-backend-config="key=team3-backend-dev.tfstate" \
	-backend-config="use_azuread_auth=true"
terraform fmt -check -recursive infrastructure
terraform -chdir=infrastructure/environments/dev validate
terraform -chdir=infrastructure/environments/dev plan
```

Terraform outputs include resource names and IDs, the Container App Environment
domain, and the backend's internal FQDN.

Production rejects `latest` and `dev-latest`, so provide an immutable commit SHA
or release version when reviewing its current partial root:

```bash
export TF_VAR_project_name=team3
export TF_VAR_environment=prod
export TF_VAR_location=uksouth
export TF_VAR_acr_name=acraiacademy26
export TF_VAR_acr_resource_group_name=rg-ai-academy-26
export TF_VAR_backend_image_tag=<existing-tested-image-sha>
export TF_VAR_enable_swagger_docs=false

terraform -chdir=infrastructure/environments/prod init \
	-backend-config="resource_group_name=rg-team3-tfstate" \
	-backend-config="storage_account_name=stteam3tfstate26" \
	-backend-config="container_name=tfstate" \
	-backend-config="key=team3-backend-prod.tfstate" \
	-backend-config="use_azuread_auth=true"
terraform -chdir=infrastructure/environments/prod validate
terraform -chdir=infrastructure/environments/prod plan
```