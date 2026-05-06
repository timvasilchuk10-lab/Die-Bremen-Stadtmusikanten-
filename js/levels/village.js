// ============================================================================
// LEVEL 1: THE VILLAGE
// Player starts here. First recruits (Dog, Cat, Rooster). Donkey-kick puzzle
// with crates blocking the gate. Identical layout to the original monolith.
// ============================================================================

export const VILLAGE_LEVEL = {
  id: 'village',
  name: 'The Village',
  chapter: 'Chapter I',
  width: 1900, height: 1300,
  tileType: 'grass',
  spawn: { x: 200, y: 1100 },
  exit: { x: 1780, y: 580, w: 100, h: 200, label: 'TO THE FOREST' },
  walls: [
    { x: 100, y: 1230, w: 800, h: 14, type: 'fence' },
    { x: 100, y: 970, w: 14, h: 274, type: 'fence' },
    { x: 380, y: 880, w: 160, h: 14, type: 'fence' },
    { x: 800, y: 720, w: 14, h: 130, type: 'fence' },
    { x: 1100, y: 540, w: 220, h: 14, type: 'fence' },
  ],
  decor: [
    { type: 'mill',  x: 280,  y: 950 },
    { type: 'house', x: 600,  y: 1000, variant: 0 },
    { type: 'house', x: 900,  y: 1080, variant: 1 },
    { type: 'house', x: 1100, y: 920,  variant: 0 },
    { type: 'house', x: 1500, y: 1100, variant: 1 },
    { type: 'barn',  x: 700,  y: 740 },
    { type: 'coop',  x: 1300, y: 1050 },
    { type: 'well',  x: 540,  y: 1140 },
    { type: 'well',  x: 1200, y: 740 },
    { type: 'hay',   x: 350,  y: 1150 },
    { type: 'hay',   x: 410,  y: 1170 },
    { type: 'hay',   x: 870,  y: 850 },
    { type: 'cart',  x: 800,  y: 1130 },
    { type: 'cart',  x: 1150, y: 1180 },
    { type: 'tree',  x: 220,  y: 800 },
    { type: 'tree',  x: 470,  y: 730 },
    { type: 'tree',  x: 1000, y: 700 },
    { type: 'tree',  x: 1450, y: 880 },
    { type: 'tree',  x: 1400, y: 1180 },
    { type: 'tree',  x: 1700, y: 1000 },
    { type: 'tree',  x: 150,  y: 1100 },
    { type: 'post',  x: 460,  y: 1100 },
    { type: 'post',  x: 750,  y: 940 },
    // Donkey-kick puzzle: crates blocking the gate
    { type: 'crate', x: 1620, y: 700 },
    { type: 'crate', x: 1660, y: 720 },
    { type: 'crate', x: 1620, y: 740 },
    { type: 'signpost', x: 1620, y: 800, text: 'BREMEN  ➤' },
  ],
  notes: [
    { x: 320,  y: 1080 }, { x: 540,  y: 980 }, { x: 700,  y: 1180 },
    { x: 880,  y: 990 },  { x: 1080, y: 1100 }, { x: 1280, y: 980 },
    { x: 1380, y: 800 },  { x: 1530, y: 700 },  { x: 1130, y: 800 },
    { x: 480,  y: 850 }, // hidden bonus
  ],
  recruits: [
    { which: 1, x: 720,  y: 1080, text: 'A weary hound, no longer fit for the hunt.' },
    { which: 2, x: 720,  y: 820,  text: 'An aged cat, cast out from her warm hearth.' },
    { which: 3, x: 1340, y: 1080, text: 'A rooster, marked for the morrow\'s pot.' },
  ],
  enemies: [],
  messages: [
    { x: 200,  y: 1080, w: 220, h: 200, text: 'Use <span class="key">W A S D</span> or arrows to walk along the village road.', triggered: false, once: true },
    { x: 540,  y: 1080, w: 240, h: 240, text: 'Press <span class="key">F</span> when near a companion to recruit them.', triggered: false, once: true },
    { x: 1000, y: 700,  w: 400, h: 400, text: 'Press <span class="key">1 2 3 4</span> to switch between recruited animals.', triggered: false, once: true },
    { x: 1500, y: 700,  w: 200, h: 200, text: 'Crates block the gate. As the Donkey, press <span class="key">E</span> to kick them down.', triggered: false, once: true },
  ],
};
