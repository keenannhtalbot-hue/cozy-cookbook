/* ============================================
   Cozy Cookbook — App Engine
   Vanilla JS, no frameworks
   ============================================ */

(function() {
'use strict';

// === GLOBAL ERROR TRAP ===
// Catch any uncaught error and surface it visibly so the app never silently fails.
window.__bootErrors = [];
window.addEventListener('error', function(ev) {
  try {
    var msg = (ev && ev.error && ev.error.message) || ev.message || 'Unknown error';
    var src = (ev && ev.filename) || '?';
    var line = (ev && ev.lineno) || 0;
    window.__bootErrors.push({msg: msg, src: src, line: line, stack: (ev.error && ev.error.stack) || ''});
    // If #root is empty, render a visible error
    var root = document.getElementById('root');
    if (root && (!root.innerHTML || root.innerHTML.length < 50)) {
      root.innerHTML = '<div class="screen" style="padding:24px"><div class="empty"><div class="empty-emoji">⚠️</div><h3 class="script">Uncaught error</h3><p style="font-family:monospace;font-size:12px;white-space:pre-wrap">' + msg + '\n\n' + (ev.error && ev.error.stack || '').substring(0, 800) + '</p></div></div>';
    }
  } catch(_){}
});
window.addEventListener('unhandledrejection', function(ev) {
  try {
    var reason = ev.reason || 'unknown';
    window.__bootErrors.push({msg: 'Promise: ' + (reason.message || reason), stack: reason.stack || ''});
  } catch(_){}
});

// === HELPERS ===
function $(sel) { return document.querySelector(sel); }
function $$(sel) { return Array.from(document.querySelectorAll(sel)); }

function el(tag, attrs, children) {
  var node = document.createElement(tag);
  if (attrs) for (var k in attrs) {
    if (!attrs.hasOwnProperty(k)) continue;
    if (k === 'class') node.className = attrs[k];
    else if (k === 'style' && typeof attrs[k] === 'object') {
      for (var s in attrs[k]) if (attrs[k].hasOwnProperty(s)) node.style[s] = attrs[k][s];
    } else if (k.indexOf('on') === 0 && typeof attrs[k] === 'function') {
      node.addEventListener(k.substring(2).toLowerCase(), attrs[k]);
    } else if (attrs[k] === false || attrs[k] === null) {
      // skip
    } else if (attrs[k] === true) {
      node.setAttribute(k, '');
    } else {
      node.setAttribute(k, attrs[k]);
    }
  }
  if (children !== undefined) {
    if (!Array.isArray(children)) children = [children];
    // Flatten nested arrays recursively (from .map() results, ternaries, etc.)
    function flatten(arr) {
      var out = [];
      arr.forEach(function(c) {
        if (c == null || c === false) return;
        if (Array.isArray(c)) {
          // Recursively flatten
          flatten(c).forEach(function(x) { out.push(x); });
        } else {
          out.push(c);
        }
      });
      return out;
    }
    children = flatten(children);
    children.forEach(function(c) {
      if (typeof c === 'string' || typeof c === 'number') {
        node.appendChild(document.createTextNode(String(c)));
      } else {
        node.appendChild(c);
      }
    });
  }
  return node;
}

function save(key, val) {
  try { localStorage.setItem('cc_' + key, JSON.stringify(val)); } catch(e) {}
}
function load(key, def) {
  try {
    var v = localStorage.getItem('cc_' + key);
    return v ? JSON.parse(v) : def;
  } catch(e) { return def; }
}

function loadProfileStore(key, legacyKey, fallback) {
  var stored = load(key, null);
  if (stored && typeof stored === 'object' && !Array.isArray(stored) && Object.keys(stored).length) {
    return stored;
  }

  var legacy = load(legacyKey, null);
  if (legacy == null) return fallback;
  if (Array.isArray(legacy)) return { p1: legacy };
  if (legacy && typeof legacy === 'object') {
    // Preserve an already profile-shaped legacy object.
    if (Object.keys(legacy).some(function(id) { return /^p\d+$/.test(id); })) return legacy;
    // Older meal plans were flat slot -> recipe maps.
    return { p1: legacy };
  }
  return fallback;
}

// === DATA NORMALIZATION ===
// The cookbook data contains both object ingredients and compact tuple
// ingredients, plus a few sparse/duplicate entries from the data generator.
// Normalize once at the boundary so every screen can rely on one safe shape.
function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'variant';
}

function normalizeIngredient(ingredient) {
  if (Array.isArray(ingredient)) {
    return {
      name: ingredient[0] == null ? '' : String(ingredient[0]),
      qty: ingredient[1] == null ? null : ingredient[1],
      unit: ingredient[2] == null ? '' : String(ingredient[2])
    };
  }
  if (ingredient && typeof ingredient === 'object') {
    return {
      name: ingredient.name == null ? '' : String(ingredient.name),
      qty: ingredient.qty == null ? null : ingredient.qty,
      unit: ingredient.unit == null ? '' : String(ingredient.unit)
    };
  }
  return { name: ingredient == null ? '' : String(ingredient), qty: null, unit: '' };
}

function normalizeRecipes(rawRecipes) {
  var usedIds = Object.create(null);
  var seenRecipes = Object.create(null);
  var normalized = [];

  (Array.isArray(rawRecipes) ? rawRecipes : []).forEach(function(recipe) {
    if (!recipe || typeof recipe !== 'object') return;

    var item = Object.assign({}, recipe);
    item.ingredients = (Array.isArray(recipe.ingredients) ? recipe.ingredients : [])
      .map(normalizeIngredient);
    item.steps = Array.isArray(recipe.steps) ? recipe.steps.slice() : [];
    item.tags = Array.isArray(recipe.tags) ? recipe.tags.slice() : [];

    var baseId = String(item.id || 'recipe-' + (normalized.length + 1));
    var fingerprint = JSON.stringify([
      item.name, item.cuisine, item.level, item.time, item.servings,
      item.ingredients, item.steps, item.nutrition, item.tags
    ]);

    // Drop exact duplicates, but preserve genuinely different recipes that
    // unfortunately share an old ID by assigning a stable variant ID.
    var recipeKey = baseId + '|' + fingerprint;
    if (seenRecipes[recipeKey]) return;
    seenRecipes[recipeKey] = true;

    var id = baseId;
    if (usedIds[id]) {
      var suffix = slugify(item.name);
      id = baseId + '-' + suffix;
      var n = 2;
      while (usedIds[id]) id = baseId + '-' + suffix + '-' + n++;
    }
    item.id = id;
    usedIds[id] = true;
    normalized.push(item);
  });

  return normalized;
}

window.RECIPES = normalizeRecipes(window.RECIPES);

// === STATE ===
var state = {
  mode: 'home', // home, browse, recipe, planner, shopping, favorites, search, cook
  cook: null,    // active cooking session
  profiles: load('profiles', [
    { id: 'p1', name: 'You', color: '#d4a5a5', level: 'picky' }
  ]),
  activeProfile: load('activeProfile', 'p1'),
  history: load('history', []),
  favorites: load('favorites', []), // legacy storage key
  favoritesByProfile: loadProfileStore('favoritesByProfile', 'favorites', {}),
  mealPlan: load('mealPlan', {}),    // legacy storage key
  mealPlanByProfile: loadProfileStore('mealPlanByProfile', 'mealPlan', {}),
  shopping: load('shopping', []),    // legacy storage key
  shoppingByProfile: loadProfileStore('shoppingByProfile', 'shopping', {}),
  filter: {
    cuisine: null,
    level: null,
    maxTime: null,
    q: ''
  },
  selectedRecipe: null,
  selectedDay: 'mon',
  selectedSlot: 'breakfast',
  contextRecipe: null,  // for shopping list add etc
  contextReturnMode: null
};

function currentProfile() {
  return state.profiles.find(function(p) { return p.id === state.activeProfile; }) || state.profiles[0];
}
function saveAll() {
  save('profiles', state.profiles);
  save('activeProfile', state.activeProfile);
  save('history', state.history);
  save('favorites', state.favorites);
  save('favoritesByProfile', state.favoritesByProfile);
  save('mealPlan', state.mealPlan);
  save('mealPlanByProfile', state.mealPlanByProfile);
  save('shopping', state.shopping);
  save('shoppingByProfile', state.shoppingByProfile);
}
function profileData(key) {
  // per-profile data lives under {profileId: {...}}
  if (!state[key + 'ByProfile']) state[key + 'ByProfile'] = {};
  return state[key + 'ByProfile'];
}

// === TOAST ===
var toastId = 0;
function showToast(msg, kind) {
  if (!kind) kind = 'info';
  var host = $('#toast-host');
  if (!host) return;
  var id = ++toastId;
  var t = el('div', { class: 'toast' }, msg);
  if (kind !== 'info') t.classList.add(kind);
  host.appendChild(t);
  setTimeout(function() {
    t.style.opacity = '0';
    setTimeout(function() { if (t.parentNode) t.parentNode.removeChild(t); }, 300);
  }, 2500);
}

// === SCREENS ===

function renderTopBar() {
  var profile = currentProfile();
  return el('header', { class: 'top-bar' }, [
    el('button', {
      class: 'brand',
      onclick: function() { setMode('home'); }
    }, [
      el('span', { class: 'brand-mark' }, '📖'),
      el('span', { class: 'script' }, 'Cozy Cookbook')
    ]),
    el('div', { class: 'actions', style: { display: 'flex', gap: '8px' } }, [
      state.mode !== 'home' ? el('button', {
        class: 'icon-btn',
        onclick: function() { setMode('home'); },
        title: 'Home'
      }, '🏠') : null,
      el('button', {
        class: 'profile-chip',
        onclick: function() { setMode('profile'); }
      }, [
        el('span', { class: 'avatar', style: { background: profile.color } }, profile.name.charAt(0)),
        el('span', { class: 'script' }, profile.name)
      ])
    ])
  ]);
}

function renderBottomNav() {
  var tabs = [
    { id: 'home', icon: '🏠', label: 'Home' },
    { id: 'browse', icon: '🌍', label: 'Browse' },
    { id: 'planner', icon: '📅', label: 'Plan' },
    { id: 'shopping', icon: '🛒', label: 'Shop' },
    { id: 'favorites', icon: '❤️', label: 'Favorites' }
  ];
  return el('nav', { class: 'bottom-nav', role: 'navigation' }, tabs.map(function(t) {
    return el('button', {
      class: 'nav-btn' + (state.mode === t.id ? ' active' : ''),
      onclick: function() { setMode(t.id); }
    }, [
      el('span', { class: 'icon' }, t.icon),
      el('span', { class: 'script' }, t.label)
    ]);
  }));
}

// === SCREEN: HOME ===
function renderHome() {
  var profile = currentProfile();
  var hour = new Date().getHours();
  var greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  var recentCooks = state.history.filter(function(h) { return h.profileId === profile.id; }).slice(0, 3);
  var profileFavs = (state.favoritesByProfile && state.favoritesByProfile[profile.id]) || [];

  var levelInfo = window.LEVELS[profile.level] || window.LEVELS.casual;

  return el('div', { class: 'screen' }, [
    el('div', { class: 'hero' }, [
      el('div', { class: 'hero-greeting' }, greeting + ', ' + profile.name),
      el('div', { class: 'hero-title' }, 'What shall we cook?'),
      el('div', { class: 'hero-subtitle' }, window.RECIPES.length + ' recipes · ' + profile.level.charAt(0).toUpperCase() + profile.level.slice(1) + ' level unlocked')
    ]),

    // Quick action tiles
    el('div', { class: 'grid-2' }, [
      el('button', {
        class: 'card',
        onclick: function() { setMode('browse'); },
        style: { background: 'linear-gradient(135deg, var(--sage-light), var(--cream-warm))', cursor: 'pointer', border: 'none', textAlign: 'left', color: 'var(--ink)' }
      }, [
        el('div', { style: { fontSize: '40px', marginBottom: '8px' } }, '🌍'),
        el('div', { class: 'recipe-title' }, 'Browse Recipes'),
        el('div', { class: 'recipe-meta' }, [
          el('span', { class: 'recipe-meta-pill' }, window.CUISINES.length + ' cuisines')
        ])
      ]),
      el('button', {
        class: 'card',
        onclick: function() { state.contextReturnMode = 'home'; setMode('search'); },
        style: { background: 'linear-gradient(135deg, var(--rose-light), var(--cream-warm))', cursor: 'pointer', border: 'none', textAlign: 'left', color: 'var(--ink)' }
      }, [
        el('div', { style: { fontSize: '40px', marginBottom: '8px' } }, '🔍'),
        el('div', { class: 'recipe-title' }, 'Search'),
        el('div', { class: 'recipe-meta' }, [
          el('span', { class: 'recipe-meta-pill' }, 'By name, ingredient, cuisine')
        ])
      ])
    ]),

    // Recent cooks
    recentCooks.length > 0 ? el('div', { class: 'section-title' }, [
      el('h2', { class: 'script' }, 'Recently Cooked'),
    ]) : null,
    recentCooks.length > 0 ? el('div', { class: 'stack' },
      recentCooks.map(function(h) {
        var r = window.RECIPES.find(function(x) { return x.id === h.recipeId; });
        if (!r) return null;
        return recipeCardCompact(r);
      }).filter(Boolean)
    ) : null,

    // Favorites preview
    profileFavs.length > 0 ? el('div', { class: 'section-title' }, [
      el('h2', { class: 'script' }, 'Your Favorites'),
    ]) : null,
    profileFavs.length > 0 ? el('div', { class: 'stack' },
      profileFavs.slice(0, 3).map(function(id) {
        var r = window.RECIPES.find(function(x) { return x.id === id; });
        if (!r) return null;
        return recipeCardCompact(r);
      }).filter(Boolean)
    ) : null,

    // Level info
    el('div', { class: 'section-title' }, [
      el('h2', { class: 'script' }, 'Your Level'),
    ]),
    el('button', {
      class: 'card',
      onclick: function() { setMode('levels'); },
      style: { width: '100%', cursor: 'pointer', border: 'none', textAlign: 'left', color: 'var(--ink)' }
    }, [
      el('div', { style: { display: 'flex', alignItems: 'center', gap: '16px' } }, [
        el('div', { style: { fontSize: '48px' } }, levelInfo.emoji),
        el('div', { style: { flex: 1 } }, [
          el('div', { class: 'script', style: { fontSize: '22px', fontWeight: '600' } }, levelInfo.name),
          el('div', { class: 'recipe-meta' }, [
            el('span', { style: { fontSize: '13px', color: 'var(--ink-mute)' } }, levelInfo.desc)
          ])
        ]),
        el('span', { style: { fontSize: '20px', color: 'var(--ink-mute)' } }, '›')
      ])
    ])
  ]);
}

// === SCREEN: BROWSE ===
function renderBrowse() {
  var profile = currentProfile();
  var recipes = filterRecipes();

  return el('div', { class: 'screen' }, [
    el('div', { class: 'page-title' }, 'Browse'),
    el('div', { class: 'page-subtitle' }, recipes.length + ' recipes match your filters'),

    // Cuisine filter chips
    el('div', { class: 'chip-row' }, [
      el('div', {
        class: 'chip' + (state.filter.cuisine == null ? ' active' : ''),
        onclick: function() { state.filter.cuisine = null; render(); }
      }, '🌍 All'),
      ...window.CUISINES.map(function(c) {
        return el('div', {
          class: 'chip' + (state.filter.cuisine === c.id ? ' active' : ''),
          onclick: function() { state.filter.cuisine = state.filter.cuisine === c.id ? null : c.id; render(); }
        }, c.emoji + ' ' + c.name);
      })
    ]),

    // Level filter
    el('div', { class: 'chip-row' }, [
      el('div', {
        class: 'chip' + (state.filter.level == null ? ' active' : ''),
        onclick: function() { state.filter.level = null; render(); }
      }, 'All levels'),
      ...Object.values(window.LEVELS).map(function(l) {
        return el('div', {
          class: 'chip' + (state.filter.level === l.id ? ' active' : ''),
          onclick: function() { state.filter.level = state.filter.level === l.id ? null : l.id; render(); }
        }, l.emoji + ' ' + l.name);
      })
    ]),

    // Time filter
    el('div', { class: 'chip-row' }, [
      el('div', {
        class: 'chip' + (state.filter.maxTime == null ? ' active' : ''),
        onclick: function() { state.filter.maxTime = null; render(); }
      }, 'Any time'),
      el('div', {
        class: 'chip' + (state.filter.maxTime === 30 ? ' active' : ''),
        onclick: function() { state.filter.maxTime = state.filter.maxTime === 30 ? null : 30; render(); }
      }, '⚡ ≤30 min'),
      el('div', {
        class: 'chip' + (state.filter.maxTime === 60 ? ' active' : ''),
        onclick: function() { state.filter.maxTime = state.filter.maxTime === 60 ? null : 60; render(); }
      }, '⏱ ≤1 hour'),
      el('div', {
        class: 'chip' + (state.filter.maxTime === 120 ? ' active' : ''),
        onclick: function() { state.filter.maxTime = state.filter.maxTime === 120 ? null : 120; render(); }
      }, '🕐 ≤2 hours')
    ]),

    // Search shortcut
    el('button', {
      class: 'card',
      onclick: function() { state.contextReturnMode = 'browse'; setMode('search'); },
      style: { width: '100%', cursor: 'pointer', border: 'none', textAlign: 'left', color: 'var(--ink)', marginTop: '4px', marginBottom: '8px' }
    }, [
      el('div', { style: { display: 'flex', alignItems: 'center', gap: '12px' } }, [
        el('span', { style: { fontSize: '20px' } }, '🔍'),
        el('span', { style: { color: 'var(--ink-mute)' } }, 'Search by ingredient or name...')
      ])
    ]),

    // Results
    recipes.length === 0
      ? el('div', { class: 'empty' }, [
          el('div', { class: 'empty-emoji' }, '🍽'),
          el('h3', { class: 'script' }, 'No recipes found'),
          el('p', {}, 'Try changing your filters')
        ])
      : el('div', { class: 'grid-2' },
          recipes.map(function(r) { return recipeCard(r); })
        )
  ]);
}

function filterRecipes() {
  var profile = currentProfile();
  var levelOrder = ['picky', 'casual', 'home', 'advanced', 'master'];
  var profileLevelIdx = levelOrder.indexOf(profile.level);
  var q = state.filter.q.toLowerCase().trim();

  return window.RECIPES.filter(function(r) {
    // Level: only show recipes at or below profile level
    var rLevelIdx = levelOrder.indexOf(r.level);
    if (rLevelIdx > profileLevelIdx) return false;

    // Cuisine filter
    if (state.filter.cuisine && r.cuisine !== state.filter.cuisine) return false;

    // Level filter
    if (state.filter.level && r.level !== state.filter.level) return false;

    // Time filter
    if (state.filter.maxTime && r.time > state.filter.maxTime) return false;

    // Search query
    if (q) {
      var inName = r.name.toLowerCase().indexOf(q) >= 0;
      var inCuisine = (window.CUISINES.find(function(c){return c.id===r.cuisine;}) || { name: '' }).name.toLowerCase().indexOf(q) >= 0;
      var inIng = r.ingredients.some(function(i) { return i.name.toLowerCase().indexOf(q) >= 0; });
      var inTag = (r.tags || []).some(function(t) { return t.toLowerCase().indexOf(q) >= 0; });
      if (!inName && !inCuisine && !inIng && !inTag) return false;
    }

    return true;
  });
}

// === Recipe card ===
function recipeCard(r) {
  var cuisine = window.CUISINES.find(function(c) { return c.id === r.cuisine; }) || { name: r.cuisine, emoji: '🍽' };
  var level = window.LEVELS[r.level] || { name: r.level, emoji: '' };

  // Detect dietary tags from ingredients (no API data — derive on the fly)
  var allIngNames = (r.ingredients || []).map(function(i) { return i.name.toLowerCase(); }).join(' ');
  var isVegetarian = !/(chicken|beef|pork|lamb|bacon|ham|sausage|turkey|fish|salmon|tuna|shrimp|crab|lobster|squid|octopus|mussel|clam|anchovy|sardine|duck|chorizo|pepperoni|salami|prosciutto|pancetta|guanciale|guanciale|bresaola)/.test(allIngNames);
  var isVegan = isVegetarian && !/(egg|milk|butter|cheese|cream|yogurt|honey|parmesan|feta|mozzarella|ricotta|mascarpone|cheddar|gruyere|ghee)/.test(allIngNames);

  // Detect keto (high fat, low carb): < 30g carbs and > 50% calories from fat
  var n = r.nutrition || {};
  var fatCal = (n.fat || 0) * 9;
  var totalCal = n.calories || 1;
  var isKeto = (n.carbs || 99) < 30 && (fatCal / totalCal) > 0.5;

  // Detect spicy level: count chili-family ingredients + tags
  var spicyHits = (allIngNames.match(/(chili|chile|chilli|jalape[ñn]o|habanero|serrano|cayenne|tabasco|sriracha|harissa|gochujang|gochugaru|wasabi|cayenne|chipotle|aji|cambodian|piri piri|bird.?s eye|scotch bonnet|thai chili|bang)/g) || []).length;
  var spiceLevel = spicyHits >= 3 ? 3 : spicyHits >= 1 ? 2 : 0;
  // Tag override
  if ((r.tags || []).indexOf('extra-spicy') >= 0) spiceLevel = 3;
  else if ((r.tags || []).indexOf('spicy') >= 0 && spiceLevel < 2) spiceLevel = 2;
  var pepperIcons = spiceLevel > 0 ? '🌶'.repeat(spiceLevel) : '';

  // Build diet badges
  var dietBadges = [];
  if (isVegan) dietBadges.push('🌱 Vegan');
  else if (isVegetarian) dietBadges.push('🌿 Veg');
  if (isKeto) dietBadges.push('K Keto');

  // Build diet pill class set (auto-color via CSS based on text)
  var dietPill = function(text) {
    var cls = 'recipe-meta-pill';
    if (text.indexOf('Vegan') >= 0) cls += ' vegan';
    else if (text.indexOf('Veg') >= 0) cls += ' veg';
    else if (text.indexOf('Keto') >= 0) cls += ' keto';
    return el('span', { class: cls }, text);
  };

  return el('div', {
    class: 'recipe-card',
    onclick: function() { openRecipe(r.id); }
  }, [
    el('div', { class: 'recipe-thumb' }, [
      cuisine.emoji,
      dietBadges.length > 0
        ? el('div', { class: 'thumb-badges' },
            dietBadges.map(function(b) {
              return el('span', { class: 'thumb-badge' }, b.split(' ')[0]);
            })
          )
        : null,
      pepperIcons
        ? el('div', { class: 'thumb-spice' }, pepperIcons)
        : null
    ]),
    el('div', { class: 'recipe-title' }, r.name),
    el('div', { class: 'recipe-meta' }, [
      el('span', { class: 'recipe-meta-pill' }, '⏱ ' + r.time + 'm'),
      el('span', { class: 'recipe-meta-pill' }, '🍽 ' + r.servings)
    ]),
    el('div', { class: 'recipe-meta' }, [
      el('span', { class: 'recipe-meta-pill level-pill' }, level.emoji + ' ' + level.name),
      el('span', { class: 'recipe-meta-pill cuisine-pill' }, cuisine.emoji + ' ' + cuisine.name),
      dietBadges.length > 0 ? dietPill(dietBadges.join(' · ')) : null,
      pepperIcons ? el('span', { class: 'recipe-meta-pill spice-pill', title: 'Spicy level: ' + spiceLevel + '/3' }, pepperIcons) : null
    ])
  ]);
}

function recipeCardCompact(r) {
  var cuisine = window.CUISINES.find(function(c) { return c.id === r.cuisine; }) || { name: r.cuisine, emoji: '🍽' };
  return el('div', {
    class: 'recipe-card',
    onclick: function() { openRecipe(r.id); },
    style: { flexDirection: 'row', alignItems: 'center' }
  }, [
    el('div', { style: { fontSize: '32px', flexShrink: 0 } }, cuisine.emoji),
    el('div', { style: { flex: 1 } }, [
      el('div', { class: 'recipe-title', style: { fontSize: '16px' } }, r.name),
      el('div', { class: 'recipe-meta' }, [
        el('span', { class: 'recipe-meta-pill' }, '⏱ ' + r.time + 'm'),
        el('span', { class: 'recipe-meta-pill' }, cuisine.name)
      ])
    ]),
    el('span', { style: { fontSize: '20px', color: 'var(--ink-mute)' } }, '›')
  ]);
}

// === SCREEN: RECIPE DETAIL ===
function openRecipe(id) {
  if (!id) {
    console.warn('openRecipe called without an id');
    showToast('That recipe could not be opened');
    return;
  }
  state.selectedRecipe = id;
  state.contextReturnMode = state.mode;
  setMode('recipe');
}

function renderRecipe() {
  var r = window.RECIPES.find(function(x) { return x.id === state.selectedRecipe; });
  if (!r) {
    // Defensive: a stale id (e.g. from a cached favorites list referencing a
    // recipe that was renamed or removed) should not leave the user stranded
    // on a screen with a single thinking-face emoji.
    console.warn('Recipe not found in RECIPES:', state.selectedRecipe);
    return el('div', { class: 'screen' }, [
      el('div', { class: 'empty' }, [
        el('div', { class: 'empty-emoji' }, '🍳'),
        el('h3', {}, 'Recipe not found'),
        el('p', {}, 'This recipe may have been removed in a recent update, or your saved version is out of date.'),
        el('button', {
          class: 'btn btn-primary',
          style: { marginTop: '16px' },
          onclick: function() { setMode('browse'); }
        }, '← Back to Browse')
      ])
    ]);
  }

  var cuisine = window.CUISINES.find(function(c) { return c.id === r.cuisine; }) || { name: r.cuisine, emoji: '🍽' };
  var level = window.LEVELS[r.level] || { name: r.level, emoji: '' };
  var profile = currentProfile();
  var favs = (state.favoritesByProfile && state.favoritesByProfile[profile.id]) || [];
  var isFav = favs.indexOf(r.id) >= 0;

  return el('div', { class: 'screen' }, [
    el('div', { class: 'recipe-hero' }, [cuisine.emoji]),

    el('h1', { style: { marginTop: '4px' } }, r.name),
    el('div', { class: 'recipe-meta', style: { marginTop: '8px' } }, [
      el('span', { class: 'recipe-meta-pill veg' }, level.emoji + ' ' + level.name),
      el('span', { class: 'recipe-meta-pill rose' }, cuisine.emoji + ' ' + cuisine.name),
      el('span', { class: 'recipe-meta-pill gold' }, '⏱ ' + r.time + ' min'),
      el('span', { class: 'recipe-meta-pill' }, '🍽 serves ' + r.servings)
    ]),

    // Nutrition
    r.nutrition ? el('div', { class: 'recipe-section' }, [
      el('h3', { class: 'script' }, 'Nutrition (per serving)'),
      el('div', { class: 'nutrition-grid' }, [
        nutritionCell(r.nutrition.calories, 'cal'),
        nutritionCell(r.nutrition.protein, 'g protein'),
        nutritionCell(r.nutrition.carbs, 'g carbs'),
        nutritionCell(r.nutrition.fat, 'g fat')
      ])
    ]) : null,

    // Ingredients
    el('div', { class: 'recipe-section' }, [
      el('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' } }, [
        el('h3', { class: 'script', style: { margin: 0 } }, 'Ingredients'),
        el('button', {
          class: 'section-action',
          onclick: function() { addToShoppingList(r); }
        }, '+ Shopping list')
      ]),
      el('ul', { class: 'ingredient-list' },
        r.ingredients.map(function(ing) {
          return el('li', {}, [
            el('span', { style: { flex: 1 } }, ing.name),
            el('span', { style: { color: 'var(--ink-mute)', fontSize: '13px' } },
              (ing.qty ? formatQty(ing.qty) : '') + ' ' + (ing.unit || '')
            )
          ]);
        })
      )
    ]),

    // Steps
    el('div', { class: 'recipe-section' }, [
      el('h3', { class: 'script' }, 'Steps'),
      el('ol', { class: 'step-list' },
        r.steps.map(function(step) {
          return el('li', {}, step);
        })
      )
    ]),

    // Action buttons
    el('div', { class: 'recipe-section', style: { display: 'flex', flexDirection: 'column', gap: '12px' } }, [
      el('button', {
        class: 'btn btn-primary',
        style: { width: '100%' },
        onclick: function() { startCooking(r); }
      }, '👨‍🍳 Start Cooking'),

      el('div', { style: { display: 'flex', gap: '8px' } }, [
        el('button', {
          class: 'btn btn-secondary',
          style: { flex: 1 },
          onclick: function() { toggleFavorite(r.id); }
        }, isFav ? '❤️ Saved' : '🤍 Save'),

        el('button', {
          class: 'btn btn-secondary',
          style: { flex: 1 },
          onclick: function() { addToMealPlan(r); }
        }, '📅 Plan')
      ])
    ])
  ]);
}

