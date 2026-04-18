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
  const q = searchParams.get('q');
  const start = searchParams.get('start');
  const end = searchParams.get('end');
  const grouped = searchParams.get('grouped') === 'true';

  try {
    // 1. Fetch Banned Patterns for matching - Handle missing table
    let bannedPatterns: any[] = [];
    try {
      const bannedRes = await sql`SELECT type, pattern FROM banned_patterns`;
      bannedPatterns = bannedRes.rows;
    } catch (e) {
      console.warn('Banned patterns fetch failed (table might be missing):', e);
    }

    let query = `
      SELECT r.*, t.title as theme_title,
      (SELECT COUNT(*)::int FROM song_requests r2 WHERE r2.id != r.id AND (r2.title = r.title AND r2.artist = r.artist OR r2.youtube_url = r.youtube_url)) as duplicate_count
      FROM song_requests r
      LEFT JOIN monthly_themes t ON r.theme_id = t.id
      WHERE r.deleted_at IS NULL
    `;
    const values: any[] = [];

    if (status && status !== 'all') {
      values.push(status);
      query += ` AND r.status = $${values.length}`;
    }

    if (q) {
      values.push(`%${q}%`);
      query += ` AND (r.title ILIKE $${values.length} OR r.artist ILIKE $${values.length} OR r.requester_name ILIKE $${values.length})`;
    }

    if (start) {
      values.push(start);
      query += ` AND r.created_at >= $${values.length}`;
    }
    if (end) {
      values.push(`${end} 23:59:59`);
      query += ` AND r.created_at <= $${values.length}`;
    }

    query += ` ORDER BY r.created_at DESC`;

    // Use sql.query or the tag-like query approach correctly
    const result = await sql.query(query, values);
    let rows = result.rows;

    // 2. Apply Recommendation Logic
    rows = rows.map(row => {
      let rec = 'REVIEW';
      let reason = 'Normal request';

      // Check Banned
      const matchedBanned = bannedPatterns.find(p => {
        const title = (row.title || '').toLowerCase();
        const artist = (row.artist || '').toLowerCase();
        const story = (row.story || '').toLowerCase();
        const youtubeUrl = (row.youtube_url || '').toLowerCase();
        const pattern = (p.pattern || '').toLowerCase();

        if (p.type === 'WORD' && (title.includes(pattern) || artist.includes(pattern) || story.includes(pattern))) return true;
        if (p.type === 'ARTIST' && artist === pattern) return true;
        if (p.type === 'LINK' && youtubeUrl.includes(pattern)) return true;
        return false;
      });

      if (matchedBanned) {
        rec = 'REJECT';
        reason = `Banned pattern matched: ${matchedBanned.pattern}`;
      } else if (row.duplicate_count > 0) {
        rec = 'REVIEW_CAUTION';
        reason = `Duplicate requests detected (${row.duplicate_count})`;
      } else if (row.youtube_url && row.youtube_url.includes('youtube.com/watch?v=')) {
        rec = 'APPROVE';
        reason = 'Valid link and no conflicts';
      }

      return { ...row, auto_recommendation: rec, auto_reason: reason };
    });

    // 3. Handle Grouping - Add Null Safety
    if (grouped) {
      const groups: Record<string, any[]> = {};
      rows.forEach(row => {
        const title = (row.title || 'Untitled').toLowerCase();
        const artist = (row.artist || 'Unknown').toLowerCase();
        const key = `${title}|${artist}`;
        if (!groups[key]) groups[key] = [];
        groups[key].push(row);
      });
      return NextResponse.json(Object.values(groups).map(group => ({
        ...group[0],
        group_items: group,
        group_count: group.length
      })));
    }

    return NextResponse.json(rows);
  } catch (error: any) {
    console.error('Requests GET error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const adminId = (session.user as any).id;

  try {
    const { id, status, admin_memo, title, artist, image, clear_contact } = await req.json();

    if (clear_contact) {
      await sql`UPDATE song_requests SET requester_contact = NULL WHERE id = ${id}`;
      await logAudit('CLEAR_CONTACT', 'song_requests', id, {}, adminId);
      return NextResponse.json({ success: true, message: 'Contact cleared' });
    }

    // 1. Fetch current state
    const currentRes = await sql`SELECT status, approved_at FROM song_requests WHERE id = ${id}`;
    if (currentRes.rowCount === 0) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }
    const current = currentRes.rows[0];

    // 2. Handle Status Change with Rules
    if (status && status !== current.status) {
      const approved_at = (status === 'approved' && !current.approved_at) 
                          ? new Date().toISOString() 
                          : current.approved_at;
                          
      const deleted_at = (status === 'deleted') ? new Date().toISOString() : null;
      
      await sql`
        UPDATE song_requests 
        SET status = ${status}, 
            approved_at = ${approved_at ?? null},
            deleted_at = ${deleted_at ?? null}
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

    // 3. Handle Admin Memo and Music Info
    if (admin_memo !== undefined || title !== undefined || artist !== undefined || image !== undefined) {
      await sql`
        UPDATE song_requests 
        SET 
          admin_memo = COALESCE(${admin_memo ?? null}, admin_memo),
          title = COALESCE(${title ?? null}, title),
          artist = COALESCE(${artist ?? null}, artist),
          image = COALESCE(${image ?? null}, image),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ${id}
      `;
      
      await logAudit('UPDATE_REQUEST_INFO', 'song_requests', id, { title, artist, image, memo: admin_memo }, adminId);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Request PATCH error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

