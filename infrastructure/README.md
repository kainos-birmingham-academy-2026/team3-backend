# Infrastructure

Terraform deploys the backend's Azure resources. Environment roots live under
`environments/` and reuse modules from `modules/`; add a separate `prod` root
rather than sharing state with `dev`.

## GitHub configuration

The repository uses these existing Actions secrets:

| Secret | Purpose |
| --- | --- |
| `AZURE_CLIENT_ID` | Application/client ID of the deployment service principal |
| `AZURE_CLIENT_SECRET` | Password used by the deployment service principal |
| `AZURE_TENANT_ID` | Azure tenant ID |
| `AZURE_SUBSCRIPTION_ID` | Azure subscription ID |
| `ACR_NAME` | ACR resource name, without `.azurecr.io` |

The workflow contains the non-sensitive Terraform state resource names. Grant
the service principal only the roles it needs:

- `AcrPush` on the container registry.
- `Storage Blob Data Contributor` on the Terraform state storage account.
- `Contributor` on the subscription or resource group Terraform manages.

The remote-state resource group, storage account, and container must already
exist before the workflow's first run.