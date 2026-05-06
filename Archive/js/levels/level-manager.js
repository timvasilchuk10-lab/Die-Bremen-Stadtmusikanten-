// ============================================================================
// LEVEL MANAGER
//
// Owns the LEVELS array (a runtime mutable copy of the per-level data) and the
// "original snapshot" used by restartGame(). Provides:
//   - loadLevel(idx)        — sets player spawn, recomputes total notes, etc.
//   - advanceLevel()        — go to the next chapter, or trigger 'win' on last
//   - getCurrentLevel()     — convenience for everyone else
//   - resetAllLevels()      — restart-game support: deep-copy fresh data back
// ============================================================================

import { CONFIG }          from '../config.js';
import { state }           from '../state.js';
import { player }          from '../entities/player.js';
import { setHudNoteTotal,
         updateLevelTag,
         updateScrollUI } from '../ui/hud.js';
import { showCutscene }    from '../ui/menus.js';

import { VILLAGE_LEVEL } from './village.js';
import { FOREST_LEVEL }  from './forest.js';
import { RIVER_LEVEL }   from './river.js';
import { COTTAGE_LEVEL } from './cottage.js';
import { BREMEN_LEVEL }  from './bremen.js';

// Live, mutable list of levels — match CONFIG.LEVELS order exactly.
export const LEVELS = [
  VILLAGE_LEVEL,
  FOREST_LEVEL,
  RIVER_LEVEL,
  COTTAGE_LEVEL,
  BREMEN_LEVEL,
];

// Frozen-by-deep-copy snapshot for restartGame(). Captured ONCE on import so
// the data isn't tainted by any in-game mutation that may have happened.
const ORIGINAL_LEVELS = JSON.parse(JSON.stringify(LEVELS));

/** Convenience accessor — returns the level object for the current chapter. */
export function getCurrentLevel() {
  return LEVELS[state.currentLevel];
}

/**
 * Load a level by index and align all per-run state (player position, camera,
 * total-notes counter, robber HP, message-triggered flags).
 */
export function loadLevel(idx) {
  state.currentLevel = idx;
  const L = LEVELS[idx];

  // Player spawn
  player.x = L.spawn.x;
  player.y = L.spawn.y;
  player.spawnX = L.spawn.x;
  player.spawnY = L.spawn.y;
  player.vx = 0; player.vy = 0;
  player.stacked = false;
  player.facingX = 1; player.facingY = 0;

  // Centre camera on player
  state.cameraX = player.x - CONFIG.CANVAS_WIDTH  / 2;
  state.cameraY = player.y - CONFIG.CANVAS_HEIGHT / 2;

  updateLevelTag();

  // Total notes across the whole game, computed from the pristine snapshot so
  // it doesn't shrink as the player picks notes up.
  let totalNotes = 0;
  for (const lvl of ORIGINAL_LEVELS) totalNotes += lvl.notes.length;
  setHudNoteTotal(totalNotes);

  // Reset message-triggered flags
  for (const m of L.messages) m.triggered = false;

  // Initialize robber HP / hit-state. Levels 4 & 5 (idx >= 3) are tougher.
  const tougher = idx >= 3;
  for (const e of L.enemies) {
    e.maxHp    = tougher ? 3 : 2;
    e.hp       = e.maxHp;
    e.hitFlash = 0;
    e.iframes  = 0;
    e.panicked = false;
    e.fleeT    = 0;
  }
  // Reset cottage one-time panic event so retrying the level rearms it.
  if (L.windowZone) L.panicTriggered = false;

  // Refresh the lore-counter HUD (hidden on levels without scrolls).
  updateScrollUI();
}

/**
 * Move on to the next chapter, with the appropriate cutscene. Triggers the
 * win screen when the final level is cleared.
 */
export function advanceLevel(onWin) {
  const next = state.currentLevel + 1;
  if (next >= LEVELS.length) {
    // Final win
    state.status = 'win';
    if (onWin) onWin();
    return;
  }
  // Cutscene before next level (CUTSCENE_BEFORE_LEVEL aligns with LEVELS by index)
  const cutsceneKey = CONFIG.CUTSCENE_BEFORE_LEVEL[next];
  if (cutsceneKey) {
    showCutscene(cutsceneKey, () => loadLevel(next));
  } else {
    loadLevel(next);
  }
}

/**
 * Deep-copy the original level data back into LEVELS — used by restartGame().
 * This brings back picked-up notes, downed enemies, broken crates, etc.
 */
/**
 * Reset only the level the player is currently on — used by game-over retry.
 * Restores enemies, notes, decor and message flags from the pristine snapshot.
 */
export function resetCurrentLevel() {
  const i = state.currentLevel;
  const fresh = JSON.parse(JSON.stringify(ORIGINAL_LEVELS[i]));
  LEVELS[i].notes    = fresh.notes;
  LEVELS[i].enemies  = fresh.enemies;
  LEVELS[i].messages = fresh.messages;
  LEVELS[i].decor    = fresh.decor;
  for (const m of LEVELS[i].messages) m.triggered = false;
}

export function resetAllLevels() {
  for (let i = 0; i < LEVELS.length; i++) {
    const fresh = JSON.parse(JSON.stringify(ORIGINAL_LEVELS[i]));
    LEVELS[i].notes    = fresh.notes;
    LEVELS[i].enemies  = fresh.enemies;
    LEVELS[i].messages = fresh.messages;
    LEVELS[i].decor    = fresh.decor;
    for (const m of LEVELS[i].messages) m.triggered = false;
  }
}