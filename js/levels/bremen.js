// ============================================================================
// LEVEL 5: BREMEN (the final chapter)
// ============================================================================

export const BREMEN_LEVEL = {
  id: 'bremen',
  name: 'Bremen',
  chapter: 'Chapter V',
  width: 2200, height: 1300,
  tileType: 'cobblestone',
  spawn: { x: 150, y: 700 },
  exit: { x: 2060, y: 560, w: 90, h: 180, label: 'THE STATUE', isFinal: true },
  walls: [
    { x: 0, y: 200,  w: 2200, h: 18, type: 'stonewall' },
    { x: 0, y: 1000, w: 2200, h: 18, type: 'stonewall' },
  ],
  decor: [
    // ── Marktplatz ground — must be first so it renders under everything ─────
    { type: 'cobblePlaza', x: 1620, y: 640, w: 380, h: 280 },

    // ── City entry gate ───────────────────────────────────────────────────────
    { type: 'citygate', x: 80, y: 620 },

    // ── Schnoor quarter — packed narrow lane (35px spacing, south side) ───────
    { type: 'schnoor', x: 260, y: 880, variant: 0 },
    { type: 'schnoor', x: 295, y: 880, variant: 1 },
    { type: 'schnoor', x: 330, y: 880, variant: 0 },
    { type: 'schnoor', x: 365, y: 880, variant: 1 },
    { type: 'schnoor', x: 400, y: 880, variant: 0 },
    { type: 'schnoor', x: 435, y: 880, variant: 1 },
    // Schnoor east cluster
    { type: 'schnoor', x: 1080, y: 880, variant: 1 },
    { type: 'schnoor', x: 1115, y: 880, variant: 0 },
    { type: 'schnoor', x: 1150, y: 880, variant: 1 },
    { type: 'schnoor', x: 1185, y: 880, variant: 0 },

    // ── Hanseatic houses — north side, west of Cathedral ──────────────────────
    { type: 'hansehouse', x: 320, y: 380, variant: 0 },
    { type: 'hansehouse', x: 480, y: 380, variant: 1 },
    { type: 'hansehouse', x: 640, y: 380, variant: 0 },

    // ── BREMEN CATHEDRAL (St. Petri Dom) ─────────────────────────────────────
    { type: 'cathedral', x: 900, y: 370 },

    // ── Hanseatic houses east of Cathedral, west of Marktplatz ───────────────
    { type: 'hansehouse', x: 1160, y: 380, variant: 1 },
    { type: 'hansehouse', x: 1320, y: 380, variant: 0 },

    // ── RATHAUS — north side of Marktplatz ───────────────────────────────────
    { type: 'rathaus', x: 1620, y: 370 },

    // ── SCHÜTTING — south side of Marktplatz, facing Rathaus ─────────────────
    { type: 'schutting', x: 1620, y: 860 },

    // ── ROLAND STATUE — centre of Marktplatz ─────────────────────────────────
    { type: 'roland', x: 1620, y: 680 },

    // ── BREMEN TOWN MUSICIANS STATUE — final destination ─────────────────────
    { type: 'musiciansStatue', x: 2000, y: 600 },

    // ── Market stalls — west corridor only, keep plaza clear ─────────────────
    { type: 'stall', x: 600,  y: 580, color: '#8a2c2c' },
    { type: 'stall', x: 750,  y: 700, color: '#3a5a8a' },
    { type: 'stall', x: 1100, y: 620, color: '#6b4423' },
    { type: 'stall', x: 1280, y: 740, color: '#8a2c2c' },

    // ── Banners — on building faces, not free-floating ────────────────────────
    { type: 'banner', x: 320,  y: 470 },
    { type: 'banner', x: 640,  y: 470 },
    { type: 'banner', x: 1160, y: 470 },
    { type: 'banner', x: 1500, y: 470 },
    { type: 'banner', x: 1740, y: 470 },

    // ── Wells ─────────────────────────────────────────────────────────────────
    { type: 'well', x: 560,  y: 700 },
    { type: 'well', x: 1420, y: 700 },

    // ── Cheering citizens near the statue ─────────────────────────────────────
    { type: 'citizen', x: 1940, y: 720, color: '#3a5a8a' },
    { type: 'citizen', x: 1990, y: 760, color: '#8a2c2c' },
    { type: 'citizen', x: 2040, y: 730, color: '#5a3a2a' },
    { type: 'citizen', x: 2080, y: 770, color: '#3a5a8a' },
    { type: 'citizen', x: 1900, y: 750, color: '#8a2c2c' },
    { type: 'citizen', x: 1860, y: 720, color: '#5a3a2a' },
    // Scattered onlookers along the path
    { type: 'citizen', x: 1060, y: 730, color: '#5a3a2a' },
    { type: 'citizen', x: 700,  y: 730, color: '#8a2c2c' },
    { type: 'citizen', x: 820,  y: 760, color: '#3a5a8a' },

    // ── Signpost pointing to Musicians Statue ─────────────────────────────────
    { type: 'signpost', x: 1810, y: 620, text: 'STATUE  ➤' },
  ],
  notes: [
    { x: 300,  y: 700 }, { x: 500,  y: 620 }, { x: 700,  y: 700 },
    { x: 900,  y: 660 }, { x: 1100, y: 700 }, { x: 1300, y: 720 },
    { x: 1500, y: 640 }, { x: 1700, y: 700 }, { x: 900,  y: 850 },
    { x: 1150, y: 850 }, { x: 1950, y: 800 },
  ],
  recruits: [],
  scrolls: [
    // Each scroll sits NEAR (not under) its landmark, on a path the player
    // naturally walks. read=false at start; load resets via level-manager.
    { x: 1700, y: 530, id: 'rathaus',   read: false },  // east of Rathaus
    { x: 1560, y: 730, id: 'roland',    read: false },  // beside Roland on plaza
    { x: 980,  y: 540, id: 'cathedral', read: false },  // east of Cathedral entrance
    // Schnoor — placed on clean cobble in FRONT of the lane, not blended into it.
    // The previous spot at (380, 820) was inside the parchment-toned house row
    // and disappeared visually. Moved north onto the open plaza.
    { x: 250,  y: 790, id: 'schnoor',   read: false },
    { x: 1960, y: 660, id: 'musicians', read: false },  // approach to the statue
  ],
  enemies: [
    { x: 680,  y: 640, w: 26, h: 28, type: 'robber', alive: true, patrolType: 'horizontal', cx: 680,  cy: 640, range: 80, t: 0, speed: 0.5,  weapon: 'club',  stunned: 0 },
    { x: 1000, y: 700, w: 26, h: 28, type: 'robber', alive: true, patrolType: 'circle',     cx: 1000, cy: 700, range: 60, t: 1, speed: 0.55, weapon: 'sack',  stunned: 0 },
    { x: 1300, y: 640, w: 26, h: 28, type: 'robber', alive: true, patrolType: 'vertical',   cx: 1300, cy: 640, range: 70, t: 2, speed: 0.45, weapon: 'torch', stunned: 0 },
    { x: 1490, y: 780, w: 26, h: 28, type: 'robber', alive: true, patrolType: 'horizontal', cx: 1490, cy: 780, range: 60, t: 0, speed: 0.5,  weapon: 'club',  stunned: 0 },
  ],
  messages: [
    { x: 150,  y: 600, w: 200, h: 300, text: 'The free city of Bremen! The Cathedral, the Rathaus, the Roland — all stand before you.', triggered: false, once: true },
    { x: 820,  y: 580, w: 300, h: 300, text: 'A few robbers prowl even here. Stack and play your song.', triggered: false, once: true },
    { x: 1700, y: 580, w: 300, h: 200, text: 'There — the bronze statue of the Bremen Town Musicians. Step upon it.', triggered: false, once: true },
  ],
};