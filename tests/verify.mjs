import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { resolve, dirname, relative, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = path => readFileSync(resolve(root, path), 'utf8');
let checks = 0;
const check = (label, fn) => { fn(); checks++; console.log(`PASS ${label}`); };
const meta = JSON.parse(read('komari-theme.json'));
check('Theme identity matches the original Reze v1.2.2 package', () => {
  assert.equal(meta.short, 'Reze'); assert.equal(meta.version, '1.2.2');
  assert.match(meta.name, /蕾塞/); assert.ok(statSync(resolve(root, meta.preview)).size > 0);
});
check('Managed configuration keys are unique and sensitive confirmation field is empty', () => {
  const items = meta.configuration.data.filter(item => item.key);
  assert.equal(new Set(items.map(item => item.key)).size, items.length);
  assert.equal(items.find(item => item.key === 'exportSecondaryPassword').default, '');
  for (const item of items.filter(item => item.type === 'select')) {
    assert.ok(item.options.split(',').includes(String(item.default)), item.key);
  }
});
for (const html of ['dist/index.html', 'dist/admin-app/index.html']) {
  check(`${html} local scripts and styles are packaged`, () => {
    const content = read(html); const base = dirname(resolve(root, html));
    const refs = [...content.matchAll(/(?:src|href)=["']([^"']+)["']/g)].map(match => match[1]);
    for (const url of refs.filter(url => !/^(?:https?:|data:|#)/.test(url))) {
      const path = url.split(/[?#]/)[0];
      const candidates = path.startsWith('/')
        ? [resolve(root, 'dist', path.slice(1)), resolve(root, 'dist/admin-app', path.slice(1))]
        : [resolve(base, path)];
      assert.ok(candidates.some(candidate => { try { return statSync(candidate).isFile(); } catch { return false; } }), `${html}: ${url}`);
    }
  });
}
function files(dir) {
  return readdirSync(dir).flatMap(name => {
    if (name === '.git') return [];
    const path = resolve(dir, name); return statSync(path).isDirectory() ? files(path) : [path];
  });
}
const all = files(resolve(root, 'dist'));
const scripts = all.filter(path => extname(path) === '.js');
check(`All ${scripts.length} packaged JavaScript files pass syntax checks`, () => {
  for (const path of scripts) {
    const result = spawnSync(process.execPath, ['--check', path], { encoding: 'utf8' });
    assert.equal(result.status, 0, `${relative(root, path)}: ${result.stderr}`);
  }
});
check('No obvious GitHub tokens or private keys in packaged text assets', () => {
  for (const path of all.filter(path => ['.js', '.json', '.geojson', '.css', '.html', '.svg'].includes(extname(path)))) {
    const text = readFileSync(path, 'utf8');
    assert.ok(!/gh[pousr]_[A-Za-z0-9_]{20,}|github_pat_[A-Za-z0-9_]{20,}|-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/.test(text), relative(root, path));
  }
});
check('README includes an actual direct installation asset URL', () => {
  assert.ok(read('README.md').includes('https://github.com/vioIetMiku/komari-theme-reze/releases/download/v1.2.2/komari-theme-Reze-v1.2.2.zip'));
});
console.log(`${checks} static checks passed; these do not verify runtime behavior or deployment.`);
