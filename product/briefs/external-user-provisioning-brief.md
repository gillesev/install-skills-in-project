# External User Provisioning In PingOne

## Problem Statement

All financial LOB application (called Tax Exchange applications) do provision new external/customer users or require existing external/customer users to be rolled over to their next tax accounts (generated/renewed every tax season on a yearly basis).

The Enterprise Identity Provider and Authorization System is Azure Entra ID and all external users are provisioned as Entra ID users along with their respecitive memberships. The service responsible for this is called the Identity Service that all financial LOB applications call its POST /requests endpoint to provision/roll-over an external/client user.

As PingOne has been introduced as the next external Identity Provider for external/client users, users need to be provisioned in both Entra ID AND PingOne.

Entra ID remains the Authorization System but trusts PingOne as an external Identity Provider (SAML, domainless) for external/client users.

## Constraints

- The Identity Service relies on an old workflow technology called Camunda and the service cannot easily be modified or enhanced (and there is no desire to do so).
- Note that the Identity Service publishes events in a user-created Azure Service Bus topic when the user has been provisioned successfully in Entra ID.
- When a user gets created in Entra ID, a welcome email will be sent and the expectation is that the user should be able to log to any financial LOB application upon receiving the email.

## Main Goal

The external/client users need to be provisioned in PingOne as near real-time as possible when a user is created in Entra ID.

## Technologies

- user-created events are Azure Service Bus topic events,
- NodeJS 22/Typescript v5 APIs or workers hosted in Azure Kubernetes Service (AKS),
- The NodeJS azure sdk is the preferred framework,
- Any persistency need would most likely using Azure SQL Server databases or Azure Account blob service
- Leverage the PingOne REST API to create a user's basic profile in PingOne.

## Message Schema

The user-created event message contains the following fields:
- contactEmail
- contactFirstname
- contactLastname
- contactEntraObjectId
- createdDate

