# Production provisioning status

Production provisioning, data transfer, deployment and R1 cutover are complete. Do not recreate resources or reimport catalog data. See [release closeout](R1_Release_Closeout.md) and [deployment evidence](evidence/Production_Deployment_20261016.json).

- Worker: cookie-catalog-prod; release branch release/r1-production.
- D1: cookie-catalog-prod, 9428a5b4-4675-4f45-9ec8-aba243848e27.
- Private R2: cookie-catalog-prod-private; owner verified public development URL disabled and no custom domains.
- Access: Cookie Catalog Production; existing user permissions preserved. OWNER_EMAIL/CATALOG_MEMBERS are runtime secrets managed privately.
- Active production URL: https://cookie-catalog-prod.j-brickey.workers.dev/ . Development remains isolated.

[Historical provisioning evidence](Production_Provisioning_Status_History.md) contains earlier steps and approvals; it must not be used to repeat completed setup. Paid changes remain outside authorization. Backup stall root cause remains CC-TODO-019, separate from provisioning success.
