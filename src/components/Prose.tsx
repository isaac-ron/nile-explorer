import Link from 'next/link';
import { PortableText, type PortableTextComponents } from '@portabletext/react';
import type { PortableTextBlock } from '@portabletext/types';

/**
 * Body text.
 *
 * Renders exactly the elements the stylesheet dresses — h2, h3, blockquote,
 * ul, ol, p — and nothing else, so a block type that somehow reaches here
 * cannot produce unstyled markup. The Studio only offers these four styles,
 * which is the other half of the same contract.
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
