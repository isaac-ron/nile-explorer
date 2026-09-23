import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { useClient, useCurrentUser } from 'sanity';
import { useIntentLink } from 'sanity/router';
import {
  Badge,
  Box,
  Button,
  Card,
  Container,
  Flex,
  Grid,
  Heading,
  Spinner,
  Stack,
  Text
} from '@sanity/ui';
import { AddIcon, LaunchIcon } from '../icons';
import { apiVersion } from '../env';
import { popularityOf, POPULARITY_WINDOW_DAYS, type RawStats } from '../../src/lib/popularity';

/**
 * The Studio's front door.
 *
 * Before this, signing in dropped an editor into a bare menu of document
 * types and left them to work out where anything was. This page answers the
 * questions they actually arrive with: what am I in the middle of, what went
 * out recently, what is being read, and is anything broken — with a button
 * for the one thing they most often came to do.
 *
 * Everything here is a read. Nothing on this page changes content; every row
 * opens the document in the ordinary editor.
 */

type Row = { _id: string; _type: string; title?: string; when?: string; note?: string };

type Data = {
  drafts: (Row & { live: boolean })[];
  recent: (Row & { author?: string; slug?: string })[];
  commissioned: (Row & { author?: string })[];
  stats: (RawStats & { title?: string; slug?: string })[];
  noAlt: Row[];
  noBio: Row[];
};

const QUERY = /* groq */ `{
  "drafts": *[_type in ["article", "author", "episode", "film"] && _id in path("drafts.**")]
    | order(_updatedAt desc)[0...8] {
      "_id": string::split(_id, "drafts.")[1],
      _type,
      "title": coalesce(title, name),
      "when": _updatedAt,
      "live": defined(*[_id == string::split(^._id, "drafts.")[1]][0]._id)
    },
  "recent": *[_type == "article" && state == "published" && !(_id in path("drafts.**"))]
    | order(publishedAt desc)[0...6] {
      _id, _type, title, "when": publishedAt, "author": author->name, "slug": slug.current
    },
  "commissioned": *[_type == "article" && state == "commissioned" && !(_id in path("drafts.**"))]
    | order(_updatedAt desc) { _id, _type, title, "author": author->name },
  "stats": *[_type == "articleStats"] {
    "article": article._ref, views, shares, days,
    "title": article->title, "slug": article->slug.current
  },
  "noAlt": *[_type == "article" && !(_id in path("drafts.**")) && defined(image.asset)
    && (!defined(image.alt) || image.alt == "")] { _id, _type, title, "note": "Lead picture has no description" },
  "noBio": *[_type == "author" && !(_id in path("drafts.**")) && !defined(bio)
    && count(*[_type == "article" && references(^._id)]) > 0] { _id, _type, "title": name, "note": "No biography for their writer page" }
}`;

const greeting = (): string => {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
};

