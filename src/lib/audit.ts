import { query } from "./db";

export async function logAudit(
  action: string,
  targetTable: string,
  targetId: string,
  details: any = null,
  adminId: string = 'system'
) {
  try {
    await query(
      `INSERT INTO audit_logs (admin_id, action, target_table, target_id, details)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        adminId === 'system' ? null : adminId, 
        action, 
        targetTable, 
        targetId, 
        details ? JSON.stringify(details) : null
      ]
    );
  } catch (error) {
    console.error("Failed to record audit log:", error);
  }
}
