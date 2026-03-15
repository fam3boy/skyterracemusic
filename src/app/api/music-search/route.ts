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
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    // Maniadb API (Search for songs) - Definitive URL & Key
    const maniadbUrl = `http://www.maniadb.com/api/search/${encodeURIComponent(keyword.trim())}?sr=song&display=25&key=example&v=0.5`;
    
    console.log('Fetching Maniadb:', maniadbUrl);

    const response = await fetch(maniadbUrl, { 
      signal: controller.signal,
      headers: { 
        'Accept': 'application/xml',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
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
      return NextResponse.json({ error: '음악 데이터베이스(Maniadb) 응답이 너무 늦습니다. 다시 한 번 검색 버튼을 눌러주세요. (Timeout: 30s)' }, { status: 504 });
    }
    return NextResponse.json({ error: '데이터 불러오기에 실패했습니다. 잠시 후 다시 시도해 주세요.' }, { status: 500 });
  }
}
