// ============================================================================
// CONFIG — all tunable constants and registries.
// Behaviour is identical to the original monolith; values are extracted, not
// changed. If you tweak something, you do it here, not in random files.
// ============================================================================

export const CONFIG = {
  // Canvas / viewport (the canvas in index.html is fixed at this size)
  CANVAS_WIDTH:  960,
  CANVAS_HEIGHT: 600,

  // Player base movement (per-animal multipliers live in ANIMAL_DATA)
  PLAYER_BASE_SPEED: 2.6,
  STACK_SPEED_MULT:  0.65,
  STEALTH_SPEED_MULT: 1.15,

  // Camera
  CAMERA_LERP: 0.12,

  // Combat / abilities
  MUSIC_NOTE_COST: 1,        // notes consumed per stacked-music attack
  MUSIC_DAMAGE_RANGE: 240,
  CONTACT_DAMAGE_RANGE: 28,
  PLAYER_INVULN_FRAMES: 80,
  PLAYER_MAX_HP: 4,          // hearts in the shared party pool
  ROBBER_DAMAGE: 1,          // HP lost per robber touch

  // Audio
  MUSIC_VOLUME_ON:  0.16,
  MUSIC_VOLUME_OFF: 0,
  BPM: 92,

  // Level registry — `id` matches the key in LevelManager.LEVEL_CLASSES.
  // Order here defines the chapter order in-game.
  LEVELS: [
    { id: 'village', name: 'The Village',          chapter: 'Chapter I'   },
    { id: 'forest',  name: 'The Forest Road',      chapter: 'Chapter II'  },
    { id: 'river',   name: 'The River Crossing',   chapter: 'Chapter III' },
    { id: 'cottage', name: "The Robbers' Cottage", chapter: 'Chapter IV'  },
    { id: 'bremen',  name: 'Bremen',               chapter: 'Chapter V'   },
  ],

  // Cutscene to play BEFORE entering each level (by level index).
  // null = no cutscene (e.g., entering the very first level shows 'intro' from beginAdventure).
  CUTSCENE_BEFORE_LEVEL: [null, 'afterVillage', 'afterForest', 'afterRiver', 'afterCottage'],
};