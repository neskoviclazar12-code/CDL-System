// Static-site sanity check: internal links/assets resolve, every page has title, description, canonical,
// and every indexable page is in sitemap.xml. Run: npm run check
import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';

const ROOT = resolve(new URL('../public', import.meta.url).pathname);
const pages = [];
(function walk(d) {
  for (const f of readdirSync(d)) {
    const p = join(d, f);
    if (statSync(p).isDirectory()) walk(p);
    else if (f.endsWith('.html')) pages.push(p);
  }
})(ROOT);

const sitemap = readFileSync(join(ROOT, 'sitemap.xml'), 'utf8');
const problems = [];
const exists = (u) => {
  const clean = u.split('#')[0].split('?')[0];
  if (!clean) return true;
  const base = clean.startsWith('/') ? join(ROOT, clean) : null;
  if (!base) return true;
  if (existsSync(base) && statSync(base).isFile()) return true;
  return existsSync(join(base, 'index.html'));
};

for (const file of pages) {
  const rel = file.slice(ROOT.length) || '/';
  const html = readFileSync(file, 'utf8');
  const redirectStub = html.length < 600;
  if (!redirectStub && file !== join(ROOT, '404.html')) {
    if (!/<title>[^<]{10,}/.test(html)) problems.push(`${rel}: missing/short <title>`);
    if (!/<meta name="description" content="[^"]{50,}/.test(html)) problems.push(`${rel}: missing/short meta description`);
    if (!/<link rel="canonical"/.test(html)) problems.push(`${rel}: missing canonical`);
    if ((html.match(/<h1[\s>]/g) || []).length !== 1) problems.push(`${rel}: needs exactly one <h1>`);
    const url = 'https://cdlsystem.com' + rel.replace(/index\.html$/, '');
    if (!/noindex/.test(html) && !sitemap.includes(`<loc>${url}</loc>`)) problems.push(`${rel}: not in sitemap.xml`);
  }
  for (const m of html.matchAll(/(?:href|src)="(\/[^"#?][^"]*)"/g)) {
    if (!exists(m[1])) problems.push(`${rel}: broken reference ${m[1]}`);
  }
}
console.log(`${pages.length} pages checked, ${problems.length} problem(s)`);
for (const p of problems) console.log(' -', p);
process.exit(problems.length ? 1 : 0);
