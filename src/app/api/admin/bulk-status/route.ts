import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const adminId = (session.user as any).id;

  try {
    const { ids, status, admin_memo } = await req.json();

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'IDs array required' }, { status: 400 });
    }

    const approved_at = status === 'approved' ? new Date().toISOString() : null;
    const deleted_at = status === 'deleted' ? new Date().toISOString() : null;

    // We process individually to ensure approved_at is only set if not already set,
    // and to log audits properly. For high performance, we could use a single query,
    // but individual audits are required.
    
    for (const id of ids) {
      const currentRes = await sql`SELECT status, approved_at FROM song_requests WHERE id = ${id}`;
      if (currentRes.rowCount === 0) continue;
      const current = currentRes.rows[0];

      if (status !== current.status) {
        const finalApprovedAt = (status === 'approved' && !current.approved_at) 
                                ? approved_at 
                                : current.approved_at;

        await sql`
          UPDATE song_requests 
          SET status = ${status}, 
              approved_at = ${finalApprovedAt},
              deleted_at = ${status === 'deleted' ? deleted_at : null},
              admin_memo = COALESCE(${admin_memo !== undefined ? admin_memo : null}, admin_memo)
          WHERE id = ${id}
        `;
        
        await logAudit(
          `BULK_STATUS_CHANGE: ${current.status} -> ${status}`,
          'song_requests',
          id,
          { bulk: true, from: current.status, to: status },
          adminId
        );
      }
    }

    return NextResponse.json({ success: true, count: ids.length });
  } catch (error: any) {
    console.error('Bulk Status error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
