# External User Provisioning

Covers the provisioning of external users into PingOne when they are created in Entra ID, triggered by user-created events published by the Identity Service.

## Language

**External User**:
A non-employee user of a Tax Exchange Application, provisioned in both Entra ID (for authorization) and PingOne (for authentication).
_Avoid_: client user, customer user

**Tax Account**:
An application-level record scoped to a single tax year, associated with an External User. A new Tax Account is created each tax season; the underlying External User identity persists unchanged.
_Avoid_: account, tax record

**Roll-over**:
The annual process of associating an existing External User with new Tax Accounts for the upcoming tax season. A roll-over publishes a User-Created Event but requires no action in PingOne — the External User's profile already exists there.
_Avoid_: renewal, migration

**Tax Exchange Application**:
A financial application that External Users authenticate into to manage their tax accounts. Entra ID provides authorization; PingOne provides authentication for External Users.
_Avoid_: financial LOB application, LOB app

**Identity Service**:
The internal service (built on Camunda) responsible for provisioning External Users in Entra ID and associating them with Tax Accounts. It cannot be modified. It publishes a User-Created Event to Azure Service Bus upon successful Entra ID provisioning.

**User-Created Event**:
The Azure Service Bus message published by the Identity Service after an External User is successfully provisioned in Entra ID. Published for both net-new External Users and roll-overs. The schema does not indicate which case applies.

**ExternalUserProvisioningWorker**:
The stateless Azure Service Bus consumer responsible for provisioning net-new External Users in PingOne. It looks up the user by `externalId` (mapped from `contactEntraObjectId`) before attempting a create, making it idempotent. Roll-overs are silently skipped when the PingOne profile already exists.
_Avoid_: provisioning service, PingOne worker
