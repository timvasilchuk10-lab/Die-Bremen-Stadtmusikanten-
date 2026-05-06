// ============================================================================
// COLLISION — shape utilities + decor → solids translation + moveAndCollide.
//
// `decorSolids(L)` walks the level's decor array and produces axis-aligned
// rectangles that the player should not pass through. Some decor (river,
// bridge, stepping stones) needs special handling — see `moveAndCollide`.
// ============================================================================

import { state }              from '../state.js';
import { player }             from '../entities/player.js';
import { ANIMAL_DATA }        from '../data/animals.js';
import { getCurrentLevel }    from '../levels/level-manager.js';

/** Generic AABB overlap test. */
export function rectOverlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x &&
         a.y < b.y + b.h && a.y + a.h > b.y;
}

/** Euclidean distance between (ax,ay) and (bx,by). */
export function dist(ax, ay, bx, by) {
  const dx = ax - bx, dy = ay - by;
  return Math.hypot(dx, dy);
}

/** AABB around the active animal's body, used for trigger volumes. */
export function activeBox() {
  const a = ANIMAL_DATA[player.active];
  return {
    x: player.x - a.bodyLen / 2,
    y: player.y - a.bodyWid / 2,
    w: a.bodyLen,
    h: a.bodyWid,
  };
}

/**
 * Compute the array of solid rectangles for a given level. The translation
 * from decor type → bounding box is intentionally hand-written per type so
 * artists can tune visuals without breaking collision.
 *
 * Solids tagged with `_isRiver: true` are treated specially in
 * `moveAndCollide` — bridges/stones can cancel them.
 */
export function decorSolids(L) {
  const solids = [];
  for (const d of L.decor) {
    let r = null;
    if      (d.type === 'mill')         r = { x: d.x - 50,  y: d.y - 50,  w: 100, h: 100 };
    else if (d.type === 'house')        r = { x: d.x - 60,  y: d.y - 50,  w: 120, h: 80  };
    else if (d.type === 'hansehouse')   r = { x: d.x - 55,  y: d.y - 60,  w: 110, h: 90  };
    else if (d.type === 'schnoor')      r = { x: d.x - 35,  y: d.y - 70,  w: 70,  h: 100 };
    else if (d.type === 'cathedral')    r = { x: d.x - 110, y: d.y - 100, w: 220, h: 200 };
    else if (d.type === 'rathaus')      r = { x: d.x - 130, y: d.y - 80,  w: 260, h: 170 };
    else if (d.type === 'roland')       r = { x: d.x - 18,  y: d.y - 50,  w: 36,  h: 70  };
    else if (d.type === 'musiciansStatue') r = { x: d.x - 30, y: d.y - 50, w: 60, h: 70  };
    else if (d.type === 'barn')         r = { x: d.x - 70,  y: d.y - 60,  w: 140, h: 110 };
    else if (d.type === 'coop')         r = { x: d.x - 35,  y: d.y - 30,  w: 70,  h: 60  };
    else if (d.type === 'well')         r = { x: d.x - 18,  y: d.y - 18,  w: 36,  h: 36  };
    else if (d.type === 'cart')         r = { x: d.x - 30,  y: d.y - 20,  w: 60,  h: 40  };
    else if (d.type === 'tree' || d.type === 'darktree')
                                        r = { x: d.x - 18,  y: d.y - 18,  w: 36,  h: 36  };
    else if (d.type === 'rock')         r = { x: d.x - 22,  y: d.y - 18,  w: 44,  h: 32  };
    else if (d.type === 'cottage') {
      const sm = d.small ? 0.7 : (d.big ? 1.3 : 1);
      r = { x: d.x - 70 * sm, y: d.y - 60 * sm, w: 140 * sm, h: 110 * sm };
    }
    else if (d.type === 'ruin')         r = { x: d.x - 50,  y: d.y - 40,  w: 100, h: 80  };
    else if (d.type === 'stall')        r = { x: d.x - 30,  y: d.y - 20,  w: 60,  h: 40  };
    else if (d.type === 'citygate')     r = { x: d.x - 35,  y: d.y - 60,  w: 70,  h: 120 };
    else if (d.type === 'crate' && !d.broken)   r = { x: d.x - 16, y: d.y - 16, w: 32, h: 32 };
    else if (d.type === 'cage'  && !d.broken)   r = { x: d.x - 22, y: d.y - 18, w: 44, h: 36 };
    else if (d.type === 'chest' && !d.opened)   r = { x: d.x - 18, y: d.y - 14, w: 36, h: 28 };
    else if (d.type === 'watchtower')   r = { x: d.x - 35,  y: d.y - 50,  w: 70,  h: 100 };
    else if (d.type === 'river')        r = { x: d.x - d.w / 2, y: 0, w: d.w, h: d.h, _isRiver: true };
    else if (d.type === 'bigbridge')    r = null; // open passage
    else if (d.type === 'stone')        r = null; // walkable stepping stone
    else if (d.type === 'signpost')     r = { x: d.x - 8,  y: d.y - 8,  w: 16, h: 16 };
    else if (d.type === 'post')         r = { x: d.x - 4,  y: d.y - 6,  w: 8,  h: 12 };
    if (r) solids.push(r);
  }
  for (const w of L.walls) solids.push(w);
  return solids;
}

