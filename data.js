/* ============================================
   Cozy Cookbook — Recipe Database
   Structure: { recipes: [...], cuisines: [...], levels: [...] }
   Add new recipes by appending to the recipes array.
   ============================================ */

// 5 skill levels with their filter rules
const LEVELS = {
  picky:     { id: 'picky',     name: 'Picky Eater', emoji: '🌱', desc: '≤5 ingredients, ≤30 min, kid-friendly, no exotic spices' },
  casual:    { id: 'casual',    name: 'Casual Cook',  emoji: '🍳', desc: '≤10 ingredients, ≤60 min, mild spices OK' },
  home:      { id: 'home',      name: 'Home Cook',    emoji: '👨‍🍳', desc: 'Up to 15 ingredients, ≤2 hours, full spices' },
  advanced:  { id: 'advanced',  name: 'Advanced',     emoji: '🔪', desc: 'Multi-step techniques, long marinades' },
  master:    { id: 'master',    name: 'Master Chef',  emoji: '👑', desc: 'All recipes unlocked' }
};

// 15+ cuisines
const CUISINES = [
  { id: 'italian',   name: 'Italian',      emoji: '🇮🇹' },
  { id: 'chinese',   name: 'Chinese',      emoji: '🇨🇳' },
  { id: 'indian',    name: 'Indian',       emoji: '🇮🇳' },
  { id: 'mexican',   name: 'Mexican',      emoji: '🇲🇽' },
  { id: 'japanese',  name: 'Japanese',     emoji: '🇯🇵' },
  { id: 'thai',      name: 'Thai',         emoji: '🇹🇭' },
  { id: 'french',    name: 'French',       emoji: '🇫🇷' },
  { id: 'korean',    name: 'Korean',       emoji: '🇰🇷' },
  { id: 'middle_eastern', name: 'Middle Eastern', emoji: '🌙' },
  { id: 'greek',     name: 'Greek',        emoji: '🇬🇷' },
  { id: 'spanish',   name: 'Spanish',      emoji: '🇪🇸' },
  { id: 'thai_vietnamese', name: 'Vietnamese', emoji: '🇻🇳' },
  { id: 'japanese_korean', name: 'Korean BBQ', emoji: '🥩' },
  { id: 'american',  name: 'American',     emoji: '🇺🇸' },
  { id: 'british',   name: 'British',      emoji: '🇬🇧' },
  { id: 'world',     name: 'World / Fusion', emoji: '🌍' }
];

// Helper to make a recipe quickly
function r(id, name, cuisine, level, time, servings, ingredients, steps, nutrition, tags = []) {
  return { id, name, cuisine, level, time, servings, ingredients, steps, nutrition, tags };
}

