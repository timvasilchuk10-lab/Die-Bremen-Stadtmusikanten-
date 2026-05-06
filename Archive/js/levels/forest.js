// ============================================================================
// LEVEL 2: THE FOREST ROAD
// Dark woods with patrolling robbers. Rooster recruitment cage. First time
// the player has to use stack + music to clear the road.
// ============================================================================

export const FOREST_LEVEL = {
  id: 'forest',
  name: 'The Forest Road',
  chapter: 'Chapter II',
  width: 2200, height: 1500,
  tileType: 'forest',
  darkness: false,
  spawn: { x: 200, y: 800 },
  exit: { x: 2100, y: 700, w: 100, h: 200, label: 'TO THE RIVER' },
  walls: [],
  decor: [
    // upper canopy
    { type: 'darktree', x: 100,  y: 200 }, { type: 'darktree', x: 280,  y: 280 },
    { type: 'darktree', x: 450,  y: 180 }, { type: 'darktree', x: 620,  y: 260 },
    { type: 'darktree', x: 780,  y: 200 }, { type: 'darktree', x: 950,  y: 320 },
    { type: 'darktree', x: 1120, y: 200 }, { type: 'darktree', x: 1300, y: 290 },
    { type: 'darktree', x: 1480, y: 200 }, { type: 'darktree', x: 1660, y: 260 },
    { type: 'darktree', x: 1840, y: 200 }, { type: 'darktree', x: 2020, y: 280 },
    // lower canopy
    { type: 'darktree', x: 150,  y: 1200 }, { type: 'darktree', x: 320,  y: 1280 },
    { type: 'darktree', x: 480,  y: 1180 }, { type: 'darktree', x: 660,  y: 1260 },
    { type: 'darktree', x: 820,  y: 1180 }, { type: 'darktree', x: 980,  y: 1300 },
    { type: 'darktree', x: 1150, y: 1200 }, { type: 'darktree', x: 1320, y: 1280 },
    { type: 'darktree', x: 1500, y: 1200 }, { type: 'darktree', x: 1680, y: 1260 },
    { type: 'darktree', x: 1850, y: 1200 }, { type: 'darktree', x: 2020, y: 1280 },
    // inner forest
    { type: 'darktree', x: 400,  y: 480 }, { type: 'darktree', x: 700,  y: 520 },
    { type: 'darktree', x: 1100, y: 490 }, { type: 'darktree', x: 1450, y: 510 },
    { type: 'darktree', x: 1900, y: 480 },
    { type: 'darktree', x: 380,  y: 1000 }, { type: 'darktree', x: 750,  y: 990 },
    { type: 'darktree', x: 1180, y: 1010 }, { type: 'darktree', x: 1500, y: 980 },
    { type: 'darktree', x: 230,  y: 600 }, { type: 'darktree', x: 1700, y: 950 },
    { type: 'darktree', x: 1800, y: 600 }, { type: 'darktree', x: 230,  y: 940 },
    { type: 'rock',     x: 500,  y: 750 }, { type: 'rock',     x: 920,  y: 800 },
    { type: 'rock',     x: 1300, y: 700 }, { type: 'rock',     x: 1600, y: 850 },
    { type: 'campfire', x: 700,  y: 700 },
    { type: 'campfire', x: 1400, y: 800 },
    { type: 'campfire', x: 1900, y: 760 },
    { type: 'ruin',     x: 1050, y: 600 },
    // Where the river-fragment used to be — atmospheric forest clearing
    { type: 'rock',     x: 760,  y: 870 },
    { type: 'rock',     x: 820,  y: 880 },
    { type: 'campfire', x: 800,  y: 850 },
    { type: 'darktree', x: 720,  y: 820 },
    { type: 'cage',     x: 1500, y: 900, which: 3 },     // rooster recruitment cage
    { type: 'signpost', x: 250,  y: 900, text: 'BEWARE!  ROBBERS' },
  ],
  notes: [
    { x: 350,  y: 700 },  { x: 600,  y: 850 }, { x: 900,  y: 750 },
    { x: 1100, y: 800 },  { x: 1250, y: 700 }, { x: 1700, y: 750 },
    { x: 800,  y: 600 },  { x: 1350, y: 950 }, { x: 1850, y: 850 },
    { x: 2000, y: 700 },
  ],
  recruits: [
    { which: 3, x: 1500, y: 900, text: 'A captured rooster, locked in the robbers\' cage.' },
  ],
  enemies: [
    { x: 550,  y: 700, w: 26, h: 28, type: 'robber', alive: true, patrolType: 'horizontal', cx: 550,  cy: 700, range: 80,  t: 0, speed: 0.4, weapon: 'club',  stunned: 0 },
    { x: 850,  y: 750, w: 26, h: 28, type: 'robber', alive: true, patrolType: 'circle',     cx: 850,  cy: 750, range: 60,  t: 1, speed: 0.6, weapon: 'torch', stunned: 0 },
    { x: 1150, y: 850, w: 26, h: 28, type: 'robber', alive: true, patrolType: 'horizontal', cx: 1150, cy: 850, range: 100, t: 0, speed: 0.5, weapon: 'sack',  stunned: 0 },
    { x: 1380, y: 750, w: 26, h: 28, type: 'robber', alive: true, patrolType: 'vertical',   cx: 1380, cy: 750, range: 70,  t: 2, speed: 0.4, weapon: 'club',  stunned: 0 },
    { x: 1750, y: 800, w: 26, h: 28, type: 'robber', alive: true, patrolType: 'circle',     cx: 1750, cy: 800, range: 50,  t: 0, speed: 0.5, weapon: 'torch', stunned: 0 },
  ],
  messages: [
    { x: 200,  y: 700, w: 200, h: 200, text: 'The forest is dark — robbers prowl the road. Use <span class="key">E</span> as the Rooster to widen your light.', triggered: false, once: true },
    { x: 450,  y: 600, w: 240, h: 300, text: 'Press <span class="key">Q</span> to stack the musicians into a tower.', triggered: false, once: true },
    { x: 800,  y: 600, w: 240, h: 300, text: 'When stacked, press <span class="key">F</span> to play music. Robbers fear the song.', triggered: false, once: true },
    { x: 1300, y: 850, w: 300, h: 200, text: 'A captured rooster! Free him with <span class="key">F</span>.', triggered: false, once: true },
  ],
};