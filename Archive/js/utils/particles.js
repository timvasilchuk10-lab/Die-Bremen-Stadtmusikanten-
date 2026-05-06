// ============================================================================
// PARTICLES — tiny effect system used everywhere (note pickups, kicks, music
// waves, dust trails, stealth shimmer, etc.).
//
// Particles live in a flat array. Spawners push new ones, `update()` moves
// them and drops dead ones, `drawParticle()` renders a single particle.
// ============================================================================

import { state } from '../state.js';

export const particles = [];

function spawnParticle(x, y, vx, vy, color, life, size, type = 'dot') {
  particles.push({ x, y, vx, vy, color, life, maxLife: life, size, type });
}

export function spawnNoteBurst(x, y) {
  for (let i = 0; i < 8; i++) {
    const ang = (Math.PI * 2) * i / 8 + Math.random() * 0.3;
    spawnParticle(x, y, Math.cos(ang) * 1.6, Math.sin(ang) * 1.6 - 0.8,
                  '#d4a843', 50, 5, 'note');
  }
}

export function spawnDust(x, y) {
  for (let i = 0; i < 4; i++) {
    const ang = Math.random() * Math.PI * 2;
    spawnParticle(x, y, Math.cos(ang) * 0.8, Math.sin(ang) * 0.8,
                  '#b89968', 22, 3, 'dust');
  }
}

export function spawnImpact(x, y, color) {
  for (let i = 0; i < 14; i++) {
    const ang = Math.random() * Math.PI * 2;
    const sp  = 1.5 + Math.random() * 2.5;
    spawnParticle(x, y, Math.cos(ang) * sp, Math.sin(ang) * sp,
                  color || '#e87a5d', 28, 3, 'dot');
  }
}

export function spawnMusicWave(x, y) {
  for (let i = 0; i < 24; i++) {
    const ang = (Math.PI * 2) * i / 24;
    spawnParticle(x, y, Math.cos(ang) * 2.6, Math.sin(ang) * 2.6,
                  ['#d4a843', '#c77f7a', '#f0dca8'][i % 3], 60, 6, 'note');
  }
}

export function spawnBarkWave(x, y) {
  for (let i = 0; i < 20; i++) {
    const ang = (Math.PI * 2) * i / 20;
    spawnParticle(x, y, Math.cos(ang) * 4, Math.sin(ang) * 4,
                  '#c48f5b', 40, 5, 'ring');
  }
}

export function spawnCrowWave(x, y) {
  for (let i = 0; i < 18; i++) {
    const ang = (Math.PI * 2) * i / 18;
    spawnParticle(x, y, Math.cos(ang) * 3, Math.sin(ang) * 3,
                  '#f9a847', 50, 5, 'ring');
  }
}

/** Cat-stealth ambient sparkle — re-exposed for the player draw call. */
export function spawnStealthSparkle(x, y) {
  const ang = Math.random() * Math.PI * 2;
  spawnParticle(x + Math.cos(ang) * 14, y + Math.sin(ang) * 14,
                Math.cos(ang) * 0.4, Math.sin(ang) * 0.4,
                '#fcd9a8', 30, 3, 'dust');
}

/** Generic single-particle spawner — exposed because crate-shatter uses it. */
export function spawnDot(x, y, vx, vy, color, life, size) {
  spawnParticle(x, y, vx, vy, color, life, size, 'dot');
}

/** Step the simulation forward by one frame. */
export function updateParticles() {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx; p.y += p.vy;
    p.vx *= 0.96; p.vy *= 0.96;
    if (p.type !== 'note') p.vy *= 0.95;
    p.life--;
    if (p.life <= 0) particles.splice(i, 1);
  }
}

/** Draw a single particle. Caller is responsible for the camera transform. */
export function drawParticle(p) {
  const ctx = state.ctx;
  const alpha = p.life / p.maxLife;
  ctx.globalAlpha = alpha;
  if (p.type === 'note') {
    ctx.fillStyle = p.color;
    ctx.font = `${p.size * 3}px serif`;
    ctx.textAlign = 'center';
    ctx.fillText('♪', p.x, p.y);
  } else if (p.type === 'ring') {
    ctx.strokeStyle = p.color;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.stroke();
  } else {
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
  }
  ctx.globalAlpha = 1;
}
