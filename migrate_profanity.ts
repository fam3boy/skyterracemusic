import { createPool } from '@vercel/postgres';
import * as fs from 'fs';
import * as path from 'path';

// Manually load .env.local for local execution
if (!process.env.POSTGRES_URL) {
  const envPath = path.join(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        let value = match[2].trim();
        if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
        if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
        process.env[key] = value;
      }
    });
  }
}

const PROFANITY_DB = [
  'ㅅㅂ', '시발', '씨발', '개새끼', '존나', '병신', '미친', '지랄', '염병', '새끼',
  'fuck', 'shit', 'bitch', 'asshole', 'cunt', 'dick', 'pussy',
  '한남', '김치녀', '된장녀', '맘충', '틀딱', '일베', '메갈', '이기야', '노무노무',
  '조센징', '짱깨', '쪽발이',
  '좌파', '우파', '빨갱이', '친일파', '문재인', '윤석열', '이재명', '김대중', '노무현', '박정희', '전두환',
  '신천지', '개독', '예수쟁이', '알라'
];

async function migrate() {
  console.log("POSTGRES_URL is:", process.env.POSTGRES_URL ? "Set" : "Not Set");
  const pool = createPool({
    connectionString: process.env.POSTGRES_URL
  });

  try {
    console.log('Starting migration...');
    for (const word of PROFANITY_DB) {
      await pool.query(`
        INSERT INTO banned_patterns (type, pattern)
        VALUES ('WORD', $1)
      `, [word]);
    }
    console.log(`Successfully migrated ${PROFANITY_DB.length} patterns.`);
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await pool.end();
  }
}

migrate();
