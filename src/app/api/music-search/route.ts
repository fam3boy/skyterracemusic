import { NextResponse } from 'next/server';
import { XMLParser } from 'fast-xml-parser';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const keyword = searchParams.get('keyword');
  
  if (!keyword) {
    return NextResponse.json({ error: 'Keyword is required' }, { status: 400 });
  }

  const results: any[] = [];
  const seenIds = new Set<string>();

  const addToResults = (items: any[]) => {
    items.forEach(item => {
      const id = `${item.title}-${item.artist}`.toLowerCase().replace(/\s+/g, '');
      if (!seenIds.has(id)) {
        seenIds.add(id);
        results.push(item);
      }
    });
  };

  // 1. Try Maniadb (10s timeout)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const maniadbUrl = `http://www.maniadb.com/api/search/${encodeURIComponent(keyword.trim())}?sr=song&display=20&key=example&v=0.5`;
    
    console.log('Fetching Maniadb:', maniadbUrl);

    const response = await fetch(maniadbUrl, { 
      signal: controller.signal,
      headers: { 
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    
    clearTimeout(timeoutId);

    if (response.ok) {
      const xmlData = await response.text();
      const parser = new XMLParser({
        ignoreAttributes: false,
        attributeNamePrefix: ""
      });
      const jsonObj = parser.parse(xmlData);
      const items = jsonObj.rss?.channel?.item || [];
      const maniadbResults = (Array.isArray(items) ? items : [items]).map((item: any) => {
        const title = (item.title || '').replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1').replace(/<[^>]*>?/gm, '');
        const artistObj = item['maniadb:artist'] || item.author || {};
        const artist = typeof artistObj === 'string' ? artistObj : (artistObj.name || 'Unknown Artist');
        const albumObj = item['maniadb:album'] || {};
        
        return {
          title: title || 'Unknown Title',
          artist: artist,
          album: albumObj.title || '',
          image: albumObj.image || '',
          source: 'maniadb'
        };
      });
      addToResults(maniadbResults);
    }
  } catch (error) {
    console.error('Maniadb attempt failed:', error);
  }

  // 2. Fallback to iTunes (Always run if results are low, or if Maniadb failed)
  if (results.length < 10) {
    try {
      const itunesUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(keyword.trim())}&country=kr&media=music&entity=song&limit=20`;
      console.log('Fetching iTunes Fallback:', itunesUrl);
      
      const response = await fetch(itunesUrl, {
         headers: { 'User-Agent': 'Mozilla/5.0' }
      });

      if (response.ok) {
        const data = await response.json();
        const itunesResults = (data.results || []).map((item: any) => ({
          title: item.trackName,
          artist: item.artistName,
          album: item.collectionName,
          image: item.artworkUrl100?.replace('100x100bb', '400x400bb') || '',
          source: 'itunes'
        }));
        addToResults(itunesResults);
      }
    } catch (error) {
      console.error('iTunes attempt failed:', error);
    }
  }

  return NextResponse.json(results);
}
