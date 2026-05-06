// ============================================================================
// NPCs — peaceful villagers and townsfolk.
//
// Currently the only "peaceful NPC" type rendered in the game is `citizen`
// in the Bremen plaza, drawn directly by the renderer's drawCitizen() (it's
// purely decorative — no dialogue, no interaction).
//
// This file is the canonical home for future NPC types: shopkeepers, quest-
// givers, historical guides, etc. The interface is intentionally minimal:
//   - Each NPC has { x, y, type, dialogue?, trigger? }
//   - drawNpc(npc) — paints the sprite (caller has translated to world space)
//   - npcsTriggerNear(player) — used by Game.update for proximity dialogues
//
// NEW NPCs go here, NOT in renderer.js (to keep concerns separated).
// ============================================================================

// Placeholder — this module exports nothing the rest of the game needs yet.
// When you add a new NPC type:
//   1) Add a `drawXyz(npc)` function below
//   2) Register it in a dispatcher exported from this file
//   3) Levels reference it via decor entries with `type: 'xyz'`, OR via a
//      separate `npcs: []` array on the level object that game.render reads.
