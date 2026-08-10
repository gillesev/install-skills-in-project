# Accept the welcome email race condition for PingOne provisioning

When an External User is provisioned in Entra ID, the Identity Service sends a welcome email and publishes a User-Created Event simultaneously. The ExternalUserProvisioningWorker consumes that event and provisions the user in PingOne asynchronously. Since Entra ID trusts PingOne as the external IdP, a user who clicks the welcome email link before PingOne provisioning completes will fail to authenticate.

We accept this race condition. The window is expected to be small (Service Bus delivery and PingOne API call complete in seconds), and closing it would require either blocking the welcome email until PingOne confirms — which requires modifying the Identity Service (not possible) — or introducing a synchronous provisioning path that bypasses the existing event-driven architecture.

## Consequences

- A narrow window exists after welcome email delivery where an External User cannot log in. This is a known, accepted risk.
- If PingOne provisioning fails and exhausts all retries, the External User will be unable to authenticate until the dead-lettered message is replayed and provisioning succeeds. Ops must monitor the dead-letter queue.
