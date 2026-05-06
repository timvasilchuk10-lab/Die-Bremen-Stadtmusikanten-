// ============================================================================
// STATE — shared mutable runtime state.
// In the original monolith these were top-level `let` globals. We collect them
// here so any module can `import { state } from './state.js'` and read/write
// the same values. This is the simplest faithful translation that preserves
// behaviour without re-architecting how the game thinks about itself.
// ============================================================================

export const state = {
  // Rendering context — set by main.js once the canvas exists.
  canvas: null,
  ctx:    null,

  // High-level game state machine:
  //   'title'    — title screen visible
  //   'play'     — gameplay running
  //   'cutscene' — parchment showing
  //   'win'      — victory screen
  status: 'title',

  // Current level index in CONFIG.LEVELS
  currentLevel: 0,

  // Frame counter — drives all sin/cos animations
  worldTime: 0,

  // Camera (world-space top-left of the viewport)
  cameraX: 0,
  cameraY: 0,
  cameraShake: 0,
};

// Reset helper used by restartGame() — keeps the same object identity so any
// module that captured a reference still sees the new values.
export function resetState() {
  state.status       = 'title';
  state.currentLevel = 0;
  state.worldTime    = 0;
  state.cameraX      = 0;
  state.cameraY      = 0;
  state.cameraShake  = 0;
}