function nutritionCell(val, label) {
  return el('div', { class: 'nutrition-item' }, [
    el('div', { class: 'nutrition-value' }, val),
    el('div', { class: 'nutrition-label' }, label)
  ]);
}

function formatQty(n) {
  if (Number.isInteger(n)) return String(n);
  if (n === 0.25) return '¼';
  if (n === 0.5) return '½';
  if (n === 0.75) return '¾';
  if (n === 1.5) return '1.5';
  return String(n);
}

function toggleFavorite(id) {
  var profile = currentProfile();
  if (!state.favoritesByProfile) state.favoritesByProfile = {};
  if (!state.favoritesByProfile[profile.id]) state.favoritesByProfile[profile.id] = [];
  var favs = state.favoritesByProfile[profile.id];
  var idx = favs.indexOf(id);
  if (idx >= 0) {
    favs.splice(idx, 1);
    showToast('Removed from favorites');
  } else {
    favs.push(id);
    showToast('Added to favorites ❤️');
  }
  save('favoritesByProfile', state.favoritesByProfile);
  render();
}

// === SCREEN: COOK MODE ===
function startCooking(r) {
  state.cook = {
    recipeId: r.id,
    step: 0,
    timer: null,
    timerEnd: null,
    timerOriginal: null
  };
  setMode('cook');
}

