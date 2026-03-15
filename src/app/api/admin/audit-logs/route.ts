import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const result = await sql`
      SELECT al.*, a.nickname as admin_name
      FROM audit_logs al
      LEFT JOIN admins a ON al.admin_id = a.id
      ORDER BY al.created_at DESC
      LIMIT 10
    `;
    return NextResponse.json(result.rows);
  } catch (error: any) {
    console.error('Audit logs fetch error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
