import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    // Get active theme
    const themeRes = await sql`
      SELECT id, title FROM monthly_themes 
      WHERE is_active = true AND deleted_at IS NULL 
      LIMIT 1
    `;
    
    if (themeRes.rows.length === 0) {
      return NextResponse.json({ theme: null, tracks: [] });
    }

    const theme = themeRes.rows[0];
    const tracksRes = await sql`
      SELECT * FROM theme_tracks 
      WHERE theme_id = ${theme.id} 
      ORDER BY order_index ASC
    `;

    return NextResponse.json({
      theme,
      tracks: tracksRes.rows
    });
  } catch (error: any) {
    console.error('Playlist GET error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const adminId = (session.user as any).id;

  try {
    const { title, artist, youtube_url } = await req.json();

    // Get active theme
    const themeRes = await sql`
      SELECT id FROM monthly_themes 
      WHERE is_active = true AND deleted_at IS NULL 
      LIMIT 1
    `;
    
    if (themeRes.rows.length === 0) {
      return NextResponse.json({ error: 'No active theme found' }, { status: 404 });
    }

    const themeId = themeRes.rows[0].id;

    // Get max order index
    const maxOrderRes = await sql`
      SELECT MAX(order_index) as max_order FROM theme_tracks WHERE theme_id = ${themeId}
    `;
    const nextOrder = (maxOrderRes.rows[0].max_order ?? -1) + 1;

    const result = await sql`
      INSERT INTO theme_tracks (theme_id, title, artist, youtube_url, order_index)
      VALUES (${themeId}, ${title}, ${artist}, ${youtube_url}, ${nextOrder})
      RETURNING id
    `;

    await logAudit('ADD_PLAYLIST_TRACK', 'theme_tracks', result.rows[0].id, { title, artist, themeId }, adminId);

    return NextResponse.json({ success: true, id: result.rows[0].id });
  } catch (error: any) {
    console.error('Playlist POST error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const adminId = (session.user as any).id;

  try {
    const { id, title, artist, youtube_url, order_index } = await req.json();

    if (order_index !== undefined) {
      await sql`UPDATE theme_tracks SET order_index = ${order_index} WHERE id = ${id}`;
    } else {
      await sql`
        UPDATE theme_tracks 
        SET title = COALESCE(${title}, title),
            artist = COALESCE(${artist}, artist),
            youtube_url = COALESCE(${youtube_url}, youtube_url),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ${id}
      `;
    }

    await logAudit('UPDATE_PLAYLIST_TRACK', 'theme_tracks', id, { title, order_index }, adminId);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Playlist PATCH error:', error);
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
    await sql`DELETE FROM theme_tracks WHERE id = ${id}`;
    await logAudit('DELETE_PLAYLIST_TRACK', 'theme_tracks', id, null, adminId);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Playlist DELETE error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
