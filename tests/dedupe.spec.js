/**
 * Bug-fix tests for Cozy Cookbook data.js deduplication.
 *
 * Run with: node tests/dedupe.spec.js
 */
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

function loadRecipes() {
  const code = fs.readFileSync(path.join(__dirname, '..', 'data.js'), 'utf8');
  const sandbox = { window: {} };
  vm.createContext(sandbox);
  vm.runInContext(code, sandbox);
  return sandbox.window.RECIPES;
}

let pass = 0, fail = 0;
function test(name, fn) {
  try { fn(); console.log('  ✓', name); pass++; }
  catch (e) { console.log('  ✗', name); console.log('     ', e.message); fail++; }
}
function assertEq(a, e, l) {
  if (JSON.stringify(a) !== JSON.stringify(e)) throw new Error(`${l||''}: expected ${JSON.stringify(e)}, got ${JSON.stringify(a)}`);
}
function assertTruthy(v, l) { if (!v) throw new Error(`${l||''}: got ${v}`); }

console.log('\n=== data.js bug-fix tests ===\n');

test('RECIPES array exists and is non-empty', () => {
  const r = loadRecipes();
  assertTruthy(Array.isArray(r) && r.length > 0, 'array');
});

test('every recipe has a unique id (no duplicate IDs)', () => {
  const r = loadRecipes();
  const ids = r.map(x => x.id);
  assertEq(new Set(ids).size, r.length, 'unique-id count vs total');
});

test('1008 unique recipes (1006 spec + 2 from beef-wellington collision fix)', () => {
  const r = loadRecipes();
  assertEq(r.length, 1008, 'total count');
});

test('hero subtitle shows the actual count (not the inflated 1423)', () => {
  const r = loadRecipes();
  if (r.length >= 1100) throw new Error(`hero count too high: ${r.length}`);
});

test('every recipe has required fields', () => {
  const r = loadRecipes();
  const req = ['id', 'name', 'cuisine', 'level', 'time', 'servings', 'ingredients', 'steps', 'tags'];
  for (const rec of r) {
    for (const f of req) {
      if (rec[f] === undefined || rec[f] === null) throw new Error(`${rec.id||'?'} missing ${f}`);
    }
  }
});

test('no recipe has null level', () => {
  const r = loadRecipes();
  assertEq(r.filter(x => x.level == null).length, 0, 'null level count');
});

test('cuisine is in the CUISINES list (or null sentinel)', () => {
  const r = loadRecipes();
  const allowed = new Set([
    'italian', 'chinese', 'indian', 'mexican', 'japanese', 'thai', 'french',
    'korean', 'middle_eastern', 'greek', 'spanish', 'vietnamese', 'american',
    'british', 'german', 'portuguese', 'canadian', 'world',
    'jewish', 'indonesian', 'taiwanese', 'australian', 'irish', 'austrian'
  ]);
  const unknown = r.filter(x => x.cuisine && !allowed.has(x.cuisine));
  assertEq(unknown.length, 0, 'unknown cuisines: ' + unknown.map(x => `${x.id}:${x.cuisine}`).join(','));
});

test('time and servings are positive numbers', () => {
  const r = loadRecipes();
  for (const rec of r) {
    if (typeof rec.time !== 'number' || rec.time <= 0) throw new Error(`${rec.id}: bad time`);
    if (typeof rec.servings !== 'number' || rec.servings <= 0) throw new Error(`${rec.id}: bad servings`);
  }
});

test('ingredients and steps are non-empty arrays', () => {
  const r = loadRecipes();
  for (const rec of r) {
    if (!Array.isArray(rec.ingredients) || rec.ingredients.length === 0) throw new Error(`${rec.id}: bad ingredients`);
    if (!Array.isArray(rec.steps) || rec.steps.length === 0) throw new Error(`${rec.id}: bad steps`);
  }
});

test('27 Canadian recipes present', () => {
  const r = loadRecipes();
  const c = r.filter(x => x.cuisine === 'canadian');
  if (c.length < 27) throw new Error(`canadian = ${c.length}, want >= 27`);
});

test('beef-wellington-british and beef-wellington-french both exist', () => {
  const r = loadRecipes();
  const uk = r.find(x => x.id === 'beef-wellington-british');
  const fr = r.find(x => x.id === 'beef-wellington-french');
  if (!uk || !fr) throw new Error(`uk=${!!uk} fr=${!!fr}`);
  if (uk.cuisine !== 'british' || fr.cuisine !== 'french') throw new Error('cuisine mismatch');
});

test('no id spans multiple cuisines', () => {
  const r = loadRecipes();
  const groups = {};
  r.forEach(rec => { (groups[rec.id] = groups[rec.id] || []).push(rec); });
  for (const [id, arr] of Object.entries(groups)) {
    if (arr.length > 1) {
      const cuisines = new Set(arr.map(x => x.cuisine));
      if (cuisines.size > 1) throw new Error(`id "${id}" spans cuisines: ${[...cuisines].join(', ')}`);
    }
  }
});

test('24 cuisines total', () => {
  const r = loadRecipes();
  const c = new Set(r.map(x => x.cuisine).filter(Boolean));
  if (c.size !== 24) throw new Error(`cuisine count = ${c.size}, want 24`);
});

console.log(`\n=== ${pass} passed, ${fail} failed ===\n`);
process.exit(fail > 0 ? 1 : 0);