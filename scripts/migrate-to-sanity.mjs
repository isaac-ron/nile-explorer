/**
 * One-off migration into Sanity.
 *
 * Run once, against an empty dataset:
 *
 *   NEXT_PUBLIC_SANITY_PROJECT_ID=... NEXT_PUBLIC_SANITY_DATASET=production \
 *   SANITY_API_WRITE_TOKEN=... node scripts/migrate-to-sanity.mjs
 *
 * Safe to re-run: every document has a deterministic id, so a second run
 * overwrites rather than duplicating. Add --dry to see what it would do.
 *
 * ---------------------------------------------------------------------------
 * Three decisions worth knowing before you touch this
 * ---------------------------------------------------------------------------
 *
 * 1. Articles are re-parsed from the WordPress REST API, NOT from
 *    content/articles.json.
 *
 *    Measured, the difference is smaller than you might expect: the old regex
 *    parser came within 3 leaf blocks and 73 characters of the original across
 *    all eleven pieces, so block structure and text survived it nearly intact.
 *    What it did destroy is inline markup — 6 bold and 11 italic spans — which
 *    it flattened with `stripTags`. There are no hyperlinks in the archive, so
 *    none were lost.
 *
 *    Re-parsing is still right: the source HTML is free to fetch, it is the
 *    actual original, and it restores the emphasis. But the reason is "recover
 *    17 spans of emphasis and start from the real source", not "rescue the
 *    archive from catastrophic loss".
 *
 * 2. Images are downloaded and uploaded into Sanity, not referenced. Every
 *    article image currently hot-links to nilexplorer.net/wp-content/, and
 *    that domain is about to point at this site instead of at WordPress. Skip
 *    this step and every article image 404s the day the DNS changes.
 *
 * 3. Placeholder content is imported as DRAFTS carrying `placeholder: true`,
 *    which the schema treats as a validation error. They are visible and
 *    editable in the Studio and cannot be published until someone replaces
 *    the invented content and unticks the box.
 */

import { createClient } from '@sanity/client';
import { htmlToBlocks } from '@portabletext/block-tools';
import { Schema } from '@sanity/schema';
import { JSDOM } from 'jsdom';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';

const WP = 'https://nilexplorer.net/wp-json/wp/v2';
const ROOT = process.cwd();
const CONTENT = join(ROOT, 'content');
const PUBLIC = join(ROOT, 'public');
const DRY = process.argv.includes('--dry');

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production';
const token = process.env.SANITY_API_WRITE_TOKEN;

if (!projectId || (!token && !DRY)) {
  console.error(
    'Missing configuration.\n' +
      '  NEXT_PUBLIC_SANITY_PROJECT_ID  the project id, from sanity.io/manage\n' +
      '  NEXT_PUBLIC_SANITY_DATASET     usually "production"\n' +
      '  SANITY_API_WRITE_TOKEN         an Editor token, from the project API settings\n\n' +
      'Add --dry to rehearse without writing anything.'
  );
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  token,
  apiVersion: '2025-02-19',
  useCdn: false
});

/* -------------------------------------------------------------------------
   Plumbing
------------------------------------------------------------------------- */

