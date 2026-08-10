# External User Provisioning — Grilling Session

**Date:** 2026-08-08
**Brief:** product/briefs/external-user-provisioning-brief.md
**Outputs:** CONTEXT.md, docs/adr/0001-standalone-worker-for-pingone-provisioning.md, docs/adr/0002-accept-welcome-email-race-condition.md

---

## Q1 — Canonical term for the person being provisioned

The brief uses "external user", "client user", and "customer user" interchangeably.

**Decision:** **External User** — draws the clearest boundary against internal/employee identities.

## Q2 — What is a "Tax Account"?

**Decision:** A Tax Account is an application-level record scoped to a single tax year. It is not a new identity. The External User identity (Entra ID + PingOne) persists across years; only the Tax Account is created/renewed each season.

Additional clarification: the same Identity Service endpoint handles both net-new user provisioning and roll-overs. The consumer does not need to distinguish the two at the identity layer.

## Q3 — What happens in PingOne on a roll-over?

**Decision:** Nothing. Only net-new External Users trigger a PingOne create. On a roll-over the PingOne profile already exists and must not be modified.

## Q4 — Does a roll-over publish a User-Created Event to Service Bus?

**Decision:** Yes — unfortunately. Both net-new provisioning and roll-overs publish to the same user-created topic. The message schema does not distinguish the two cases. The consumer must therefore be idempotent.

## Q5 — How should the consumer detect that a PingOne user already exists?

**Decision:** Use `contactEntraObjectId` as the lookup key, mapped to PingOne's `externalId` field. Email is mutable and therefore unreliable as a stable key.

Additional clarifications:
- PingOne `username` = original `contactEmail` at creation (immutable).
- If email changes later, PingOne `email` is updated but `username` stays the same.
- An existing PingOne profile found via `externalId` is treated as a no-op (roll-over case silently skipped).

## Q6 — The welcome email race condition

Entra ID provisioning → welcome email sent + User-Created Event published simultaneously → ExternalUserProvisioningWorker provisions PingOne asynchronously. A user who clicks the email before PingOne provisioning completes will fail to authenticate.

**Decision:** Race condition is accepted as low risk. The processing window is seconds. Closing it would require modifying the Identity Service (not possible). Risk documented in ADR-0002.

## Q7 — Failure and retry strategy

**Decision:** Rely on Azure Service Bus built-in redelivery with exponential back-off. Dead-letter after 10 failed attempts. Ops must monitor the dead-letter queue depth for manual replay. No custom retry worker.

## Q8 — Name of the new component

**Decision:** **ExternalUserProvisioningWorker** — a stateless Service Bus consumer (not an API, not a service).

## Q9 — Canonical term for the consuming applications

**Decision:** **Tax Exchange Application** — domain-specific, avoids the generic "financial LOB application".

## Q10 — Does the ExternalUserProvisioningWorker need persistence?

**Decision:** No. The worker is stateless. Idempotency is handled live via the PingOne `externalId` lookup. Observability is provided by Azure Application Insights.
