/**
 * Platform icons.
 *
 * These are the supplied brand marks in public/icons, rendered as plain <img>
 * rather than next/image: they are small, already optimised, and optimising SVG
 * through next/image would mean turning on dangerouslyAllowSVG for no gain.
 *
 * Brand marks are used in their own colours. They are decorative here because
 * every one sits inside a link that already carries an aria-label.
 */

export type PlatformName =
  | 'spotify'
  | 'youtube'
  | 'apple-podcasts'
  | 'instagram'
  | 'x'
  | 'facebook'
  | 'whatsapp';

const FILES: Record<PlatformName, string> = {
  spotify: '/icons/spotify.svg',
  youtube: '/icons/icons8-youtube.svg',
  'apple-podcasts': '/icons/apple-podcasts.svg',
  instagram: '/icons/icons8-instagram.svg',
  x: '/icons/icons8-x.svg',
  facebook: '/icons/icons8-facebook.svg',
  whatsapp: '/icons/icons8-whatsapp.svg'
};

export function PlatformIcon({
  name,
  size = 22
}: {
  name: PlatformName;
  size?: number;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={FILES[name]}
      alt=""
      width={size}
      height={size}
      aria-hidden="true"
      loading="lazy"
      decoding="async"
    />
  );
}

/** Square, bordered platform link. Used in "Listen on" and "Follow" rows. */
export function PlatformLink({
  name,
  href,
  label
}: {
  name: PlatformName;
  href: string;
  label: string;
}) {
  return (
    <a
      className="platform"
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      title={label}
    >
      <PlatformIcon name={name} />
    </a>
  );
}
