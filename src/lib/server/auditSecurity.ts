import { User } from "@/lib/store/types";
import { logAudit } from "./db";

export interface LogAdminActionParams {
  actor: User;
  action: string;
  orderId?: string;
  reference?: string;
  fromStatus?: string;
  toStatus?: string;
  note?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Sanitizes and securely records administrative actions into the audit log
 */
export async function logAdminAction({
  actor,
  action,
  orderId,
  reference,
  fromStatus,
  toStatus,
  note,
  metadata = {},
}: LogAdminActionParams): Promise<void> {
  const sanitizedMeta: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(metadata)) {
    if (/password|token|secret|cvv|card/i.test(key)) {
      sanitizedMeta[key] = "[REDACTED]";
    } else {
      sanitizedMeta[key] = value;
    }
  }

  logAudit({
    action,
    orderId,
    reference,
    fromStatus,
    toStatus,
    actorName: actor.name || actor.email,
    actorRole: actor.role,
    note: note ? note.slice(0, 500) : undefined,
    metadata: sanitizedMeta,
  });
}