function renderCook() {
  var r = window.RECIPES.find(function(x) { return x.id === state.cook.recipeId; });
  if (!r) {
    console.warn('Cook session references missing recipe:', state.cook.recipeId);
    showToast('That recipe is no longer available');
    state.cook = null;
    setMode('home');
    return el('div', {});
  }

  var stepIdx = state.cook.step;
  var total = r.steps.length;
  var isLast = stepIdx === total - 1;
  var isFirst = stepIdx === 0;

  return el('div', { class: 'cook-screen' }, [
    el('div', { class: 'cook-header' }, [
      el('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' } }, [
        el('button', {
          class: 'icon-btn',
          onclick: function() {
            if (state.cook.timer) clearInterval(state.cook.timer);
            state.cook = null;
            setMode(state.contextReturnMode || 'home');
          },
          title: 'Exit cooking mode'
        }, '✕'),
        el('div', { class: 'script', style: { fontSize: '15px', color: 'var(--ink-mute)' } },
          'Step ' + (stepIdx + 1) + ' of ' + total),
        el('div', { style: { width: '40px' } })
      ]),
      el('div', { style: { marginTop: '8px' } }, [
        el('div', { style: { fontSize: '11px', color: 'var(--ink-mute)', textTransform: 'uppercase', letterSpacing: '0.1em' } }, r.name)
      ])
    ]),

    el('div', { class: 'cook-body' }, [
      el('div', { class: 'step-number' }, 'Step ' + (stepIdx + 1)),
      el('div', { class: 'step-text' }, r.steps[stepIdx]),

      // Timer button — parses "X minutes" from step text
      stepHasTime(r.steps[stepIdx]) && !state.cook.timer ? el('button', {
        class: 'cook-timer',
        onclick: function() { startTimerForStep(r.steps[stepIdx]); }
      }, [
        '⏱',
        el('span', {}, extractTimeMinutes(r.steps[stepIdx]) + ':00')
      ]) : null,

      // Active timer
      state.cook.timer ? el('button', {
        class: 'cook-timer running',
        onclick: function() { cancelTimer(); }
      }, [
        '⏱',
        el('span', {}, formatTimer(state.cook.timerEnd - Date.now()))
      ]) : null,

      // Progress dots
      el('div', { style: { display: 'flex', gap: '6px', justifyContent: 'center', marginTop: '32px' } },
        r.steps.map(function(_, i) {
          return el('div', {
            style: {
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              background: i <= stepIdx ? 'var(--rose)' : 'rgba(168, 181, 160, 0.3)',
              transition: 'all 200ms'
            }
          });
        })
      )
    ]),

    el('div', { class: 'cook-footer' }, [
      el('button', {
        class: 'btn btn-ghost',
        onclick: function() {
          if (!isFirst) {
            state.cook.step--;
            render();
          }
        },
        disabled: isFirst,
        style: isFirst ? { opacity: 0.3 } : {}
      }, '← Back'),

      isLast ? el('button', {
        class: 'btn btn-primary',
        onclick: function() { finishCooking(r); }
      }, '✓ Done!') : el('button', {
        class: 'btn btn-primary',
        onclick: function() { state.cook.step++; render(); }
      }, 'Next →')
    ])
  ]);
}

