import { db, auditLogsTable } from "@workspace/db";
import { Request } from "express";

export async function logAudit(
  req: Request,
  action: string,
  resource: string,
  resourceId?: string | number,
  details?: string,
) {
  try {
    await db.insert(auditLogsTable).values({
      userId: req.user?.id ?? null,
      action,
      resource,
      resourceId: resourceId != null ? String(resourceId) : null,
      details: details ?? null,
      ipAddress: req.ip ?? null,
    });
  } catch {
    // audit logging should never crash the request
  }
}
