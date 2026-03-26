import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { logAudit } from '@/lib/audit';
import bcrypt from 'bcryptjs';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { rows } = await sql`SELECT id, email, nickname, role, created_at FROM admins ORDER BY created_at DESC`;
    return NextResponse.json(rows);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const actingAdminId = (session.user as any).id;

  try {
    const { email, password, nickname, role } = await req.json();
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const result = await sql`
      INSERT INTO admins (email, password_hash, nickname, role)
      VALUES (${email}, ${hashedPassword}, ${nickname}, ${role || 'admin'})
      RETURNING id, email, nickname, role
    `;
    
    await logAudit('CREATE_ADMIN', 'admins', result.rows[0].id, { email, nickname, role }, actingAdminId);
    
    return NextResponse.json(result.rows[0]);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const actingAdminId = (session.user as any).id;

  try {
    const { id, password, email, nickname } = await req.json();
    
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      await sql`UPDATE admins SET password_hash = ${hashedPassword} WHERE id = ${id}`;
      await logAudit('CHANGE_ADMIN_PASSWORD', 'admins', id, {}, actingAdminId);
    }

    if (email !== undefined || nickname !== undefined) {
      await sql`
        UPDATE admins 
        SET email = COALESCE(${email}, email), 
            nickname = COALESCE(${nickname}, nickname) 
        WHERE id = ${id}
      `;
      await logAudit('UPDATE_ADMIN_INFO', 'admins', id, { email, nickname }, actingAdminId);
    }
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const actingAdminId = (session.user as any).id;
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });
  if (id === actingAdminId) return NextResponse.json({ error: 'Cannot delete yourself' }, { status: 400 });

  try {
    await sql`DELETE FROM admins WHERE id = ${id}`;
    await logAudit('DELETE_ADMIN', 'admins', id, {}, actingAdminId);
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
