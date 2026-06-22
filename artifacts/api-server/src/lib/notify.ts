import { db, notificationsTable } from "@workspace/db";

export async function createNotification(
  userId: number,
  title: string,
  message: string,
  type: "consultation" | "queue" | "prescription" | "lab_result" | "counseling" | "system" = "system",
) {
  try {
    await db.insert(notificationsTable).values({ userId, title, message, type });
  } catch {
    // notification errors should not crash the request
  }
}