function stepHasTime(step) {
  return /\d+(?:\.\d+)?\s*(min(?:ute)?s?|hours?|hrs?|seconds?|secs?)/i.test(step);
}

function extractTimeMinutes(step) {
  var hourMatch = step.match(/(\d+(?:\.\d+)?)\s*(?:hours?|hrs?)/i);
  var minuteMatch = step.match(/(\d+(?:\.\d+)?)\s*(?:minutes?|mins?)/i);
  var secondMatch = step.match(/(\d+(?:\.\d+)?)\s*(?:seconds?|secs?)/i);
  var minutes = 0;
  if (hourMatch) minutes += parseFloat(hourMatch[1]) * 60;
  if (minuteMatch) minutes += parseFloat(minuteMatch[1]);
  if (secondMatch) minutes += parseFloat(secondMatch[1]) / 60;
  if (minutes > 0) return Math.max(1, Math.ceil(minutes));
  return 5;
}

function startTimerForStep(step) {
  var minutes = extractTimeMinutes(step);
  state.cook.timerEnd = Date.now() + minutes * 60 * 1000;
  state.cook.timerOriginal = minutes * 60 * 1000;
  state.cook.timer = setInterval(function() {
    var remaining = state.cook.timerEnd - Date.now();
    if (remaining <= 0) {
      clearInterval(state.cook.timer);
      state.cook.timer = null;
      showToast('⏰ Timer done!', 'success');
      if ('vibrate' in navigator) navigator.vibrate(200);
      render();
    } else {
      render();
    }
  }, 1000);
  render();
}