const ago = (iso?: string): string => {
  if (!iso) return '';
  const mins = Math.round((Date.now() - +new Date(iso)) / 60_000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} h ago`;
  const days = Math.round(hours / 24);
  return days < 30 ? `${days} d ago` : new Date(iso).toLocaleDateString('en-GB');
};

const date = (iso?: string): string =>
  iso ? new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '';

/** A document row that opens the document, the same as clicking it in a list. */
function DocRow({ doc, meta, badge }: { doc: Row; meta?: ReactNode; badge?: ReactNode }) {
  const link = useIntentLink({ intent: 'edit', params: { id: doc._id, type: doc._type } });
  return (
    <Card
      as="a"
      href={link.href}
      onClick={link.onClick}
      padding={3}
      radius={2}
      tone="inherit"
      style={{ textDecoration: 'none' }}
    >
      <Flex align="center" gap={3}>
        <Stack gap={2} flex={1} style={{ minWidth: 0 }}>
          <Text size={1} weight="medium" textOverflow="ellipsis">
            {doc.title || 'Untitled'}
          </Text>
          {meta && (
            <Text size={1} muted textOverflow="ellipsis">
              {meta}
            </Text>
          )}
        </Stack>
        {badge}
      </Flex>
    </Card>
  );
}

function Panel({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <Card padding={4} radius={3} shadow={1}>
      <Stack gap={4}>
        <Stack gap={2}>
          <Heading as="h2" size={1}>
            {title}
          </Heading>
          {hint && (
            <Text size={1} muted>
              {hint}
            </Text>
          )}
        </Stack>
        <Stack gap={1}>{children}</Stack>
      </Stack>
    </Card>
  );
}

function Empty({ children }: { children: ReactNode }) {
  return (
    <Box paddingY={2} paddingX={3}>
      <Text size={1} muted>
        {children}
      </Text>
    </Box>
  );
}

function CreateButton({ type, text, primary }: { type: string; text: string; primary?: boolean }) {
  const link = useIntentLink({ intent: 'create', params: { type } });
  return (
    <Button
      as="a"
      href={link.href}
      onClick={link.onClick}
      icon={AddIcon}
      text={text}
      mode={primary ? 'default' : 'ghost'}
      tone={primary ? 'primary' : 'default'}
      fontSize={2}
      padding={3}
    />
  );
}

export default function Dashboard() {
  const client = useClient({ apiVersion });
  const user = useCurrentUser();
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    client
      .fetch<Data>(QUERY, {}, { perspective: 'raw' })
      .then((d) => {
        setData(d);
        setError(null);
      })
      .catch((err) => setError(err instanceof Error ? err.message : String(err)));
  }, [client]);

  // Fresh on arrival and whenever the editor comes back to the tab — which is
  // usually straight after publishing something from another one.
  useEffect(() => {
    load();
    const onFocus = () => load();
    window.addEventListener('focus', onFocus);
    const timer = window.setInterval(load, 60_000);
    return () => {
      window.removeEventListener('focus', onFocus);
      window.clearInterval(timer);
    };
  }, [load]);

  const firstName = user?.name?.split(/\s+/)[0];
  const now = Date.now();
  const mostRead = (data?.stats ?? [])
    .filter((s) => s.title)
    .map((s) => ({ ...s, score: popularityOf(s, now) }))
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
  const attention = [...(data?.noAlt ?? []), ...(data?.noBio ?? [])];

  return (
    <Box padding={[3, 4, 5]} style={{ overflowY: 'auto', height: '100%' }}>
      <Container width={3}>
        <Stack gap={5}>
          <Flex align={['flex-start', 'center']} direction={['column', 'row']} gap={4}>
            <Stack gap={3} flex={1}>
              <Heading as="h1" size={3}>
                {greeting()}
                {firstName ? `, ${firstName}` : ''}
              </Heading>
              <Text muted>
                {new Date().toLocaleDateString('en-GB', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long'
                })}
              </Text>
            </Stack>
            <Flex gap={2} wrap="wrap">
              <CreateButton type="article" text="New article" primary />
              <CreateButton type="episode" text="New episode" />
              <Button
                as="a"
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                icon={LaunchIcon}
                text="Open the site"
                mode="ghost"
                fontSize={2}
                padding={3}
              />
            </Flex>
          </Flex>

          {error && (
            <Card padding={4} radius={3} tone="critical">
              <Text size={1}>Could not load this page: {error}</Text>
            </Card>
          )}

          {!data && !error ? (
            <Flex justify="center" padding={6}>
              <Spinner muted />
            </Flex>
          ) : data ? (
            <Grid gridTemplateColumns={[1, 1, 2]} gap={4}>
              <Panel
                title="In progress"
                hint="Saved but not published. Nothing here is on the site until you press Publish."
              >
                {data.drafts.length === 0 ? (
                  <Empty>Nothing half-finished. Everything saved has been published.</Empty>
                ) : (
                  data.drafts.map((d) => (
                    <DocRow
                      key={d._id}
                      doc={d}
                      meta={`Edited ${ago(d.when)}`}
                      badge={
                        <Badge tone={d.live ? 'caution' : 'primary'} fontSize={0}>
                          {d.live ? 'Unpublished changes' : 'Never published'}
                        </Badge>
                      }
                    />
                  ))
                )}
              </Panel>

              <Panel
                title="Most read"
                hint={`What readers are opening and sharing over the last ${POPULARITY_WINDOW_DAYS} days. This decides Top stories on the front page.`}
              >
                {mostRead.length === 0 ? (
                  <Empty>No readership counted yet. It appears here as people read the site.</Empty>
                ) : (
                  mostRead.map((s, i) => (
                    <DocRow
                      key={s.article}
                      doc={{ _id: s.article, _type: 'article', title: `${i + 1}. ${s.title}` }}
                      meta={`${s.views ?? 0} reads · ${s.shares ?? 0} shares, all time`}
                    />
                  ))
                )}
              </Panel>

              <Panel title="Recently published">
                {data.recent.length === 0 ? (
                  <Empty>Nothing published yet.</Empty>
                ) : (
                  data.recent.map((r) => (
                    <DocRow
                      key={r._id}
                      doc={r}
                      meta={[date(r.when), r.author].filter(Boolean).join(' · ')}
                    />
                  ))
                )}
              </Panel>

              <Panel
                title="Needs attention"
                hint="Small fixes that affect readers. Each opens the document to fix."
              >
                {attention.length === 0 ? (
                  <Empty>Nothing needs attention.</Empty>
                ) : (
                  attention.map((a) => (
                    <DocRow
                      key={`${a._id}-${a.note}`}
                      doc={a}
                      meta={a.note}
                      badge={
                        <Badge tone="caution" fontSize={0}>
                          Fix
                        </Badge>
                      }
                    />
                  ))
                )}
              </Panel>

              {data.commissioned.length > 0 && (
                <Panel
                  title="Commissioned"
                  hint="Assigned but not yet written. They show on the front page as “In production”."
                >
                  {data.commissioned.map((c) => (
                    <DocRow key={c._id} doc={c} meta={c.author} />
                  ))}
                </Panel>
              )}
            </Grid>
          ) : null}
        </Stack>
      </Container>
    </Box>
  );
}
