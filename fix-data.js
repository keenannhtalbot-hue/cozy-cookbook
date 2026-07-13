// fix-data.js — dedup + fix ID collisions in data.js
const fs = require('fs');
const vm = require('vm');
const path = require('path');

const srcPath = path.join(__dirname, 'data.js');
const code = fs.readFileSync(srcPath, 'utf8');
const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(code, sandbox);
const all = sandbox.window.RECIPES;
console.log(`Loaded ${all.length} entries (including nulls and dupes)`);

// Step 1: filter nulls
const valid = [];
let nulled = 0;
for (const r of all) {
  if (r == null) { nulled++; continue; }
  if (!r.id) continue;
  valid.push(r);
}
console.log(`Filtered: ${nulled} nulls. Kept ${valid.length} candidates.`);

// Step 2: rename cross-cuisine ID collisions BEFORE dedup
const idGroups = {};
for (const r of valid) (idGroups[r.id] = idGroups[r.id] || []).push(r);
let renamed = 0;
for (const [id, arr] of Object.entries(idGroups)) {
  if (arr.length <= 1) continue;
  const cuisines = new Set(arr.map(r => r.cuisine));
  if (cuisines.size <= 1) continue;
  for (let i = 1; i < arr.length; i++) {
    arr[i].id = `${id}-${arr[i].cuisine}`;
    renamed++;
  }
}
console.log(`Renamed ${renamed} colliding recipe(s)`);

// Step 3: dedup by id (keep first)
const seen = new Set();
const unique = [];
let dupes = 0;
for (const r of valid) {
  if (seen.has(r.id)) { dupes++; continue; }
  seen.add(r.id);
  unique.push(r);
}
console.log(`Removed ${dupes} duplicates. ${unique.length} unique recipes remain.`);

// Step 4: verify
const idCounts = {};
for (const r of unique) idCounts[r.id] = (idCounts[r.id] || 0) + 1;
const remaining = Object.entries(idCounts).filter(([_, c]) => c > 1);
console.log(`Remaining ID collisions: ${remaining.length}`);

// Step 5: emit
function q(s) {
  if (s == null) return 'null';
  if (typeof s !== 'string') return JSON.stringify(s);
  return "'" + s.replace(/\\/g, '\\\\').replace(/'/g, "\\'") + "'";
}
function emit(r) {
  // Ingredients may be tuples or objects — preserve original format to keep
  // diffs minimal (app.js now has normalizeIngredient() at runtime).
  const ings = (r.ingredients || []).map(i => {
    if (Array.isArray(i)) return '      [' + i.map(x => x === undefined || x === null ? 'null' : (typeof x === 'string' ? q(x) : JSON.stringify(x))).join(', ') + ']';
    if (i && typeof i === 'object') return '      { name: ' + q(i.name) + ', qty: ' + (i.qty != null ? JSON.stringify(i.qty) : 'null') + ', unit: ' + q(i.unit || '') + ' }';
    return '      ' + q(String(i));
  }).join(',\n');
  const steps = (r.steps || []).map(s => '      ' + q(s)).join(',\n');
  const nut = r.nutrition || {};
  const nutParts = ['calories', 'protein', 'carbs', 'fat'].filter(k => k in nut).map(k => `${k}: ${JSON.stringify(nut[k])}`);
  const tags = (r.tags || []).map(t => q(t)).join(', ');
  return [
    `  r(${q(r.id)}, ${q(r.name)}, ${q(r.cuisine)}, ${q(r.level)}, ${r.time}, ${r.servings},`,
    '    [\n' + ings + '\n    ],',
    '    [\n' + steps + '\n    ],',
    '    { ' + nutParts.join(', ') + ' },',
    '    [' + tags + ']\n  )'
  ].join('\n');
}

const body = unique.map(emit).join(',\n');
const newBlock = `const RECIPES = [\n${body}\n];`;

// Splice
const startMarker = 'const RECIPES = [';
const startIdx = code.indexOf(startMarker);
const endMarker = '\n];';
const endIdx = code.indexOf(endMarker, startIdx + startMarker.length) + endMarker.length;
const newCode = code.slice(0, startIdx) + newBlock + code.slice(endIdx);

const outPath = path.join(__dirname, 'data.js.fixed');
fs.writeFileSync(outPath, newCode);
console.log(`\nWrote ${outPath}: ${unique.length} recipes, ${newCode.length} bytes (was ${code.length})`);

// Smoke test
try {
  const sandbox2 = { window: {} };
  vm.createContext(sandbox2);
  vm.runInContext(newCode, sandbox2);
  console.log(`Smoke test PASS: ${sandbox2.window.RECIPES.length} recipes load`);
} catch (e) {
  console.log(`Smoke test FAIL: ${e.message}`);
  process.exit(1);
}