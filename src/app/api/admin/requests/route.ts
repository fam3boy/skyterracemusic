import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  const search = searchParams.get('q');
  const startDate = searchParams.get('start');
  const endDate = searchParams.get('end');

  try {
    let queryStr = `
      SELECT sr.*, mt.title as theme_title,
             (SELECT COUNT(*) FROM song_requests d 
              WHERE d.title = sr.title AND d.artist = sr.artist 
              AND d.id != sr.id AND d.theme_id = sr.theme_id 
              AND d.status != 'deleted') as duplicate_count
      FROM song_requests sr
      LEFT JOIN monthly_themes mt ON sr.theme_id = mt.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (status && status !== 'all') {
      params.push(status);
      queryStr += ` AND sr.status = $${params.length}`;
      if (status === 'deleted') {
         queryStr += ` AND sr.deleted_at IS NOT NULL`;
      } else {
         queryStr += ` AND sr.deleted_at IS NULL`;
      }
    } else {
      // For 'all', exclude soft-deleted items unless 'all' includes them.
      // Usually 'all' in a CMS means 'all active'. Let's exclude deleted from 'all'.
      queryStr += ` AND sr.deleted_at IS NULL`;
    }

    if (search) {
      params.push(`%${search}%`);
      queryStr += ` AND (sr.title ILIKE $${params.length} OR sr.artist ILIKE $${params.length} OR sr.requester_name ILIKE $${params.length})`;
    }

    if (startDate) {
      params.push(startDate);
      queryStr += ` AND sr.created_at >= $${params.length}`;
    }

    if (endDate) {
      params.push(endDate);
      queryStr += ` AND sr.created_at <= $${params.length}`;
    }

    queryStr += ` ORDER BY sr.created_at DESC`;

    const result = await sql.query(queryStr, params);
    return NextResponse.json(result.rows);
  } catch (error: any) {
    console.error('Requests fetch error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const adminId = (session.user as any).id;

  try {
    const { id, status, admin_memo } = await req.json();

    // 1. Fetch current state
    const currentRes = await sql`SELECT status, approved_at FROM song_requests WHERE id = ${id}`;
    if (currentRes.rowCount === 0) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }
    const current = currentRes.rows[0];

    // 2. Handle Status Change with Rules
    if (status && status !== current.status) {
      // Logic:
      // - approved -> hold (Allow: administrator might want to re-eval)
      // - approved -> deleted (Allow: soft delete)
      // - pending/hold/deleted -> approved (Allow: standard approval)
      
      const approved_at = (status === 'approved' && !current.approved_at) 
                          ? new Date().toISOString() 
                          : current.approved_at;
                          
      const deleted_at = (status === 'deleted') ? new Date().toISOString() : null;
      
      await sql`
        UPDATE song_requests 
        SET status = ${status}, 
            approved_at = ${approved_at},
            deleted_at = ${deleted_at}
        WHERE id = ${id}
      `;
      
      await logAudit(
        `STATUS_CHANGE: ${current.status} -> ${status}`, 
        'song_requests', 
        id, 
        { from: current.status, to: status },
        adminId
      );
    }

    // 3. Handle Admin Memo
    if (admin_memo !== undefined && admin_memo !== current.admin_memo) {
      await sql`
        UPDATE song_requests 
        SET admin_memo = ${admin_memo}
        WHERE id = ${id}
      `;
      await logAudit('UPDATE_MEMO', 'song_requests', id, { memo: admin_memo }, adminId);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Request PATCH error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

