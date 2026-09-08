/**
 * Content ingestion for The Nile Explorer.
 *
 *   node scripts/ingest.mjs
 *
 * Pulls from the two sources that expose real APIs and writes normalised JSON
 * into content/. Re-runnable; overwrites its own output only.
 *
 *   nilexplorer.net   WordPress REST API (public, no auth)  -> articles
 *   YouTube           channel RSS feed (public, no API key) -> episodes
 *
 * Instagram is deliberately absent: it has no open feed API, and the agreed
 * approach is editor-pasted embeds rather than automated import.
 */

import { writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';

const WP = 'https://nilexplorer.net/wp-json/wp/v2';
const YT_CHANNEL = 'UCcfZzC9x7rKBpp2b96885cw';
const OUT = join(process.cwd(), 'content');

/**
 * Which YouTube uploads are actually podcast episodes.
 *
 * The channel carries more than the podcast: live-stream tests, a special,
 * and two re-uploaded PLO Lumumba speeches. Only listed videos are treated as
 * episodes; everything else becomes Television. This is an editorial call, not
 * something derivable from the feed, so it is an explicit list. Add the video
 * id here when a new episode is published.
 */
const PODCAST_VIDEO_IDS = new Set([
  'p3lHlWR-O3g' // Episode 1 — Peace, War and the Search for a Political Solution
]);

/**
 * Audio distribution. Spotify is the only provider so far; the show is not yet
 * on Apple Podcasts (checked against the iTunes search API, no match).
 *
 * `rssFeed` is intentionally null. Once the show has an origin RSS feed, put it
 * here and ingestAudio() below will drive episode audio from the feed instead
 * of the hardcoded show id, which is what makes the provider swappable. See
 * README for where to find that URL.
 */
const AUDIO = {
  rssFeed: null,
  spotifyShowId: '1viond2HBFAncP9IYGOSd3'
};

const get = async (url) => {
  const res = await fetch(url, { headers: { 'user-agent': 'nile-explorer-ingest' } });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${url}`);
  return res;
};

const ENTITIES = {
  '&#8217;': '’', '&#8216;': '‘', '&#8220;': '“', '&#8221;': '”',
  '&#8211;': '–', '&#8212;': '—', '&#8230;': '…', '&#039;': "'",
  '&#39;': "'", '&quot;': '"', '&amp;': '&', '&nbsp;': ' ', '&lt;': '<', '&gt;': '>'
};

const decode = (s = '') =>
  s.replace(/&#\d+;|&[a-z]+;/gi, (m) => ENTITIES[m] ?? m).replace(/\s+/g, ' ').trim();

const stripTags = (html = '') => decode(html.replace(/<[^>]+>/g, ' '));

/** WordPress content is a flat run of <p>/<h*> with inline markup we do not want. */
function toBlocks(html = '') {
  const blocks = [];
  const re = /<(h[1-6]|p|blockquote|ul|ol)\b[^>]*>([\s\S]*?)<\/\1>/gi;
  let m;
  while ((m = re.exec(html))) {
    const tag = m[1].toLowerCase();
    if (tag === 'ul' || tag === 'ol') {
      const items = [...m[2].matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/gi)]
        .map((li) => stripTags(li[1]))
        .filter(Boolean);
      if (items.length) blocks.push({ type: 'list', ordered: tag === 'ol', items });
      continue;
    }
    const text = stripTags(m[2]);
    if (!text || text.length < 2) continue;
    if (tag === 'blockquote') blocks.push({ type: 'quote', text });
    else if (tag === 'p') blocks.push({ type: 'para', text });
    else blocks.push({ type: 'heading', level: Number(tag[1]), text });
  }
  return blocks;
}

/** First real sentence(s) up to ~180 chars, for card blurbs and meta descriptions. */
function summarise(blocks, limit = 180) {
  const first = blocks.find((b) => b.type === 'para' && b.text.length > 80);
  if (!first) return '';
  const text = first.text;
  if (text.length <= limit) return text;
  const cut = text.slice(0, limit);
  const stop = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf('? '), cut.lastIndexOf('! '));
  return stop > 90 ? cut.slice(0, stop + 1) : cut.replace(/\s+\S*$/, '') + '…';
}

const slugify = (s) =>
  s
    .toLowerCase()
    .replace(/[’'"]/g, '')
    .replace(/[^\w\s-]/g, ' ')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80)
    .replace(/-$/, '');

/**
 * Some posts carry a bare post-id as their WordPress slug (/?p=9). Those make
 * ugly, meaningless URLs, so derive one from the title instead.
 */
const slugFor = (post, title) =>
  !post.slug || /^\d+$/.test(post.slug) ? slugify(title) : post.slug;

const readingTime = (blocks) => {
  const words = blocks.reduce(
    (n, b) => n + (b.items ? b.items.join(' ') : b.text).split(/\s+/).length,
    0
  );
  return Math.max(1, Math.round(words / 220));
};

async function ingestArticles() {
  const cats = await (await get(`${WP}/categories?per_page=100&_fields=id,name,slug,count`)).json();
  const byId = Object.fromEntries(cats.map((c) => [c.id, c]));

  const posts = await (
    await get(`${WP}/posts?per_page=100&_fields=id,date,modified,slug,title,content,categories,featured_media`)
  ).json();

  // Featured images, resolved in one call rather than per-post.
  const mediaIds = [...new Set(posts.map((p) => p.featured_media).filter(Boolean))];
  let media = {};
  if (mediaIds.length) {
    const list = await (
      await get(`${WP}/media?include=${mediaIds.join(',')}&per_page=100&_fields=id,source_url,alt_text,media_details`)
    ).json();
    media = Object.fromEntries(
      list.map((m) => [
        m.id,
        {
          url: m.source_url,
          alt: decode(m.alt_text) || '',
          width: m.media_details?.width ?? null,
          height: m.media_details?.height ?? null
        }
      ])
    );
  }

  const articles = posts
    .map((p) => {
      const blocks = toBlocks(p.content.rendered);
      const cat = byId[p.categories?.[0]];
      const title = decode(p.title.rendered);
      return {
        id: p.id,
        slug: slugFor(p, title),
        title,
        date: p.date,
        modified: p.modified,
        category: cat ? { name: cat.name, slug: cat.slug } : { name: 'General', slug: 'general' },
        author: 'Dr. Aldo Ajou Deng-Akuey',
        image: media[p.featured_media] ?? null,
        blocks,
        summary: summarise(blocks),
        readingTime: readingTime(blocks),
        source: `https://nilexplorer.net/?p=${p.id}`
      };
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const categories = cats
    .map((c) => ({
      name: c.name,
      slug: c.slug,
      count: articles.filter((a) => a.category.slug === c.slug).length
    }))
    .filter((c) => c.count > 0)
    .sort((a, b) => b.count - a.count);

  return { articles, categories };
}

