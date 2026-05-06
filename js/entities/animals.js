// ============================================================================
// ANIMALS — drawing routines for the four companions.
//
// Two flavours of art:
//   drawAnimalTopDown      — in-world sprite (top-down, body faces movement)
//   paintAnimalPortrait    — square HUD/win-screen "bust" portrait (side view)
//
// Plus:
//   drawPlayer             — composes the active animal + the followers + the
//                            stack tower + ability VFX (kick ring, bark
//                            ripples, crow glow, stealth shimmer). Called by
//                            Game.render().
//
// All bodies are 1:1 with the original monolith — only the surrounding glue
// (imports/exports/state references) was reorganised.
// ============================================================================

import { state }      from '../state.js';
import { player }     from './player.js';
import { ANIMAL_DATA } from '../data/animals.js';
import { spawnStealthSparkle } from '../utils/particles.js';

// ────────────────────────────────────────────────────────────────────────────
// In-world top-down sprite
// ────────────────────────────────────────────────────────────────────────────

/**
 * Render a single animal at (cx, cy) facing (fx, fy). The "data" argument is
 * the entry from ANIMAL_DATA, NOT the index — that mirrors the original code
 * and lets the win-screen/portraits reuse the same draw without changing
 * who the active player is.
 */
export function drawAnimalTopDown(cx, cy, data, fx, fy, t, alpha) {
  const ctx = state.ctx;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.globalAlpha = alpha == null ? 1 : alpha;
  const angle = Math.atan2(fy, fx);
  ctx.rotate(angle);
  const bob = Math.sin(t * 0.8) * 1.5;

  // Drop shadow
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.beginPath();
  ctx.ellipse(0, 0, data.bodyLen / 2, data.bodyWid / 2, 0, 0, Math.PI * 2);
  ctx.fill();

  // Body
  ctx.fillStyle = data.color;
  ctx.beginPath();
  ctx.ellipse(-2, bob * 0.3, data.bodyLen / 2, data.bodyWid / 2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = data.accent;
  ctx.lineWidth = 1;
  ctx.stroke();

  // Belly
  ctx.fillStyle = data.belly;
  ctx.beginPath();
  ctx.ellipse(-2, 1 + bob * 0.3, data.bodyLen / 2 - 4, data.bodyWid / 2 - 3, 0, 0, Math.PI * 2);
  ctx.fill();

  // Head
  const headX = data.bodyLen / 2 - 2;
  ctx.fillStyle = data.color;
  ctx.beginPath();
  ctx.arc(headX, bob * 0.4, data.headSize, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = data.accent;
  ctx.lineWidth = 1;
  ctx.stroke();

  if (data === ANIMAL_DATA[0]) {
    // DONKEY — long ears, mane, tail
    ctx.fillStyle = data.color;
    ctx.beginPath(); ctx.ellipse(headX - 4, -8 + bob * 0.4, 3, 7, -0.4, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(headX - 4,  8 + bob * 0.4, 3, 7,  0.4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#c77f7a';
    ctx.beginPath(); ctx.ellipse(headX - 4, -8 + bob * 0.4, 1.5, 4, -0.4, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(headX - 4,  8 + bob * 0.4, 1.5, 4,  0.4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = data.mane;
    ctx.fillRect(-data.bodyLen / 2 + 2, -2, data.bodyLen / 3, 4);
    ctx.fillStyle = data.mane;
    ctx.fillRect(-data.bodyLen / 2 - 3, -1, 6, 2);
    ctx.fillStyle = '#1a0f08';
    ctx.beginPath(); ctx.arc(-data.bodyLen / 2 - 4, 0, 2, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = data.accent;
    ctx.beginPath(); ctx.arc(headX + 5, bob * 0.4, 4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#1a0f08';
    ctx.fillRect(headX + 7, bob * 0.4 - 2, 1, 1);
    ctx.fillRect(headX + 7, bob * 0.4 + 1, 1, 1);
  } else if (data === ANIMAL_DATA[1]) {
    // DOG — floppy ears, snout, wagging tail
    ctx.fillStyle = data.accent;
    ctx.beginPath(); ctx.ellipse(headX - 2, -7 + bob * 0.4, 4, 5, -0.2, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(headX - 2,  7 + bob * 0.4, 4, 5,  0.2, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = data.belly;
    ctx.beginPath(); ctx.ellipse(headX + 5, bob * 0.4, 4, 3, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#1a0f08';
    ctx.beginPath(); ctx.arc(headX + 7, bob * 0.4, 1.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = data.color;
    const tailWag = Math.sin(state.worldTime * 0.4) * 0.6;
    ctx.save();
    ctx.translate(-data.bodyLen / 2, 0);
    ctx.rotate(tailWag);
    ctx.fillRect(-7, -2, 8, 4);
    ctx.restore();
  } else if (data === ANIMAL_DATA[2]) {
    // CAT — pointy ears, stripes, raised tail
    ctx.fillStyle = data.color;
    ctx.beginPath();
    ctx.moveTo(headX - 4, -2); ctx.lineTo(headX - 8, -8); ctx.lineTo(headX, -6);
    ctx.closePath(); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(headX - 4, 2);  ctx.lineTo(headX - 8, 8); ctx.lineTo(headX, 6);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#c77f7a';
    ctx.beginPath();
    ctx.moveTo(headX - 4, -3); ctx.lineTo(headX - 6, -6); ctx.lineTo(headX - 1, -5);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = data.accent;
    ctx.lineWidth = 1;
    for (let i = -4; i <= 4; i += 4) {
      ctx.beginPath();
      ctx.moveTo(i - 4, -data.bodyWid / 2 + 1); ctx.lineTo(i, -data.bodyWid / 2 + 4);
      ctx.moveTo(i - 4,  data.bodyWid / 2 - 1); ctx.lineTo(i,  data.bodyWid / 2 - 4);
      ctx.stroke();
    }
    ctx.fillStyle = '#c77f7a';
    ctx.fillRect(headX + 5, bob * 0.4 - 1, 2, 1.5);
    ctx.strokeStyle = data.color;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-data.bodyLen / 2, 0);
    ctx.quadraticCurveTo(-data.bodyLen / 2 - 8, -10, -data.bodyLen / 2 - 4, -16);
    ctx.stroke();
  } else if (data === ANIMAL_DATA[3]) {
    // ROOSTER — comb, beak, wattle, tail feathers
    ctx.fillStyle = '#e74444';
    ctx.beginPath();
    ctx.moveTo(headX - 4, -8); ctx.lineTo(headX - 2, -12);
    ctx.lineTo(headX, -8); ctx.lineTo(headX + 2, -12);
    ctx.lineTo(headX + 4, -8); ctx.lineTo(headX + 4, -3);
    ctx.lineTo(headX - 4, -3); ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#f9a847';
    ctx.beginPath();
    ctx.moveTo(headX + 5, bob * 0.4 - 1); ctx.lineTo(headX + 11, bob * 0.4);
    ctx.lineTo(headX + 5, bob * 0.4 + 1); ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#e74444';
    ctx.beginPath(); ctx.arc(headX + 4, bob * 0.4 + 4, 2, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = data.accent;
    ctx.beginPath();
    ctx.ellipse(0, 0, data.bodyLen / 2 - 3, data.bodyWid / 2 - 3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = data.mane;
    ctx.beginPath();
    ctx.moveTo(-data.bodyLen / 2, -2);
    ctx.lineTo(-data.bodyLen / 2 - 8, -8);
    ctx.lineTo(-data.bodyLen / 2 - 6, -2);
    ctx.lineTo(-data.bodyLen / 2 - 10, 0);
    ctx.lineTo(-data.bodyLen / 2 - 6, 2);
    ctx.lineTo(-data.bodyLen / 2 - 8, 8);
    ctx.lineTo(-data.bodyLen / 2, 2);
    ctx.closePath();
    ctx.fill();
  }

  // Eye + highlight (shared)
  ctx.fillStyle = '#1a0f08';
  ctx.beginPath();
  ctx.arc(headX + 1, bob * 0.4 - 2, 1.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#f3e3bf';
  ctx.beginPath();
  ctx.arc(headX + 1.2, bob * 0.4 - 2.2, 0.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.restore();
}

/** Convenience: draw an animal by INDEX (used by drawRecruitPoint). */
export function drawAnimalByIndex(cx, cy, idx, fx, fy, t, alpha) {
  drawAnimalTopDown(cx, cy, ANIMAL_DATA[idx], fx, fy, t, alpha);
}

// ────────────────────────────────────────────────────────────────────────────
// drawPlayer — the active animal + followers + stack tower + ability VFX
// ────────────────────────────────────────────────────────────────────────────

export function drawPlayer() {
  const ctx = state.ctx;
  const a = ANIMAL_DATA[player.active];
  const stealthed = player.stealthT > 0 && player.active === 2;

  if (player.stacked) {
    const order = [0, 1, 2, 3].filter(i => player.recruited[i]);
    for (let k = 0; k < order.length; k++) {
      const idx = order[k];
      const data = ANIMAL_DATA[idx];
      const sx = 1 - k * 0.05;
      const off = -k * 14;
      ctx.save();
      ctx.translate(player.x, player.y + off);
      ctx.scale(sx, sx);
      const sway = Math.sin(state.worldTime * 0.1 + k * 0.5) * 1.5;
      ctx.translate(sway, 0);
      drawAnimalTopDown(0, 0, data, player.facingX, player.facingY, state.worldTime + k * 30);
      ctx.restore();
    }
    // Floating music notes around the stack
    for (let i = 0; i < 3; i++) {
      const ang = state.worldTime * 0.05 + i * Math.PI * 2 / 3;
      const r = 36;
      ctx.save();
      ctx.translate(player.x + Math.cos(ang) * r, player.y - 30 + Math.sin(ang) * r * 0.4);
      ctx.fillStyle = '#d4a843';
      ctx.font = 'bold 16px serif';
      ctx.textAlign = 'center';
      ctx.fillText('♪', 0, 0);
      ctx.restore();
    }
    return;
  }

  // Followers (recruited animals other than the active one) trail behind
  const order = [];
  for (let i = 0; i < 4; i++) {
    if (i !== player.active && player.recruited[i]) order.push(i);
  }
  for (let k = 0; k < order.length; k++) {
    const idx = order[k];
    const data = ANIMAL_DATA[idx];
    const tx = player.x - player.facingX * (28 * (k + 1)) + Math.sin(state.worldTime * 0.04 + k) * 4;
    const ty = player.y - player.facingY * (28 * (k + 1)) + Math.cos(state.worldTime * 0.04 + k) * 4;
    const followAlpha = stealthed ? 0.45 : 0.85;
    drawAnimalTopDown(tx, ty, data, player.facingX, player.facingY, state.worldTime + k * 12, followAlpha);
  }

  // The active animal
  let alpha = 1;
  if (player.invuln > 0 && Math.floor(state.worldTime / 4) % 2) alpha = 0.4;
  if (stealthed) alpha = 0.45;
  drawAnimalTopDown(player.x, player.y, a, player.facingX, player.facingY,
                    state.worldTime + player.walkT, alpha);

  // Ability VFX — kick ring (donkey)
  if (player.kickT > 0 && player.active === 0) {
    const t = player.kickT / 24;
    ctx.save();
    ctx.strokeStyle = `rgba(212,168,67,${t})`;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(player.x + player.facingX * 30, player.y + player.facingY * 30,
            30 * (1 - t) + 10, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
  // Bark ripples (dog)
  if (player.barkT > 0 && player.active === 1) {
    const t = player.barkT / 20;
    ctx.save();
    ctx.strokeStyle = `rgba(196,143,91,${t})`;
    ctx.lineWidth = 3;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.arc(player.x, player.y, 30 + (1 - t) * 100 + i * 10, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }
  // Crow glow (rooster)
  if (player.crowT > 0 && player.active === 3) {
    const t = player.crowT / 180;
    ctx.save();
    ctx.fillStyle = `rgba(249,168,71,${t * 0.4})`;
    ctx.beginPath();
    ctx.arc(player.x, player.y, 60, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  // Cat stealth shimmer
  if (stealthed && state.worldTime % 4 === 0) {
    spawnStealthSparkle(player.x, player.y);
  }
}

// ────────────────────────────────────────────────────────────────────────────
// HUD-friendly side-view "bust" portraits for the four animals.
// Used by paintCompanionPortraits() (HUD slots) and the win-screen silhouettes.
// ────────────────────────────────────────────────────────────────────────────

export function paintAnimalPortrait(target, animalIdx, size) {
  target.clearRect(0, 0, size, size);
  const cx = size / 2, cy = size / 2;
  // Medallion background (subtle radial)
  const bg = target.createRadialGradient(cx, cy, 0, cx, cy, size / 2);
  bg.addColorStop(0, 'rgba(50,38,28,0.55)');
  bg.addColorStop(1, 'rgba(20,12,18,0.75)');
  target.fillStyle = bg;
  target.beginPath();
  target.arc(cx, cy, size / 2 - 1, 0, Math.PI * 2);
  target.fill();
  // Inner ring
  target.strokeStyle = 'rgba(212,168,67,0.5)';
  target.lineWidth = 1;
  target.beginPath();
  target.arc(cx, cy, size / 2 - 2, 0, Math.PI * 2);
  target.stroke();

  target.save();
  target.translate(cx, cy);
  const s = size / 40;
  target.scale(s, s);
  if (animalIdx === 0)      drawDonkeyPortrait(target);
  else if (animalIdx === 1) drawDogPortrait(target);
  else if (animalIdx === 2) drawCatPortrait(target);
  else if (animalIdx === 3) drawRoosterPortrait(target);
  target.restore();
}

function drawDonkeyPortrait(g) {
  g.fillStyle = '#9d8c78';
  g.beginPath(); g.ellipse(-4, -14, 3, 7, -0.15, 0, Math.PI * 2); g.fill();
  g.beginPath(); g.ellipse( 4, -14, 3, 7,  0.15, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#c77f7a';
  g.beginPath(); g.ellipse(-4, -13, 1.4, 4, -0.15, 0, Math.PI * 2); g.fill();
  g.beginPath(); g.ellipse( 4, -13, 1.4, 4,  0.15, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#9d8c78';
  g.beginPath();
  g.moveTo(-9, -8);
  g.quadraticCurveTo(-11, 0, -7, 8);
  g.quadraticCurveTo(0, 14, 7, 8);
  g.quadraticCurveTo(11, 0, 9, -8);
  g.quadraticCurveTo(0, -12, -9, -8);
  g.closePath();
  g.fill();
  g.strokeStyle = '#5a4a3a';
  g.lineWidth = 1;
  g.stroke();
  g.fillStyle = '#c4b298';
  g.beginPath();
  g.ellipse(0, 7, 6, 4, 0, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = '#3a2a1a';
  g.fillRect(-2, -10, 4, 4);
  g.fillStyle = '#1a0f08';
  g.beginPath(); g.arc(-4, -1, 1.4, 0, Math.PI * 2); g.fill();
  g.beginPath(); g.arc( 4, -1, 1.4, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#fff';
  g.fillRect(-4.5, -2, 0.7, 0.7);
  g.fillRect( 3.5, -2, 0.7, 0.7);
  g.fillStyle = '#3a1f0c';
  g.fillRect(-2.5, 7, 1.2, 1.2);
  g.fillRect( 1.3, 7, 1.2, 1.2);
}

function drawDogPortrait(g) {
  g.fillStyle = '#5a3818';
  g.beginPath(); g.ellipse(-9, -2, 4, 8, -0.3, 0, Math.PI * 2); g.fill();
  g.beginPath(); g.ellipse( 9, -2, 4, 8,  0.3, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#8b5a2b';
  g.beginPath();
  g.arc(0, 0, 10, 0, Math.PI * 2);
  g.fill();
  g.strokeStyle = '#4d2e15';
  g.lineWidth = 1;
  g.stroke();
  g.fillStyle = '#3a2010';
  g.beginPath(); g.ellipse(-9, -1, 2, 5, -0.3, 0, Math.PI * 2); g.fill();
  g.beginPath(); g.ellipse( 9, -1, 2, 5,  0.3, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#c48f5b';
  g.beginPath();
  g.ellipse(0, 6, 5.5, 4, 0, 0, Math.PI * 2);
  g.fill();
  g.strokeStyle = '#4d2e15';
  g.stroke();
  g.fillStyle = '#1a0f08';
  g.beginPath();
  g.moveTo(-2, 4); g.lineTo(2, 4); g.lineTo(0, 6.5);
  g.closePath(); g.fill();
  g.strokeStyle = '#3a1f0c';
  g.lineWidth = 1;
  g.beginPath();
  g.moveTo(0, 6.5); g.lineTo(0, 9);
  g.moveTo(0, 9);   g.lineTo(-2, 10);
  g.moveTo(0, 9);   g.lineTo( 2, 10);
  g.stroke();
  g.fillStyle = '#1a0f08';
  g.beginPath(); g.arc(-4, -2, 1.4, 0, Math.PI * 2); g.fill();
  g.beginPath(); g.arc( 4, -2, 1.4, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#fff';
  g.fillRect(-4.5, -3, 0.7, 0.7);
  g.fillRect( 3.5, -3, 0.7, 0.7);
  g.fillStyle = 'rgba(196,143,91,0.5)';
  g.beginPath(); g.ellipse(0, -5, 4, 3, 0, 0, Math.PI * 2); g.fill();
}

function drawCatPortrait(g) {
  g.fillStyle = '#d97706';
  g.beginPath();
  g.moveTo(-9, -4); g.lineTo(-7, -14); g.lineTo(-2, -7);
  g.closePath(); g.fill();
  g.beginPath();
  g.moveTo( 9, -4); g.lineTo( 7, -14); g.lineTo( 2, -7);
  g.closePath(); g.fill();
  g.fillStyle = '#c77f7a';
  g.beginPath();
  g.moveTo(-7, -5); g.lineTo(-7, -11); g.lineTo(-3.5, -7);
  g.closePath(); g.fill();
  g.beginPath();
  g.moveTo( 7, -5); g.lineTo( 7, -11); g.lineTo( 3.5, -7);
  g.closePath(); g.fill();
  g.fillStyle = '#d97706';
  g.beginPath();
  g.moveTo(-10, -2);
  g.quadraticCurveTo(-12, 4, -8, 9);
  g.quadraticCurveTo(0, 13, 8, 9);
  g.quadraticCurveTo(12, 4, 10, -2);
  g.quadraticCurveTo(0, -8, -10, -2);
  g.closePath();
  g.fill();
  g.strokeStyle = '#7c2d12';
  g.lineWidth = 1;
  g.stroke();
  g.strokeStyle = '#7c2d12';
  g.lineWidth = 0.8;
  g.beginPath();
  g.moveTo(-7, -3); g.lineTo(-9, -1);
  g.moveTo(-3, -5); g.lineTo(-3, -8);
  g.moveTo( 3, -5); g.lineTo( 3, -8);
  g.moveTo( 7, -3); g.lineTo( 9, -1);
  g.stroke();
  g.fillStyle = '#5fa84a';
  g.beginPath(); g.ellipse(-4, 0, 2.2, 2.6, 0, 0, Math.PI * 2); g.fill();
  g.beginPath(); g.ellipse( 4, 0, 2.2, 2.6, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#1a0f08';
  g.beginPath(); g.ellipse(-4, 0, 0.8, 2.2, 0, 0, Math.PI * 2); g.fill();
  g.beginPath(); g.ellipse( 4, 0, 0.8, 2.2, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#c77f7a';
  g.beginPath();
  g.moveTo(-1.5, 4); g.lineTo(1.5, 4); g.lineTo(0, 6);
  g.closePath(); g.fill();
  g.strokeStyle = '#3a1f0c';
  g.lineWidth = 0.8;
  g.beginPath();
  g.moveTo(0, 6); g.lineTo(0, 8);
  g.moveTo(0, 8); g.quadraticCurveTo(-2, 9.5, -3, 8.5);
  g.moveTo(0, 8); g.quadraticCurveTo( 2, 9.5,  3, 8.5);
  g.stroke();
  g.beginPath();
  g.moveTo(-4, 6); g.lineTo(-12, 5);
  g.moveTo(-4, 7); g.lineTo(-12, 8);
  g.moveTo( 4, 6); g.lineTo( 12, 5);
  g.moveTo( 4, 7); g.lineTo( 12, 8);
  g.stroke();
}

function drawRoosterPortrait(g) {
  g.fillStyle = '#e74444';
  g.beginPath();
  g.moveTo(-8, -3);
  g.lineTo(-7, -10);
  g.lineTo(-3, -6);
  g.lineTo(-1, -12);
  g.lineTo( 2, -7);
  g.lineTo( 5, -13);
  g.lineTo( 8, -7);
  g.lineTo( 8, -3);
  g.closePath();
  g.fill();
  g.strokeStyle = '#7a0a0a';
  g.lineWidth = 1;
  g.stroke();
  g.fillStyle = '#e7c59d';
  g.beginPath();
  g.ellipse(0, 2, 9, 8, 0, 0, Math.PI * 2);
  g.fill();
  g.strokeStyle = '#7a5a3a';
  g.lineWidth = 1;
  g.stroke();
  g.fillStyle = '#b91c1c';
  g.beginPath();
  g.moveTo(-9, 7);  g.lineTo(-11, 14); g.lineTo(-6, 10);
  g.lineTo(-3, 14); g.lineTo(0, 10);
  g.lineTo( 3, 14); g.lineTo(6, 10);
  g.lineTo(11, 14); g.lineTo(9, 7);
  g.closePath();
  g.fill();
  g.strokeStyle = '#450a0a';
  g.stroke();
  g.fillStyle = '#f9a847';
  g.beginPath();
  g.moveTo(7, 0); g.lineTo(15, 2); g.lineTo(7, 4);
  g.closePath();
  g.fill();
  g.strokeStyle = '#7a4a0a';
  g.stroke();
  g.beginPath();
  g.moveTo(7, 2); g.lineTo(14, 2);
  g.stroke();
  g.fillStyle = '#e74444';
  g.beginPath();
  g.ellipse(7, 6, 2, 3.5, 0, 0, Math.PI * 2);
  g.fill();
  g.strokeStyle = '#7a0a0a';
  g.stroke();
  g.fillStyle = '#1a0f08';
  g.beginPath();
  g.arc(2, 0, 2.2, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = '#fff';
  g.fillRect(1.2, -0.8, 1, 1);
  g.fillStyle = '#f3e3bf';
  g.beginPath();
  g.ellipse(0, 6, 2, 1.5, 0, 0, Math.PI * 2);
  g.fill();
}
