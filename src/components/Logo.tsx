import Image from 'next/image';
import Link from 'next/link';
import { getSite } from '@/lib/content';

/**
 * The lockup, in one place because it now has two forms.
 *
 * `reversed` selects the navy-ground artwork from
 * design/tools/make-reversed-lockup.js. It is not optional on a navy ground:
 * measured against --navy, the positive mark's own navy is 1.33:1 and its
 * river blue 2.62:1, so the continent and the Nile both vanish and only the
 * eagle's gold survives.
 */
export default async function Logo({
  reversed,
  preload
}: {
  reversed?: boolean;
  /** Replaces the `priority` prop, deprecated in Next 16. */
  preload?: boolean;
}) {
  const variant = reversed ? '-reversed' : '';
  const site = await getSite();

  return (
    <Link className="logo" href="/" aria-label={`${site.name}, home`}>
      <Image
        className="logo__mark"
        src={`/brand/logo-mark${variant}.png`}
        alt=""
        width={889}
        height={1044}
        preload={preload}
      />
      <Image
        className="logo__word"
        src={`/brand/logo-wordmark${variant}.png`}
        alt={site.name}
        width={1729}
        height={334}
        preload={preload}
      />
    </Link>
  );
}