async function ingestEpisodes() {
  const xml = await (
    await get(`https://www.youtube.com/feeds/videos.xml?channel_id=${YT_CHANNEL}`)
  ).text();

  const entries = [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)].map((m) => m[1]);
  const pick = (block, tag) => {
    const m = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`));
    return m ? decode(m[1]) : '';
  };

  // YouTube only generates maxresdefault for HD uploads; older videos 404.
  // Resolve the best thumbnail that actually exists, once, at ingest time.
  const bestThumb = async (id) => {
    for (const name of ['maxresdefault', 'sddefault', 'hqdefault']) {
      const url = `https://i.ytimg.com/vi/${id}/${name}.jpg`;
      try {
        const res = await fetch(url, { method: 'HEAD' });
        if (res.ok) return url;
      } catch {
        /* try the next size */
      }
    }
    return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
  };

  return await Promise.all(entries.map(async (e, i) => {
    const id = pick(e, 'yt:videoId');
    const description = pick(e, 'media:description');
    return {
      kind: PODCAST_VIDEO_IDS.has(id) ? 'podcast' : 'television',
      videoId: id,
      slug: pick(e, 'title')
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .slice(0, 70),
      title: pick(e, 'title'),
      published: pick(e, 'published'),
      description,
      summary: description ? description.split('\n')[0].slice(0, 200) : '',
      thumbnail: await bestThumb(id),
      url: `https://www.youtube.com/watch?v=${id}`,
      embed: `https://www.youtube-nocookie.com/embed/${id}?rel=0`,
      number: entries.length - i
    };
  }));
}

async function main() {
  await mkdir(OUT, { recursive: true });

  const [{ articles, categories }, videos] = await Promise.all([
    ingestArticles(),
    ingestEpisodes()
  ]);

  // The channel mixes the podcast with everything else. Split them, and number
  // each strand from 1 within itself rather than across the whole upload feed.
  const number = (list) =>
    list
      .sort((a, b) => new Date(a.published) - new Date(b.published))
      .map((v, i) => ({ ...v, number: i + 1 }))
      .sort((a, b) => new Date(b.published) - new Date(a.published));

  const episodes = number(videos.filter((v) => v.kind === 'podcast'));
  const television = number(videos.filter((v) => v.kind === 'television'));

  const podcast = {
    title: 'The Nile Explorer Podcast',
    // Audio and video are two renderings of the same episode; the player lets
    // the reader choose. Spotify has no public API for the origin feed, so the
    // show embed stands in until an RSS URL is supplied.
    rssFeed: AUDIO.rssFeed,
    spotify: {
      showId: AUDIO.spotifyShowId,
      url: `https://open.spotify.com/show/${AUDIO.spotifyShowId}`,
      embed: `https://open.spotify.com/embed/show/${AUDIO.spotifyShowId}?theme=0`
    },
    episodes
  };

  const write = (name, data) =>
    writeFile(join(OUT, name), JSON.stringify(data, null, 2) + String.fromCharCode(10), 'utf8');

  await Promise.all([
    write('articles.json', articles),
    write('categories.json', categories),
    write('podcast.json', podcast),
    write('television.json', television),
    write('ingest-meta.json', {
      ingestedAt: new Date().toISOString(),
      sources: {
        wordpress: { endpoint: WP, articles: articles.length },
        youtube: {
          channel: YT_CHANNEL,
          podcastEpisodes: episodes.length,
          televisionVideos: television.length
        },
        audio: {
          provider: AUDIO.rssFeed ? 'rss' : 'spotify-embed',
          rssFeed: AUDIO.rssFeed,
          note: AUDIO.rssFeed
            ? 'Episode audio driven by the origin RSS feed.'
            : 'No RSS feed supplied; falling back to the Spotify show embed.'
        },
        instagram: { status: 'manual-embed', note: 'No open feed API; editors paste post URLs.' }
      }
    })
  ]);

  console.log(`articles     ${articles.length}`);
  console.log(`categories   ${categories.map((c) => `${c.name}(${c.count})`).join(' ')}`);
  console.log(`episodes     ${episodes.length}  ${episodes.map((e) => '#' + e.number).join(' ')}`);
  console.log(`television   ${television.length}`);
  console.log(`audio        ${AUDIO.rssFeed ? 'RSS: ' + AUDIO.rssFeed : 'Spotify embed (no RSS feed supplied)'}`);
  const missing = articles.filter((a) => !a.image).length;
  if (missing) console.log(`note: ${missing} article(s) without a featured image`);
}

main().catch((err) => {
  console.error('ingest failed:', err.message);
  process.exit(1);
});
