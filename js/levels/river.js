// ============================================================================
// LEVEL 3: THE RIVER CROSSING
// Wide river bisects the map. Bridge guarded by robbers; stepping stones as
// alternate path; donkey-kick puzzle for crates blocking the bridge.
// ============================================================================

export const RIVER_LEVEL = {
  id: 'river',
  name: 'The River Crossing',
  chapter: 'Chapter III',
  width: 1800, height: 1100,
  tileType: 'grass',
  spawn: { x: 100, y: 600 },
  exit: { x: 1700, y: 480, w: 90, h: 200, label: 'TO THE COTTAGE' },
  walls: [
    // Invisible riverbank guards. Without these, the player's narrow body
    // can squeeze along the water's edge and the river hitbox feels twitchy.
    // Walls run flush with both shores, with gaps for the bridge corridor
    // and the stepping-stone path.
    //
    //   River spans x=860..940, full height 1100.
    //   Bridge gap:  y=550..650 (a touch wider than bridge planks 570..630).
    //   Stones gap:  y=300..400.
    //
    // West bank walls (x=856..860, just inside the riverbank):
    { x: 856, y: 0,    w: 4, h: 300, type: 'invisible' },
    { x: 856, y: 400,  w: 4, h: 150, type: 'invisible' },
    { x: 856, y: 650,  w: 4, h: 450, type: 'invisible' },
    // East bank walls (x=940..944):
    { x: 940, y: 0,    w: 4, h: 300, type: 'invisible' },
    { x: 940, y: 400,  w: 4, h: 150, type: 'invisible' },
    { x: 940, y: 650,  w: 4, h: 450, type: 'invisible' },
  ],
  decor: [
    // Watchtower (ruined Hanseatic outpost)
    { type: 'watchtower', x: 320, y: 380 },
    // The river runs vertically across the middle
    { type: 'river',      x: 900, y: 0, w: 80, h: 1100 },
    // Bridge in the middle
    { type: 'bigbridge',  x: 940, y: 600 },
    // Stepping stones north of the bridge (alternate for the rooster's crow-dash)
    { type: 'stone', x: 905, y: 360 }, { type: 'stone', x: 940, y: 340 },
    { type: 'stone', x: 975, y: 360 }, { type: 'stone', x: 940, y: 380 },
    // West bank decor
    { type: 'tree',  x: 200, y: 300 }, { type: 'tree',  x: 280, y: 800 },
    { type: 'tree',  x: 100, y: 500 }, { type: 'tree',  x: 600, y: 350 },
    { type: 'tree',  x: 750, y: 700 }, { type: 'tree',  x: 500, y: 950 },
    { type: 'rock',  x: 400, y: 700 }, { type: 'rock',  x: 700, y: 500 },
    { type: 'campfire', x: 660, y: 800 },
    // East bank decor
    { type: 'tree',  x: 1100, y: 320 }, { type: 'tree',  x: 1300, y: 700 },
    { type: 'tree',  x: 1500, y: 350 }, { type: 'tree',  x: 1700, y: 800 },
    { type: 'tree',  x: 1450, y: 950 }, { type: 'tree',  x: 1600, y: 200 },
    { type: 'rock',  x: 1200, y: 850 }, { type: 'rock',  x: 1550, y: 600 },
    // Crates blocking the bridge approach (donkey-kick puzzle).
    // River runs x=860..940 vertically. Bridge mouth (y=570..630, 60px tall).
    // Two 32×32 crates at x=844 — east edge at x=860, flush with riverbank.
    // Spaced y=585 and y=617 so they touch but don't overlap (32px apart).
    { type: 'crate', x: 844, y: 585 },
    { type: 'crate', x: 844, y: 617 },
    // Robber's outpost
    { type: 'cottage',  x: 1450, y: 650, small: true },
    { type: 'campfire', x: 1380, y: 720 },
    { type: 'signpost', x: 920,  y: 720, text: 'TO BREMEN  ➤' },
  ],
  notes: [
    { x: 200,  y: 500 }, { x: 400,  y: 350 }, { x: 600,  y: 700 },
    { x: 780,  y: 450 }, { x: 940,  y: 350 }, // on stepping stones
    { x: 1100, y: 600 }, { x: 1300, y: 450 }, { x: 1500, y: 800 },
    { x: 1650, y: 600 }, { x: 940,  y: 750 }, // on bridge
  ],
  recruits: [],
  enemies: [
    // Bridge guards
    { x: 940,  y: 800, w: 26, h: 28, type: 'robber', alive: true, patrolType: 'vertical',   cx: 940,  cy: 800, range: 60,  t: 0, speed: 0.5,  weapon: 'club',  stunned: 0 },
    // West bank patrol
    { x: 500,  y: 600, w: 26, h: 28, type: 'robber', alive: true, patrolType: 'horizontal', cx: 500,  cy: 600, range: 100, t: 0, speed: 0.45, weapon: 'torch', stunned: 0 },
    // East bank trio
    { x: 1200, y: 500, w: 26, h: 28, type: 'robber', alive: true, patrolType: 'circle',     cx: 1200, cy: 500, range: 60,  t: 0, speed: 0.55, weapon: 'sack',  stunned: 0 },
    { x: 1400, y: 700, w: 26, h: 28, type: 'robber', alive: true, patrolType: 'horizontal', cx: 1400, cy: 700, range: 80,  t: 1, speed: 0.5,  weapon: 'club',  stunned: 0 },
    { x: 1600, y: 850, w: 26, h: 28, type: 'robber', alive: true, patrolType: 'vertical',   cx: 1600, cy: 850, range: 50,  t: 2, speed: 0.5,  weapon: 'torch', stunned: 0 },
  ],
  messages: [
    { x: 100,  y: 500, w: 200, h: 300, text: 'A wide river bars the way. Find the bridge — or use the stepping stones.', triggered: false, once: true },
    { x: 800,  y: 550, w: 200, h: 200, text: 'Crates block the bridge. As the Donkey, kick them with <span class="key">E</span>.', triggered: false, once: true },
    { x: 1000, y: 700, w: 200, h: 200, text: 'Across! The Cat\'s <span class="key">E</span> grants stealth past the patrols.', triggered: false, once: true },
  ],
};