const fs = require('node:fs');
const path = require('node:path');
const option = process.argv[2];
if (!['--enable', '--disable'].includes(option)) {
  console.error('Usage: node tests/toggle-live-checks.cjs --enable|--disable');
  process.exit(1);
}
const file = path.join(__dirname, '..', 'manifest.json');
const manifest = JSON.parse(fs.readFileSync(file, 'utf8'));
const scripts = manifest.content_scripts[0].js.filter(s => s !== 'tests/live-checks.js');
if (option === '--enable') scripts.push('tests/live-checks.js');
manifest.content_scripts[0].js = scripts;
fs.writeFileSync(file, JSON.stringify(manifest, null, 2) + '\n');
console.log('Live checks ' + (option === '--enable' ? 'enabled' : 'disabled') + '. Reload the extension and SoundCloud.');
