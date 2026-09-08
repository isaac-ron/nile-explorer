// Generate the reversed (navy-ground) brand lockup.
//   node design/tools/make-reversed-lockup.js
//
// Writes public/brand/logo-mark-reversed.png and logo-wordmark-reversed.png.
// Re-run whenever the source marks in public/brand/ change. Output is
// committed, like make-brand-assets.js, so the build needs no image step.
//
// Why this exists: the positive lockup cannot sit on --navy. Measured against
// #06183A the mark's own navy is 1.33:1 and its river blue is 2.62:1, so the
// continent and the Nile both disappear and only the eagle's gold survives.
// Every identity needs a reversed lockup for dark grounds; this is that, not a
// change to the brand. The mapping keeps all three brand elements legible and
// distinct, and each target colour is an existing token:
//
//   continent + eagle body  navy   -> --paper       #FFFFFF   17.5:1
//   the Nile                blue   -> --river-light #6FA8E0    6.9:1
//   wing, fish, "THE"/"EXPLORER"   -> --gold-light  #E3B25A    9.0:1
//
// DESIGN.md already reserves --gold-light for navy grounds; this follows that
// rule rather than inventing one.

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ROOT = path.resolve(__dirname, '..', '..');
const BRAND = path.join(ROOT, 'public', 'brand');

const PAPER = [0xff, 0xff, 0xff];
const RIVER = [0x6f, 0xa8, 0xe0];
const GOLD = [0xe3, 0xb2, 0x5a];

/* The source palette is three inks plus antialiasing between them:
   navy ~#0A2E6B (80%), river ~#0F5CAF (16%), gold ~#BE7C2A (2%).
   Warm pixels are the gold family. The rest split on luma: the continent sits
   near 43, the river near 82, so 62 separates them with room either side.
   Black detail (talons, eye) falls below the threshold and goes to paper,
   which is what it needs to do on a dark ground. */
const LUMA_SPLIT = 62;

function classify(r, g, b) {
  if (r > b + 20) return GOLD;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b < LUMA_SPLIT ? PAPER : RIVER;
}

async function reverse(src, out) {
  const { data, info } = await sharp(path.join(BRAND, src))
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  for (let i = 0; i < data.length; i += 4) {
    // Alpha is left exactly as it was: the outer edges and the white casing
    // around the river are transparent in the source, so the navy ground
    // shows through them and keeps the channel reading as a channel.
    if (data[i + 3] === 0) continue;
    const [r, g, b] = classify(data[i], data[i + 1], data[i + 2]);
    data[i] = r;
    data[i + 1] = g;
    data[i + 2] = b;
  }

  const buf = await sharp(data, {
    raw: { width: info.width, height: info.height, channels: 4 }
  })
    .png({ compressionLevel: 9 })
    .toBuffer();

  fs.writeFileSync(path.join(BRAND, out), buf);
  console.log(
    'wrote public/brand/' + out,
    info.width + 'x' + info.height,
    Math.round(buf.length / 1024) + 'kb'
  );
}

async function main() {
  await reverse('logo-mark.png', 'logo-mark-reversed.png');
  await reverse('logo-wordmark.png', 'logo-wordmark-reversed.png');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
