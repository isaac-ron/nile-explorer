import { color as sanityPalette, type ColorTintKey } from '@sanity/color';
import { buildTheme } from '@sanity/ui/theme';

/**
 * The Studio in the site's colours.
 *
 * Built with the token API Sanity UI itself uses (`buildTheme`), not
 * `buildLegacyTheme`, which is deprecated and marked for removal in the next
 * major version. The approach is deliberately narrow: Sanity UI draws
 * "primary" — buttons, links, the selected document, focus rings — from its
 * blue scale, so replacing that one scale with the site's navy rebrands the
 * Studio in both light and dark mode, while everything else (the greys, and
 * the red, amber and green that mean error, warning and success) stays
 * Sanity's own and keeps its meaning.
 *
 * The scale runs from near-white to the site's navy (--navy, #06183A, at 900).
 * Measured with Sanity UI's own getContrastRatio: 500 is 8.0:1 against white,
 * either way round (Sanity's default blue 500 is 4.3:1), and 300 and 400 clear
 * 5.2:1 against both dark-mode greys (900 and 950).
 *
 * buildTheme is marked internal in Sanity UI's types even though it is the
 * package's own export. If a Sanity upgrade ever breaks it, delete the `theme`
 * line in sanity.config.ts and the Studio falls back to its default look —
 * nothing else depends on this file.
 */
const NAVY: Record<ColorTintKey, string> = {
  50: '#f1f4fa',
  100: '#dde4f2',
  200: '#bccae6',
  300: '#8fa5d2',
  400: '#7390cc',
  500: '#2d4f8f',
  600: '#213f78',
  700: '#183063',
  800: '#10244d',
  900: '#06183a',
  950: '#040f27'
};

const navyTints = Object.fromEntries(
  Object.entries(NAVY).map(([tint, hex]) => [tint, { title: `Nile navy ${tint}`, hex }])
) as Record<ColorTintKey, { title: string; hex: string }>;

export const studioTheme = buildTheme({
  palette: { ...sanityPalette, blue: navyTints }
});
