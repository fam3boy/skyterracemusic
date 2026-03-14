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

  try {
    const { title, theme_month, description, tracks } = await req.json();

    // Insert theme
    const themeRes = await sql`
      INSERT INTO monthly_themes (title, theme_month, description)
      VALUES (${title}, ${theme_month}, ${description})
      RETURNING id
    `;
    const themeId = themeRes.rows[0].id;

    // Insert tracks
    if (tracks && tracks.length > 0) {
      for (let i = 0; i < tracks.length; i++) {
        const track = tracks[i];
        await sql`
          INSERT INTO theme_tracks (theme_id, title, artist, order_index)
          VALUES (${themeId}, ${track.title}, ${track.artist}, ${i})
        `;
      }
    }

    await logAudit('Created new theme', 'monthly_themes', themeId, { title, theme_month });

    return NextResponse.json({ success: true, id: themeId });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id, title, theme_month, description, tracks, is_active } = await req.json();

    if (is_active !== undefined) {
      if (is_active) {
        // Deactivate others
        await sql`UPDATE monthly_themes SET is_active = false WHERE id != ${id}`;
      }
      await sql`UPDATE monthly_themes SET is_active = ${is_active} WHERE id = ${id}`;
      await logAudit(`Set theme active status to ${is_active}`, 'monthly_themes', id);
    }

    if (title || theme_month || description !== undefined) {
      await sql`
        UPDATE monthly_themes 
        SET title = COALESCE(${title}, title), 
            theme_month = COALESCE(${theme_month}, theme_month),
            description = COALESCE(${description}, description)
        WHERE id = ${id}
      `;
      await logAudit('Updated theme details', 'monthly_themes', id, { title, theme_month });
    }

    if (tracks) {
      // Sync tracks: simplest is delete and re-insert
      await sql`DELETE FROM theme_tracks WHERE theme_id = ${id}`;
      for (let i = 0; i < tracks.length; i++) {
        const track = tracks[i];
        await sql`
          INSERT INTO theme_tracks (theme_id, title, artist, order_index)
          VALUES (${id}, ${track.title}, ${track.artist}, ${i})
        `;
      }
      await logAudit('Synchronized theme tracks', 'monthly_themes', id, { trackCount: tracks.length });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

