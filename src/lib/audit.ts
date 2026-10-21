import { prisma } from "@/lib/db";

interface LogInput {
  userId?: string | null;
  action: string;
  entity?: string;
  entityId?: string;
  meta?: Record<string, unknown>;
  ip?: string;
}

export async function logActivity(input: LogInput): Promise<void> {
  try {
    await prisma.activityLog.create({
      data: {
        userId: input.userId ?? null,
        action: input.action,
        entity: input.entity,
        entityId: input.entityId,
        meta: (input.meta as object) ?? undefined,
        ip: input.ip,
      },
    });
  } catch (err) {
    console.error("[audit] failed to write log", err);
  }
}