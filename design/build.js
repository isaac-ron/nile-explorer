// Rebuilds the Claude Design bundles from the editable templates in src/.
//
//   src/<page>-body.html    markup + stylesheet (everything from <style> to </div>)
//   src/<page>-script.js    the DCLogic class; __PHOTOS__ is replaced with the
//                           original base64 `photos = {...}` line, which is far too
//                           large to keep in a hand-edited file
//
// The assembled template is JSON-encoded back into the <script type="__bundler/template">
// tag of the standalone bundle. Forward slashes MUST be escaped as /: the template
// contains its own </script> tag, which would otherwise close the bundler tag early and
// break the page. The original bundles do the same.

const fs = require('fs');

const findTag = (lines, tag) =>
  lines.findIndex(l => l.trim() === '<script type="__bundler/' + tag + '">');

// JSON.stringify leaves "/" bare; the bundler needs it escaped.
const encodeTemplate = text => JSON.stringify(text).replace(/\//g, '\\u002F');

function assemble({ template, css, markup, script, photosLine }) {
  const lines = fs.readFileSync(template, 'utf8').split('\n');
  const head = lines.slice(0, 375).join('\n'); // <!DOCTYPE> through the @font-face </style>
  const propsLine = lines.find(l => l.includes('data-dc-script'));
  const props = propsLine.match(/data-props="([^"]*)"/)[1];
  const js = fs
    .readFileSync(script, 'utf8')
    .replace('__PHOTOS__', photosLine === null ? '' : lines[photosLine]);

  return [
    head,
    '<style>',
    fs.readFileSync('src/base.css', 'utf8'),
    fs.readFileSync(css, 'utf8'),
    '</style>',
    '</helmet>',
    '',
    fs.readFileSync(markup, 'utf8'),
    '</x-dc>',
    '<script type="text/x-dc" data-dc-script="" data-props="' + props + '">',
    js,
    '</script>',
    ''
  ].join('\n');
}

function rebundle(bundleFile, templateText, outFile) {
  const lines = fs.readFileSync(bundleFile, 'utf8').split('\n');
  lines[findTag(lines, 'template') + 1] = encodeTemplate(templateText);
  fs.writeFileSync(outFile, lines.join('\n'));
}

const PAGES = [
  {
    name: 'article',
    bundle: '.original/The Nile Explorer - Article.html',
    out: 'The Nile Explorer - Article.html',
    template: 'src/article.html',
    css: 'src/article.css',
    markup: 'src/article-markup.html',
    script: 'src/article-script.js',
    photosLine: 532
  },
  {
    name: 'landing',
    bundle: '.original/The Nile Explorer (3).html',
    out: 'The Nile Explorer.html',
    template: 'src/landing.html',
    css: 'src/landing.css',
    markup: 'src/landing-markup.html',
    script: 'src/landing-script.js',
    photosLine: 715
  }
];

const only = process.argv[2];

for (const page of PAGES) {
  if (only && page.name !== only) continue;
  if (!fs.existsSync(page.markup)) {
    console.log(page.name, '- skipped (no body yet)');
    continue;
  }
  const built = assemble(page);
  fs.writeFileSync('src/' + page.name + '.built.html', built);
  rebundle(page.bundle, built, page.out);
  console.log(page.name, '->', page.out, '(' + built.length + ' template chars)');
}
