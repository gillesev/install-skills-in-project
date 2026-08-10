# Ops Team Alerting for Service Bus Dead-Letter Queue

## Status

Proposed

## Context

The ExternalUserProvisioningWorker consumes the User-Created Event from Azure Service Bus and provisions External Users in PingOne. The worker is stateless, relies on Service Bus built-in redelivery, and dead-letters messages after 10 failed attempts. Ops must monitor the dead-letter queue because a dead-lettered message can block successful PingOne authentication until the message is replayed and processed.

This repo also accepts the welcome email race condition: a user may receive the welcome email before PingOne provisioning completes, so the operational focus is on detecting and clearing dead-lettered provisioning failures quickly.

## Decision

Use Azure Monitor alerts over the Service Bus dead-letter queue, scoped to the queue or subscription that carries the User-Created Event for ExternalUserProvisioningWorker.

The primary alert should be a metric alert on dead-letter message count greater than zero for a short evaluation window. Route the alert to an Ops Action Group.

Add a secondary log-based alert if richer triage data is needed, such as dead-letter reason, subreason, and message identifiers.

## Consequences

- Ops receives a direct alert when the dead-letter queue is non-empty.
- The alert is on the messaging boundary, not the worker, which matches the stateless design.
- A dead-lettered message requires manual replay after the underlying issue is resolved.
- If diagnostic logs are enabled, Ops can include dead-letter reason details in the notification and speed up triage.
- For topic-based messaging, the alert must target the subscription dead-letter queue, not only the topic namespace.

## Recommended Configuration

- Scope: Service Bus queue or topic subscription used by the ExternalUserProvisioningWorker
- Signal: dead-letter message count
- Threshold: greater than zero
- Evaluation frequency: 1 to 5 minutes
- Lookback window: 5 to 10 minutes
- Severity: Sev 2 in production
- Action Group: Ops email, Teams, PagerDuty, ServiceNow, or equivalent

## Operational Guidance

- Production: page Ops immediately when DLQ depth is above zero.
- Non-production: send notification only, no paging.
- If DLQ depth remains non-zero for an extended period, escalate to incident handling.
- Use the dead-letter queue as the manual replay point after root cause is fixed.