function cancelTimer() {
  if (state.cook.timer) clearInterval(state.cook.timer);
  state.cook.timer = null;
  state.cook.timerEnd = null;
  state.cook.timerOriginal = null;
  render();
}

function formatTimer(ms) {
  if (ms <= 0) return '0:00';
  var s = Math.floor(ms / 1000);
  var m = Math.floor(s / 60);
  var sec = s % 60;
  return m + ':' + (sec < 10 ? '0' : '') + sec;
}

function finishCooking(r) {
  var profile = currentProfile();
  state.history.unshift({
    profileId: profile.id,
    recipeId: r.id,
    ts: Date.now()
  });
  state.history = state.history.slice(0, 30);
  save('history', state.history);
  if (state.cook && state.cook.timer) clearInterval(state.cook.timer);
  state.cook = null;
  showToast('🎉 Cooked ' + r.name, 'success');
  setMode(state.contextReturnMode || 'home');
}

// === SCREEN: SEARCH ===
function renderSearch() {
  return el('div', { class: 'screen' }, [
    el('div', { class: 'page-title' }, 'Search'),
    el('div', { class: 'page-subtitle' }, 'Find recipes by name, ingredient, or cuisine'),

    el('input', {
      type: 'search',
      placeholder: 'Try "chicken", "tomato", "Italian"...',
      value: state.filter.q,
      oninput: function(e) { state.filter.q = e.target.value; renderResultsOnly(); },
      autofocus: true
    }),

    el('div', { id: 'search-results', style: { marginTop: '16px' } },
      renderSearchResults()
    )
  ]);
}

