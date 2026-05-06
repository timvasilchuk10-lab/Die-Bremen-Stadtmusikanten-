// ============================================================================
// LEVEL 4: THE ROBBERS' COTTAGE
// Heavily-guarded cottage in the woods. The fairy-tale moment: all 4 animals
// stack at the window, make their music, robbers flee in panic.
// ============================================================================

export const COTTAGE_LEVEL = {
  id: 'cottage',
  name: "The Robbers' Cottage",
  chapter: 'Chapter IV',
  width: 1500, height: 1000,
  tileType: 'forest',
  darkness: false,
  spawn: { x: 100, y: 800 },
  exit: { x: 1380, y: 450, w: 100, h: 150, label: 'TO BREMEN' },
  walls: [],
  // Special: stack at the window with all 4 animals & press F → robbers flee.
  // Triggers once per level. Coordinates approximate the cottage's lit window.
  windowZone: { x: 700, y: 470, r: 80 },
  cottageDoor: { x: 750, y: 425 },   // robbers spawn-burst from here on panic
  panicTriggered: false,
  decor: [
    // The cottage is the centerpiece — large
    { type: 'cottage', x: 750, y: 380, big: true },
    // Outer ring of dark trees
    { type: 'darktree', x: 100,  y: 200 }, { type: 'darktree', x: 280,  y: 280 },
    { type: 'darktree', x: 450,  y: 180 }, { type: 'darktree', x: 620,  y: 260 },
    { type: 'darktree', x: 950,  y: 200 }, { type: 'darktree', x: 1120, y: 280 },
    { type: 'darktree', x: 1300, y: 200 }, { type: 'darktree', x: 1450, y: 290 },
    { type: 'darktree', x: 150,  y: 900 }, { type: 'darktree', x: 320,  y: 950 },
    { type: 'darktree', x: 1200, y: 900 }, { type: 'darktree', x: 1400, y: 950 },
    { type: 'darktree', x: 100,  y: 500 }, { type: 'darktree', x: 1450, y: 500 },
    { type: 'darktree', x: 50,   y: 700 }, { type: 'darktree', x: 1450, y: 700 },
    { type: 'campfire', x: 500,  y: 600 },
    { type: 'campfire', x: 1000, y: 600 },
    { type: 'campfire', x: 750,  y: 750 },
    { type: 'rock',     x: 350,  y: 700 }, { type: 'rock', x: 1100, y: 750 },
    // Crates around cottage (multi-stage donkey-kick puzzle)
    { type: 'crate',    x: 700,  y: 550 },
    { type: 'crate',    x: 800,  y: 550 },
    { type: 'crate',    x: 1290, y: 480 },
    { type: 'crate',    x: 1320, y: 510 },
    // Treasure chest near cottage
    { type: 'chest',    x: 850,  y: 600 },
    // Ruined gate for atmosphere
    { type: 'ruin',     x: 200,  y: 450 },
    { type: 'signpost', x: 1280, y: 600, text: 'BREMEN  ➤' },
  ],
  notes: [
    { x: 200, y: 700 }, { x: 350,  y: 500 }, { x: 500,  y: 850 },
    { x: 700, y: 600 }, { x: 900,  y: 700 }, { x: 1100, y: 850 },
    { x: 1250, y: 600 }, { x: 850, y: 600 },
    { x: 600, y: 350 }, { x: 1050, y: 350 },
  ],
  recruits: [],
  enemies: [
    // Heavy guard around cottage — these will flee when window event triggers
    { x: 600,  y: 700, w: 26, h: 28, type: 'robber', alive: true, patrolType: 'horizontal', cx: 600,  cy: 700, range: 80,  t: 0, speed: 0.5,  weapon: 'club',  stunned: 0 },
    { x: 900,  y: 700, w: 26, h: 28, type: 'robber', alive: true, patrolType: 'horizontal', cx: 900,  cy: 700, range: 80,  t: 1, speed: 0.5,  weapon: 'club',  stunned: 0 },
    { x: 750,  y: 850, w: 26, h: 28, type: 'robber', alive: true, patrolType: 'circle',     cx: 750,  cy: 850, range: 70,  t: 0, speed: 0.55, weapon: 'torch', stunned: 0 },
    { x: 400,  y: 600, w: 26, h: 28, type: 'robber', alive: true, patrolType: 'vertical',   cx: 400,  cy: 600, range: 100, t: 0, speed: 0.45, weapon: 'sack',  stunned: 0 },
    { x: 1100, y: 600, w: 26, h: 28, type: 'robber', alive: true, patrolType: 'vertical',   cx: 1100, cy: 600, range: 100, t: 2, speed: 0.45, weapon: 'sack',  stunned: 0 },
    { x: 1250, y: 800, w: 26, h: 28, type: 'robber', alive: true, patrolType: 'horizontal', cx: 1250, cy: 800, range: 60,  t: 0, speed: 0.5,  weapon: 'torch', stunned: 0 },
  ],
  messages: [
    { x: 50,  y: 700, w: 400, h: 250, text: 'The robbers\' lair! Approach the lit window of the COTTAGE with all four animals stacked, then play music with <span class="key">F</span>.', triggered: false, once: true },
    { x: 500, y: 550, w: 400, h: 200, text: 'There — the cottage window! Stack with <span class="key">Q</span>, then <span class="key">F</span> to chase the robbers out!', triggered: false, once: true },
    { x: 800, y: 580, w: 200, h: 100, text: 'A chest! Press <span class="key">F</span> to claim its musical treasure.', triggered: false, once: true },
  ],
};