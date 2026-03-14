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

  try {
    let result;
    if (status && status !== 'all') {
      result = await sql`
        SELECT sr.*, mt.title as theme_title 
        FROM song_requests sr
        LEFT JOIN monthly_themes mt ON sr.theme_id = mt.id
        WHERE sr.status = ${status}
        ORDER BY sr.created_at DESC
      `;
    } else {
      result = await sql`
        SELECT sr.*, mt.title as theme_title 
        FROM song_requests sr
        LEFT JOIN monthly_themes mt ON sr.theme_id = mt.id
        ORDER BY sr.created_at DESC
      `;
    }
    return NextResponse.json(result.rows);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id, status, admin_memo } = await req.json();

    if (status) {
      const approved_at = status === 'approved' ? new Date().toISOString() : null;
      await sql`
        UPDATE song_requests 
        SET status = ${status}, approved_at = ${approved_at}
        WHERE id = ${id}
      `;
      await logAudit(`Changed request status to ${status}`, 'song_requests', id);
    }

    if (admin_memo !== undefined) {
      await sql`
        UPDATE song_requests 
        SET admin_memo = ${admin_memo}
        WHERE id = ${id}
      `;
      await logAudit('Updated admin memo', 'song_requests', id, { memo: admin_memo });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