function renderSearchResults() {
  var recipes = filterRecipes();
  if (!state.filter.q.trim()) {
    return el('div', { class: 'empty' }, [
      el('div', { class: 'empty-emoji' }, '🔍'),
      el('h3', { class: 'script' }, 'Start typing to search'),
      el('p', {}, 'Search by recipe name, ingredient, cuisine, or tag')
    ]);
  }
  if (recipes.length === 0) {
    return el('div', { class: 'empty' }, [
      el('div', { class: 'empty-emoji' }, '🍽'),
      el('h3', { class: 'script' }, 'No matches'),
      el('p', {}, 'Try a different search')
    ]);
  }
  return el('div', { class: 'grid-2' }, recipes.map(function(r) { return recipeCard(r); }));
}

function renderResultsOnly() {
  var r = $('#search-results');
  if (r) {
    var newContent = renderSearchResults();
    r.innerHTML = '';
    newContent.childNodes.forEach(function(c) { r.appendChild(c); });
  }
}

// === SCREEN: FAVORITES ===
function renderFavorites() {
  var profile = currentProfile();
  var favs = (state.favoritesByProfile && state.favoritesByProfile[profile.id]) || [];
  var recipes = favs.map(function(id) { return window.RECIPES.find(function(r) { return r.id === id; }); }).filter(Boolean);

  return el('div', { class: 'screen' }, [
    el('div', { class: 'page-title' }, 'Favorites'),
    el('div', { class: 'page-subtitle' }, recipes.length + ' saved by ' + profile.name),

    recipes.length === 0 ? el('div', { class: 'empty' }, [
      el('div', { class: 'empty-emoji' }, '❤️'),
      el('h3', { class: 'script' }, 'No favorites yet'),
      el('p', {}, 'Tap the heart on any recipe to save it here')
    ]) : el('div', { class: 'stack' },
      recipes.map(function(r) { return recipeCard(r); })
    )
  ]);
}

// === SCREEN: PLANNER ===
var DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
var DAY_NAMES = { mon: 'Mon', tue: 'Tue', wed: 'Wed', thu: 'Thu', fri: 'Fri', sat: 'Sat', sun: 'Sun' };
var SLOTS = ['breakfast', 'lunch', 'dinner'];
var SLOT_EMOJI = { breakfast: '🌅', lunch: '☀️', dinner: '🌙' };

function renderPlanner() {
  var profile = currentProfile();
  if (!state.mealPlanByProfile) state.mealPlanByProfile = {};
  if (!state.mealPlanByProfile[profile.id]) state.mealPlanByProfile[profile.id] = {};
  var plan = state.mealPlanByProfile[profile.id];
  var selectedDay = state.selectedDay;

  return el('div', { class: 'screen' }, [
    el('div', { class: 'page-title' }, 'Meal Plan'),
    el('div', { class: 'page-subtitle' }, 'Tap a slot, then pick a recipe'),

    el('div', { style: { display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '12px' } },
      DAYS.map(function(d) {
        return el('button', {
          class: 'chip' + (state.selectedDay === d ? ' active' : ''),
          onclick: function() { state.selectedDay = d; render(); }
        }, DAY_NAMES[d]);
      })
    ),

    el('div', { style: { display: 'flex', flexDirection: 'column', gap: '12px' } },
      SLOTS.map(function(slot) {
        var recipeId = plan[selectedDay + '-' + slot];
        var r = recipeId ? window.RECIPES.find(function(x) { return x.id === recipeId; }) : null;
        return el('div', { class: 'card' }, [
          el('div', { style: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: r ? '12px' : '0' } }, [
            el('div', { style: { fontSize: '24px' } }, SLOT_EMOJI[slot]),
            el('div', { style: { flex: 1 } }, [
              el('div', { class: 'script', style: { fontSize: '18px', fontWeight: '600' } },
                slot.charAt(0).toUpperCase() + slot.slice(1))
            ]),
            r ? el('button', {
              class: 'btn btn-ghost',
              onclick: function() { delete plan[selectedDay + '-' + slot]; save('mealPlanByProfile', state.mealPlanByProfile); render(); }
            }, '✕') : null
          ]),
          r ? el('div', {
            style: { cursor: 'pointer', padding: '8px', background: 'var(--cream-warm)', borderRadius: 'var(--r-sm)' },
            onclick: function() { openRecipe(r.id); }
          }, [
            el('div', { style: { fontSize: '14px', fontWeight: '600' } }, r.name),
            el('div', { class: 'recipe-meta', style: { marginTop: '4px' } }, [
              el('span', { class: 'recipe-meta-pill' }, '⏱ ' + r.time + 'm'),
              el('span', { class: 'recipe-meta-pill' }, '🍽 ' + r.servings)
            ])
          ]) : el('button', {
            class: 'btn btn-secondary',
            style: { width: '100%' },
            onclick: function() {
              state.contextRecipe = { day: selectedDay, slot: slot };
              setMode('recipe-picker');
            }
          }, '+ Pick recipe')
        ]);
      })
    ),

    // Generate shopping list for the week
    el('div', { style: { marginTop: '24px' } }, [
      el('button', {
        class: 'btn btn-primary',
        style: { width: '100%' },
        onclick: function() { generateWeekShoppingList(); }
      }, '🛒 Generate shopping list for this week')
    ])
  ]);
}

