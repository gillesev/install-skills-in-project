export type UserCreatedEvent = {
  contactEmail: string;
  contactFirstname: string;
  contactLastname: string;
  contactEntraObjectId: string;
  createdDate: string;
};

export type ProvisionExternalUserCommand = {
  externalId: string;
  email: string;
  firstName: string;
  lastName: string;
  occurredAt: string;
};

export type MessageHandlingOutcome =
  | {
      kind: "ready-for-provisioning";
      command: ProvisionExternalUserCommand;
    }
  | {
      kind: "invalid-event";
      reason: string;
    };

type InvalidEventOutcome = Extract<MessageHandlingOutcome, { kind: "invalid-event" }>;

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isInvalidEventOutcome(value: UserCreatedEvent | InvalidEventOutcome): value is InvalidEventOutcome {
  return (value as { kind?: string }).kind === "invalid-event";
}

function isIsoTimestamp(value: string): boolean {
  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) {
    return false;
  }

  return parsedDate.toISOString() === value;
}

function parseUserCreatedEvent(input: unknown): UserCreatedEvent | InvalidEventOutcome {
  if (typeof input !== "object" || input === null) {
    return { kind: "invalid-event", reason: "Event payload must be an object" };
  }

  const value = input as Record<string, unknown>;

  if (!isNonEmptyString(value.contactEmail)) {
    return { kind: "invalid-event", reason: "Missing or invalid contactEmail" };
  }

  if (!isNonEmptyString(value.contactFirstname)) {
    return { kind: "invalid-event", reason: "Missing or invalid contactFirstname" };
  }

  if (!isNonEmptyString(value.contactLastname)) {
    return { kind: "invalid-event", reason: "Missing or invalid contactLastname" };
  }

  if (!isNonEmptyString(value.contactEntraObjectId)) {
    return { kind: "invalid-event", reason: "Missing or invalid contactEntraObjectId" };
  }

  if (!isNonEmptyString(value.createdDate)) {
    return { kind: "invalid-event", reason: "Missing or invalid createdDate" };
  }

  if (!isIsoTimestamp(value.createdDate)) {
    return { kind: "invalid-event", reason: "Missing or invalid createdDate" };
  }

  return {
    contactEmail: value.contactEmail,
    contactFirstname: value.contactFirstname,
    contactLastname: value.contactLastname,
    contactEntraObjectId: value.contactEntraObjectId,
    createdDate: value.createdDate
  };
}

export function handleUserCreatedEvent(input: unknown): MessageHandlingOutcome {
  const parsed = parseUserCreatedEvent(input);
  if (isInvalidEventOutcome(parsed)) {
    return parsed;
  }

  return {
    kind: "ready-for-provisioning",
    command: {
      externalId: parsed.contactEntraObjectId,
      email: parsed.contactEmail,
      firstName: parsed.contactFirstname,
      lastName: parsed.contactLastname,
      occurredAt: parsed.createdDate
    }
  };
}