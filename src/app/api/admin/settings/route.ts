import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type'); // 'patterns' or 'templates'

  try {
    if (type === 'templates') {
      const result = await sql`SELECT * FROM admin_templates ORDER BY created_at DESC`;
      return NextResponse.json(result.rows);
    } else {
      const result = await sql`SELECT * FROM banned_patterns ORDER BY created_at DESC`;
      return NextResponse.json(result.rows);
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const adminId = (session.user as any).id;

  try {
    const { type, pattern, templateType, title, content } = await req.json();

    if (pattern) {
      // Create Banned Pattern
      const res = await sql`
        INSERT INTO banned_patterns (type, pattern, admin_id)
        VALUES (${type}, ${pattern}, ${adminId})
        RETURNING id
      `;
      await logAudit('CREATE_PATTERN', 'banned_patterns', res.rows[0].id, { type, pattern }, adminId);
      return NextResponse.json({ success: true, id: res.rows[0].id });
    } else if (title && content) {
      // Create Admin Template
      const res = await sql`
        INSERT INTO admin_templates (type, title, content, admin_id)
        VALUES (${templateType}, ${title}, ${content}, ${adminId})
        RETURNING id
      `;
      await logAudit('CREATE_TEMPLATE', 'admin_templates', res.rows[0].id, { title }, adminId);
      return NextResponse.json({ success: true, id: res.rows[0].id });
    }

    return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const adminId = (session.user as any).id;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  const table = searchParams.get('table'); // 'banned_patterns' or 'admin_templates'

  if (!id || !table) return NextResponse.json({ error: 'ID and table required' }, { status: 400 });

  try {
    if (table === 'banned_patterns') {
      await sql`DELETE FROM banned_patterns WHERE id = ${id}`;
      await logAudit('DELETE_PATTERN', table, id, null, adminId);
    } else {
      await sql`DELETE FROM admin_templates WHERE id = ${id}`;
      await logAudit('DELETE_TEMPLATE', table, id, null, adminId);
    }
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