// ============================================
// RECIPE DATABASE
// ============================================
const RECIPES = [
  // ===== ITALIAN (10) =====
  r('margherita-pizza', 'Margherita Pizza', 'italian', 'picky', 30, 4,
    [
      { name: 'pizza dough', qty: 1, unit: 'ball' },
      { name: 'tomato sauce', qty: 0.5, unit: 'cup' },
      { name: 'fresh mozzarella', qty: 200, unit: 'g' },
      { name: 'fresh basil', qty: 10, unit: 'leaves' },
      { name: 'olive oil', qty: 2, unit: 'tbsp' }
    ],
    [
      'Preheat oven to 250°C (480°F) with a pizza stone if you have one.',
      'Stretch the dough into a 30cm round on parchment paper.',
      'Spread tomato sauce in a thin layer, leaving a 2cm border.',
      'Tear mozzarella into pieces and distribute evenly.',
      'Bake 8-10 minutes until crust is golden and cheese bubbles.',
      'Top with fresh basil and a drizzle of olive oil. Serve immediately.'
    ],
    { calories: 540, protein: 22, carbs: 62, fat: 22 },
    ['vegetarian', 'classic']
  ),
  r('spaghetti-aglio', 'Spaghetti Aglio e Olio', 'italian', 'casual', 20, 2,
    [
      { name: 'spaghetti', qty: 200, unit: 'g' },
      { name: 'garlic', qty: 4, unit: 'cloves' },
      { name: 'olive oil', qty: 4, unit: 'tbsp' },
      { name: 'red pepper flakes', qty: 0.5, unit: 'tsp' },
      { name: 'parsley', qty: 2, unit: 'tbsp' },
      { name: 'parmesan', qty: 30, unit: 'g' }
    ],
    [
      'Bring a large pot of salted water to boil.',
      'Cook spaghetti until al dente. Reserve 1 cup pasta water before draining.',
      'While pasta cooks, slice garlic thinly.',
      'Warm olive oil in a wide pan over medium-low heat. Add garlic and chili flakes. Cook 2 minutes until fragrant (do not brown).',
      'Add drained pasta, 1/2 cup pasta water, and parsley. Toss vigorously until silky.',
      'Season with salt, top with parmesan, serve immediately.'
    ],
    { calories: 520, protein: 16, carbs: 68, fat: 22 },
    ['quick', 'vegetarian']
  ),
  r('carbonara', 'Spaghetti Carbonara', 'italian', 'home', 30, 4,
    [
      { name: 'spaghetti', qty: 400, unit: 'g' },
      { name: 'guanciale', qty: 150, unit: 'g' },
      { name: 'egg yolks', qty: 4, unit: '' },
      { name: 'whole eggs', qty: 2, unit: '' },
      { name: 'pecorino romano', qty: 80, unit: 'g' },
      { name: 'black pepper', qty: 1, unit: 'tsp' }
    ],
    [
      'Bring salted water to boil and cook spaghetti.',
      'Cut guanciale into strips and cook in a cold pan over medium heat until crispy (8 minutes).',
      'Whisk egg yolks, whole eggs, pecorino, and pepper in a bowl.',
      'Reserve 1 cup pasta water. Drain pasta when al dente.',
      'Off heat: add hot pasta to guanciale pan. Pour in egg mixture and toss quickly, adding pasta water until silky and creamy.',
      'Serve immediately with extra pecorino and pepper.'
    ],
    { calories: 680, protein: 32, carbs: 70, fat: 30 },
    ['classic', 'creamy']
  ),
  r('margherita-pasta', 'Pasta al Pomodoro', 'italian', 'picky', 25, 4,
    [
      { name: 'penne pasta', qty: 400, unit: 'g' },
      { name: 'tomatoes', qty: 4, unit: 'medium' },
      { name: 'garlic', qty: 2, unit: 'cloves' },
      { name: 'olive oil', qty: 3, unit: 'tbsp' },
      { name: 'fresh basil', qty: 8, unit: 'leaves' },
      { name: 'parmesan', qty: 40, unit: 'g' }
    ],
    [
      'Boil salted water and cook penne until al dente.',
      'While pasta cooks, blanch tomatoes 30 seconds, peel, and chop.',
      'Warm olive oil in a pan, add sliced garlic for 1 minute. Add tomatoes and a pinch of salt.',
      'Simmer 10 minutes until sauce thickens. Tear in basil leaves.',
      'Toss drained pasta with sauce. Top with parmesan.'
    ],
    { calories: 480, protein: 16, carbs: 78, fat: 12 },
    ['vegetarian', 'quick']
  ),
  r('risotto-mushroom', 'Mushroom Risotto', 'italian', 'advanced', 45, 4,
    [
      { name: 'arborio rice', qty: 320, unit: 'g' },
      { name: 'mixed mushrooms', qty: 400, unit: 'g' },
      { name: 'vegetable stock', qty: 1, unit: 'L' },
      { name: 'white wine', qty: 150, unit: 'ml' },
      { name: 'shallots', qty: 2, unit: '' },
      { name: 'parmesan', qty: 80, unit: 'g' },
      { name: 'butter', qty: 50, unit: 'g' },
      { name: 'olive oil', qty: 2, unit: 'tbsp' },
      { name: 'fresh thyme', qty: 4, unit: 'sprigs' }
    ],
    [
      'Sauté sliced mushrooms in olive oil with thyme until golden. Set aside.',
      'In same pan, sweat finely diced shallots in butter until translucent.',
      'Add rice and toast 2 minutes, stirring constantly.',
      'Pour in wine and stir until absorbed.',
      'Add hot stock one ladle at a time, stirring, until rice is creamy and al dente (about 18 minutes).',
      'Fold in mushrooms, remaining butter, and parmesan. Rest 2 minutes. Serve.'
    ],
    { calories: 520, protein: 18, carbs: 72, fat: 18 },
    ['vegetarian', 'creamy']
  ),
  r('tiramisu', 'Classic Tiramisu', 'italian', 'home', 40, 8,
    [
      { name: 'ladyfingers', qty: 24, unit: '' },
      { name: 'mascarpone', qty: 500, unit: 'g' },
      { name: 'espresso', qty: 300, unit: 'ml' },
      { name: 'eggs', qty: 4, unit: '' },
      { name: 'sugar', qty: 100, unit: 'g' },
      { name: 'cocoa powder', qty: 2, unit: 'tbsp' }
    ],
    [
      'Brew espresso and let cool completely.',
      'Separate eggs. Whisk yolks with sugar until pale and thick.',
      'Fold mascarpone into yolk mixture gently.',
      'Whip egg whites to stiff peaks and fold into mascarpone.',
      'Quickly dip each ladyfinger in espresso (1 second per side).',
      'Layer half in a dish, top with half the mascarpone. Repeat.',
      'Dust with cocoa powder. Refrigerate at least 6 hours.'
    ],
    { calories: 380, protein: 8, carbs: 32, fat: 24 },
    ['dessert', 'no-bake']
  ),
  r('lasagna-classic', 'Classic Lasagna', 'italian', 'advanced', 90, 8,
    [
      { name: 'lasagna sheets', qty: 12, unit: '' },
      { name: 'ground beef', qty: 500, unit: 'g' },
      { name: 'tomato passata', qty: 700, unit: 'ml' },
      { name: 'mozzarella', qty: 300, unit: 'g' },
      { name: 'parmesan', qty: 100, unit: 'g' },
      { name: 'onion', qty: 1, unit: '' },
      { name: 'garlic', qty: 3, unit: 'cloves' },
      { name: 'tomato paste', qty: 2, unit: 'tbsp' },
      { name: 'fresh basil', qty: 10, unit: 'leaves' }
    ],
    [
      'Sauté diced onion in olive oil until soft. Add garlic for 1 minute.',
      'Add ground beef, brown well. Add tomato paste, passata, and basil. Simmer 30 minutes.',
      'Cook lasagna sheets in salted water until just pliable.',
      'Layer in baking dish: meat sauce, sheets, mozzarella, parmesan. Repeat 3-4 times.',
      'Top with sauce and cheese. Cover with foil.',
      'Bake 25 minutes at 180°C. Remove foil, bake 15 more until golden.'
    ],
    { calories: 580, protein: 36, carbs: 48, fat: 26 },
    ['comfort', 'family']
  ),
  r('cacio-e-pepe', 'Cacio e Pepe', 'italian', 'casual', 20, 2,
    [
      { name: 'spaghetti', qty: 200, unit: 'g' },
      { name: 'pecorino romano', qty: 100, unit: 'g' },
      { name: 'black pepper', qty: 2, unit: 'tsp' },
      { name: 'butter', qty: 30, unit: 'g' }
    ],
    [
      'Cook spaghetti in salted water until just before al dente.',
      'Meanwhile, finely grate pecorino.',
      'Toast cracked black pepper in butter for 1 minute.',
      'Reserve pasta water. Drain pasta, reserving water.',
      'Off heat: toss pasta with butter, pepper, and 3 tbsp pasta water.',
      'Add pecorino in batches, tossing vigorously. Add more pasta water as needed for creamy sauce.'
    ],
    { calories: 580, protein: 22, carbs: 68, fat: 26 },
    ['quick', 'vegetarian']
  ),
  r('caprese', 'Caprese Salad', 'italian', 'picky', 10, 2,
    [
      { name: 'ripe tomatoes', qty: 3, unit: '' },
      { name: 'fresh mozzarella', qty: 250, unit: 'g' },
      { name: 'fresh basil', qty: 12, unit: 'leaves' },
      { name: 'olive oil', qty: 3, unit: 'tbsp' },
      { name: 'balsamic glaze', qty: 1, unit: 'tbsp' }
    ],
    [
      'Slice tomatoes and mozzarella into 1cm rounds.',
      'Arrange alternating on a plate, slightly overlapping.',
      'Tuck basil leaves between the slices.',
      'Drizzle with olive oil and balsamic glaze.',
      'Season with salt and pepper. Serve immediately.'
    ],
    { calories: 320, protein: 18, carbs: 12, fat: 24 },
    ['no-cook', 'summer']
  ),
  r('gnocchi-potato', 'Potato Gnocchi', 'italian', 'advanced', 75, 4,
    [
      { name: 'floury potatoes', qty: 1, unit: 'kg' },
      { name: '00 flour', qty: 250, unit: 'g' },
      { name: 'egg', qty: 1, unit: '' },
      { name: 'parmesan', qty: 50, unit: 'g' },
      { name: 'butter', qty: 60, unit: 'g' },
      { name: 'sage', qty: 8, unit: 'leaves' }
    ],
    [
      'Bake potatoes 1 hour at 200°C. Cool slightly, peel while warm.',
      'Rice potatoes through a potato ricer onto a floured surface.',
      'Make a well, add egg, parmesan, and most of the flour. Mix gently to form a soft dough (do not overwork).',
      'Roll into ropes, cut into 2cm pieces. Roll each over a fork to create ridges.',
      'Boil gnocchi in batches: they are done when they float (2 minutes).',
      'Melt butter with sage until golden. Toss gnocchi and serve.'
    ],
    { calories: 480, protein: 14, carbs: 78, fat: 14 },
    ['homemade', 'pasta']
  ),

  // ===== CHINESE (10) =====
  r('fried-rice', 'Egg Fried Rice', 'chinese', 'picky', 15, 2,
    [
      { name: 'cooked rice', qty: 2, unit: 'cups' },
      { name: 'eggs', qty: 2, unit: '' },
      { name: 'frozen peas', qty: 0.5, unit: 'cup' },
      { name: 'soy sauce', qty: 2, unit: 'tbsp' },
      { name: 'sesame oil', qty: 1, unit: 'tsp' },
      { name: 'green onion', qty: 2, unit: '' }
    ],
    [
      'Use cold rice (day-old works best). Break up clumps.',
      'Heat oil in a wok over high heat. Scramble eggs, then set aside.',
      'Add rice and stir-fry 2 minutes until grains are separate and starting to crisp.',
      'Add peas and cooked eggs. Pour soy sauce around the edge of the wok.',
      'Toss for 1 minute. Finish with sesame oil and sliced green onion.'
    ],
    { calories: 420, protein: 16, carbs: 62, fat: 14 },
    ['quick', 'leftover']
  ),
  r('mapo-tofu', 'Mapo Tofu', 'chinese', 'home', 30, 3,
    [
      { name: 'soft tofu', qty: 400, unit: 'g' },
      { name: 'ground pork', qty: 150, unit: 'g' },
      { name: 'doubanjiang', qty: 2, unit: 'tbsp' },
      { name: 'sichuan peppercorns', qty: 1, unit: 'tsp' },
      { name: 'garlic', qty: 3, unit: 'cloves' },
      { name: 'ginger', qty: 1, unit: 'thumb' },
      { name: 'green onion', qty: 3, unit: '' },
      { name: 'soy sauce', qty: 1, unit: 'tbsp' },
      { name: 'chili oil', qty: 1, unit: 'tbsp' }
    ],
    [
      'Cut tofu into 2cm cubes. Keep warm in hot water.',
      'Toast sichuan peppercorns in dry pan until fragrant. Crush.',
      'Brown ground pork in oil until crispy.',
      'Add minced garlic, ginger, green onion whites. Stir-fry 30 seconds.',
      'Add doubanjiang and stir 1 minute until oil turns red.',
      'Add tofu, soy sauce, and 100ml water. Simmer gently 5 minutes.',
      'Top with crushed peppercorns, green onion greens, and chili oil.'
    ],
    { calories: 380, protein: 22, carbs: 18, fat: 26 },
    ['spicy', 'classic']
  ),
  r('kung-pao', 'Kung Pao Chicken', 'chinese', 'home', 35, 4,
    [
      { name: 'chicken thighs', qty: 500, unit: 'g' },
      { name: 'peanuts', qty: 80, unit: 'g' },
      { name: 'dried red chilies', qty: 10, unit: '' },
      { name: 'sichuan peppercorns', qty: 1, unit: 'tsp' },
      { name: 'soy sauce', qty: 2, unit: 'tbsp' },
      { name: 'black vinegar', qty: 1, unit: 'tbsp' },
      { name: 'sugar', qty: 1, unit: 'tbsp' },
      { name: 'garlic', qty: 3, unit: 'cloves' },
      { name: 'ginger', qty: 1, unit: 'thumb' },
      { name: 'green onion', qty: 3, unit: '' }
    ],
    [
      'Cut chicken into 2cm cubes. Mix with 1 tbsp soy sauce and 1 tsp cornstarch.',
      'Mix remaining soy sauce, vinegar, and sugar in a bowl.',
      'Toast peanuts in dry wok until golden. Set aside.',
      'Heat oil in wok until smoking. Add chilies and peppercorns for 10 seconds.',
      'Add chicken and stir-fry 3 minutes until just cooked.',
      'Add garlic, ginger, green onion. Pour sauce in and toss until glossy.',
      'Stir in peanuts. Serve immediately with rice.'
    ],
    { calories: 480, protein: 38, carbs: 22, fat: 26 },
    ['spicy', 'classic']
  ),
  r('hot-sour-soup', 'Hot and Sour Soup', 'chinese', 'home', 30, 4,
    [
      { name: 'firm tofu', qty: 200, unit: 'g' },
      { name: 'shiitake mushrooms', qty: 100, unit: 'g' },
      { name: 'bamboo shoots', qty: 100, unit: 'g' },
      { name: 'ground pork', qty: 100, unit: 'g' },
      { name: 'eggs', qty: 2, unit: '' },
      { name: 'chicken stock', qty: 1, unit: 'L' },
      { name: 'rice vinegar', qty: 4, unit: 'tbsp' },
      { name: 'soy sauce', qty: 2, unit: 'tbsp' },
      { name: 'white pepper', qty: 1, unit: 'tsp' },
      { name: 'chili oil', qty: 1, unit: 'tsp' },
      { name: 'cornstarch', qty: 3, unit: 'tbsp' },
      { name: 'green onion', qty: 3, unit: '' }
    ],
    [
      'Julienne tofu, mushrooms, and bamboo shoots.',
      'Brown pork in a pot. Add stock, soy sauce, vinegar, and white pepper. Bring to simmer.',
      'Add mushrooms and bamboo. Cook 5 minutes.',
      'Whisk cornstarch with 3 tbsp water. Stir into soup to thicken.',
      'Drizzle beaten egg in a thin stream while stirring slowly (creates ribbons).',
      'Ladle into bowls. Top with green onion and chili oil.'
    ],
    { calories: 280, protein: 18, carbs: 18, fat: 14 },
    ['soup', 'warming']
  ),
  r('stir-fry-beef', 'Beef and Broccoli', 'chinese', 'casual', 25, 4,
    [
      { name: 'flank steak', qty: 400, unit: 'g' },
      { name: 'broccoli', qty: 1, unit: 'head' },
      { name: 'soy sauce', qty: 3, unit: 'tbsp' },
      { name: 'oyster sauce', qty: 1, unit: 'tbsp' },
      { name: 'sugar', qty: 1, unit: 'tsp' },
      { name: 'garlic', qty: 3, unit: 'cloves' },
      { name: 'ginger', qty: 1, unit: 'thumb' },
      { name: 'cornstarch', qty: 2, unit: 'tsp' }
    ],
    [
      'Slice beef thinly against the grain. Toss with 1 tbsp soy sauce and cornstarch.',
      'Cut broccoli into florets. Blanch 2 minutes in boiling water, drain.',
      'Mix remaining soy sauce, oyster sauce, sugar with 3 tbsp water.',
      'Heat oil in wok until smoking. Sear beef in batches, 1 minute each. Set aside.',
      'Add garlic and ginger for 30 seconds. Return beef, add broccoli.',
      'Pour sauce in and toss until glossy, about 1 minute.'
    ],
    { calories: 380, protein: 32, carbs: 22, fat: 16 },
    ['weeknight']
  ),
  r('spring-rolls', 'Crispy Spring Rolls', 'chinese', 'advanced', 60, 12,
    [
      { name: 'spring roll wrappers', qty: 24, unit: '' },
      { name: 'ground pork', qty: 200, unit: 'g' },
      { name: 'shredded cabbage', qty: 200, unit: 'g' },
      { name: 'shredded carrots', qty: 100, unit: 'g' },
      { name: 'bean sprouts', qty: 100, unit: 'g' },
      { name: 'glass noodles', qty: 50, unit: 'g' },
      { name: 'soy sauce', qty: 2, unit: 'tbsp' },
      { name: 'sesame oil', qty: 1, unit: 'tsp' },
      { name: 'ginger', qty: 1, unit: 'thumb' },
      { name: 'garlic', qty: 2, unit: 'cloves' }
    ],
    [
      'Soak noodles in hot water 5 minutes, drain and chop.',
      'Brown pork with garlic and ginger. Add cabbage, carrots, sprouts, noodles.',
      'Season with soy sauce and sesame oil. Cook 3 minutes. Cool completely.',
      'Place 2 tbsp filling on each wrapper. Fold sides in, roll tightly.',
      'Seal edge with water. Fry in 175°C oil until golden, about 3 minutes.',
      'Drain on paper towels. Serve with sweet chili sauce.'
    ],
    { calories: 220, protein: 8, carbs: 28, fat: 10 },
    ['appetizer', 'crispy']
  ),
  r('dumplings', 'Pork Dumplings', 'chinese', 'advanced', 90, 30,
    [
      { name: 'ground pork', qty: 400, unit: 'g' },
      { name: 'dumpling wrappers', qty: 30, unit: '' },
      { name: 'napa cabbage', qty: 200, unit: 'g' },
      { name: 'ginger', qty: 1, unit: 'thumb' },
      { name: 'green onion', qty: 4, unit: '' },
      { name: 'soy sauce', qty: 2, unit: 'tbsp' },
      { name: 'sesame oil', qty: 1, unit: 'tbsp' },
      { name: 'rice wine', qty: 1, unit: 'tbsp' }
    ],
    [
      'Salt chopped cabbage 10 minutes, squeeze out water.',
      'Mix pork, cabbage, minced ginger, chopped green onion, soy sauce, sesame oil, rice wine.',
      'Place 1 tbsp filling in center of wrapper. Wet edges with water.',
      'Fold in half, pleat edges to seal.',
      'Arrange in steamer basket. Steam 8 minutes.',
      'Or pan-fry: oil in pan, dumplings flat-side down, water to cover 1/3, cover and steam-fry 8 minutes.'
    ],
    { calories: 65, protein: 4, carbs: 8, fat: 3 },
    ['dim-sum', 'family']
  ),
  r('wonton-soup', 'Wonton Soup', 'chinese', 'casual', 40, 4,
    [
      { name: 'wonton wrappers', qty: 20, unit: '' },
      { name: 'ground pork', qty: 200, unit: 'g' },
      { name: 'shrimp', qty: 100, unit: 'g' },
      { name: 'chicken stock', qty: 1, unit: 'L' },
      { name: 'ginger', qty: 1, unit: 'thumb' },
      { name: 'green onion', qty: 3, unit: '' },
      { name: 'soy sauce', qty: 1, unit: 'tbsp' },
      { name: 'sesame oil', qty: 1, unit: 'tsp' },
      { name: 'bok choy', qty: 2, unit: '' }
    ],
    [
      'Chop shrimp finely. Mix with pork, minced ginger, soy sauce, sesame oil.',
      'Place 1 tsp filling in center of each wrapper. Fold into triangles, sealing edges.',
      'Bring stock to a simmer with sliced ginger.',
      'Drop wontons in, cook 4 minutes until they float.',
      'Add bok choy halves, cook 1 minute more.',
      'Ladle into bowls. Top with sliced green onion.'
    ],
    { calories: 320, protein: 22, carbs: 32, fat: 12 },
    ['soup', 'comfort']
  ),
  r('sweet-sour-pork', 'Sweet and Sour Pork', 'chinese', 'home', 40, 4,
    [
      { name: 'pork shoulder', qty: 500, unit: 'g' },
      { name: 'pineapple', qty: 200, unit: 'g' },
      { name: 'bell peppers', qty: 2, unit: '' },
      { name: 'onion', qty: 1, unit: '' },
      { name: 'rice vinegar', qty: 3, unit: 'tbsp' },
      { name: 'ketchup', qty: 2, unit: 'tbsp' },
      { name: 'sugar', qty: 3, unit: 'tbsp' },
      { name: 'soy sauce', qty: 1, unit: 'tbsp' },
      { name: 'cornstarch', qty: 0.5, unit: 'cup' },
      { name: 'egg', qty: 1, unit: '' }
    ],
    [
      'Cut pork into 2cm cubes. Coat with cornstarch, egg, and a pinch of salt.',
      'Deep fry in batches at 180°C until golden. Drain.',
      'Re-fry for extra crispness. Drain again.',
      'Mix vinegar, ketchup, sugar, soy sauce with 3 tbsp water.',
      'Stir-fry onion, peppers, pineapple for 1 minute.',
      'Add sauce and bring to a simmer. Toss in pork. Coat quickly and serve.'
    ],
    { calories: 520, protein: 32, carbs: 48, fat: 22 },
    ['classic', 'sweet-savory']
  ),
  r('chinese-eggplant', 'Fish-Fragrant Eggplant', 'chinese', 'home', 30, 4,
    [
      { name: 'asian eggplant', qty: 4, unit: '' },
      { name: 'ground pork', qty: 150, unit: 'g' },
      { name: 'soy sauce', qty: 2, unit: 'tbsp' },
      { name: 'rice vinegar', qty: 2, unit: 'tbsp' },
      { name: 'sugar', qty: 1, unit: 'tbsp' },
      { name: 'doubanjiang', qty: 1, unit: 'tbsp' },
      { name: 'garlic', qty: 4, unit: 'cloves' },
      { name: 'ginger', qty: 1, unit: 'thumb' },
      { name: 'green onion', qty: 3, unit: '' }
    ],
    [
      'Cut eggplants into batons. Soak in salted water 10 minutes, drain.',
      'Brown pork in oil until crispy. Set aside.',
      'Fry eggplant in oil until soft. Set aside.',
      'In same pan, sauté garlic, ginger, doubanjiang for 30 seconds.',
      'Add soy sauce, vinegar, sugar, 3 tbsp water. Simmer 1 minute.',
      'Return pork and eggplant. Toss until glossy. Top with green onion.'
    ],
    { calories: 280, protein: 14, carbs: 32, fat: 12 },
    ['vegetarian-friendly', 'spicy']
  ),

  // ===== INDIAN (10) =====
  r('butter-chicken', 'Butter Chicken', 'indian', 'home', 50, 4,
    [
      { name: 'chicken thighs', qty: 700, unit: 'g' },
      { name: 'yogurt', qty: 0.5, unit: 'cup' },
      { name: 'butter', qty: 100, unit: 'g' },
      { name: 'tomato puree', qty: 400, unit: 'g' },
      { name: 'heavy cream', qty: 0.5, unit: 'cup' },
      { name: 'garam masala', qty: 2, unit: 'tbsp' },
      { name: 'ginger', qty: 1, unit: 'thumb' },
      { name: 'garlic', qty: 4, unit: 'cloves' },
      { name: 'kashmiri chili', qty: 1, unit: 'tsp' },
      { name: 'turmeric', qty: 0.5, unit: 'tsp' },
      { name: 'kasuri methi', qty: 1, unit: 'tsp' }
    ],
    [
      'Marinate chicken in yogurt, half the garam masala, ginger, garlic, chili for 1 hour.',
      'Sear chicken in butter until lightly charred. Set aside.',
      'In same pan, melt remaining butter. Add tomato puree, turmeric, salt. Cook 10 minutes.',
      'Stir in cream and remaining garam masala. Simmer 5 minutes.',
      'Add chicken back. Simmer covered 15 minutes until tender.',
      'Crush kasuri methi between palms and sprinkle on top before serving.'
    ],
    { calories: 620, protein: 42, carbs: 18, fat: 42 },
    ['creamy', 'classic']
  ),
  r('chicken-tikka', 'Chicken Tikka Masala', 'indian', 'home', 60, 4,
    [
      { name: 'chicken breast', qty: 600, unit: 'g' },
      { name: 'yogurt', qty: 1, unit: 'cup' },
      { name: 'tomato puree', qty: 400, unit: 'g' },
      { name: 'heavy cream', qty: 0.5, unit: 'cup' },
      { name: 'garam masala', qty: 3, unit: 'tbsp' },
      { name: 'kashmiri chili', qty: 2, unit: 'tsp' },
      { name: 'ginger', qty: 1, unit: 'thumb' },
      { name: 'garlic', qty: 6, unit: 'cloves' },
      { name: 'lemon', qty: 1, unit: '' },
      { name: 'butter', qty: 50, unit: 'g' }
    ],
    [
      'Cube chicken. Marinate in yogurt, half the spices, lemon, half the garlic/ginger for 2 hours.',
      'Thread on skewers and grill 8 minutes until charred. Set aside.',
      'Melt butter, sauté remaining garlic and ginger until fragrant.',
      'Add tomato puree, remaining spices. Cook 15 minutes.',
      'Stir in cream. Simmer 5 minutes.',
      'Add grilled chicken. Simmer 10 minutes. Garnish with cilantro.'
    ],
    { calories: 580, protein: 48, carbs: 22, fat: 32 },
    ['classic', 'creamy']
  ),
  r('dal-tadka', 'Dal Tadka', 'indian', 'casual', 40, 4,
    [
      { name: 'yellow lentils', qty: 1, unit: 'cup' },
      { name: 'onion', qty: 1, unit: '' },
      { name: 'tomatoes', qty: 2, unit: '' },
      { name: 'ghee', qty: 3, unit: 'tbsp' },
      { name: 'cumin', qty: 1, unit: 'tsp' },
      { name: 'mustard seeds', qty: 0.5, unit: 'tsp' },
      { name: 'turmeric', qty: 0.5, unit: 'tsp' },
      { name: 'garlic', qty: 4, unit: 'cloves' },
      { name: 'ginger', qty: 1, unit: 'thumb' },
      { name: 'green chili', qty: 2, unit: '' },
      { name: 'cilantro', qty: 0.25, unit: 'cup' }
    ],
    [
      'Rinse lentils. Pressure cook or simmer with turmeric and salt for 20 minutes until soft.',
      'Mash lentils until smooth. Add water to reach thick soup consistency.',
      'Heat ghee in a small pan. Add cumin and mustard seeds. When they pop, add minced garlic, ginger, green chili.',
      'Add diced onion, cook until golden. Add diced tomatoes, cook until soft.',
      'Pour tempering into lentils. Simmer 5 minutes.',
      'Garnish with cilantro and a squeeze of lemon.'
    ],
    { calories: 280, protein: 14, carbs: 38, fat: 10 },
    ['comfort', 'vegetarian']
  ),
  r('chana-masala', 'Chana Masala', 'indian', 'casual', 35, 4,
    [
      { name: 'chickpeas', qty: 2, unit: 'cans' },
      { name: 'onion', qty: 1, unit: 'large' },
      { name: 'tomatoes', qty: 3, unit: '' },
      { name: 'ginger', qty: 1, unit: 'thumb' },
      { name: 'garlic', qty: 4, unit: 'cloves' },
      { name: 'garam masala', qty: 2, unit: 'tbsp' },
      { name: 'cumin', qty: 1, unit: 'tsp' },
      { name: 'coriander', qty: 1, unit: 'tsp' },
      { name: 'turmeric', qty: 0.5, unit: 'tsp' },
      { name: 'lemon', qty: 1, unit: '' },
      { name: 'cilantro', qty: 0.25, unit: 'cup' }
    ],
    [
      'Heat oil. Sauté chopped onion until golden. Add ginger and garlic, cook 2 minutes.',
      'Add diced tomatoes and all spices. Cook 10 minutes until thick.',
      'Drain chickpeas and add to pan. Stir to coat.',
      'Add 1/2 cup water. Simmer 15 minutes.',
      'Mash some chickpeas to thicken sauce.',
      'Finish with lemon juice and cilantro. Serve with rice or naan.'
    ],
    { calories: 320, protein: 14, carbs: 48, fat: 8 },
    ['vegetarian', 'protein']
  ),
  r('rogan-josh', 'Rogan Josh', 'indian', 'advanced', 90, 4,
    [
      { name: 'lamb shoulder', qty: 1, unit: 'kg' },
      { name: 'yogurt', qty: 1, unit: 'cup' },
      { name: 'kashmiri chili', qty: 2, unit: 'tbsp' },
      { name: 'fennel', qty: 1, unit: 'tsp' },
      { name: 'cinnamon', qty: 1, unit: 'stick' },
      { name: 'cardamom', qty: 4, unit: 'pods' },
      { name: 'cloves', qty: 4, unit: '' },
      { name: 'bay leaves', qty: 2, unit: '' },
      { name: 'ginger', qty: 1, unit: 'thumb' },
      { name: 'garlic', qty: 6, unit: 'cloves' },
      { name: 'onion', qty: 2, unit: '' }
    ],
    [
      'Marinate lamb in yogurt, half the spices, ginger, garlic for 4 hours.',
      'Brown lamb in batches in a heavy pot. Set aside.',
      'In same pot, brown sliced onions until deep golden (20 minutes).',
      'Add remaining spices. Bloom 1 minute.',
      'Return lamb with marinade and 1 cup water. Cover and simmer 1.5 hours.',
      'Remove bay leaves and cinnamon stick. Skim fat. Serve with rice.'
    ],
    { calories: 580, protein: 42, carbs: 18, fat: 36 },
    ['slow-cook', 'classic']
  ),
  r('palak-paneer', 'Palak Paneer', 'indian', 'casual', 30, 4,
    [
      { name: 'spinach', qty: 500, unit: 'g' },
      { name: 'paneer', qty: 250, unit: 'g' },
      { name: 'onion', qty: 1, unit: '' },
      { name: 'tomatoes', qty: 2, unit: '' },
      { name: 'heavy cream', qty: 0.25, unit: 'cup' },
      { name: 'ginger', qty: 1, unit: 'thumb' },
      { name: 'garlic', qty: 4, unit: 'cloves' },
      { name: 'garam masala', qty: 1, unit: 'tbsp' },
      { name: 'cumin', qty: 1, unit: 'tsp' },
      { name: 'turmeric', qty: 0.5, unit: 'tsp' }
    ],
    [
      'Blanch spinach 1 minute. Drain, cool, and blend into a smooth puree.',
      'Cube paneer. Lightly pan-fry until golden. Set aside.',
      'Sauté chopped onion until soft. Add garlic, ginger, spices. Cook 2 minutes.',
      'Add diced tomatoes, cook until oil separates.',
      'Stir in spinach puree and 1/4 cup water. Simmer 5 minutes.',
      'Add cream and paneer. Heat through gently. Serve with naan.'
    ],
    { calories: 380, protein: 18, carbs: 18, fat: 26 },
    ['vegetarian', 'classic']
  ),
  r('samosas', 'Samosas', 'indian', 'advanced', 90, 12,
    [
      { name: 'all-purpose flour', qty: 2, unit: 'cups' },
      { name: 'potatoes', qty: 3, unit: 'medium' },
      { name: 'peas', qty: 0.5, unit: 'cup' },
      { name: 'onion', qty: 1, unit: '' },
      { name: 'ghee', qty: 0.5, unit: 'cup' },
      { name: 'cumin', qty: 1, unit: 'tsp' },
      { name: 'coriander', qty: 1, unit: 'tbsp' },
      { name: 'garam masala', qty: 1, unit: 'tsp' },
      { name: 'ginger', qty: 1, unit: 'thumb' },
      { name: 'green chili', qty: 2, unit: '' }
    ],
    [
      'Make dough: flour, ghee, salt, water. Knead until firm. Rest 30 minutes.',
      'Boil and mash potatoes. Sauté onion, ginger, chili, spices. Add peas and potatoes.',
      'Roll dough thin, cut into halves. Form cones, fill with potato mixture, seal.',
      'Deep fry at 170°C until golden, about 5 minutes.',
      'Drain on paper towels. Serve with mint chutney and tamarind sauce.'
    ],
    { calories: 220, protein: 5, carbs: 32, fat: 10 },
    ['snack', 'crispy']
  ),
  r('naan', 'Garlic Naan', 'indian', 'advanced', 120, 8,
    [
      { name: 'bread flour', qty: 3, unit: 'cups' },
      { name: 'yogurt', qty: 0.5, unit: 'cup' },
      { name: 'milk', qty: 0.5, unit: 'cup' },
      { name: 'butter', qty: 3, unit: 'tbsp' },
      { name: 'yeast', qty: 1, unit: 'tsp' },
      { name: 'sugar', qty: 1, unit: 'tsp' },
      { name: 'garlic', qty: 4, unit: 'cloves' },
      { name: 'cilantro', qty: 0.25, unit: 'cup' }
    ],
    [
      'Dissolve yeast and sugar in warm milk. Wait 10 minutes until foamy.',
      'Mix flour, yogurt, melted butter, yeast mixture. Knead 10 minutes until smooth.',
      'Cover and rise 1.5 hours until doubled.',
      'Divide into 8 balls. Roll each into a teardrop shape.',
      'Cook in a screaming hot cast iron skillet 1-2 minutes per side until charred.',
      'Brush with butter, sprinkle garlic and cilantro.'
    ],
    { calories: 280, protein: 8, carbs: 42, fat: 8 },
    ['bread', 'comfort']
  ),
  r('tikka-masala-veggie', 'Vegetable Tikka Masala', 'indian', 'home', 45, 4,
    [
      { name: 'cauliflower', qty: 1, unit: 'head' },
      { name: 'bell peppers', qty: 2, unit: '' },
      { name: 'onion', qty: 1, unit: '' },
      { name: 'tomato puree', qty: 400, unit: 'g' },
      { name: 'heavy cream', qty: 0.5, unit: 'cup' },
      { name: 'cashews', qty: 0.25, unit: 'cup' },
      { name: 'garam masala', qty: 2, unit: 'tbsp' },
      { name: 'ginger', qty: 1, unit: 'thumb' },
      { name: 'garlic', qty: 4, unit: 'cloves' },
      { name: 'lemon', qty: 1, unit: '' }
    ],
    [
      'Cut cauliflower and peppers into bite-sized pieces.',
      'Marinate in yogurt, half the garam masala, lemon, salt for 30 minutes.',
      'Grill or broil vegetables until charred. Set aside.',
      'Blend cashews with 1/4 cup water into paste.',
      'Sauté onion until soft. Add garlic, ginger, remaining spices.',
      'Add tomato puree, simmer 10 minutes. Stir in cashew paste and cream.',
      'Add vegetables. Simmer 5 minutes. Serve with rice or naan.'
    ],
    { calories: 380, protein: 12, carbs: 32, fat: 24 },
    ['vegetarian', 'creamy']
  ),
  r('mango-lassi', 'Mango Lassi', 'indian', 'picky', 5, 2,
    [
      { name: 'mango chunks', qty: 2, unit: 'cups' },
      { name: 'yogurt', qty: 1, unit: 'cup' },
      { name: 'milk', qty: 0.5, unit: 'cup' },
      { name: 'honey', qty: 2, unit: 'tbsp' },
      { name: 'cardamom', qty: 0.5, unit: 'tsp' }
    ],
    [
      'Blend all ingredients until smooth and frothy.',
      'Taste and adjust sweetness.',
      'Pour into tall glasses. Garnish with a pinch of cardamom.'
    ],
    { calories: 220, protein: 8, carbs: 38, fat: 6 },
    ['drink', 'no-cook']
  ),

  // ===== MEXICAN (8) =====
  r('chicken-tacos', 'Chicken Tacos', 'mexican', 'casual', 30, 4,
    [
      { name: 'chicken breast', qty: 500, unit: 'g' },
      { name: 'small tortillas', qty: 8, unit: '' },
      { name: 'lime', qty: 2, unit: '' },
      { name: 'cumin', qty: 1, unit: 'tbsp' },
      { name: 'chili powder', qty: 1, unit: 'tbsp' },
      { name: 'garlic', qty: 3, unit: 'cloves' },
      { name: 'onion', qty: 1, unit: '' },
      { name: 'cilantro', qty: 0.5, unit: 'cup' },
      { name: 'avocado', qty: 1, unit: '' }
    ],
    [
      'Season chicken with cumin, chili, minced garlic, lime juice, salt. Rest 15 minutes.',
      'Cook chicken in a hot pan 6-7 minutes per side. Rest 5 minutes, then shred.',
      'Warm tortillas in a dry pan or over a flame.',
      'Slice onion and avocado. Chop cilantro.',
      'Fill tortillas with chicken, top with onion, avocado, cilantro.',
      'Serve with lime wedges and your favorite salsa.'
    ],
    { calories: 480, protein: 38, carbs: 38, fat: 18 },
    ['classic', 'family']
  ),
  r('guacamole', 'Classic Guacamole', 'mexican', 'picky', 10, 4,
    [
      { name: 'avocados', qty: 3, unit: 'ripe' },
      { name: 'lime', qty: 1, unit: '' },
      { name: 'red onion', qty: 0.5, unit: '' },
      { name: 'tomato', qty: 1, unit: '' },
      { name: 'cilantro', qty: 0.25, unit: 'cup' },
      { name: 'jalapeño', qty: 1, unit: '' },
      { name: 'garlic', qty: 1, unit: 'clove' }
    ],
    [
      'Halve avocados, remove pit. Scoop flesh into a bowl.',
      'Mash with a fork to desired chunkiness.',
      'Fold in finely diced onion, tomato, jalapeño, cilantro, minced garlic.',
      'Squeeze lime juice over. Season with salt.',
      'Taste and adjust. Serve immediately with tortilla chips.'
    ],
    { calories: 220, protein: 4, carbs: 18, fat: 18 },
    ['no-cook', 'snack']
  ),
  r('beef-enchiladas', 'Beef Enchiladas', 'mexican', 'home', 50, 4,
    [
      { name: 'ground beef', qty: 500, unit: 'g' },
      { name: 'corn tortillas', qty: 12, unit: '' },
      { name: 'enchilada sauce', qty: 400, unit: 'ml' },
      { name: 'cheddar', qty: 200, unit: 'g' },
      { name: 'onion', qty: 1, unit: '' },
      { name: 'garlic', qty: 3, unit: 'cloves' },
      { name: 'cumin', qty: 1, unit: 'tsp' },
      { name: 'chili powder', qty: 1, unit: 'tsp' }
    ],
    [
      'Brown beef with diced onion, garlic, spices. Drain fat.',
      'Spread some sauce in baking dish.',
      'Dip each tortilla in sauce, fill with beef and cheese, roll up.',
      'Place seam-down in dish. Pour remaining sauce over top.',
      'Top with remaining cheese.',
      'Bake at 180°C for 20 minutes until bubbly.'
    ],
    { calories: 620, protein: 32, carbs: 42, fat: 36 },
    ['comfort', 'family']
  ),
  r('black-bean-burrito', 'Black Bean Burritos', 'mexican', 'picky', 20, 4,
    [
      { name: 'flour tortillas', qty: 4, unit: 'large' },
      { name: 'black beans', qty: 1, unit: 'can' },
      { name: 'rice', qty: 1, unit: 'cup' },
      { name: 'cheddar', qty: 100, unit: 'g' },
      { name: 'salsa', qty: 0.5, unit: 'cup' },
      { name: 'sour cream', qty: 0.25, unit: 'cup' }
    ],
    [
      'Warm black beans in a small pot with a splash of water.',
      'Cook rice and let cool slightly.',
      'Warm tortillas in a dry pan or microwave.',
      'Spread rice in center of each tortilla.',
      'Top with beans, cheese, salsa, sour cream.',
      'Fold sides in and roll tightly. Serve with extra salsa.'
    ],
    { calories: 520, protein: 18, carbs: 72, fat: 16 },
    ['quick', 'vegetarian']
  ),
  r('salsa-verde', 'Salsa Verde', 'mexican', 'picky', 15, 6,
    [
      { name: 'tomatillos', qty: 500, unit: 'g' },
      { name: 'jalapeño', qty: 2, unit: '' },
      { name: 'cilantro', qty: 0.5, unit: 'cup' },
      { name: 'onion', qty: 0.5, unit: '' },
      { name: 'garlic', qty: 2, unit: 'cloves' },
      { name: 'lime', qty: 1, unit: '' }
    ],
    [
      'Husk and rinse tomatillos. Place on a baking sheet with jalapeños and garlic.',
      'Broil 5-7 minutes until charred.',
      'Blend charred vegetables with cilantro, onion, lime juice, salt.',
      'Adjust seasoning. Refrigerate 30 minutes before serving.'
    ],
    { calories: 35, protein: 1, carbs: 8, fat: 0 },
    ['sauce', 'no-cook']
  ),
  r('chicken-enchiladas-verde', 'Chicken Enchiladas Verdes', 'mexican', 'home', 45, 4,
    [
      { name: 'chicken breast', qty: 500, unit: 'g' },
      { name: 'corn tortillas', qty: 12, unit: '' },
      { name: 'tomatillos', qty: 500, unit: 'g' },
      { name: 'jalapeño', qty: 2, unit: '' },
      { name: 'sour cream', qty: 0.5, unit: 'cup' },
      { name: 'monterey jack', qty: 200, unit: 'g' },
      { name: 'cilantro', qty: 0.5, unit: 'cup' },
      { name: 'onion', qty: 1, unit: '' }
    ],
    [
      'Poach chicken 15 minutes. Shred when cool.',
      'Make salsa verde: broil tomatillos, jalapeño, garlic. Blend with cilantro.',
      'Mix shredded chicken with 1/2 cup salsa verde.',
      'Dip tortillas in remaining salsa verde. Fill with chicken and cheese.',
      'Roll and place in baking dish. Top with sour cream mixed with salsa verde.',
      'Bake at 180°C for 20 minutes. Top with onion and cilantro.'
    ],
    { calories: 540, protein: 38, carbs: 42, fat: 24 },
    ['classic', 'family']
  ),
  r('shrimp-ceviche', 'Shrimp Ceviche', 'mexican', 'casual', 25, 4,
    [
      { name: 'raw shrimp', qty: 500, unit: 'g' },
      { name: 'lime juice', qty: 0.75, unit: 'cup' },
      { name: 'tomato', qty: 2, unit: '' },
      { name: 'red onion', qty: 1, unit: '' },
      { name: 'cilantro', qty: 0.5, unit: 'cup' },
      { name: 'jalapeño', qty: 1, unit: '' },
      { name: 'avocado', qty: 1, unit: '' }
    ],
    [
      'Cut shrimp into 1cm pieces. Submerge in lime juice with a pinch of salt.',
      'Refrigerate 20 minutes until shrimp turns opaque (acid cooks it).',
      'Dice tomato, onion, jalapeño, cilantro, avocado.',
      'Combine everything. Season with salt.',
      'Serve in martini glasses with tortilla chips.'
    ],
    { calories: 220, protein: 26, carbs: 16, fat: 6 },
    ['fresh', 'no-cook']
  ),
  r('tres-leches', 'Tres Leches Cake', 'mexican', 'advanced', 120, 12,
    [
      { name: 'flour', qty: 1.5, unit: 'cups' },
      { name: 'eggs', qty: 5, unit: '' },
      { name: 'sugar', qty: 1, unit: 'cup' },
      { name: 'evaporated milk', qty: 1, unit: 'can' },
      { name: 'condensed milk', qty: 1, unit: 'can' },
      { name: 'heavy cream', qty: 1, unit: 'cup' },
      { name: 'vanilla', qty: 1, unit: 'tsp' },
      { name: 'cinnamon', qty: 1, unit: 'tsp' }
    ],
    [
      'Beat egg yolks with half the sugar until pale. Fold in flour.',
      'Whip egg whites with remaining sugar to stiff peaks. Fold into batter.',
      'Bake in a 9x13 pan at 175°C for 25 minutes. Cool completely.',
      'Mix evaporated milk, condensed milk, cream, vanilla.',
      'Poke holes all over cake. Slowly pour milk mixture over.',
      'Refrigerate overnight. Top with whipped cream and cinnamon.'
    ],
    { calories: 420, protein: 8, carbs: 58, fat: 18 },
    ['dessert', 'make-ahead']
  ),

  // ===== JAPANESE (8) =====
  r('chicken-teriyaki', 'Chicken Teriyaki', 'japanese', 'casual', 25, 4,
    [
      { name: 'chicken thighs', qty: 600, unit: 'g' },
      { name: 'soy sauce', qty: 0.25, unit: 'cup' },
      { name: 'mirin', qty: 0.25, unit: 'cup' },
      { name: 'sake', qty: 2, unit: 'tbsp' },
      { name: 'sugar', qty: 2, unit: 'tbsp' },
      { name: 'ginger', qty: 1, unit: 'thumb' },
      { name: 'sesame seeds', qty: 1, unit: 'tbsp' }
    ],
    [
      'Combine soy sauce, mirin, sake, sugar, grated ginger in a saucepan.',
      'Bring to simmer and cook 3 minutes until slightly thickened.',
      'Score chicken thighs. Sear skin-side down in a hot pan 6 minutes until crispy.',
      'Flip and cook 4 minutes more.',
      'Pour teriyaki sauce over. Cook 2 minutes, basting, until glaze is thick.',
      'Slice and serve over rice. Drizzle with extra sauce, garnish with sesame.'
    ],
    { calories: 380, protein: 32, carbs: 18, fat: 18 },
    ['classic', 'sweet-savory']
  ),
  r('miso-soup', 'Miso Soup', 'japanese', 'picky', 10, 4,
    [
      { name: 'dashi stock', qty: 4, unit: 'cups' },
      { name: 'white miso', qty: 3, unit: 'tbsp' },
      { name: 'tofu', qty: 150, unit: 'g' },
      { name: 'wakame', qty: 2, unit: 'tbsp' },
      { name: 'green onion', qty: 2, unit: '' }
    ],
    [
      'Heat dashi to just below boiling (do not boil).',
      'Soak wakame in warm water 5 minutes. Drain.',
      'Cube tofu. Slice green onions.',
      'Whisk miso with 1/4 cup warm dashi until smooth. Stir back into pot.',
      'Add tofu and wakame. Heat gently (do not boil).',
      'Ladle into bowls. Top with green onions.'
    ],
    { calories: 80, protein: 8, carbs: 6, fat: 4 },
    ['soup', 'umami']
  ),
  r('ramen-simple', 'Simple Shoyu Ramen', 'japanese', 'advanced', 120, 4,
    [
      { name: 'ramen noodles', qty: 4, unit: 'portions' },
      { name: 'chicken stock', qty: 1, unit: 'L' },
      { name: 'soy sauce', qty: 4, unit: 'tbsp' },
      { name: 'mirin', qty: 2, unit: 'tbsp' },
      { name: 'chicken breast', qty: 300, unit: 'g' },
      { name: 'soft-boiled eggs', qty: 4, unit: '' },
      { name: 'corn', qty: 1, unit: 'can' },
      { name: 'nori', qty: 4, unit: 'sheets' },
      { name: 'green onion', qty: 4, unit: '' },
      { name: 'ginger', qty: 1, unit: 'thumb' }
    ],
    [
      'Make soft-boiled eggs: simmer 6.5 minutes, ice bath, peel. Marinate in soy sauce.',
      'Poach chicken 15 minutes. Slice thin.',
      'Heat stock with soy sauce, mirin, ginger. Simmer 10 minutes.',
      'Cook noodles per package. Drain.',
      'Divide noodles between 4 bowls. Pour hot broth over.',
      'Top with chicken, halved eggs, corn, nori, green onions.'
    ],
    { calories: 580, protein: 36, carbs: 62, fat: 18 },
    ['comfort', 'umami']
  ),
  r('sushi-rolls', 'Maki Sushi Rolls', 'japanese', 'advanced', 60, 4,
    [
      { name: 'sushi rice', qty: 2, unit: 'cups' },
      { name: 'nori sheets', qty: 4, unit: '' },
      { name: 'rice vinegar', qty: 3, unit: 'tbsp' },
      { name: 'sugar', qty: 1, unit: 'tbsp' },
      { name: 'salt', qty: 1, unit: 'tsp' },
      { name: 'salmon', qty: 200, unit: 'g' },
      { name: 'cucumber', qty: 1, unit: '' },
      { name: 'avocado', qty: 1, unit: '' },
      { name: 'soy sauce', qty: 4, unit: 'tbsp' },
      { name: 'wasabi', qty: 1, unit: 'tsp' }
    ],
    [
      'Rinse rice until water runs clear. Cook with 2.5 cups water.',
      'Mix vinegar, sugar, salt. Fold into hot rice. Cool to body temperature.',
      'Slice salmon, cucumber, avocado into thin strips.',
      'Place nori on bamboo mat, shiny side down. Spread thin layer of rice.',
      'Lay fillings in a line. Roll tightly using the mat.',
      'Cut each roll into 8 pieces with a wet knife. Serve with soy and wasabi.'
    ],
    { calories: 380, protein: 18, carbs: 58, fat: 8 },
    ['classic', 'fun']
  ),
  r('gyudon', 'Gyudon (Beef Bowl)', 'japanese', 'casual', 25, 2,
    [
      { name: 'thinly sliced beef', qty: 300, unit: 'g' },
      { name: 'onion', qty: 1, unit: 'large' },
      { name: 'rice', qty: 2, unit: 'cups' },
      { name: 'soy sauce', qty: 4, unit: 'tbsp' },
      { name: 'mirin', qty: 2, unit: 'tbsp' },
      { name: 'sake', qty: 2, unit: 'tbsp' },
      { name: 'sugar', qty: 1, unit: 'tbsp' },
      { name: 'ginger', qty: 1, unit: 'thumb' },
      { name: 'green onion', qty: 2, unit: '' },
      { name: 'soft egg', qty: 1, unit: '' }
    ],
    [
      'Simmer soy sauce, mirin, sake, sugar, ginger with 1/2 cup water.',
      'Add sliced onion. Cook 5 minutes until soft.',
      'Add beef slices in batches, simmering 2 minutes until just cooked.',
      'Spoon over steamed rice in bowls.',
      'Top with green onion and a soft-boiled egg.',
      'Serve with pickled ginger and shichimi togarashi.'
    ],
    { calories: 620, protein: 32, carbs: 78, fat: 18 },
    ['comfort', 'quick']
  ),
  r('okonomiyaki', 'Okonomiyaki', 'japanese', 'home', 30, 2,
    [
      { name: 'flour', qty: 1, unit: 'cup' },
      { name: 'water', qty: 0.75, unit: 'cup' },
      { name: 'eggs', qty: 2, unit: '' },
      { name: 'napa cabbage', qty: 300, unit: 'g' },
      { name: 'pork belly', qty: 150, unit: 'g' },
      { name: 'green onion', qty: 2, unit: '' },
      { name: 'okonomiyaki sauce', qty: 3, unit: 'tbsp' },
      { name: 'mayonnaise', qty: 2, unit: 'tbsp' },
      { name: 'bonito flakes', qty: 1, unit: 'tbsp' }
    ],
    [
      'Whisk flour, water, eggs into smooth batter.',
      'Fold in shredded cabbage and chopped green onion.',
      'Pour onto hot oiled pan in a thick round.',
      'Lay pork belly slices on top. Press down.',
      'Cook 4 minutes per side until deep golden.',
      'Top with okonomiyaki sauce, mayo zigzag, bonito flakes, and seaweed.'
    ],
    { calories: 580, protein: 24, carbs: 58, fat: 26 },
    ['savory pancake', 'classic']
  ),
  r('tempura', 'Shrimp Tempura', 'japanese', 'advanced', 40, 4,
    [
      { name: 'large shrimp', qty: 12, unit: '' },
      { name: 'flour', qty: 1, unit: 'cup' },
      { name: 'cornstarch', qty: 0.25, unit: 'cup' },
      { name: 'ice water', qty: 1, unit: 'cup' },
      { name: 'egg', qty: 1, unit: '' },
      { name: 'vegetables', qty: 1, unit: 'assorted' },
      { name: 'soy sauce', qty: 4, unit: 'tbsp' },
      { name: 'mirin', qty: 2, unit: 'tbsp' },
      { name: 'dashi', qty: 4, unit: 'tbsp' }
    ],
    [
      'Peel and devein shrimp, leaving tails. Make 3 small slits on the underside.',
      'Make batter: mix flour, cornstarch, ice water, egg. Do not overmix (lumps OK).',
      'Heat oil to 180°C.',
      'Dredge shrimp in flour, dip in batter, fry 2-3 minutes.',
      'Fry vegetables same way.',
      'Make tentsuyu: simmer soy, mirin, dashi. Serve with tempura.'
    ],
    { calories: 380, protein: 18, carbs: 42, fat: 14 },
    ['crispy', 'classic']
  ),
  r('miso-glazed-salmon', 'Miso Glazed Salmon', 'japanese', 'home', 30, 4,
    [
      { name: 'salmon fillets', qty: 4, unit: '' },
      { name: 'white miso', qty: 3, unit: 'tbsp' },
      { name: 'mirin', qty: 2, unit: 'tbsp' },
      { name: 'sake', qty: 1, unit: 'tbsp' },
      { name: 'sugar', qty: 1, unit: 'tbsp' },
      { name: 'soy sauce', qty: 1, unit: 'tsp' },
      { name: 'ginger', qty: 1, unit: 'thumb' }
    ],
    [
      'Whisk miso, mirin, sake, sugar, soy, grated ginger into glaze.',
      'Coat salmon fillets. Marinate 30 minutes.',
      'Preheat broiler. Wipe excess glaze off salmon.',
      'Broil 8 inches from heat for 8 minutes until glaze caramelizes.',
      'Watch carefully — sugar burns fast.',
      'Serve over rice with steamed greens.'
    ],
    { calories: 380, protein: 36, carbs: 12, fat: 18 },
    ['umami', 'elegant']
  )
];

window.LEVELS = LEVELS;
window.CUISINES = CUISINES;
window.RECIPES = RECIPES;