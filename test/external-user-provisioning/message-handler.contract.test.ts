import { describe, expect, it } from "vitest";
import { handleUserCreatedEvent } from "../../src/external-user-provisioning/message-handler.js";

describe("handleUserCreatedEvent", () => {
  it("returns a ready-for-provisioning outcome for a valid User-Created Event", () => {
    const outcome = handleUserCreatedEvent({
      contactEmail: "ada@example.com",
      contactFirstname: "Ada",
      contactLastname: "Lovelace",
      contactEntraObjectId: "entra-123",
      createdDate: "2026-08-16T10:00:00.000Z"
    });

    expect(outcome).toEqual({
      kind: "ready-for-provisioning",
      command: {
        externalId: "entra-123",
        email: "ada@example.com",
        firstName: "Ada",
        lastName: "Lovelace",
        occurredAt: "2026-08-16T10:00:00.000Z"
      }
    });
  });

  it("returns invalid-event when a required field is missing", () => {
    const outcome = handleUserCreatedEvent({
      contactEmail: "ada@example.com",
      contactFirstname: "Ada",
      contactLastname: "Lovelace",
      createdDate: "2026-08-16T10:00:00.000Z"
    });

    expect(outcome).toEqual({
      kind: "invalid-event",
      reason: "Missing or invalid contactEntraObjectId"
    });
  });

  it("returns invalid-event when createdDate is not an ISO timestamp", () => {
    const outcome = handleUserCreatedEvent({
      contactEmail: "ada@example.com",
      contactFirstname: "Ada",
      contactLastname: "Lovelace",
      contactEntraObjectId: "entra-123",
      createdDate: "not-a-date"
    });

    expect(outcome).toEqual({
      kind: "invalid-event",
      reason: "Missing or invalid createdDate"
    });
  });

  it("returns invalid-event when payload is not an object", () => {
    const outcome = handleUserCreatedEvent("not-an-object");

    expect(outcome).toEqual({
      kind: "invalid-event",
      reason: "Event payload must be an object"
    });
  });

  it("returns invalid-event for non-ISO but parseable date strings", () => {
    const outcome = handleUserCreatedEvent({
      contactEmail: "ada@example.com",
      contactFirstname: "Ada",
      contactLastname: "Lovelace",
      contactEntraObjectId: "entra-123",
      createdDate: "2026-08-16"
    });

    expect(outcome).toEqual({
      kind: "invalid-event",
      reason: "Missing or invalid createdDate"
    });
  });
});