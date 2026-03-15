import { NextResponse } from 'next/server';
import { XMLParser } from 'fast-xml-parser';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const keyword = searchParams.get('keyword');
  
  if (!keyword) {
    return NextResponse.json({ error: 'Keyword is required' }, { status: 400 });
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout

    // Maniadb API (Search for songs)
    const maniadbUrl = `http://www.maniadb.com/api/search/${encodeURIComponent(keyword)}/?sr=song&display=20&key=admin@skyterracemusic.com&v=0.5`;
    
    console.log('Maniadb Search URL:', maniadbUrl);

    const response = await fetch(maniadbUrl, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (!response.ok) throw new Error(`Maniadb search failed: ${response.status}`);

    const xmlData = await response.text();

    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: ""
    });
    const jsonObj = parser.parse(xmlData);

    const items = jsonObj.rss?.channel?.item || [];
    const results = (Array.isArray(items) ? items : [items]).map((item: any) => {
      const title = (item.title || '').replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1').replace(/<[^>]*>?/gm, '');
      const artistObj = item['maniadb:artist'] || item.author || {};
      const artist = typeof artistObj === 'string' ? artistObj : (artistObj.name || 'Unknown Artist');
      const albumObj = item['maniadb:album'] || {};
      
      return {
        title: title || 'Unknown Title',
        artist: artist,
        album: albumObj.title || '',
        image: albumObj.image || ''
      };
    });

    return NextResponse.json(results);
  } catch (error: any) {
    console.error('Public music search error:', error);
    if (error.name === 'AbortError') {
      return NextResponse.json({ error: '검색 시간이 초과되었습니다. 다시 시도해 주세요.' }, { status: 504 });
    }
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