function addToMealPlan(r) {
  if (!state.contextRecipe) {
    state.contextRecipe = { day: state.selectedDay, slot: 'dinner' };
  }
  var profile = currentProfile();
  if (!state.mealPlanByProfile) state.mealPlanByProfile = {};
  if (!state.mealPlanByProfile[profile.id]) state.mealPlanByProfile[profile.id] = {};
  var plan = state.mealPlanByProfile[profile.id];
  plan[state.contextRecipe.day + '-' + state.contextRecipe.slot] = r.id;
  save('mealPlanByProfile', state.mealPlanByProfile);
  showToast('Added to ' + DAY_NAMES[state.contextRecipe.day] + ' ' + state.contextRecipe.slot);
  setMode('planner');
}

// === SCREEN: RECIPE PICKER (for planner) ===
function renderRecipePicker() {
  var recipes = filterRecipes();
  return el('div', { class: 'screen' }, [
    el('div', { class: 'page-title' }, 'Pick a Recipe'),
    el('div', { class: 'page-subtitle' }, 'Adding to ' + DAY_NAMES[state.contextRecipe.day] + ' ' + state.contextRecipe.slot),

    el('div', { class: 'stack' },
      recipes.map(function(r) {
        var cuisine = window.CUISINES.find(function(c) { return c.id === r.cuisine; }) || { name: '', emoji: '' };
        return el('div', {
          class: 'recipe-card',
          onclick: function() { addToMealPlan(r); }
        }, [
          el('div', { style: { display: 'flex', alignItems: 'center', gap: '12px' } }, [
            el('div', { style: { fontSize: '32px' } }, cuisine.emoji),
            el('div', { style: { flex: 1 } }, [
              el('div', { class: 'recipe-title' }, r.name),
              el('div', { class: 'recipe-meta' }, [
                el('span', { class: 'recipe-meta-pill' }, '⏱ ' + r.time + 'm')
              ])
            ]),
            el('span', { style: { fontSize: '20px', color: 'var(--rose)' } }, '+')
          ])
        ]);
      })
    )
  ]);
}

// === SCREEN: SHOPPING ===
function renderShopping() {
  var profile = currentProfile();
  var items = (state.shoppingByProfile && state.shoppingByProfile[profile.id]) || [];

  return el('div', { class: 'screen' }, [
    el('div', { class: 'page-title' }, 'Shopping List'),
    el('div', { class: 'page-subtitle' }, items.length + ' items · ' + profile.name),

    items.length === 0 ? el('div', { class: 'empty' }, [
      el('div', { class: 'empty-emoji' }, '🛒'),
      el('h3', { class: 'script' }, 'Empty list'),
      el('p', {}, 'Open a recipe and tap "Add to shopping list", or generate from your meal plan')
    ]) : el('div', {},
      items.map(function(item, i) {
        return el('div', {
          class: 'shopping-item' + (item.checked ? ' checked' : ''),
          onclick: function() {
            items[i].checked = !items[i].checked;
            save('shoppingByProfile', state.shoppingByProfile);
            render();
          }
        }, [
          el('input', {
            type: 'checkbox',
            checked: item.checked,
            onchange: function(e) { e.stopPropagation(); }
          }),
          el('span', { style: { flex: 1 } }, item.name),
          el('span', { style: { color: 'var(--ink-mute)', fontSize: '13px' } }, item.amount || '')
        ]);
      }),

      el('div', { style: { marginTop: '16px', display: 'flex', gap: '8px' } }, [
        el('button', {
          class: 'btn btn-secondary',
          style: { flex: 1 },
          onclick: function() {
            items.forEach(function(it) { it.checked = !it.checked; });
            save('shoppingByProfile', state.shoppingByProfile);
            render();
          }
        }, 'Toggle all'),
        el('button', {
          class: 'btn btn-secondary',
          style: { flex: 1 },
          onclick: function() { clearCheckedItems(); }
        }, 'Clear checked')
      ]),

      el('button', {
        class: 'btn btn-ghost',
        style: { width: '100%', marginTop: '12px', color: 'var(--var-red, #ff3838)' },
        onclick: function() {
          if (confirm('Clear entire shopping list?')) {
            state.shoppingByProfile[profile.id] = [];
            save('shoppingByProfile', state.shoppingByProfile);
            render();
          }
        }
      }, 'Clear all')
    )
  ]);
}

function clearCheckedItems() {
  var profile = currentProfile();
  var items = (state.shoppingByProfile && state.shoppingByProfile[profile.id]) || [];
  state.shoppingByProfile[profile.id] = items.filter(function(i) { return !i.checked; });
  save('shoppingByProfile', state.shoppingByProfile);
  render();
}

function addToShoppingList(r) {
  var profile = currentProfile();
  if (!state.shoppingByProfile) state.shoppingByProfile = {};
  if (!state.shoppingByProfile[profile.id]) state.shoppingByProfile[profile.id] = [];

  var items = state.shoppingByProfile[profile.id];
  var added = 0;
  r.ingredients.forEach(function(ing) {
    var key = ing.name.toLowerCase();
    var existing = items.find(function(it) { return it.name.toLowerCase() === key; });
    var amount = (ing.qty ? formatQty(ing.qty) : '') + ' ' + (ing.unit || '');
    if (existing) {
      // don't duplicate
    } else {
      items.push({ name: ing.name, amount: amount, checked: false });
      added++;
    }
  });

  save('shoppingByProfile', state.shoppingByProfile);
  showToast(added + ' items added to shopping list');
}

function generateWeekShoppingList() {
  var profile = currentProfile();
  if (!state.mealPlanByProfile || !state.mealPlanByProfile[profile.id]) {
    showToast('No meals planned this week');
    return;
  }
  var plan = state.mealPlanByProfile[profile.id];
  var recipeIds = Object.values(plan);
  var recipes = recipeIds.map(function(id) { return window.RECIPES.find(function(r) { return r.id === id; }); }).filter(Boolean);

  if (recipes.length === 0) {
    showToast('No meals planned this week');
    return;
  }

  if (!state.shoppingByProfile) state.shoppingByProfile = {};
  if (!state.shoppingByProfile[profile.id]) state.shoppingByProfile[profile.id] = [];

  var items = state.shoppingByProfile[profile.id];
  recipes.forEach(function(r) {
    r.ingredients.forEach(function(ing) {
      var key = ing.name.toLowerCase();
      var existing = items.find(function(it) { return it.name.toLowerCase() === key; });
      var amount = (ing.qty ? formatQty(ing.qty) : '') + ' ' + (ing.unit || '');
      if (!existing) items.push({ name: ing.name, amount: amount, checked: false });
    });
  });

  save('shoppingByProfile', state.shoppingByProfile);
  showToast(recipes.length + ' recipes added to shopping');
  setMode('shopping');
}

