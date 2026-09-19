import { useWorkspace } from 'sanity';

/**
 * The wordmark in the Studio's top-left corner.
 *
 * Sanity's default is the workspace title as plain text, which reads as an
 * untitled project — the newsroom should be able to tell at a glance that they
 * are in their own publication and not a generic CMS.
 *
 * Deliberately typographic rather than an image. The site's logo is a PNG
 * drawn for a navy masthead; on the Studio's light chrome it would need its
 * own cut, and a second file to keep in step with the brand is a liability for
 * something this small. This takes the same serif the site sets its headlines
 * in, so it reads as the masthead without being a copy of it.
 *
 * The title comes from the workspace rather than a string here, so renaming
 * the Studio in sanity.config.ts renames this too.
 */
export default function StudioLogo() {
  const { title } = useWorkspace();

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'baseline',
        gap: '0.45em',
        fontFamily: 'Newsreader, Georgia, serif',
        fontSize: '1.05rem',
        fontWeight: 600,
        letterSpacing: '-0.01em',
        // `currentColor`, not a brand value: the Studio ships light and dark
        // schemes and a hardcoded navy disappears against the dark one.
        color: 'currentColor',
        whiteSpace: 'nowrap'
      }}
    >
      {title}
      <span
        aria-hidden
        style={{
          fontFamily: 'system-ui, sans-serif',
          fontSize: '0.58rem',
          fontWeight: 500,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          opacity: 0.55
        }}
      >
        Newsroom
      </span>
    </span>
  );
}