/**
 * Move the player by (dx, dy) world-units, resolving collisions axis-by-axis
 * against the current level's solids. The river is special-cased: it's solid
 * UNLESS the player's centre is inside a bridge or stepping-stone "cancel
 * zone".
 */
export function moveAndCollide(dx, dy) {
  const a = ANIMAL_DATA[player.active];
  const halfW = a.bodyLen / 2;
  const halfH = a.bodyWid / 2;
  const L = getCurrentLevel();
  const solids = decorSolids(L);

  // Collect cancel zones (places where river collision is disabled).
  // Generously sized so the player can never fall into the river while ANY
  // part of their body still touches a bridge or stepping stone.
  const cancelZones = [];
  for (const d of L.decor) {
    if (d.type === 'bigbridge')      cancelZones.push({ x: d.x - 110, y: d.y - 50, w: 220, h: 100 });
    else if (d.type === 'bridge')    cancelZones.push({ x: d.x - 75,  y: d.y - 35, w: 150, h: 70 });
    else if (d.type === 'stone')     cancelZones.push({ x: d.x - 40,  y: d.y - 40, w: 80,  h: 80  });
  }
  // Whole-rectangle test: if ANY part of the player body overlaps a cancel
  // zone, the river is disabled. Fixes the "fall through bridge" bug where
  // the player's centre left the zone but the body still touched water.
  function rectInCancel(px, py) {
    const r = { x: px - halfW, y: py - halfH, w: a.bodyLen, h: a.bodyWid };
    for (const z of cancelZones) {
      if (rectOverlap(r, z)) return true;
    }
    return false;
  }

  // X axis
  player.x += dx;
  for (const s of solids) {
    const r = { x: player.x - halfW, y: player.y - halfH, w: a.bodyLen, h: a.bodyWid };
    if (rectOverlap(r, s)) {
      if (s._isRiver && rectInCancel(player.x, player.y)) continue;
      if (dx > 0)      player.x = s.x - halfW;
      else if (dx < 0) player.x = s.x + s.w + halfW;
    }
  }
  // Y axis
  player.y += dy;
  for (const s of solids) {
    const r = { x: player.x - halfW, y: player.y - halfH, w: a.bodyLen, h: a.bodyWid };
    if (rectOverlap(r, s)) {
      if (s._isRiver && rectInCancel(player.x, player.y)) continue;
      if (dy > 0)      player.y = s.y - halfH;
      else if (dy < 0) player.y = s.y + s.h + halfH;
    }
  }
  // Clamp to level bounds
  player.x = Math.max(40, Math.min(L.width  - 40, player.x));
  player.y = Math.max(40, Math.min(L.height - 40, player.y));
}