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

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s absolute limit

  // 1. Define Search Tasks
  const maniadbTask = async () => {
    try {
      const maniadbUrl = `http://www.maniadb.com/api/search/${encodeURIComponent(keyword.trim())}?sr=song&display=25&key=example&v=0.5`;
      
      // Secondary controller for just Maniadb to fail fast
      const mController = new AbortController();
      const mTimeout = setTimeout(() => mController.abort(), 3000); 

      const response = await fetch(maniadbUrl, { 
        signal: mController.signal,
        headers: { 
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });
      clearTimeout(mTimeout);
      if (!response.ok) return [];
      const xmlData = await response.text();
      const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "" });
      const jsonObj = parser.parse(xmlData);
      const items = jsonObj.rss?.channel?.item || [];
      return (Array.isArray(items) ? items : [items]).map((item: any) => {
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
    } catch (e) {
      console.error('Maniadb failed:', e);
      return [];
    }
  };

  const itunesTask = async () => {
    try {
      const itunesUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(keyword.trim())}&country=kr&media=music&entity=song&limit=25`;
      const response = await fetch(itunesUrl, { 
        signal: controller.signal,
        headers: { 'User-Agent': 'Mozilla/5.0' } 
      });
      if (!response.ok) return [];
      const data = await response.json();
      return (data.results || []).map((item: any) => ({
        title: item.trackName,
        artist: item.artistName,
        album: item.collectionName,
        image: item.artworkUrl100?.replace('100x100bb', '400x400bb') || '',
        source: 'itunes'
      }));
    } catch (e) {
      console.error('iTunes failed:', e);
      return [];
    }
  };

  // 2. Execute Parallely
  try {
    const [maniadbRes, itunesRes] = await Promise.allSettled([maniadbTask(), itunesTask()]);
    
    if (itunesRes.status === 'fulfilled') addToResults(itunesRes.value);
    if (maniadbRes.status === 'fulfilled') addToResults(maniadbRes.value);

    clearTimeout(timeoutId);
  } catch (err) {
    console.error('Parallel search error:', err);
  }

  return NextResponse.json(results);
}