// === SCREEN: PROFILE ===
function renderProfile() {
  return el('div', { class: 'screen' }, [
    el('div', { class: 'page-title' }, 'Profiles'),
    el('div', { class: 'page-subtitle' }, 'Each person has their own level, favorites, and history'),

    el('div', { class: 'profile-grid' },
      state.profiles.map(function(p) {
        var level = window.LEVELS[p.level] || window.LEVELS.casual;
        var isActive = p.id === state.activeProfile;
        return el('div', {
          class: 'profile-card',
          style: isActive ? { borderColor: 'var(--sage)' } : {},
          onclick: function() { state.activeProfile = p.id; save('activeProfile', p.id); render(); }
        }, [
          el('div', { class: 'avatar-lg', style: { background: p.color } }, p.name.charAt(0)),
          el('div', { style: { fontWeight: '700', fontSize: '16px' } }, p.name),
          el('div', { class: 'level' }, level.emoji + ' ' + level.name)
        ]);
      })
    ),

    el('button', {
      class: 'btn btn-secondary',
      style: { width: '100%', marginTop: '16px' },
      onclick: function() { addProfile(); }
    }, '+ Add profile'),

    el('div', { class: 'section-title' }, [el('h2', { class: 'script' }, 'Manage Profile')]),
    el('button', {
      class: 'btn btn-secondary',
      style: { width: '100%' },
      onclick: function() { setMode('levels'); }
    }, '⚙️ Change cooking level'),

    state.profiles.length > 1 ? el('button', {
      class: 'btn btn-ghost',
      style: { width: '100%', marginTop: '8px', color: 'var(--var-red, #ff3838)' },
      onclick: function() {
        if (confirm('Delete this profile?')) deleteProfile();
      }
    }, '🗑 Delete this profile') : null
  ]);
}

function addProfile() {
  var name = prompt('Profile name?');
  if (!name) return;
  var colors = ['#d4a5a5', '#a8b5a0', '#c9a961', '#b88787', '#8a9c84', '#e0c886'];
  state.profiles.push({
    id: 'p' + Date.now(),
    name: name.charAt(0).toUpperCase() + name.slice(1),
    color: colors[state.profiles.length % colors.length],
    level: 'picky'
  });
  saveAll();
  render();
}

function deleteProfile() {
  var profile = currentProfile();
  state.profiles = state.profiles.filter(function(p) { return p.id !== profile.id; });
  state.activeProfile = state.profiles[0].id;
  saveAll();
  render();
}

// === SCREEN: LEVELS ===
function renderLevels() {
  var profile = currentProfile();

  return el('div', { class: 'screen' }, [
    el('div', { class: 'page-title' }, 'Cooking Level'),
    el('div', { class: 'page-subtitle' }, 'Higher levels unlock more complex recipes'),

    Object.values(window.LEVELS).map(function(l) {
      var isCurrent = l.id === profile.level;
      return el('div', {
        class: 'level-card' + (isCurrent ? ' selected' : ''),
        onclick: function() {
          profile.level = l.id;
          saveAll();
          showToast('Level set to ' + l.name);
          render();
        }
      }, [
        el('div', { class: 'level-emoji' }, l.emoji),
        el('div', { style: { flex: 1 } }, [
          el('div', { class: 'level-name' }, l.name),
          el('div', { class: 'level-desc' }, l.desc)
        ]),
        isCurrent ? el('span', { style: { fontSize: '20px' } }, '✓') : null
      ]);
    })
  ]);
}

// === MAIN RENDER ===
function setMode(m) {
  state.mode = m;
  render();
}

function render() {
  // Render the entire app. If anything throws, the global error handler will
  // catch it and surface the error visibly. The local try/catch around the
  // screen block keeps a partial page functional when only one screen fails.
  var root = $('#root');
  if (!root) {
    // #root not in DOM yet — re-create it
    root = document.createElement('div');
    root.id = 'root';
    document.body.appendChild(root);
  }
  try { root.innerHTML = ''; } catch(_){}

  var app = el('div', { class: 'app' });

  var topbar;
  try { topbar = renderTopBar(); }
  catch (e) { window.__renderErr = (window.__renderErr || []); window.__renderErr.push({step: 'topbar', msg: e.message, stack: e.stack}); topbar = document.createElement('div'); }

  app.appendChild(topbar);

  var screenArea = el('div', { class: 'screen-area' });
  var screen = null;
  try {
    switch (state.mode) {
      case 'home': screen = renderHome(); break;
      case 'browse': screen = renderBrowse(); break;
      case 'recipe': screen = renderRecipe(); break;
      case 'cook': screen = renderCook(); break;
      case 'search': screen = renderSearch(); break;
      case 'favorites': screen = renderFavorites(); break;
      case 'planner': screen = renderPlanner(); break;
      case 'recipe-picker': screen = renderRecipePicker(); break;
      case 'shopping': screen = renderShopping(); break;
      case 'profile': screen = renderProfile(); break;
      case 'levels': screen = renderLevels(); break;
      default: screen = renderHome();
    }
  } catch (e) {
    window.__renderErr = (window.__renderErr || []);
    window.__renderErr.push({step: 'screen-' + state.mode, msg: e.message, stack: e.stack});
    var fb = document.createElement('div');
    fb.className = 'screen';
    var eb = document.createElement('div');
    eb.className = 'empty';
    var eicon = document.createElement('div');
    eicon.className = 'empty-emoji';
    eicon.textContent = '⚠️';
    eb.appendChild(eicon);
    var eh = document.createElement('h3');
    eh.className = 'script';
    eh.textContent = 'Something went wrong';
    eb.appendChild(eh);
    var ep = document.createElement('p');
    ep.textContent = e.message;
    eb.appendChild(ep);
    fb.appendChild(eb);
    screen = fb;
  }

  screenArea.appendChild(screen);
  app.appendChild(screenArea);

  if (state.mode !== 'cook') {
    var bottomNav;
    try { bottomNav = renderBottomNav(); }
    catch (e) {
      window.__renderErr = (window.__renderErr || []);
      window.__renderErr.push({step: 'bottomnav', msg: e.message, stack: e.stack});
      bottomNav = document.createElement('nav');
    }
    app.appendChild(bottomNav);
  }

  root.appendChild(app);
}

// === BOOT ===
try { render(); console.log('Cozy Cookbook loaded'); } catch (e) { console.error('Boot failed:', e); }

})();