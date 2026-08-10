# Standalone worker for PingOne provisioning instead of modifying the Identity Service

The Identity Service is the existing system that provisions External Users in Entra ID. It is built on Camunda and cannot be meaningfully modified or extended. Rather than attempting to add PingOne provisioning inside it, we introduce a separate ExternalUserProvisioningWorker that consumes the User-Created Events already published by the Identity Service to Azure Service Bus.

## Considered Options

- **Modify the Identity Service** — rejected. The Camunda-based workflow is brittle and there is explicit organisational intent not to change it. Any modification would carry high risk and no team ownership.
- **Synchronous call from Tax Exchange Applications** — rejected. Applications should not own identity provisioning; it would scatter the responsibility and create coupling between each application and PingOne.
- **Standalone Service Bus consumer (chosen)** — the Identity Service already publishes User-Created Events. A dedicated worker can consume those events without touching the Identity Service, with no coupling beyond the event schema.

## Consequences

- The ExternalUserProvisioningWorker must be idempotent: User-Created Events are published for both net-new External Users and roll-overs, and the schema does not distinguish the two cases. The worker resolves this by looking up the PingOne `externalId` (mapped from `contactEntraObjectId`) before attempting a create, treating an existing profile as a no-op.
- Failed provisioning attempts are retried via Service Bus's built-in redelivery. Messages are dead-lettered after 10 attempts and require manual replay.
