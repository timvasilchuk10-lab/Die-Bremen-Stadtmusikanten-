// ============================================================================
// ENEMIES — robber drawing.
//
// Robbers' MOTION (patrol logic), state (alive/stunned/iframes/hp), and
// contact damage live in player.js / level data — same as the original
// monolith. Here we only deal with how a robber LOOKS on screen, including:
//   - hooded silhouette
//   - per-weapon detail (club, torch, money sack)
//   - hit-flash (pale tint + jitter)
//   - HP pips when wounded
//   - stun stars
// ============================================================================

import { state } from '../state.js';

export function drawRobber(e) {
  const ctx = state.ctx;
  const ex = e.x + e.w / 2;
  const ey = e.y + e.h / 2;
  ctx.save();
  ctx.translate(ex, ey);

  // Hit flash: small jitter + pale tint when hitFlash is active
  const flashing = e.hitFlash > 0 && (e.hitFlash & 2);
  if (e.hitFlash > 0) {
    ctx.translate((Math.random() - 0.5) * 1.4, (Math.random() - 0.5) * 1.4);
  }

  // Drop shadow
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  ctx.beginPath();
  ctx.ellipse(0, 0, 14, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Robe / cloak silhouette
  ctx.fillStyle = flashing ? '#f3e6c8' : '#2a1a2a';
  ctx.beginPath();
  ctx.ellipse(0, -2, 12, 14, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#1a0f1a';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Hood
  ctx.fillStyle = '#3a2a3a';
  ctx.beginPath();
  ctx.arc(0, -8, 7, 0, Math.PI * 2);
  ctx.fill();

  // Eyes / stun stars
  if (e.stunned > 0) {
    ctx.font = 'bold 7px serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#f9d597';
    ctx.fillText('✦', -4, -16 + Math.sin(state.worldTime * 0.3) * 1);
    ctx.fillText('✦',  4, -16 + Math.sin(state.worldTime * 0.3 + 1) * 1);
    ctx.fillStyle = '#888';
    ctx.beginPath();
    ctx.arc(-2, -9, 1, 0, Math.PI * 2);
    ctx.arc( 2, -9, 1, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.fillStyle = '#e74444';
    ctx.beginPath();
    ctx.arc(-2, -9, 1, 0, Math.PI * 2);
    ctx.arc( 2, -9, 1, 0, Math.PI * 2);
    ctx.fill();
  }

  // Weapon
  if (e.weapon === 'club') {
    ctx.fillStyle = '#5a3a1a';
    ctx.fillRect(8, -4, 4, 12);
    ctx.fillStyle = '#3a2818';
    ctx.beginPath();
    ctx.arc(10, 9, 4, 0, Math.PI * 2);
    ctx.fill();
  } else if (e.weapon === 'torch') {
    ctx.strokeStyle = '#5a3a1a';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(8, 6); ctx.lineTo(14, -8);
    ctx.stroke();
    ctx.fillStyle = '#e87a3d';
    ctx.beginPath();
    ctx.ellipse(14, -10, 3, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f4c14a';
    ctx.beginPath();
    ctx.ellipse(14, -11, 1.5, 3, 0, 0, Math.PI * 2);
    ctx.fill();
  } else if (e.weapon === 'sack') {
    ctx.fillStyle = '#8a7a4a';
    ctx.beginPath();
    ctx.ellipse(8, 6, 4, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#5a3a1a';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(8, 1); ctx.lineTo(8, 4);
    ctx.stroke();
    ctx.fillStyle = '#d4a843';
    ctx.font = 'bold 6px serif';
    ctx.textAlign = 'center';
    ctx.fillText('$', 8, 8);
  }

  // HP pips above the head when wounded
  if (e.alive && e.hp < e.maxHp) {
    const pipY = -22, pipSize = 3;
    const totalW = e.maxHp * (pipSize + 1) - 1;
    for (let i = 0; i < e.maxHp; i++) {
      ctx.fillStyle = i < e.hp ? '#c33a3a' : 'rgba(0,0,0,0.5)';
      ctx.fillRect(-totalW / 2 + i * (pipSize + 1), pipY, pipSize, pipSize);
    }
  }
  ctx.restore();
}
