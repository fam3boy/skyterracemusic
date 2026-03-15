import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { rows } = await sql`SELECT * FROM mail_recipients ORDER BY created_at DESC`;
    return NextResponse.json(rows);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const adminId = (session.user as any).id;

  try {
    const { email, role, send_day } = await req.json();
    const result = await sql`
      INSERT INTO mail_recipients (email, role, send_day)
      VALUES (${email}, ${role}, ${send_day})
      RETURNING *
    `;
    
    await logAudit('CREATE_MAIL_RECIPIENT', 'mail_recipients', result.rows[0].id, { email, role, send_day }, adminId);
    
    return NextResponse.json(result.rows[0]);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const adminId = (session.user as any).id;

  try {
    const { id, is_active } = await req.json();
    await sql`UPDATE mail_recipients SET is_active = ${is_active} WHERE id = ${id}`;
    
    await logAudit('TOGGLE_MAIL_RECIPIENT', 'mail_recipients', id, { is_active }, adminId);
    
    return NextResponse.json({ success: true });
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

  if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

  try {
    await sql`DELETE FROM mail_recipients WHERE id = ${id}`;
    await logAudit('DELETE_MAIL_RECIPIENT', 'mail_recipients', id, {}, adminId);
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
