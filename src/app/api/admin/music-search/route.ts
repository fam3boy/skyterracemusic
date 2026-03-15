import { NextResponse } from 'next/server';
import { XMLParser } from 'fast-xml-parser';

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const keyword = searchParams.get('keyword');
  
  if (!keyword) {
    return NextResponse.json({ error: 'Keyword is required' }, { status: 400 });
  }

  try {
    // Maniadb API (Search for songs)
    const maniadbUrl = `http://www.maniadb.com/api/search/${encodeURIComponent(keyword)}/?sr=song&display=20&key=admin@skyterracemusic.com&v=0.5`;
    
    const response = await fetch(maniadbUrl);
    if (!response.ok) throw new Error(`Maniadb search failed: ${response.status}`);

    const xmlData = await response.text();
    console.log('Maniadb Search Result (First 200 chars):', xmlData.substring(0, 200));

    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: ""
    });
    const jsonObj = parser.parse(xmlData);
    console.log('Parsed JSON Keys:', Object.keys(jsonObj));

    const items = jsonObj.rss?.channel?.item || [];
    const results = (Array.isArray(items) ? items : [items]).map((item: any) => {
      // Maniadb namespaced tags can be tricky depending on the parser
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
    console.error('Music search error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
