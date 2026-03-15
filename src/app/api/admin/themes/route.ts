import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const themeId = searchParams.get('id');

  try {
    if (themeId) {
      const themeRes = await sql`SELECT * FROM monthly_themes WHERE id = ${themeId} LIMIT 1`;
      const tracksRes = await sql`SELECT * FROM theme_tracks WHERE theme_id = ${themeId} ORDER BY order_index`;
      return NextResponse.json({
        theme: themeRes.rows[0],
        tracks: tracksRes.rows
      });
    }

    const result = await sql`SELECT * FROM monthly_themes ORDER BY theme_month DESC`;
    return NextResponse.json(result.rows);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const adminId = (session.user as any).id;

  try {
    const { title, theme_month, description, start_date, end_date, tracks, is_active, background_base64 } = await req.json();

    // 1. One Active Theme Check
    if (is_active) {
       await sql`UPDATE monthly_themes SET is_active = false WHERE is_active = true`;
    }

    // 2. Insert theme
    const themeRes = await sql`
      INSERT INTO monthly_themes (title, theme_month, description, start_date, end_date, is_active, background_base64)
      VALUES (${title}, ${theme_month}, ${description}, ${start_date}, ${end_date}, ${!!is_active}, ${background_base64 || ''})
      RETURNING id
    `;
    const themeId = themeRes.rows[0].id;

    // 3. Insert tracks
    if (tracks && Array.isArray(tracks)) {
      for (let i = 0; i < tracks.length; i++) {
        const track = tracks[i];
        await sql`
          INSERT INTO theme_tracks (theme_id, title, artist, youtube_url, order_index)
          VALUES (${themeId}, ${track.title}, ${track.artist}, ${track.youtube_url}, ${i})
        `;
      }
    }

    await logAudit('CREATE_THEME', 'monthly_themes', themeId, { title, theme_month, is_active }, adminId);

    return NextResponse.json({ success: true, id: themeId });
  } catch (error: any) {
    console.error('Theme POST error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const adminId = (session.user as any).id;

  try {
    const { id, title, theme_month, description, start_date, end_date, tracks, is_active, background_base64 } = await req.json();

    if (is_active !== undefined) {
      if (is_active === true) {
        // Enforce only one active
        await sql`UPDATE monthly_themes SET is_active = false WHERE id != ${id}`;
      }
      await sql`UPDATE monthly_themes SET is_active = ${is_active} WHERE id = ${id}`;
      await logAudit(`SET_ACTIVE: ${is_active}`, 'monthly_themes', id, null, adminId);
    }

    if (title || theme_month || description !== undefined || start_date || end_date || background_base64 !== undefined) {
      await sql`
        UPDATE monthly_themes 
        SET title = COALESCE(${title}, title), 
            theme_month = COALESCE(${theme_month}, theme_month),
            description = COALESCE(${description}, description),
            start_date = COALESCE(${start_date}, start_date),
            end_date = COALESCE(${end_date}, end_date),
            background_base64 = COALESCE(${background_base64}, background_base64),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ${id}
      `;
      await logAudit('UPDATE_THEME', 'monthly_themes', id, { title }, adminId);
    }

    if (tracks && Array.isArray(tracks)) {
      await sql`DELETE FROM theme_tracks WHERE theme_id = ${id}`;
      for (let i = 0; i < tracks.length; i++) {
        const track = tracks[i];
        await sql`
          INSERT INTO theme_tracks (theme_id, title, artist, youtube_url, order_index)
          VALUES (${id}, ${track.title}, ${track.artist}, ${track.youtube_url}, ${i})
        `;
      }
      await logAudit('SYNC_TRACKS', 'monthly_themes', id, { count: tracks.length }, adminId);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Theme PATCH error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const adminId = (session.user as any).id;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

  try {
    // Soft delete
    await sql`UPDATE monthly_themes SET deleted_at = CURRENT_TIMESTAMP, is_active = false WHERE id = ${id}`;
    await logAudit('DELETE_THEME', 'monthly_themes', id, null, adminId);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Theme DELETE error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

