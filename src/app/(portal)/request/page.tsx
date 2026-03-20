import { sql } from '@vercel/postgres';
import RequestClient from './RequestClient';

export const dynamic = 'force-dynamic';

export default async function RequestPage() {
  // Fetch Theme
  const themeRes = await sql`
    SELECT id, title, description, background_base64 
    FROM monthly_themes 
    WHERE is_active = true 
    AND deleted_at IS NULL 
    LIMIT 1
  `;
  const initialTheme = themeRes.rows[0] || null;

  // Fetch Branding
  const brandingRes = await sql`SELECT key, value FROM system_settings WHERE key IN ('logo_mode', 'logo_base64', 'brand_text')`;
  const initialBranding = brandingRes.rows.reduce((acc: any, row) => {
    acc[row.key] = row.value;
    return acc;
  }, {});

  return <RequestClient initialTheme={initialTheme} initialBranding={initialBranding} />;
}
