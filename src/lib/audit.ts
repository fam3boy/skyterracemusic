import { query } from './db';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function logAudit(action: string, table: string, id: string, details?: any) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return;

  const adminId = (session.user as any).id;

  await query(
    `INSERT INTO audit_logs (admin_id, action, target_table, target_id, details)
     VALUES ($1, $2, $3, $4, $5)`,
    [adminId, action, table, id, JSON.stringify(details)]
  );
}

