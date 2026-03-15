import { NextResponse } from 'next/server';
import { XMLParser } from 'fast-xml-parser';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const keyword = searchParams.get('keyword');
  
  if (!keyword) {
    return NextResponse.json({ error: 'Keyword is required' }, { status: 400 });
  }

  try {
    // Maniadb API (Search for songs)
    const maniadbUrl = `http://www.maniadb.com/api/search/${encodeURIComponent(keyword)}/?sr=song&display=20&key=admin@skyterracemusic.com&v=0.5`;
    
    const response = await fetch(maniadbUrl);
    if (!response.ok) throw new Error('Maniadb search failed');

    const xmlData = await response.text();
    const parser = new XMLParser();
    const jsonObj = parser.parse(xmlData);

    const items = jsonObj.rss?.channel?.item || [];
    const results = (Array.isArray(items) ? items : [items]).map((item: any) => ({
      title: item.title?.replace(/<[^>]*>?/gm, '') || 'Unknown Title',
      artist: item['maniadb:artist']?.name || item.author || 'Unknown Artist',
      album: item['maniadb:album']?.title || '',
      image: item['maniadb:album']?.image || ''
    }));

    return NextResponse.json(results);
  } catch (error: any) {
    console.error('Music search error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