const get = async (url) => {
  const res = await fetch(url, { headers: { 'user-agent': 'nile-explorer-migration' } });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${url}`);
  return res;
};

const readJson = async (name) => JSON.parse(await readFile(join(CONTENT, name), 'utf8'));

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

const ENTITIES = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#039;': "'",
  '&#8217;': '’',
  '&#8216;': '‘',
  '&#8220;': '“',
  '&#8221;': '”',
  '&#8211;': '–',
  '&#8212;': '—',
  '&hellip;': '…',
  '&nbsp;': ' '
};
const decode = (s = '') =>
  s.replace(/&#\d+;|&[a-z]+;/gi, (m) => ENTITIES[m] ?? m).replace(/\s+/g, ' ').trim();

/** Deduplicated asset uploads: the same URL or file is only sent once. */
const assetCache = new Map();

async function uploadImage(source, filename) {
  if (DRY) return { _type: 'reference', _ref: `image-DRY-${filename}` };
  if (assetCache.has(source)) return assetCache.get(source);

  const body = source.startsWith('http')
    ? Buffer.from(await (await get(source)).arrayBuffer())
    : await readFile(source);

  const asset = await client.assets.upload('image', body, { filename });
  const ref = { _type: 'reference', _ref: asset._id };
  assetCache.set(source, ref);
  console.log(`    uploaded ${filename} (${(body.length / 1024).toFixed(0)} KB)`);
  return ref;
}

/** A `figure` value. `alt` is left empty where the source had none — see below. */
const figure = (assetRef, alt = '', credit) => ({
  _type: 'figure',
  asset: assetRef,
  alt,
  ...(credit ? { credit } : {})
});

/* -------------------------------------------------------------------------
   HTML -> Portable Text
   -------------------------------------------------------------------------
   The block-tools schema must match sanity/schemaTypes/objects/blockContent.ts
   exactly, or content silently fails to map: a style that is not declared is
   dropped rather than flagged.
------------------------------------------------------------------------- */

const blockContentSchema = Schema.compile({
  name: 'nile',
  types: [
    {
      name: 'blockContent',
      type: 'array',
      of: [
        {
          type: 'block',
          styles: [
            { title: 'Paragraph', value: 'normal' },
            { title: 'Heading', value: 'h2' },
            { title: 'Sub-heading', value: 'h3' },
            { title: 'Pull quote', value: 'blockquote' }
          ],
          lists: [
            { title: 'Bulleted', value: 'bullet' },
            { title: 'Numbered', value: 'number' }
          ],
          marks: {
            decorators: [
              { title: 'Bold', value: 'strong' },
              { title: 'Italic', value: 'em' }
            ],
            annotations: [
              {
                name: 'link',
                type: 'object',
                fields: [{ name: 'href', type: 'url' }]
              }
            ]
          }
        }
      ]
    }
  ]
})
  .get('blockContent');

function toPortableText(html) {
  return htmlToBlocks(html ?? '', blockContentSchema, {
    parseHtml: (h) => new JSDOM(h).window.document,
    rules: [
      {
        // WordPress writes h1..h6; the site renders only two levels, so
        // anything deeper is folded into the lower of them rather than lost.
        deserialize(el, next, block) {
          if (!/^h[1-6]$/i.test(el.tagName ?? '')) return undefined;
          const level = Number(el.tagName[1]);
          return block({
            _type: 'block',
            style: level <= 2 ? 'h2' : 'h3',
            markDefs: [],
            children: next(el.childNodes)
          });
        }
      }
    ]
  }).map((b) => ({ ...b, _key: b._key ?? randomUUID().slice(0, 12) }));
}

/** Portable Text from plain paragraphs, for prose lifted out of .tsx files. */
const paragraphs = (...texts) =>
  texts.filter(Boolean).map((text) => ({
    _type: 'block',
    _key: randomUUID().slice(0, 12),
    style: 'normal',
    markDefs: [],
    children: [{ _type: 'span', _key: randomUUID().slice(0, 12), text, marks: [] }]
  }));

const quoteBlock = (text) => ({
  _type: 'block',
  _key: randomUUID().slice(0, 12),
  style: 'blockquote',
  markDefs: [],
  children: [{ _type: 'span', _key: randomUUID().slice(0, 12), text, marks: [] }]
});

const keyed = (items) => items.map((i) => ({ ...i, _key: randomUUID().slice(0, 12) }));

/* -------------------------------------------------------------------------
   Writing
------------------------------------------------------------------------- */

const docs = [];
const stage = (doc) => {
  docs.push(doc);
  return { _type: 'reference', _ref: doc._id.replace(/^drafts\./, '') };
};

async function commit() {
  console.log(`\n${DRY ? 'Would write' : 'Writing'} ${docs.length} documents…`);
  if (DRY) {
    for (const d of docs) console.log(`  ${d._id.padEnd(48)} ${d._type}`);
    return;
  }
  // Batched: one transaction per 50 keeps each request well inside limits
  // while still being atomic enough that a failure is easy to reason about.
  for (let i = 0; i < docs.length; i += 50) {
    const tx = client.transaction();
    for (const d of docs.slice(i, i + 50)) tx.createOrReplace(d);
    await tx.commit();
    console.log(`  committed ${Math.min(i + 50, docs.length)}/${docs.length}`);
  }
}

/* -------------------------------------------------------------------------
   The migration
------------------------------------------------------------------------- */

async function main() {
  console.log(`Migrating into ${projectId}/${dataset}${DRY ? ' (dry run)' : ''}\n`);

  /* --- The patron ------------------------------------------------------ */
  console.log('Patron…');
  const portrait = await uploadImage(join(PUBLIC, 'brand', 'patron.jpg'), 'patron.jpg');

  const patronRef = stage({
    _id: 'author-aldo-ajou-deng-akuey',
    _type: 'author',
    name: 'Dr. Aldo Ajou Deng-Akuey',
    role: 'Patron & contributing author',
    isPatron: true,
    portrait: figure(
      portrait,
      'Dr. Aldo Ajou Deng-Akuey, patron of The Nile Explorer, seated at a podcast microphone.',
      'Photograph by Daniel Athian'
    ),
    colophon:
      'Dr. Aldo Ajou Deng-Akuey writes on peace, governance and regional geopolitics.',
    bio: [
      ...paragraphs(
        'Dr. Aldo Ajou Deng-Akuey has spent more than five decades at the centre of this story, not as an observer but as a participant. From Sudan’s parliament to South Sudan’s Council of States, he has been present in the rooms where peace was negotiated, where constitutions were debated, and where the architecture of a new nation was drawn in real time.',
        'He is a believer in the independence and self-determination of African states: in Africa’s right to govern itself, to own its resources, to trade on its own terms, and to build institutions that answer to African citizens rather than external creditors. He stands with the government of South Sudan in its commitment to the peace process and the constitutional path forward, out of the conviction that stability and legitimate governance are the preconditions for everything else: economic justice, youth opportunity, and national unity.'
      ),
      quoteBlock(
        'The path forward cannot be the burden of the government alone, nor of political parties alone. It is a collective responsibility of all South Sudanese; leaders, opposition, communities, religious groups, women, youth, and civil society. We must shift from blame to responsibility, from suspicion to trust, from division to unity.'
      ),
      ...paragraphs(
        'He is the patron of The Nile Explorer, bringing to it his credibility, his relationships and his institutional memory. The platform, though, is not about one man. It is about a continent: built for the people, owned by the people, speaking to and for the people.'
      )
    ]
  });

  /* --- Topics ---------------------------------------------------------- */
  console.log('Topics…');
  const categories = await (
    await get(`${WP}/categories?per_page=100&_fields=id,name,slug,count`)
  ).json();

  // Categories that describe the section rather than the subject. They carry
  // no information once every piece is Opinion, so they do not become topics.
  const NOT_A_TOPIC = new Set(['opinion', 'general', 'uncategorised', 'uncategorized']);

  const topicRefs = new Map();
  for (const c of categories) {
    if (NOT_A_TOPIC.has(c.slug) || c.count === 0) continue;
    topicRefs.set(
      c.id,
      stage({
        _id: `topic-${c.slug}`,
        _type: 'topic',
        name: decode(c.name),
        slug: { _type: 'slug', current: c.slug }
      })
    );
  }
  console.log(`  ${topicRefs.size} topics`);

  /* --- Articles -------------------------------------------------------- */
  console.log('Articles…');
  // date_gmt, not date: WordPress `date` is site-local with no offset, so a
  // piece published near midnight renders a day out depending on where the
  // build runs. The GMT field is a real instant.
  const posts = await (
    await get(
      `${WP}/posts?per_page=100&_fields=id,date_gmt,slug,title,excerpt,content,categories,featured_media`
    )
  ).json();

  const mediaIds = [...new Set(posts.map((p) => p.featured_media).filter(Boolean))];
  const media = mediaIds.length
    ? await (
        await get(
          `${WP}/media?include=${mediaIds.join(',')}&per_page=100&_fields=id,source_url,alt_text`
        )
      ).json()
    : [];
  const mediaById = new Map(media.map((m) => [m.id, m]));

  const seenSlugs = new Set();
  let missingAlt = 0;

  for (const p of posts) {
    const title = decode(p.title?.rendered ?? '');
    // Some posts carry a bare post id as their slug (/?p=9). Those make
    // meaningless URLs, so derive one from the title instead.
    let slug = !p.slug || /^\d+$/.test(p.slug) ? slugify(title) : p.slug;
    if (seenSlugs.has(slug)) {
      // The old ingest had no uniqueness check; two posts colliding would have
      // meant one silently unreachable. Fail loudly instead.
      throw new Error(`Duplicate slug "${slug}" — give post ${p.id} a distinct slug in WordPress.`);
    }
    seenSlugs.add(slug);

    const body = toPortableText(p.content?.rendered);

    let image;
    const m = mediaById.get(p.featured_media);
    if (m?.source_url) {
      const filename = m.source_url.split('/').pop();
      const alt = decode(m.alt_text ?? '');
      if (!alt) missingAlt += 1;
      image = figure(await uploadImage(m.source_url, filename), alt);
    }

    const cat = p.categories?.map((id) => categories.find((c) => c.id === id)).find(Boolean);

    stage({
      _id: `article-${p.id}`,
      _type: 'article',
      state: 'published',
      title,
      slug: { _type: 'slug', current: slug },
      // WordPress excerpts here are auto-generated from the body, so the first
      // substantial paragraph is a better standfirst than the excerpt field.
      standfirst: standfirstFrom(p, body),
      author: patronRef,
      publishedAt: new Date(`${p.date_gmt}Z`).toISOString(),
      section: 'Opinion',
      ...(cat && topicRefs.has(cat.id) ? { topic: topicRefs.get(cat.id) } : {}),
      ...(image ? { image } : {}),
      body,
      placeholder: false
    });
  }
  console.log(`  ${posts.length} articles`);
  if (missingAlt > 0) {
    console.log(
      `  NOTE: ${missingAlt} image(s) came across with no description. They are live, but the\n` +
        '        Studio will show a validation error on each until someone describes them.\n' +
        '        See HANDOVER.md, "Things to finish".'
    );
  }

  /* --- Commissioned pieces --------------------------------------------- */
  console.log('Commissioned pieces…');
  const pending = await readJson('placeholder-articles.json');
  for (const s of pending.stories ?? []) {
    const topicRef = [...topicRefs.values()].find((r) => r._ref === `topic-${slugify(s.topic)}`);
    docs.push({
      // Drafts: invented commissions, imported so the shape is visible.
      _id: `drafts.article-commission-${s.slug}`,
      _type: 'article',
      state: 'commissioned',
      title: s.title,
      slug: { _type: 'slug', current: s.slug },
      standfirst: s.standfirst,
      author: patronRef,
      publishedAt: new Date().toISOString(),
      section: 'Opinion',
      ...(topicRef ? { topic: topicRef } : {}),
      body: [],
      placeholder: true
    });
  }
  console.log(`  ${pending.stories?.length ?? 0} commissions (as drafts)`);

  /* --- Podcast --------------------------------------------------------- */
  console.log('Podcast…');
  const podcast = await readJson('podcast.json');
  const podcastMeta = await readJson('podcast-meta.json');

  stage({
    _id: 'podcastShow',
    _type: 'podcastShow',
    title: podcast.title,
    tagline: podcastMeta.show?.tagline,
    blurb: podcastMeta.show?.blurb,
    spotifyShowId: podcast.spotify?.showId,
    ...(podcast.rssFeed ? { rssFeed: podcast.rssFeed } : {})
  });

  for (const e of podcast.episodes ?? []) {
    const meta = podcastMeta.episodes?.[e.videoId] ?? {};
    const stills = [];
    for (const s of meta.stills ?? []) {
      const filename = s.src.split('/').pop();
      stills.push(figure(await uploadImage(join(PUBLIC, s.src.replace(/^\//, '')), filename), s.alt));
    }

    stage({
      _id: `episode-${e.videoId}`,
      _type: 'episode',
      state: 'published',
      number: e.number,
      // The upload title carries "Episode 1" on the end and the band prints
      // the number directly above it, which read as a typo. The number is its
      // own field now, so it comes off the title.
      title: e.title.replace(/[.\s—–-]*\s*Episode\s+\d+\s*$/i, '').trim() || e.title,
      slug: { _type: 'slug', current: e.slug },
      publishedAt: e.published,
      blurb: meta.blurb ?? e.summary,
      youtubeId: e.videoId,
      videoAvailable: meta.videoAvailable !== false,
      ...(meta.videoNote ? { videoNote: meta.videoNote } : {}),
      guests: keyed((meta.guests ?? []).map((g) => ({ _type: 'guest', ...g }))),
      topics: meta.topics ?? [],
      stills: keyed(stills),
      ...(meta.photographer ? { photographer: meta.photographer } : {}),
      placeholder: false
    });
  }

  // Invented episodes, with invented guests. Imported as drafts so the band's
  // layout is visible, and unpublishable until the names and the artwork are
  // real. See the note printed at the end of this run.
  for (const p of podcastMeta.placeholderEpisodes ?? []) {
    const filename = p.thumbnail.split('/').pop();
    docs.push({
      _id: `drafts.episode-placeholder-${p.number}`,
      _type: 'episode',
      state: 'upcoming',
      number: p.number,
      title: p.title,
      slug: { _type: 'slug', current: slugify(p.title) },
      publishedAt: new Date(p.date).toISOString(),
      blurb: p.blurb,
      videoAvailable: false,
      guests: keyed(
        (p.guests ?? []).map(() => ({
          _type: 'guest',
          // The invented names are deliberately NOT carried across. They are
          // realistic names of people who do not exist, attached to a South
          // Sudanese politics podcast; a fictional guest list is the one piece
          // of placeholder content here that could do real harm if it slipped
          // out. The slot is kept so the layout is visible.
          name: 'Guest to be confirmed',
          role: 'Role to be confirmed'
        }))
      ),
      stills: keyed([figure(await uploadImage(join(PUBLIC, p.thumbnail.replace(/^\//, '')), filename), p.thumbnailAlt)]),
      placeholder: true
    });
  }
  console.log(
    `  ${podcast.episodes?.length ?? 0} episodes, ` +
      `${podcastMeta.placeholderEpisodes?.length ?? 0} placeholders (as drafts)`
  );

  /* --- Documentaries --------------------------------------------------- */
  console.log('Documentaries…');
  const documentaries = await readJson('documentaries.json');
  let order = 0;
  for (const f of documentaries.films ?? []) {
    const filename = f.poster.split('/').pop();
    docs.push({
      // Drafts: the films are not commissioned and the key art is
      // AI-generated, so none of this may be published as it stands.
      _id: `drafts.film-${f.slug}`,
      _type: 'film',
      title: f.title,
      slug: { _type: 'slug', current: f.slug },
      standfirst: f.standfirst,
      summary: f.summary,
      poster: figure(
        await uploadImage(join(PUBLIC, f.poster.replace(/^\//, '')), filename),
        f.posterAlt
      ),
      status: f.status,
      order: (order += 1),
      placeholder: true
    });
  }
  console.log(`  ${documentaries.films?.length ?? 0} films (as drafts)`);

  /* --- Strands --------------------------------------------------------- */
  console.log('Strands…');
  const STRANDS = [
    ['culture', 'Cultural commentary', 'Writing on the traditions, languages and public life carried between South Sudan and its diaspora.'],
    ['media', 'Media', 'The press, broadcasting and information environment across the region, and who gets to tell the story.'],
    ['entertainment', 'Entertainment', 'Music, film, performance and the people making them.'],
    ['food', 'Food', 'The cooking of the river and the regions, and the people who keep it.'],
    ['sport', 'Sport', 'Competition across the states, and the athletes who carry the country’s name abroad.'],
    ['fashion', 'Fashion & textiles', 'Designers and makers working with South Sudanese cloth, pattern and form.']
  ];
  STRANDS.forEach(([slug, name, standfirst], i) => {
    const topicRef = [...topicRefs.values()].find((r) => r._ref === `topic-${slug}`);
    stage({
      _id: `strand-${slug}`,
      _type: 'strand',
      name,
      slug: { _type: 'slug', current: slug },
      standfirst,
      ...(topicRef ? { topic: topicRef } : {}),
      order: i + 1
    });
  });

  /* --- The Festival ---------------------------------------------------- */
  console.log('Festival…');
  const festival = await readJson('festival.json');
  docs.push({
    // Draft: nothing about this event is scheduled.
    //
    // The five carousel images are deliberately NOT imported. They were
    // licensed stock photographs of other events standing in until the first
    // edition is shot; re-hosting them inside the site's own asset library
    // would make them look like the festival's own photography. The carousel
    // renders nothing when there are no slides, which is the honest state.
    _id: 'drafts.festival',
    _type: 'festival',
    name: festival.name,
    standfirst: festival.standfirst,
    blurb: festival.blurb,
    datesAnnounced: false,
    strands: keyed((festival.strands ?? []).map((s) => ({ _type: 'namedDetail', ...s }))),
    ...(festival.awards ? { awards: { _type: 'namedDetail', ...festival.awards } } : {}),
    foundationBody: paragraphs(
      'The festival is also the platform’s sustainability engine. Alongside it sits the foundation, which carries the Nile Explorer Scholarships, the Nile Festival Awards and the Nile Explorer Academy, so that the newsroom and the training pipeline are funded from something the public actually turns up to rather than from donor cycles.'
    ),
    editorialNote:
      'this page describes the festival as set out in the communications strategy. Dates, venues, the programme and ticketing are not yet confirmed and nothing on this page should be read as a published schedule.',
    slides: [],
    placeholder: true
  });

  /* --- About page ------------------------------------------------------ */
  console.log('About page…');
  stage({
    _id: 'aboutPage',
    _type: 'aboutPage',
    patronKicker: 'The patron',
    patronRole: 'Patron of The Nile Explorer',
    editorialNote:
      'Still needed: confirmation of the formal titles and honorifics to use alongside the name.',
    themesHeading: 'Recurring subjects',
    themes: keyed(
      [
        ['Continental unity', 'Africa’s position between competing powers, and why a common diplomatic front matters more than alignment with any single bloc.'],
        ['From movement to state', 'The unfinished transition of the SPLM from liberation movement to governing party, and what democratic contestation demands of it.'],
        ['Nationalism as practice', 'Nationalism argued as practical leverage and shared responsibility, not as slogan or ethnic claim.'],
        ['Peace architecture', 'Mediation, security arrangements and the institutional work that has to hold once an agreement is signed.']
      ].map(([name, detail]) => ({ _type: 'namedDetail', name, detail }))
    ),
    publicationHeading: 'About the publication',
    publicationBody: paragraphs(
      'The Nile Explorer is an independent media network reporting on peace, governance and geopolitics across South Sudan and the wider Nile basin. It publishes written analysis, produces The Nile Explorer Podcast, and carries video from the newsroom and the field.',
      'The masthead line, The Mirror of Africa, is meant literally: coverage of the region written from inside it, for readers who live with the consequences of what is reported.'
    ),
    contactBlurb: 'Pitches, corrections and rights of reply go to the newsroom directly.',
    correctionsNote: 'Corrections and rights of reply are published in full.'
  });

  /* --- Site settings --------------------------------------------------- */
  console.log('Site settings…');
  stage({
    _id: 'siteSettings',
    _type: 'siteSettings',
    name: 'The Nile Explorer',
    tagline: 'The Mirror of Africa',
    description:
      'Independent reporting, analysis and opinion on peace, governance and geopolitics across South Sudan and the Nile basin.',
    url: 'https://nilexplorer.net',
    email: 'newsroom@nilexplorer.net',
    youtube: 'https://www.youtube.com/@thenilexplorerpodcast',
    youtubeHandle: '@thenilexplorerpodcast',
    instagram: 'https://www.instagram.com/thenilexplorer_podcast',
    instagramHandle: '@thenilexplorer_podcast',
    patron: patronRef,
    pullQuote: {
      text: 'We must shift from blame to responsibility, from suspicion to trust, from division to unity.',
      attribution: 'Dr. Aldo Ajou Deng-Akuey · Patron'
    },
    nav: keyed([
      // News and Opinion resolve to the same articles today, because every
      // piece published so far is commentary. They diverge as sourced
      // reporting arrives. Documentaries is deliberately absent: it reaches
      // the footer only.
      { _type: 'navItem', label: 'News', href: '/articles' },
      { _type: 'navItem', label: 'Opinion', href: '/articles?section=opinion' },
      { _type: 'navItem', label: 'Podcast', href: '/podcasts' },
      { _type: 'navItem', label: 'Festival', href: '/festival' },
      { _type: 'navItem', label: 'About', href: '/about' },
      { _type: 'navItem', label: 'More', href: '/more', expandStrands: true }
    ])
  });

  await commit();

  console.log(`\n${DRY ? 'Dry run complete.' : 'Done.'}\n`);
  console.log('Next:');
  console.log('  1. Open /studio and check the Articles list against the live WordPress site.');
  console.log('  2. Describe any images that came across without a description.');
  console.log('  3. The drafts marked PLACEHOLDER cannot be published until they are real.');
  console.log('     The two invented podcast episodes had four fictional guest names; those');
  console.log('     were replaced with "Guest to be confirmed" rather than imported.');
  console.log('  4. The festival carousel is empty: the previous images were stock photographs');
  console.log('     of other events and were not carried over.');
  console.log('  5. Once the site builds from Sanity, delete scripts/ingest.mjs and content/.');
}

/** First substantial paragraph, trimmed to a standfirst. */
function standfirstFrom(post, body) {
  const excerpt = decode((post.excerpt?.rendered ?? '').replace(/<[^>]+>/g, ' '));
  const first = body
    .filter((b) => b._type === 'block' && b.style === 'normal')
    .map((b) => (b.children ?? []).map((c) => c.text ?? '').join(''))
    .find((t) => t.length > 80);

  const source = first ?? excerpt;
  if (!source) return 'Standfirst needed.';
  if (source.length <= 180) return source;

  const cut = source.slice(0, 180);
  const stop = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf('? '), cut.lastIndexOf('! '));
  return stop > 90 ? cut.slice(0, stop + 1) : `${cut.replace(/\s+\S*$/, '')}…`;
}

main().catch((err) => {
  console.error('\nMigration failed:', err.message);
  process.exit(1);
});
