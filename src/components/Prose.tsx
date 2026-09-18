import Image from 'next/image';
import Link from 'next/link';
import { PortableText, type PortableTextComponents } from '@portabletext/react';
import type { PortableTextBlock } from '@portabletext/types';
import { toImage, type SanityImage } from '@/lib/sanity/image';

/**
 * Body text.
 *
 * Renders exactly the elements the stylesheet dresses — h2, h3, blockquote,
 * ul, ol, p, plus a picture and an editor's note — and nothing else, so a
 * block type that somehow reaches here cannot produce unstyled markup. The
 * Studio offers exactly these and no more, which is the other half of the
 * same contract: see sanity/schemaTypes/objects/blockContent.ts.
 *
 * Links and bold and italic are new. The WordPress ingest flattened inline
 * markup with a regex, so the archive's emphasis was lost and a hyperlink was
 * not expressible at all.
 */
const components: PortableTextComponents = {
  block: {
    normal: ({ children }) => <p>{children}</p>,
    h2: ({ children }) => <h2>{children}</h2>,
    h3: ({ children }) => <h3>{children}</h3>,
    blockquote: ({ children }) => <blockquote>{children}</blockquote>
  },
  list: {
    bullet: ({ children }) => <ul>{children}</ul>,
    number: ({ children }) => <ol>{children}</ol>
  },
  listItem: {
    bullet: ({ children }) => <li>{children}</li>,
    number: ({ children }) => <li>{children}</li>
  },
  types: {
    /**
     * A picture in the body.
     *
     * The frame carries the file's real ratio inline and its own pixel width
     * as a ceiling, so nothing is cropped to a house aspect and a small
     * supplied file is never upscaled to fill the column. Running the full
     * column rather than the 68ch text measure is what .prose--wide is for.
     */
    figure: ({ value }) => {
      const image = toImage(value as SanityImage);
      if (!image) return null;

      const { url, alt, width, height, caption, credit } = image;

      return (
        <figure className="prose__figure">
          <span
            className="frame"
            style={
              width && height
                ? { aspectRatio: `${width} / ${height}`, maxWidth: width }
                : undefined
            }
          >
            <Image
              src={url}
              alt={alt}
              width={width ?? 1200}
              height={height ?? 800}
              sizes={
                width
                  ? `(max-width: 1000px) 100vw, min(860px, ${width}px)`
                  : '(max-width: 1000px) 100vw, 860px'
              }
            />
          </span>
          {(caption || credit) && (
            <figcaption>
              {caption}
              {credit && <span className="credit">Photograph: {credit}</span>}
            </figcaption>
          )}
        </figure>
      );
    },

    /**
     * An editor's note. The opening "Editor's note:" is emphasised where the
     * copy carries it, so the label reads as a label rather than as the first
     * words of a sentence.
     */
    editorsNote: ({ value }) => {
      const text: string = (value as { text?: string })?.text ?? '';
      if (!text.trim()) return null;

      // Both apostrophes: the Studio's copy is typographic, but text pasted
      // from elsewhere often is not.
      const [, label, rest] = /^(Editor['’]s note:)\s*([\s\S]*)$/.exec(text) ?? [];

      return (
        <aside className="callout prose__note">
          {label ? (
            <>
              <strong>{label}</strong> {rest}
            </>
          ) : (
            text
          )}
        </aside>
      );
    }
  },
  marks: {
    strong: ({ children }) => <strong>{children}</strong>,
    em: ({ children }) => <em>{children}</em>,
    link: ({ children, value }) => {
      const href: string = value?.href ?? '';

      // Internal links go through next/link so they navigate without a reload.
      if (href.startsWith('/')) return <Link href={href}>{children}</Link>;

      // rel is set on every outbound link rather than only on new-tab ones:
      // it costs nothing and there is no case here where we want to pass
      // referrer-privileged window access to another site.
      return (
        <a href={href} rel="noopener noreferrer">
          {children}
        </a>
      );
    }
  }
};

export default function Prose({
  value,
  className = 'prose'
}: {
  value: PortableTextBlock[] | undefined;
  className?: string;
}) {
  if (!Array.isArray(value) || value.length === 0) return null;
  return (
    <div className={className}>
      <PortableText value={value} components={components} />
    </div>
  );
}
