// Render the images the newsletter templates use, at email sizes.
//   node design/tools/make-email-assets.js
//
// Writes public/email/. The site's own images are sized for the web (the
// lockup PNGs are 1729px wide, the podcast artwork 320KB), which is a heavy
// download for a reader opening an email on mobile data. Every image here is
// exactly twice its display width in the templates, for high-density screens.
// Re-run when public/brand/ changes or a new story goes into an edition.

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ROOT = path.resolve(__dirname, '..', '..');
const OUT = path.join(ROOT, 'public', 'email');
const src = (...p) => path.join(ROOT, 'public', ...p);

// [source, output name, width at 2x, optional height at 2x (crops to fill)]
const JOBS = [
  // Lockup halves, reversed for the navy masthead. Display: 44x52 and 155x30.
  [src('brand', 'logo-mark-reversed.png'), 'logo-mark-reversed.png', 88],
  [src('brand', 'logo-wordmark-reversed.png'), 'logo-wordmark-reversed.png', 310],
  [src('brand', 'podcast-logo.png'), 'podcast-logo.png', 240],
  [src('brand', 'patron.jpg'), 'patron.jpg', 144, 144],

  // Lead story: full 600px column.
  [src('articles', 'south-sudan-at-a-critical-moment', 'we-need-peace.jpg'), 'lead-we-need-peace.jpg', 1200, 720],
  [src('articles', 'why-the-us-voted-against-correcting-the-map', 'world-map-2026.jpg'), 'lead-world-map-2026.jpg', 1200, 654],

  // Paired stories: two 264px columns, cropped to one shape so titles align.
  [src('articles', 'one-vote-450-years', 'un-general-assembly.jpg'), 'pair-un-general-assembly.jpg', 528, 330],
  [src('articles', 'why-the-us-voted-against-correcting-the-map', 'world-map-2026.jpg'), 'pair-world-map-2026.jpg', 528, 330],
  [src('articles', 'kenyas-expulsion-of-small-traders', 'jamhuri-estate.jpg'), 'pair-jamhuri-estate.jpg', 528, 330],
  [src('articles', 'rutos-retail-crackdown-and-the-eac', 'eac-24th-summit.jpg'), 'pair-eac-24th-summit.jpg', 528, 330],

  // Welcome email "start here" thumbnails.
  [src('articles', 'south-sudan-at-a-critical-moment', 'we-need-peace.jpg'), 'thumb-we-need-peace.jpg', 240, 180],
  [src('articles', 'africa-must-unite', 'oau-addis-1963.jpg'), 'thumb-oau-addis-1963.jpg', 240, 180],
  [src('articles', 'kenyas-expulsion-of-small-traders', 'jamhuri-estate.jpg'), 'thumb-jamhuri-estate.jpg', 240, 180]
];

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  for (const [from, name, width, height] of JOBS) {
    let img = sharp(from).resize({ width, height, fit: 'cover', position: 'attention' });
    img = name.endsWith('.png')
      ? img.png({ compressionLevel: 9, palette: true })
      : img.jpeg({ quality: 72, progressive: true, mozjpeg: true });
    const info = await img.toFile(path.join(OUT, name));
    console.log(`${name.padEnd(32)} ${info.width}x${info.height}  ${(info.size / 1024).toFixed(0)}KB`);
  }
})();
