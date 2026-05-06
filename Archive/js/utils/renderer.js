// ============================================================================
// RENDERER — all the canvas drawing utilities + decor sprites + background.
//
// This file is intentionally big: it owns every "how do I draw X" function,
// from `roundedRect` and tiled grass up to the cathedral and the bronze
// Stadtmusikanten statue. Each function expects `state.ctx` to already be set
// (main.js does this), and may assume the camera transform has been applied
// by the caller (see Game.render). All bodies are 1:1 with the original
// monolith — only the surrounding glue moved.
// ============================================================================

import { CONFIG } from '../config.js';
import { state }  from '../state.js';
import { player } from '../entities/player.js';

// ────────────────────────────────────────────────────────────────────────────
// Generic primitives
// ────────────────────────────────────────────────────────────────────────────

export function roundedRect(x, y, w, h, r) {
  const ctx = state.ctx;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

/** Soft drop shadow ellipse below a sprite. Caller must have translated. */
export function shadow(rx, ry, alpha) {
  const ctx = state.ctx;
  ctx.fillStyle = `rgba(0,0,0,${alpha == null ? 0.35 : alpha})`;
  ctx.beginPath();
  ctx.ellipse(0, ry, rx, rx * 0.35, 0, 0, Math.PI * 2);
  ctx.fill();
}

// ────────────────────────────────────────────────────────────────────────────
// Background tiles & ground details
// ────────────────────────────────────────────────────────────────────────────

export function drawTiledBackground(type) {
  const ctx = state.ctx;
  const W = CONFIG.CANVAS_WIDTH, H = CONFIG.CANVAS_HEIGHT;
  if      (type === 'grass')       ctx.fillStyle = '#4d6b3a';
  else if (type === 'forest')      ctx.fillStyle = '#2a3a26';
  else if (type === 'cobblestone') ctx.fillStyle = '#7a6b58';
  else                              ctx.fillStyle = '#222';
  ctx.fillRect(0, 0, W, H);
  const tileSize = 64;
  const startX = Math.floor(state.cameraX / tileSize) * tileSize;
  const startY = Math.floor(state.cameraY / tileSize) * tileSize;
  ctx.save();
  ctx.translate(-state.cameraX, -state.cameraY);
  for (let x = startX; x < state.cameraX + W + tileSize; x += tileSize) {
    for (let y = startY; y < state.cameraY + H + tileSize; y += tileSize) {
      drawTile(x, y, tileSize, type);
    }
  }
  ctx.restore();
}

function drawTile(x, y, size, type) {
  const ctx = state.ctx;
  const seed = ((x * 13 + y * 7) % 100 + 100) % 100;
  if (type === 'grass') {
    ctx.fillStyle = seed > 70 ? '#5a7a44' : (seed > 40 ? '#506b3a' : '#4d6b3a');
    ctx.fillRect(x, y, size, size);
    ctx.fillStyle = '#7a9a5a';
    for (let i = 0; i < 3; i++) {
      const sx = x + ((seed + i * 17) % size);
      const sy = y + ((seed + i * 29) % size);
      ctx.fillRect(sx, sy, 2, 3);
    }
    if (seed > 85) {
      ctx.fillStyle = '#f4d35e';
      ctx.beginPath();
      ctx.arc(x + (seed % size), y + ((seed * 3) % size), 2, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (type === 'forest') {
    ctx.fillStyle = seed > 60 ? '#1f2e1c' : (seed > 30 ? '#283b22' : '#2a3a26');
    ctx.fillRect(x, y, size, size);
    if (seed > 75) {
      ctx.fillStyle = 'rgba(80,120,60,0.4)';
      ctx.beginPath();
      ctx.arc(x + size / 2, y + size / 2, 12 + (seed % 8), 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (type === 'cobblestone') {
    ctx.fillStyle = seed > 60 ? '#8a7a64' : (seed > 30 ? '#74644e' : '#6b5a48');
    ctx.fillRect(x, y, size, size);
    ctx.strokeStyle = 'rgba(40,30,20,0.4)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 3; i++) {
      const sx = x + ((seed + i * 19) % (size - 16));
      const sy = y + ((seed + i * 31) % (size - 16));
      const sz = 8 + ((seed + i) % 10);
      ctx.beginPath();
      ctx.ellipse(sx + sz / 2, sy + sz / 2, sz / 2, sz / 2 * 0.7, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
}

export function drawGroundDetails(L) {
  const ctx = state.ctx;
  if      (L.tileType === 'grass')  drawPath(L, '#8a7a5a', 22, 0.3);
  else if (L.tileType === 'forest') drawPath(L, '#3a2818', 18, 0.55);
  else if (L.tileType === 'cobblestone') {
    ctx.fillStyle = 'rgba(180,160,130,0.3)';
    ctx.beginPath();
    ctx.arc(1100, 700, 280, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawPath(L, color, width, alpha) {
  const ctx = state.ctx;
  ctx.strokeStyle = color;
  ctx.globalAlpha = alpha;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(L.spawn.x, L.spawn.y);
  const segs = 8;
  const tx = L.exit.x + L.exit.w / 2;
  const ty = L.exit.y + L.exit.h / 2;
  for (let i = 1; i <= segs; i++) {
    const t = i / segs;
    const x = L.spawn.x + (tx - L.spawn.x) * t + Math.sin(i * 1.7) * 60;
    const y = L.spawn.y + (ty - L.spawn.y) * t + Math.cos(i * 2.3) * 50;
    ctx.lineTo(x, y);
  }
  ctx.lineTo(tx, ty);
  ctx.stroke();
  ctx.globalAlpha = 1;
}

// ────────────────────────────────────────────────────────────────────────────
// Decor dispatcher
// ────────────────────────────────────────────────────────────────────────────

/**
 * Every decor sprite has a "baseline" — the y-offset of its visual bottom from
 * its anchor point. The render sort uses (decor.y + baseline) to draw nearer
 * objects on top of farther ones (poor-man's depth).
 */
export function getDecorBaseline(d) {
  switch (d.type) {
    case 'tree': case 'darktree':                                 return 24;
    case 'house': case 'barn': case 'cottage': case 'hansehouse': return 50;
    case 'schnoor':                                               return 32;
    case 'cathedral':                                             return 110;
    case 'rathaus':                                               return 90;
    case 'roland':                                                return 22;
    case 'musiciansStatue':                                       return 24;
    case 'schutting':                                             return 70;
    case 'cobblePlaza':                                           return -1000;  // ground tile — always first
    case 'mill':                                                  return 60;
    case 'rock':                                                  return 16;
    case 'well':                                                  return 18;
    case 'cart':                                                  return 20;
    case 'coop':                                                  return 30;
    case 'hay':                                                   return 12;
    case 'campfire':                                              return 12;
    case 'banner':                                                return 0;
    case 'stall':                                                 return 22;
    case 'bridge': case 'bigbridge':                              return 0;
    case 'stream':                                                return -10;
    case 'river':                                                 return -200;
    case 'stone':                                                 return 0;
    case 'citizen':                                               return 14;
    case 'signpost':                                              return 30;
    case 'post':                                                  return 30;
    case 'ruin':                                                  return 40;
    case 'citygate':                                              return 60;
    case 'crate':                                                 return 18;
    case 'cage':                                                  return 20;
    case 'chest':                                                 return 16;
    case 'watchtower':                                            return 50;
    default:                                                      return 0;
  }
}

export function drawDecor(d) {
  const ctx = state.ctx;
  const W = CONFIG.CANVAS_WIDTH, H = CONFIG.CANVAS_HEIGHT;
  if (d.x + 250 < state.cameraX || d.x - 250 > state.cameraX + W) return;
  // The river spans the full level height — never y-cull it
  if (d.type !== 'river' && (d.y + 250 < state.cameraY || d.y - 250 > state.cameraY + H)) return;
  if (d.type === 'river')     { drawRiver(d);     return; }
  if (d.type === 'bigbridge') { drawBigBridge(d); return; }
  if (d.type === 'stream')    { drawStream(d);    return; }
  ctx.save();
  ctx.translate(d.x, d.y);
  switch (d.type) {
    case 'mill':              drawMill();                  break;
    case 'house':             drawHouse(d.variant || 0);   break;
    case 'hansehouse':        drawHanseHouse(d.variant||0);break;
    case 'schnoor':           drawSchnoor(d.variant || 0); break;
    case 'cathedral':         drawCathedral();             break;
    case 'rathaus':           drawRathaus();               break;
    case 'roland':            drawRoland();                break;
    case 'musiciansStatue':   drawMusiciansStatue();       break;
    case 'schutting':         drawSchutting();             break;
    case 'cobblePlaza':       drawCobblePlaza(d);          break;
    case 'barn':              drawBarn();                  break;
    case 'coop':              drawCoop();                  break;
    case 'well':              drawWell();                  break;
    case 'hay':               drawHay();                   break;
    case 'cart':              drawCart();                  break;
    case 'tree':              drawTree();                  break;
    case 'darktree':          drawDarkTree();              break;
    case 'rock':              drawRock();                  break;
    case 'campfire':          drawCampfire();              break;
    case 'ruin':              drawRuin();                  break;
    case 'cottage':           drawCottage(d.small ? 0.7 : (d.big ? 1.3 : 1)); break;
    case 'bridge':            drawBridge();                break;
    case 'stone':             drawStepStone();             break;
    case 'stall':             drawStall(d.color || '#8a2c2c'); break;
    case 'banner':            drawBanner();                break;
    case 'citizen':           drawCitizen(d.color || '#3a5a8a'); break;
    case 'signpost':          drawSignpost(d.text);        break;
    case 'post':              drawPost();                  break;
    case 'citygate':          drawCityGate();              break;
    case 'crate':             drawCrate(d.broken);         break;
    case 'cage':              drawCage(d.broken);          break;
    case 'chest':             drawChest(d.opened);         break;
    case 'watchtower':        drawWatchtower();            break;
  }
  ctx.restore();
}

// ────────────────────────────────────────────────────────────────────────────
// Individual decor sprites — bodies are 1:1 with the original.
// ────────────────────────────────────────────────────────────────────────────

function drawTree() {
  const ctx = state.ctx;
  shadow(20, 18);
  ctx.fillStyle = '#3a2418';
  ctx.beginPath(); ctx.arc(0, 8, 6, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#3a4a26';
  ctx.beginPath(); ctx.arc(0, 0, 28, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#506e36';
  ctx.beginPath(); ctx.arc(-4, -4, 22, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#6a8c4a';
  ctx.beginPath(); ctx.arc(-7, -7, 14, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(160,200,100,0.3)';
  ctx.beginPath(); ctx.arc(-10, -10, 6, 0, Math.PI * 2); ctx.fill();
}

function drawDarkTree() {
  const ctx = state.ctx;
  shadow(22, 22, 0.5);
  ctx.fillStyle = '#1f2818';
  ctx.beginPath(); ctx.arc(0, 8, 7, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#1a2a18';
  ctx.beginPath(); ctx.arc(0, 0, 32, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#283a22';
  ctx.beginPath(); ctx.arc(-3, -3, 26, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#36482c';
  ctx.beginPath(); ctx.arc(-6, -6, 18, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(80,110,60,0.3)';
  ctx.beginPath(); ctx.arc(-9, -9, 6, 0, Math.PI * 2); ctx.fill();
}

function drawMill() {
  const ctx = state.ctx;
  shadow(60, 50);
  ctx.fillStyle = '#8a8578';
  ctx.fillRect(-50, -50, 100, 100);
  ctx.strokeStyle = '#5a5548';
  ctx.lineWidth = 2;
  ctx.strokeRect(-50, -50, 100, 100);
  ctx.lineWidth = 1;
  for (let y = -42; y < 50; y += 16) {
    ctx.beginPath(); ctx.moveTo(-50, y); ctx.lineTo(50, y); ctx.stroke();
  }
  ctx.fillStyle = '#5a3018';
  ctx.beginPath();
  ctx.moveTo(-35, -35); ctx.lineTo(0, -55); ctx.lineTo(35, -35);
  ctx.lineTo(35, 0); ctx.lineTo(-35, 0); ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#2a1810';
  ctx.fillRect(-8, 30, 16, 20);
  ctx.save();
  ctx.translate(0, -20);
  ctx.rotate(state.worldTime * 0.025);
  ctx.fillStyle = '#d8c8a8';
  ctx.strokeStyle = '#3a2818';
  ctx.lineWidth = 2;
  for (let i = 0; i < 4; i++) {
    ctx.save();
    ctx.rotate((Math.PI / 2) * i);
    ctx.beginPath();
    ctx.moveTo(0, 0); ctx.lineTo(10, -52); ctx.lineTo(-10, -52); ctx.closePath();
    ctx.fill(); ctx.stroke();
    ctx.restore();
  }
  ctx.fillStyle = '#3a2818';
  ctx.beginPath(); ctx.arc(0, 0, 6, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

function drawHouse(variant) {
  const ctx = state.ctx;
  shadow(60, 40);
  ctx.fillStyle = variant === 0 ? '#e8d5a4' : '#d8c094';
  ctx.fillRect(-55, -45, 110, 75);
  ctx.strokeStyle = '#3a2818';
  ctx.lineWidth = 3;
  ctx.strokeRect(-55, -45, 110, 75);
  ctx.beginPath();
  ctx.moveTo(-55, -10); ctx.lineTo(55, -10);
  ctx.moveTo(0, -45); ctx.lineTo(0, 30);
  ctx.stroke();
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-55, -45); ctx.lineTo(0, -10);
  ctx.moveTo(0, -10); ctx.lineTo(55, -45);
  ctx.moveTo(-55, 30); ctx.lineTo(-30, -10);
  ctx.moveTo(30, -10); ctx.lineTo(55, 30);
  ctx.stroke();
  ctx.fillStyle = variant === 0 ? '#8a3a1a' : '#7a2a1a';
  ctx.fillRect(-60, -50, 120, 10);
  ctx.fillStyle = '#3a1f0c';
  ctx.fillRect(-10, 12, 20, 18);
  ctx.fillStyle = '#f9e3a3';
  ctx.fillRect(-40, -32, 12, 12);
  ctx.fillRect(28, -32, 12, 12);
  ctx.strokeStyle = '#3a2818';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(-34, -32); ctx.lineTo(-34, -20);
  ctx.moveTo(-40, -26); ctx.lineTo(-28, -26);
  ctx.moveTo(34, -32); ctx.lineTo(34, -20);
  ctx.moveTo(28, -26); ctx.lineTo(40, -26);
  ctx.stroke();
}

function drawHanseHouse(variant) {
  const ctx = state.ctx;
  // Tight shadow at base so the house sits on the ground, not floats above it.
  shadow(48, 28, 0.22);
  const colors = [
    { wall: '#c89878', roof: '#5a2818', trim: '#3a1f0c' },
    { wall: '#a87864', roof: '#6a3a1a', trim: '#3a1f0c' },
  ];
  const c = colors[variant % colors.length];
  ctx.fillStyle = c.wall;
  ctx.fillRect(-50, -60, 100, 90);
  ctx.strokeStyle = c.trim;
  ctx.lineWidth = 2;
  ctx.strokeRect(-50, -60, 100, 90);
  ctx.fillStyle = c.roof;
  ctx.beginPath();
  ctx.moveTo(-50, -60);
  ctx.lineTo(-40, -75); ctx.lineTo(-30, -65);
  ctx.lineTo(-20, -80); ctx.lineTo(-10, -68);
  ctx.lineTo(0, -85); ctx.lineTo(10, -68);
  ctx.lineTo(20, -80); ctx.lineTo(30, -65);
  ctx.lineTo(40, -75); ctx.lineTo(50, -60);
  ctx.closePath(); ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#2a1810';
  ctx.fillRect(-9, 12, 18, 18);
  ctx.fillStyle = c.trim;
  ctx.beginPath(); ctx.arc(0, 12, 9, Math.PI, 0); ctx.fill();
  ctx.fillStyle = '#f9d597';
  ctx.fillRect(-38, -30, 14, 14);
  ctx.fillRect(-7, -30, 14, 14);
  ctx.fillRect(24, -30, 14, 14);
  ctx.strokeStyle = c.trim;
  ctx.lineWidth = 1;
  for (const wx of [-31, 0, 31]) {
    ctx.beginPath();
    ctx.moveTo(wx, -30); ctx.lineTo(wx, -16);
    ctx.moveTo(wx - 7, -23); ctx.lineTo(wx + 7, -23);
    ctx.stroke();
  }
}

function drawSchnoor(variant) {
  const ctx = state.ctx;
  shadow(28, 22, 0.22);
  const palette = [
    { wall: '#d8c8a8', roof: '#7a3a1a', door: '#3a1f0c' },
    { wall: '#a8c8d8', roof: '#5a2818', door: '#3a1f0c' },
  ];
  const c = palette[variant % palette.length];
  ctx.fillStyle = c.wall;
  ctx.fillRect(-30, -68, 60, 90);
  ctx.strokeStyle = c.door;
  ctx.lineWidth = 2;
  ctx.strokeRect(-30, -68, 60, 90);
  ctx.fillStyle = c.roof;
  ctx.beginPath();
  ctx.moveTo(-32, -68); ctx.lineTo(0, -90); ctx.lineTo(32, -68);
  ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = c.door;
  ctx.beginPath();
  ctx.moveTo(-30, -40); ctx.lineTo(30, -40);
  ctx.moveTo(-30, -10); ctx.lineTo(30, -10);
  ctx.moveTo(0, -68); ctx.lineTo(0, 22);
  ctx.stroke();
  ctx.fillStyle = '#f9d597';
  ctx.fillRect(-22, -58, 8, 8);
  ctx.fillRect(14, -58, 8, 8);
  ctx.fillRect(-10, -28, 8, 8);
  ctx.fillRect(2, -28, 8, 8);
  ctx.fillStyle = c.door;
  ctx.fillRect(-7, 4, 14, 18);
}

function drawCathedral() {
  const ctx = state.ctx;
  shadow(95, 90, 0.22);
  ctx.fillStyle = '#a89878';
  ctx.fillRect(-90, -60, 180, 160);
  ctx.strokeStyle = '#3a2818';
  ctx.lineWidth = 4;
  ctx.strokeRect(-90, -60, 180, 160);
  ctx.lineWidth = 1;
  for (let y = -52; y < 100; y += 18) {
    ctx.beginPath(); ctx.moveTo(-90, y); ctx.lineTo(90, y); ctx.stroke();
  }
  ctx.fillStyle = '#5a2818';
  ctx.fillRect(-95, -72, 190, 14);
  ctx.fillStyle = '#2a1810';
  ctx.beginPath();
  ctx.moveTo(-22, 100); ctx.lineTo(-22, 30);
  ctx.quadraticCurveTo(-22, 0, 0, -2);
  ctx.quadraticCurveTo(22, 0, 22, 30);
  ctx.lineTo(22, 100); ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#6b4423';
  ctx.lineWidth = 2; ctx.stroke();
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(0, 0); ctx.lineTo(0, 100);
  ctx.stroke();
  ctx.fillStyle = '#7ab0d4';
  ctx.beginPath(); ctx.arc(0, -32, 16, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#3a2818';
  ctx.lineWidth = 2; ctx.stroke();
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const ang = (Math.PI * 2) * i / 8;
    ctx.moveTo(0, -32);
    ctx.lineTo(Math.cos(ang) * 16, -32 + Math.sin(ang) * 16);
  }
  ctx.stroke();
  for (const wx of [-55, 55]) {
    ctx.fillStyle = '#7a3a8a';
    ctx.beginPath();
    ctx.moveTo(wx - 10, 30); ctx.lineTo(wx - 10, -10);
    ctx.quadraticCurveTo(wx - 10, -30, wx, -30);
    ctx.quadraticCurveTo(wx + 10, -30, wx + 10, -10);
    ctx.lineTo(wx + 10, 30); ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#3a2818';
    ctx.lineWidth = 2; ctx.stroke();
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(wx, 30); ctx.lineTo(wx, -25);
    ctx.moveTo(wx - 10, 0); ctx.lineTo(wx + 10, 0);
    ctx.stroke();
  }
  for (const tx of [-90, 90]) {
    ctx.fillStyle = '#a89878';
    ctx.fillRect(tx - 22, -120, 44, 220);
    ctx.strokeStyle = '#3a2818';
    ctx.lineWidth = 3; ctx.strokeRect(tx - 22, -120, 44, 220);
    ctx.lineWidth = 1;
    for (let y = -110; y < 100; y += 16) {
      ctx.beginPath(); ctx.moveTo(tx - 22, y); ctx.lineTo(tx + 22, y); ctx.stroke();
    }
    // Needle spire — slender, copper-green, as in real St. Petri Dom
    ctx.fillStyle = '#3a7055';
    ctx.beginPath();
    ctx.moveTo(tx - 14, -120); ctx.lineTo(tx, -198); ctx.lineTo(tx + 14, -120);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#1a3828'; ctx.lineWidth = 1.5; ctx.stroke();
    // Highlight facet to read as octagonal spire
    ctx.fillStyle = '#4a9070';
    ctx.beginPath();
    ctx.moveTo(tx - 2, -120); ctx.lineTo(tx, -198); ctx.lineTo(tx + 6, -120);
    ctx.closePath(); ctx.fill();
    // Cross finial
    ctx.fillStyle = '#d4a843';
    ctx.fillRect(tx - 1, -208, 2, 14);
    ctx.fillRect(tx - 5, -204, 10, 2);
    ctx.fillStyle = '#f9d597';
    ctx.beginPath();
    ctx.moveTo(tx - 12, -50); ctx.lineTo(tx - 12, -90);
    ctx.quadraticCurveTo(tx - 12, -100, tx - 7, -100);
    ctx.quadraticCurveTo(tx - 2, -100, tx - 2, -90);
    ctx.lineTo(tx - 2, -50); ctx.closePath(); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(tx + 2, -50); ctx.lineTo(tx + 2, -90);
    ctx.quadraticCurveTo(tx + 2, -100, tx + 7, -100);
    ctx.quadraticCurveTo(tx + 12, -100, tx + 12, -90);
    ctx.lineTo(tx + 12, -50); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#3a2818'; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.fillStyle = '#d4a843';
    ctx.beginPath();
    ctx.arc(tx, -10 + Math.sin(state.worldTime * 0.08) * 1.2, 4, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawRathaus() {
  const ctx = state.ctx;
  shadow(115, 70, 0.22);

  // ── Main body ─────────────────────────────────────────────────────────────
  ctx.fillStyle = '#c8a878';
  ctx.fillRect(-130, -80, 260, 170);
  ctx.strokeStyle = '#3a1f0c';
  ctx.lineWidth = 4;
  ctx.strokeRect(-130, -80, 260, 170);

  // ── Stepped gable parapet — more dramatic peaks ────────────────────────────
  ctx.fillStyle = '#5a2818';
  ctx.beginPath();
  ctx.moveTo(-130, -80);
  // 9 peaks with alternating heights — steeper than before
  const gableSteps = [
    [-130,  -80], [-97, -105], [-72, -85], [-48, -112],
    [-24, -90],   [0,  -118],  [24, -90],  [48, -112],
    [72,  -85],   [97, -105],  [130, -80],
  ];
  for (const [gx, gy] of gableSteps) ctx.lineTo(gx, gy);
  ctx.closePath();
  ctx.fill(); ctx.stroke();

  // ── Flanking towers ────────────────────────────────────────────────────────
  for (const sx of [-110, 110]) {
    ctx.fillStyle = '#a08858';
    ctx.fillRect(sx - 16, -110, 32, 200);
    ctx.strokeStyle = '#3a1f0c'; ctx.lineWidth = 2;
    ctx.strokeRect(sx - 16, -110, 32, 200);
    ctx.fillStyle = '#5a2818';
    ctx.beginPath();
    ctx.moveTo(sx - 18, -110); ctx.lineTo(sx, -135); ctx.lineTo(sx + 18, -110);
    ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#d4a843';
    ctx.beginPath();
    ctx.arc(sx, -98 + Math.sin(state.worldTime * 0.1) * 1.5, 5, 0, Math.PI * 2);
    ctx.fill();
  }

  // ── Gothic loggia — 7 OPEN pointed arches across the full façade ──────────
  // This is the most distinctive element of the Bremen Rathaus.
  // Draw arches as open (sky-light fill), not solid dark fills.
  const archW = 28, archH = 52, archCount = 7;
  const archSpacing = 260 / (archCount + 1);  // evenly spaced across 260px body
  for (let i = 0; i < archCount; i++) {
    const ax = -130 + archSpacing * (i + 1);
    const ayTop = 0;    // arch starts here
    const ayBot = 90;   // arch bottom (ground level)
    const halfW = archW / 2;
    const archMid = ax;

    // Open arch interior (bright = light through the loggia)
    ctx.fillStyle = 'rgba(200,170,120,0.6)';
    ctx.beginPath();
    ctx.moveTo(ax - halfW, ayBot);
    ctx.lineTo(ax - halfW, ayTop + halfW);
    ctx.quadraticCurveTo(ax - halfW, ayTop - 8, archMid, ayTop - 8);
    ctx.quadraticCurveTo(ax + halfW, ayTop - 8, ax + halfW, ayTop + halfW);
    ctx.lineTo(ax + halfW, ayBot);
    ctx.closePath();
    ctx.fill();

    // Arch outline — dark Gothic border
    ctx.strokeStyle = '#3a1f0c'; ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  // ── Two large Renaissance upper windows ───────────────────────────────────
  for (const wx of [-70, 70]) {
    ctx.fillStyle = '#f9d597';
    ctx.beginPath();
    ctx.moveTo(wx - 12, -10); ctx.lineTo(wx - 12, -45);
    ctx.quadraticCurveTo(wx - 12, -57, wx, -57);
    ctx.quadraticCurveTo(wx + 12, -57, wx + 12, -45);
    ctx.lineTo(wx + 12, -10);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#3a1f0c'; ctx.lineWidth = 2; ctx.stroke();
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(wx, -45); ctx.lineTo(wx, -10);
    ctx.moveTo(wx - 12, -25); ctx.lineTo(wx + 12, -25);
    ctx.stroke();
  }

  // ── Bremen banner / flag on the left tower ────────────────────────────────
  ctx.fillStyle = '#8a2c2c';
  ctx.beginPath();
  ctx.moveTo(-30, -8); ctx.lineTo(-30, 26); ctx.lineTo(-22, 22);
  ctx.lineTo(-15, 26); ctx.lineTo(-15, -8); ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#d4a843';
  ctx.font = 'bold 8px serif';
  ctx.textAlign = 'center';
  ctx.fillText('B', -22, 8);

  // ── Gold string-course (horizontal band) ──────────────────────────────────
  ctx.fillStyle = '#d4a843';
  ctx.fillRect(-130, -12, 260, 4);
}

function drawRoland() {
  const ctx = state.ctx;
  shadow(20, 22, 0.45);
  ctx.fillStyle = '#7a7268';
  ctx.fillRect(-20, 0, 40, 22);
  ctx.strokeStyle = '#3a3024';
  ctx.lineWidth = 2;
  ctx.strokeRect(-20, 0, 40, 22);
  ctx.fillStyle = '#5a5448';
  ctx.fillRect(-22, -2, 44, 4);
  ctx.fillStyle = '#a8a098';
  ctx.fillRect(-10, -38, 20, 38);
  ctx.strokeStyle = '#3a3024';
  ctx.lineWidth = 1;
  ctx.strokeRect(-10, -38, 20, 38);
  ctx.beginPath();
  ctx.arc(0, -44, 7, 0, Math.PI * 2);
  ctx.fillStyle = '#a8a098';
  ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#7a7268';
  ctx.fillRect(-6, -47, 12, 4);
  ctx.strokeStyle = '#d4d0c0';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(12, -38); ctx.lineTo(18, -52);
  ctx.stroke();
  ctx.fillStyle = '#d4a843';
  ctx.fillRect(11, -39, 4, 3);
  ctx.fillStyle = '#8a2c2c';
  ctx.beginPath();
  ctx.moveTo(-12, -32); ctx.lineTo(-22, -28); ctx.lineTo(-22, -16);
  ctx.lineTo(-12, -10); ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#d4a843';
  ctx.lineWidth = 1; ctx.stroke();
  ctx.fillStyle = '#d4a843';
  ctx.beginPath(); ctx.arc(-17, -22, 2, 0, Math.PI * 2); ctx.fill();
}

function drawMusiciansStatue() {
  const ctx = state.ctx;
  shadow(38, 26, 0.55);
  ctx.fillStyle = '#7a7268';
  ctx.fillRect(-34, 0, 68, 26);
  ctx.fillStyle = '#9a9288';
  ctx.fillRect(-36, -2, 72, 4);
  ctx.fillStyle = '#5a5448';
  ctx.fillRect(-36, 24, 72, 4);
  ctx.strokeStyle = '#3a3024';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(-34, 0, 68, 26);
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.moveTo(-34, 8); ctx.lineTo(34, 8);
  ctx.moveTo(-34, 17); ctx.lineTo(34, 17);
  ctx.moveTo(-12, 0); ctx.lineTo(-12, 8);
  ctx.moveTo(12, 8); ctx.lineTo(12, 17);
  ctx.moveTo(-6, 17); ctx.lineTo(-6, 26);
  ctx.moveTo(18, 17); ctx.lineTo(18, 26);
  ctx.stroke();
  ctx.fillStyle = '#2a2418';
  ctx.font = 'bold 6px serif';
  ctx.textAlign = 'center';
  ctx.fillText('STADTMUSIKANTEN', 0, 14);
  ctx.font = '5px serif';
  ctx.fillText('BREMEN  · 1953 ·', 0, 22);

  const bronze       = '#8a6a3a';
  const bronzeMid    = '#a8825a';
  const bronzeLight  = '#c89a6a';
  const bronzeDark   = '#5a3a1a';
  const bronzeShadow = '#3a2410';
  const patina       = 'rgba(120,180,140,0.18)';

  // DONKEY (bottom)
  ctx.fillStyle = bronze;
  ctx.beginPath(); ctx.ellipse(0, -16, 22, 11, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = bronzeLight;
  ctx.beginPath(); ctx.ellipse(-2, -13, 18, 6, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = bronzeDark;
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.ellipse(0, -16, 22, 11, 0, 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = bronzeDark;
  ctx.fillRect(-16, -10, 4, 12);
  ctx.fillRect(-10, -8, 3.5, 10);
  ctx.fillRect(8, -10, 4, 12);
  ctx.fillRect(13, -8, 3.5, 10);
  ctx.fillStyle = bronzeShadow;
  ctx.fillRect(-16, 0, 4, 2);
  ctx.fillRect(-10, 0, 3.5, 2);
  ctx.fillRect(8, 0, 4, 2);
  ctx.fillRect(13, 0, 3.5, 2);
  ctx.strokeStyle = bronzeDark;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-22, -18); ctx.quadraticCurveTo(-26, -16, -27, -10); ctx.stroke();
  ctx.fillStyle = bronzeShadow;
  ctx.beginPath(); ctx.ellipse(-27, -8, 2, 3, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = bronzeShadow;
  ctx.fillRect(2, -25, 12, 3);
  ctx.fillStyle = bronze;
  ctx.beginPath();
  ctx.moveTo(14, -22);
  ctx.quadraticCurveTo(20, -28, 26, -25);
  ctx.quadraticCurveTo(30, -20, 28, -16);
  ctx.quadraticCurveTo(24, -13, 18, -15);
  ctx.quadraticCurveTo(13, -18, 14, -22);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = bronzeDark; ctx.lineWidth = 1; ctx.stroke();
  ctx.fillStyle = bronze;
  ctx.beginPath(); ctx.ellipse(17, -30, 2, 6, -0.25, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(22, -30, 2, 6,  0.05, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = bronzeDark;
  ctx.beginPath(); ctx.ellipse(17, -30, 0.8, 3.5, -0.25, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(22, -30, 0.8, 3.5,  0.05, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = bronzeShadow;
  ctx.fillRect(28, -19, 1.2, 1.2);
  ctx.fillStyle = '#1a0f08';
  ctx.beginPath(); ctx.arc(22, -22, 1, 0, Math.PI * 2); ctx.fill();

  // DOG
  ctx.fillStyle = bronze;
  ctx.beginPath(); ctx.ellipse(0, -34, 14, 7, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = bronzeDark; ctx.lineWidth = 1; ctx.stroke();
  ctx.fillStyle = bronzeLight;
  ctx.beginPath(); ctx.ellipse(-1, -32, 11, 3, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = bronzeDark;
  ctx.fillRect(-9, -30, 3, 7);
  ctx.fillRect(-5, -30, 2.5, 6);
  ctx.fillRect(7, -30, 3, 7);
  ctx.fillRect(10, -30, 2.5, 6);
  ctx.strokeStyle = bronze; ctx.lineWidth = 3; ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-13, -36); ctx.quadraticCurveTo(-18, -40, -16, -34); ctx.stroke();
  ctx.lineCap = 'butt';
  ctx.fillStyle = bronze;
  ctx.beginPath(); ctx.arc(13, -38, 6, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = bronzeDark; ctx.lineWidth = 1; ctx.stroke();
  ctx.fillStyle = bronzeMid;
  ctx.beginPath(); ctx.ellipse(18, -36, 4, 3, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = bronzeDark;
  ctx.beginPath(); ctx.ellipse(10, -42, 3, 5, -0.4, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = bronzeShadow;
  ctx.beginPath(); ctx.arc(21, -36, 1.2, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#1a0f08';
  ctx.beginPath(); ctx.arc(15, -39, 1, 0, Math.PI * 2); ctx.fill();

  // CAT
  ctx.fillStyle = bronze;
  ctx.beginPath(); ctx.ellipse(0, -47, 9, 5, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = bronzeDark; ctx.lineWidth = 1; ctx.stroke();
  ctx.fillStyle = bronzeDark;
  ctx.fillRect(-5, -45, 2, 5);
  ctx.fillRect(5, -45, 2, 5);
  ctx.strokeStyle = bronze; ctx.lineWidth = 2.5; ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-9, -47); ctx.quadraticCurveTo(-15, -50, -12, -55); ctx.stroke();
  ctx.lineCap = 'butt';
  ctx.fillStyle = bronze;
  ctx.beginPath(); ctx.arc(8, -50, 4.5, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = bronzeDark; ctx.lineWidth = 1; ctx.stroke();
  ctx.fillStyle = bronze;
  ctx.beginPath();
  ctx.moveTo(5, -53); ctx.lineTo(5.5, -57); ctx.lineTo(8, -52); ctx.closePath(); ctx.fill();
  ctx.beginPath();
  ctx.moveTo(9, -54); ctx.lineTo(11, -56); ctx.lineTo(11.5, -51); ctx.closePath(); ctx.fill();
  ctx.fillStyle = bronzeShadow;
  ctx.beginPath();
  ctx.moveTo(6, -53); ctx.lineTo(6, -56); ctx.lineTo(7.5, -53); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#1a0f08';
  ctx.beginPath(); ctx.arc(10, -51, 0.9, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = bronzeShadow;
  ctx.fillRect(11.5, -49, 1, 0.8);

  // ROOSTER
  ctx.fillStyle = bronze;
  ctx.beginPath(); ctx.ellipse(2, -58, 6, 5, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = bronzeDark; ctx.lineWidth = 1; ctx.stroke();
  ctx.fillStyle = bronzeShadow;
  ctx.beginPath();
  ctx.moveTo(-3, -58);
  ctx.quadraticCurveTo(-9, -64, -7, -56);
  ctx.quadraticCurveTo(-10, -60, -10, -54);
  ctx.quadraticCurveTo(-7, -53, -3, -56);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = bronzeDark;
  ctx.beginPath();
  ctx.moveTo(-3, -58); ctx.lineTo(-7, -65); ctx.lineTo(-3, -60); ctx.closePath(); ctx.fill();
  ctx.fillStyle = bronzeMid;
  ctx.beginPath(); ctx.ellipse(2, -57, 4, 3, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = bronzeShadow; ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(0, -54); ctx.lineTo(0, -52);
  ctx.moveTo(4, -54); ctx.lineTo(4, -52);
  ctx.stroke();
  ctx.fillStyle = bronze;
  ctx.beginPath(); ctx.arc(6, -63, 3.5, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = bronzeDark; ctx.lineWidth = 1; ctx.stroke();
  ctx.fillStyle = bronzeShadow;
  ctx.beginPath();
  ctx.moveTo(3, -65); ctx.lineTo(4, -68); ctx.lineTo(5, -65); ctx.lineTo(6, -69);
  ctx.lineTo(7, -65); ctx.lineTo(8, -68); ctx.lineTo(9, -65);
  ctx.lineTo(9, -63); ctx.lineTo(3, -63);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = bronzeLight;
  ctx.beginPath();
  ctx.moveTo(9, -64); ctx.lineTo(13, -63); ctx.lineTo(9, -62); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = bronzeDark; ctx.lineWidth = 0.8; ctx.stroke();
  ctx.fillStyle = bronzeShadow;
  ctx.beginPath(); ctx.ellipse(9, -61, 1.2, 1.5, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#1a0f08';
  ctx.beginPath(); ctx.arc(7, -64, 0.7, 0, Math.PI * 2); ctx.fill();

  ctx.fillStyle = 'rgba(255,220,160,0.18)';
  ctx.beginPath(); ctx.ellipse(0, -22, 18, 3, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = patina;
  ctx.beginPath(); ctx.ellipse(-8, -18, 5, 3,    0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(10, -28, 3, 2,  0.3, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(-3, -36, 3, 1.5, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(4, -49, 2, 1.2,  0, 0, Math.PI * 2); ctx.fill();

  ctx.strokeStyle = `rgba(212,168,67,${0.22 + Math.sin(state.worldTime * 0.05) * 0.08})`;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(0, -34, 46 + Math.sin(state.worldTime * 0.05) * 2, 0, Math.PI * 2);
  ctx.stroke();
}

function drawBarn() {
  const ctx = state.ctx;
  shadow(70, 55);
  ctx.fillStyle = '#8a3a2a';
  ctx.fillRect(-65, -55, 130, 100);
  ctx.fillStyle = '#3a1f0c';
  ctx.fillRect(-70, -60, 140, 10);
  ctx.strokeStyle = '#2a1810';
  ctx.lineWidth = 3;
  ctx.strokeRect(-65, -55, 130, 100);
  ctx.fillStyle = '#3a1f0c';
  ctx.fillRect(-22, 0, 44, 45);
  ctx.strokeStyle = '#6b4423';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-22, 0);  ctx.lineTo(22, 45);
  ctx.moveTo(22, 0);   ctx.lineTo(-22, 45);
  ctx.moveTo(0, 0);    ctx.lineTo(0, 45);
  ctx.stroke();
  ctx.fillStyle = '#f9c247';
  ctx.fillRect(-12, -36, 24, 18);
  ctx.strokeStyle = '#2a1810';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, -36); ctx.lineTo(0, -18);
  ctx.moveTo(-12, -27); ctx.lineTo(12, -27);
  ctx.stroke();
}

function drawCoop() {
  const ctx = state.ctx;
  shadow(35, 28);
  ctx.fillStyle = '#a87858';
  ctx.fillRect(-32, -28, 64, 56);
  ctx.fillStyle = '#5a3018';
  ctx.fillRect(-36, -32, 72, 8);
  ctx.strokeStyle = '#3a1f0c';
  ctx.lineWidth = 2;
  ctx.strokeRect(-32, -28, 64, 56);
  ctx.fillStyle = '#1a0f08';
  ctx.fillRect(-12, -8, 24, 14);
  for (let x = -10; x <= 10; x += 4) {
    ctx.fillStyle = '#6b4423';
    ctx.fillRect(x, -8, 1.5, 14);
  }
  ctx.fillStyle = '#c8a05a';
  ctx.fillRect(-25, 24, 50, 4);
}

function drawWell() {
  const ctx = state.ctx;
  shadow(20, 18);
  ctx.fillStyle = '#8a8578';
  ctx.beginPath(); ctx.arc(0, 0, 18, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#3a3024';
  ctx.lineWidth = 2; ctx.stroke();
  ctx.fillStyle = '#1a0f08';
  ctx.beginPath(); ctx.arc(0, 0, 12, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#5a3018';
  ctx.fillRect(-18, -22, 4, 8);
  ctx.fillRect(14, -22, 4, 8);
  ctx.fillStyle = '#6a3a1a';
  ctx.beginPath();
  ctx.moveTo(-22, -22); ctx.lineTo(0, -34); ctx.lineTo(22, -22);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#2a1810'; ctx.stroke();
  ctx.strokeStyle = '#3a2818';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, -22); ctx.lineTo(0, -8);
  ctx.stroke();
  ctx.fillStyle = '#5a3018';
  ctx.fillRect(-3, -10, 6, 4);
}

function drawHay() {
  const ctx = state.ctx;
  shadow(28, 16);
  ctx.fillStyle = '#c8a05a';
  ctx.beginPath();
  ctx.ellipse(0, 0, 26, 18, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#8b6b2a';
  ctx.lineWidth = 1;
  for (let i = -22; i <= 22; i += 6) {
    ctx.beginPath();
    ctx.moveTo(i, -14); ctx.lineTo(i, 14);
    ctx.stroke();
  }
  ctx.fillStyle = '#dcb670';
  ctx.beginPath();
  ctx.ellipse(-6, -6, 8, 4, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawCart() {
  const ctx = state.ctx;
  shadow(35, 22);
  ctx.fillStyle = '#6b4423';
  ctx.fillRect(-30, -16, 60, 28);
  ctx.strokeStyle = '#3a1f0c';
  ctx.lineWidth = 2;
  ctx.strokeRect(-30, -16, 60, 28);
  ctx.beginPath();
  for (let x = -20; x <= 20; x += 10) {
    ctx.moveTo(x, -16); ctx.lineTo(x, 12);
  }
  ctx.stroke();
  ctx.fillStyle = '#3a1f0c';
  ctx.beginPath(); ctx.ellipse(-26, 14, 8, 5, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(26, 14, 8, 5, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#5a3018';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(30, 0); ctx.lineTo(46, -4);
  ctx.stroke();
}

function drawRock() {
  const ctx = state.ctx;
  shadow(22, 12);
  ctx.fillStyle = '#5a5a54';
  ctx.beginPath(); ctx.ellipse(0, 0, 22, 16, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#7a7a72';
  ctx.beginPath(); ctx.ellipse(-4, -4, 14, 10, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(150,150,140,0.3)';
  ctx.beginPath(); ctx.ellipse(-8, -6, 6, 4, 0, 0, Math.PI * 2); ctx.fill();
}

function drawCampfire() {
  const ctx = state.ctx;
  ctx.fillStyle = '#3a2418';
  ctx.fillRect(-12, -3, 24, 6);
  ctx.save();
  ctx.rotate(Math.PI / 4);
  ctx.fillRect(-12, -3, 24, 6);
  ctx.restore();
  const flick = Math.sin(state.worldTime * 0.4) * 2;
  ctx.fillStyle = '#e87a3d';
  ctx.beginPath(); ctx.ellipse(0, -8, 8, 12 + flick, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#f4c14a';
  ctx.beginPath(); ctx.ellipse(0, -10, 5, 8 + flick * 0.5, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#fff4a8';
  ctx.beginPath(); ctx.ellipse(0, -8, 2, 4, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(232,122,93,0.18)';
  ctx.beginPath(); ctx.ellipse(0, 4, 36, 14, 0, 0, Math.PI * 2); ctx.fill();
}

function drawRuin() {
  const ctx = state.ctx;
  shadow(50, 35);
  ctx.fillStyle = '#6a6458';
  ctx.beginPath();
  ctx.moveTo(-40, 30); ctx.lineTo(-45, -10); ctx.lineTo(-30, -35);
  ctx.lineTo(-10, -40); ctx.lineTo(15, -30); ctx.lineTo(35, -20);
  ctx.lineTo(40, 10); ctx.lineTo(30, 30); ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#3a3528';
  ctx.lineWidth = 2; ctx.stroke();
  ctx.lineWidth = 1;
  for (let y = -30; y < 30; y += 12) {
    ctx.beginPath(); ctx.moveTo(-40, y); ctx.lineTo(40, y); ctx.stroke();
  }
  ctx.fillStyle = '#3a3528';
  ctx.fillRect(-12, -42, 8, 12);
  ctx.fillRect(8, -38, 6, 10);
  ctx.fillStyle = 'rgba(80,120,60,0.4)';
  ctx.beginPath(); ctx.ellipse(-20, 20, 12, 6, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(20, 0, 8, 5, 0, 0, Math.PI * 2); ctx.fill();
}

function drawWatchtower() {
  const ctx = state.ctx;
  shadow(35, 50);
  ctx.fillStyle = '#7a7268';
  ctx.fillRect(-30, -50, 60, 100);
  ctx.strokeStyle = '#3a3024';
  ctx.lineWidth = 3;
  ctx.strokeRect(-30, -50, 60, 100);
  ctx.lineWidth = 1;
  for (let y = -42; y < 50; y += 14) {
    ctx.beginPath(); ctx.moveTo(-30, y); ctx.lineTo(30, y); ctx.stroke();
  }
  ctx.fillStyle = '#7a7268';
  ctx.fillRect(-32, -56, 8, 8);
  ctx.fillRect(-8, -56, 8, 8);
  ctx.fillRect(20, -56, 8, 8);
  ctx.fillStyle = '#1a0f08';
  ctx.fillRect(-4, -30, 8, 16);
  ctx.fillStyle = '#2a1810';
  ctx.fillRect(-10, 28, 20, 22);
  ctx.fillStyle = 'rgba(80,120,60,0.4)';
  ctx.beginPath();
  ctx.ellipse(-22, 30, 8, 5, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawCottage(scale) {
  const ctx = state.ctx;
  scale = scale || 1;
  ctx.save();
  ctx.scale(scale, scale);
  shadow(70, 55);
  ctx.fillStyle = '#5a3a28';
  ctx.fillRect(-65, -55, 130, 100);
  ctx.fillStyle = '#2a1810';
  ctx.fillRect(-70, -62, 140, 12);
  ctx.strokeStyle = '#1a0f08';
  ctx.lineWidth = 3;
  ctx.strokeRect(-65, -55, 130, 100);
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-65, -20); ctx.lineTo(65, -10);
  ctx.moveTo(-30, -55); ctx.lineTo(-25, 45);
  ctx.moveTo(30, -55); ctx.lineTo(35, 45);
  ctx.stroke();
  ctx.fillStyle = '#1a0f08';
  ctx.fillRect(-12, 14, 24, 31);
  ctx.strokeStyle = '#6b4423';
  ctx.lineWidth = 2;
  ctx.strokeRect(-12, 14, 24, 31);
  ctx.fillStyle = '#f9c247';
  ctx.fillRect(-40, -30, 18, 18);
  ctx.fillStyle = `rgba(232,122,61,${0.2 + Math.sin(state.worldTime * 0.15) * 0.1})`;
  ctx.fillRect(-40, -30, 18, 18);
  ctx.fillStyle = '#3a1f0c';
  ctx.fillRect(-32, -22, 2, 8);
  ctx.fillStyle = '#1a0f08';
  ctx.fillRect(22, -30, 18, 18);
  ctx.strokeStyle = '#6b4423';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(22, -25); ctx.lineTo(40, -16);
  ctx.moveTo(28, -30); ctx.lineTo(35, -12);
  ctx.stroke();
  ctx.fillStyle = '#3a1f0c';
  ctx.fillRect(38, -75, 14, 16);
  ctx.fillStyle = 'rgba(180,160,150,0.4)';
  for (let i = 0; i < 3; i++) {
    const sy = -85 - i * 12 - Math.sin(state.worldTime * 0.03 + i) * 3;
    ctx.beginPath();
    ctx.arc(45 + i * 2, sy, 8 + i * 2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawBridge() {
  const ctx = state.ctx;
  ctx.fillStyle = '#5a3a1a';
  ctx.fillRect(-50, -18, 100, 36);
  ctx.strokeStyle = '#2a1810';
  ctx.lineWidth = 2;
  ctx.strokeRect(-50, -18, 100, 36);
  ctx.lineWidth = 1;
  for (let x = -45; x < 50; x += 8) {
    ctx.beginPath();
    ctx.moveTo(x, -18); ctx.lineTo(x, 18);
    ctx.stroke();
  }
  ctx.fillStyle = '#3a1f0c';
  ctx.fillRect(-50, -22, 4, 4);
  ctx.fillRect(-22, -22, 4, 4);
  ctx.fillRect(18, -22, 4, 4);
  ctx.fillRect(46, -22, 4, 4);
}

function drawBigBridge(d) {
  const ctx = state.ctx;
  ctx.save();
  ctx.translate(d.x, d.y);
  ctx.fillStyle = '#9a8a78';
  ctx.fillRect(-90, -30, 180, 60);
  ctx.strokeStyle = '#3a3024';
  ctx.lineWidth = 3;
  ctx.strokeRect(-90, -30, 180, 60);
  ctx.lineWidth = 1;
  for (let x = -84; x < 90; x += 12) {
    ctx.beginPath();
    ctx.moveTo(x, -30); ctx.lineTo(x, 30);
    ctx.stroke();
  }
  for (let y = -22; y < 30; y += 14) {
    ctx.beginPath();
    ctx.moveTo(-90, y); ctx.lineTo(90, y);
    ctx.stroke();
  }
  ctx.fillStyle = '#7a6858';
  for (let x = -86; x < 88; x += 14) {
    ctx.fillRect(x, -36, 8, 8);
    ctx.fillRect(x, 26, 8, 8);
  }
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.fillRect(-80, -30, 160, 4);
  ctx.fillRect(-80, 26, 160, 4);
  ctx.restore();
}

function drawRiver(d) {
  const ctx = state.ctx;
  ctx.save();
  ctx.fillStyle = '#3a5a7a';
  ctx.fillRect(d.x - d.w / 2, 0, d.w, d.h);
  ctx.fillStyle = '#5a7a9a';
  for (let y = 0; y < d.h; y += 30) {
    const offset = (state.worldTime * 1.5 + y * 0.5) % 60;
    ctx.fillRect(d.x - d.w / 2 + 6, y + offset % 30, d.w - 14, 3);
  }
  ctx.fillStyle = '#7a9aba';
  for (let y = 0; y < d.h; y += 50) {
    const offset = (state.worldTime * 1.0 + y * 0.7) % 100;
    const wave = Math.sin((y + state.worldTime * 0.5) * 0.05) * 4;
    ctx.fillRect(d.x - d.w / 2 + 14 + wave, y + offset % 50, 8, 2);
  }
  ctx.fillStyle = '#5a4a3a';
  ctx.fillRect(d.x - d.w / 2 - 8, 0, 8, d.h);
  ctx.fillRect(d.x + d.w / 2, 0, 8, d.h);
  ctx.fillStyle = '#3a5a3a';
  for (let y = 0; y < d.h; y += 70) {
    const sway = Math.sin(state.worldTime * 0.04 + y) * 2;
    ctx.fillRect(d.x - d.w / 2 - 12 + sway, y + 10, 2, 12);
    ctx.fillRect(d.x + d.w / 2 + 6 + sway, y + 30, 2, 12);
  }
  ctx.restore();
}

function drawStream(d) {
  const ctx = state.ctx;
  ctx.save();
  ctx.translate(d.x, d.y);
  ctx.fillStyle = '#3a5a7a';
  ctx.fillRect(-200, 18, 400, 24);
  ctx.fillStyle = '#5a7a9a';
  for (let x = -200; x < 200; x += 30) {
    const wave = Math.sin((x + state.worldTime * 2) * 0.05) * 2;
    ctx.fillRect(x, 22 + wave, 12, 2);
  }
  ctx.restore();
}

function drawStepStone() {
  const ctx = state.ctx;
  shadow(20, 14, 0.4);
  ctx.fillStyle = '#7a7268';
  ctx.beginPath();
  ctx.ellipse(0, 0, 18, 14, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#3a3024';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = '#9a9288';
  ctx.beginPath();
  ctx.ellipse(-3, -3, 12, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(80,120,60,0.3)';
  ctx.beginPath();
  ctx.ellipse(-6, 4, 5, 3, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawStall(color) {
  const ctx = state.ctx;
  shadow(30, 20);
  ctx.fillStyle = '#6b4423';
  ctx.fillRect(-25, -14, 50, 28);
  ctx.strokeStyle = '#3a1f0c';
  ctx.lineWidth = 2;
  ctx.strokeRect(-25, -14, 50, 28);
  ctx.fillStyle = color;
  ctx.fillRect(-30, -22, 60, 10);
  ctx.fillStyle = 'rgba(255,255,255,0.25)';
  for (let x = -28; x < 30; x += 8) {
    ctx.fillRect(x, -22, 4, 10);
  }
  ctx.fillStyle = '#8a7a4a';
  for (let i = 0; i < 4; i++) {
    ctx.beginPath();
    ctx.arc(-18 + i * 12, -4, 3, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawBanner() {
  const ctx = state.ctx;
  ctx.fillStyle = '#2a1810';
  ctx.fillRect(-2, -60, 4, 60);
  ctx.fillStyle = '#8a2c2c';
  const sway = Math.sin(state.worldTime * 0.04) * 3;
  ctx.beginPath();
  ctx.moveTo(2, -55);
  ctx.lineTo(38 + sway, -50);
  ctx.lineTo(38 + sway, -22);
  ctx.lineTo(28 + sway, -32);
  ctx.lineTo(2, -27);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#d4a843';
  ctx.beginPath();
  ctx.arc(20 + sway, -38, 5, 0, Math.PI * 2);
  ctx.fill();
}

function drawCitizen(color) {
  const ctx = state.ctx;
  shadow(8, 12);
  ctx.fillStyle = color;
  roundedRect(-7, -8, 14, 18, 4);
  ctx.fill();
  ctx.fillStyle = '#e6c39a';
  ctx.beginPath(); ctx.arc(0, -12, 6, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#3a1f0c';
  ctx.beginPath(); ctx.arc(0, -14, 7, Math.PI, 0); ctx.closePath(); ctx.fill();
  const wave = Math.sin(state.worldTime * 0.2) * 6;
  ctx.fillStyle = color;
  ctx.fillRect(7, -10 + wave, 4, 6);
}

/**
 * A classical scroll — a partially unfurled parchment with prominent rolled
 * wooden dowels at top and bottom (Shakespeare-style). The unread state
 * shows lines of faux-printed text visible on the parchment; the read state
 * shows the same scroll but with desaturated tones and a small visual mark.
 *
 * Caller must translate(d.x, d.y) before invoking.
 */
export function drawScroll(read, highlighted) {
  const ctx = state.ctx;
  const bob = Math.sin(state.worldTime * 0.05) * 0.6;

  // Ground shadow
  shadow(11, 16, 0.35);

  ctx.save();
  ctx.translate(0, bob);

  // Warm halo when player is in close range
  if (highlighted) {
    const t = state.worldTime * 0.06;
    const a = 0.22 + Math.sin(t) * 0.06;
    const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, 26);
    grad.addColorStop(0,   `rgba(232,213,164,${a})`);
    grad.addColorStop(0.6, `rgba(232,213,164,${a * 0.4})`);
    grad.addColorStop(1,   'rgba(232,213,164,0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(0, 0, 26, 0, Math.PI * 2);
    ctx.fill();
  }

  // Slight rotation so each scroll looks hand-placed, not stamped
  ctx.rotate(-0.08);

  // Color tokens — slightly muted when read
  const parchA  = read ? '#dcc89a' : '#ecdaad';
  const parchB  = read ? '#c8b486' : '#dcc89a';
  const parchEd = read ? 'rgba(120,90,55,0.8)' : 'rgba(138,111,72,0.95)';
  const woodA   = read ? '#6a4628' : '#7a5638';
  const woodB   = read ? '#8a6438' : '#a07848';
  const woodOut = '#3a2008';
  const ribbonA = read ? 'rgba(122,42,40,0.55)' : '#a83a36';
  const ribbonB = read ? 'rgba(80,28,28,0.65)'  : '#7a2a28';

  // ── PARCHMENT BODY (drawn first; dowels overlap top & bottom) ─────────────
  // Slightly bowed silhouette — wider at the centre, hinting at curl.
  ctx.fillStyle = parchA;
  ctx.beginPath();
  ctx.moveTo(-7, -11);                              // top-left
  ctx.quadraticCurveTo(-9, 0, -7, 11);              // left curve out
  ctx.lineTo( 7, 11);                               // bottom edge
  ctx.quadraticCurveTo( 9, 0,  7, -11);             // right curve out
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = parchEd;
  ctx.lineWidth = 0.7;
  ctx.stroke();

  // Subtle vertical fold shadow down the centre — gives depth
  ctx.fillStyle = 'rgba(140,110,70,0.18)';
  ctx.fillRect(-1, -10, 1, 20);

  // ── TEXT LINES — 4 inked lines, simulating handwritten content ────────────
  // Always visible (read or unread) so the scroll always reads as a "note".
  ctx.strokeStyle = read ? 'rgba(60,40,20,0.45)' : 'rgba(60,40,20,0.7)';
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.moveTo(-5, -7); ctx.lineTo( 4, -7);
  ctx.moveTo(-5, -3); ctx.lineTo( 5, -3);
  ctx.moveTo(-5,  1); ctx.lineTo( 3,  1);
  ctx.moveTo(-5,  5); ctx.lineTo( 4,  5);
  ctx.stroke();

  // Tiny ornamental flourish at top centre (looks like a heading or initial)
  ctx.fillStyle = read ? 'rgba(122,42,40,0.55)' : '#7a2a28';
  ctx.fillRect(-2, -9, 4, 1);

  // ── TOP DOWEL (wooden roller with darker outline) ─────────────────────────
  // Wider than the parchment so it visibly extends past edges (signature look)
  ctx.fillStyle = woodA;
  ctx.fillRect(-9, -14, 18, 4);
  // Highlight strip
  ctx.fillStyle = woodB;
  ctx.fillRect(-9, -14, 18, 1.2);
  ctx.strokeStyle = woodOut;
  ctx.lineWidth = 0.6;
  ctx.strokeRect(-9, -14, 18, 4);
  // Rounded caps on each end of the dowel
  ctx.fillStyle = woodA;
  ctx.beginPath();
  ctx.arc(-9, -12, 1.6, 0, Math.PI * 2);
  ctx.arc( 9, -12, 1.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = woodOut;
  ctx.stroke();

  // ── BOTTOM DOWEL ──────────────────────────────────────────────────────────
  ctx.fillStyle = woodA;
  ctx.fillRect(-9, 10, 18, 4);
  ctx.fillStyle = woodB;
  ctx.fillRect(-9, 12.8, 18, 1.2);
  ctx.strokeStyle = woodOut;
  ctx.lineWidth = 0.6;
  ctx.strokeRect(-9, 10, 18, 4);
  ctx.fillStyle = woodA;
  ctx.beginPath();
  ctx.arc(-9, 12, 1.6, 0, Math.PI * 2);
  ctx.arc( 9, 12, 1.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = woodOut;
  ctx.stroke();

  // ── RED RIBBON / LACE hanging from top dowel ──────────────────────────────
  // Classic Shakespeare-scroll detail: a small ribbon loop above the dowel.
  ctx.fillStyle = ribbonA;
  ctx.fillRect(-1, -18, 2, 6);                      // hanging stub
  // Loop at top
  ctx.beginPath();
  ctx.arc(0, -19, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = ribbonB;
  ctx.beginPath();
  ctx.arc(0, -19, 1.1, 0, Math.PI * 2);
  ctx.fill();

  // ── READ MARK — small "✓"-like tick on the parchment, only when read ──────
  if (read) {
    ctx.strokeStyle = 'rgba(80,40,30,0.7)';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(5, 8); ctx.lineTo(6.5, 9.5); ctx.lineTo(8.5, 6);
    ctx.stroke();
  }

  ctx.restore();
}

function drawSignpost(text) {
  const ctx = state.ctx;
  const label = text || '➤';

  // Measure first so the board grows to fit the text instead of clipping it.
  ctx.font = 'bold 9px Cinzel, serif';
  const textW   = ctx.measureText(label).width;
  const padding = 14;
  const boardW  = Math.max(60, Math.ceil(textW + padding));
  const boardH  = 14;
  const halfW   = boardW / 2;

  // Wider ground shadow so the signpost reads as planted, not floating.
  shadow(Math.max(14, halfW * 0.6), 4, 0.4);

  // Post — slightly thicker, with a small base block at ground level.
  ctx.fillStyle = '#3a2818';
  ctx.fillRect(-2.5, -30, 5, 30);
  ctx.fillStyle = '#2a1810';
  ctx.fillRect(-5, -2, 10, 4);                     // base block on ground

  // Board
  ctx.fillStyle = '#a87858';
  ctx.fillRect(-halfW, -30, boardW, boardH);
  ctx.strokeStyle = '#2a1810';
  ctx.lineWidth = 2;
  ctx.strokeRect(-halfW, -30, boardW, boardH);

  // Text
  ctx.fillStyle = '#2a1810';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, 0, -23);
}

function drawPost() {
  const ctx = state.ctx;
  shadow(6, 8);
  ctx.fillStyle = '#3a2818';
  ctx.fillRect(-3, -22, 6, 22);
  ctx.fillStyle = '#5a3a1a';
  ctx.beginPath(); ctx.arc(0, -22, 4, 0, Math.PI * 2); ctx.fill();
}

/**
 * Marktplatz ground — flat red-tinted brick cobblestone rectangle.
 * Drawn as a floor tile (baseline 0) so it renders under everything.
 * d.w and d.h define the plaza size.
 */
function drawCobblePlaza(d) {
  const ctx = state.ctx;
  const w = d.w || 320, h = d.h || 200;
  ctx.fillStyle = '#8a6a58';
  ctx.fillRect(-w / 2, -h / 2, w, h);
  ctx.strokeStyle = '#5a3a28';
  ctx.lineWidth = 1;
  // Brick grid — horizontal and vertical lines
  for (let gy = -h / 2 + 16; gy < h / 2; gy += 16) {
    ctx.beginPath(); ctx.moveTo(-w / 2, gy); ctx.lineTo(w / 2, gy); ctx.stroke();
  }
  for (let gx = -w / 2 + 24; gx < w / 2; gx += 24) {
    ctx.beginPath(); ctx.moveTo(gx, -h / 2); ctx.lineTo(gx, h / 2); ctx.stroke();
  }
  ctx.strokeStyle = '#4a2818'; ctx.lineWidth = 2;
  ctx.strokeRect(-w / 2, -h / 2, w, h);
}

/**
 * Schütting — the Bremen merchant guildhall, directly opposite the Rathaus.
 * Recognizable by its crow-stepped gable and dark ground floor arcade.
 */
function drawSchutting() {
  const ctx = state.ctx;
  shadow(88, 50, 0.22);

  // Main body — dark red brick
  ctx.fillStyle = '#8a4a38';
  ctx.fillRect(-100, -60, 200, 130);
  ctx.strokeStyle = '#3a1810';
  ctx.lineWidth = 3;
  ctx.strokeRect(-100, -60, 200, 130);

  // Horizontal brick courses
  ctx.lineWidth = 0.8;
  ctx.strokeStyle = '#5a2818';
  for (let y = -52; y < 70; y += 10) {
    ctx.beginPath(); ctx.moveTo(-100, y); ctx.lineTo(100, y); ctx.stroke();
  }

  // Crow-stepped gable — the key silhouette
  ctx.fillStyle = '#6a3828';
  ctx.beginPath();
  ctx.moveTo(-100, -60);
  ctx.lineTo(-100, -72); ctx.lineTo(-80, -72);
  ctx.lineTo(-80, -84); ctx.lineTo(-56, -84);
  ctx.lineTo(-56, -96); ctx.lineTo(-28, -96);
  ctx.lineTo(-28, -108); ctx.lineTo(0, -108);     // centre peak
  ctx.lineTo(0, -96); ctx.lineTo(28, -96);
  ctx.lineTo(28, -84); ctx.lineTo(56, -84);
  ctx.lineTo(56, -72); ctx.lineTo(80, -72);
  ctx.lineTo(80, -60); ctx.lineTo(100, -60);
  ctx.lineTo(100, -60); ctx.lineTo(-100, -60);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#3a1810'; ctx.lineWidth = 2; ctx.stroke();

  // Ground-floor arcade — 5 arched openings (like the real Schütting)
  for (let i = 0; i < 5; i++) {
    const ax = -80 + i * 40;
    ctx.fillStyle = '#1a0f08';
    ctx.beginPath();
    ctx.moveTo(ax - 12, 70);
    ctx.lineTo(ax - 12, 28);
    ctx.quadraticCurveTo(ax - 12, 12, ax, 12);
    ctx.quadraticCurveTo(ax + 12, 12, ax + 12, 28);
    ctx.lineTo(ax + 12, 70);
    ctx.closePath(); ctx.fill();
  }

  // Gold weathervane at peak
  ctx.fillStyle = '#d4a843';
  ctx.fillRect(-1, -118, 2, 12);
  ctx.beginPath();
  ctx.moveTo(0, -118); ctx.lineTo(8, -122); ctx.lineTo(0, -114); ctx.closePath();
  ctx.fill();
}

function drawCityGate() {
  const ctx = state.ctx;
  shadow(40, 60);
  ctx.fillStyle = '#8a8578';
  ctx.fillRect(-35, -60, 70, 120);
  ctx.strokeStyle = '#3a3024';
  ctx.lineWidth = 3;
  ctx.strokeRect(-35, -60, 70, 120);
  ctx.lineWidth = 1;
  for (let y = -52; y < 60; y += 14) {
    ctx.beginPath();
    ctx.moveTo(-35, y); ctx.lineTo(35, y);
    ctx.stroke();
  }
  ctx.fillStyle = '#1a0f08';
  ctx.beginPath();
  ctx.moveTo(-15, 60); ctx.lineTo(-15, -10); ctx.arc(0, -10, 15, Math.PI, 0); ctx.lineTo(15, 60);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#8a8578';
  for (let x = -30; x < 30; x += 12) {
    ctx.fillRect(x, -68, 6, 8);
  }
  ctx.fillStyle = '#8a2c2c';
  ctx.fillRect(-20, -70, 8, 16);
  ctx.fillStyle = '#d4a843';
  ctx.beginPath(); ctx.arc(-16, -62, 3, 0, Math.PI * 2); ctx.fill();
}

function drawCrate(broken) {
  const ctx = state.ctx;
  shadow(18, 14, broken ? 0.2 : 0.4);
  if (broken) {
    ctx.fillStyle = '#5a3a1a';
    for (let i = 0; i < 6; i++) {
      const ang = (Math.PI * 2) * i / 6;
      ctx.save();
      ctx.rotate(ang);
      ctx.fillRect(8, -2, 10, 4);
      ctx.restore();
    }
    return;
  }
  ctx.fillStyle = '#8a6a3a';
  ctx.fillRect(-16, -16, 32, 32);
  ctx.strokeStyle = '#3a1f0c';
  ctx.lineWidth = 2;
  ctx.strokeRect(-16, -16, 32, 32);
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(-16, 0); ctx.lineTo(16, 0);
  ctx.moveTo(0, -16); ctx.lineTo(0, 16);
  ctx.stroke();
  ctx.fillStyle = '#3a3024';
  ctx.fillRect(-16, -8, 32, 2);
  ctx.fillRect(-16, 6, 32, 2);
  ctx.fillStyle = 'rgba(220,180,120,0.3)';
  ctx.fillRect(-14, -14, 6, 6);
}

function drawCage(broken) {
  const ctx = state.ctx;
  shadow(22, 16, broken ? 0.2 : 0.4);
  if (broken) {
    ctx.strokeStyle = '#3a3024';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-20, -14); ctx.lineTo(-22, 14);
    ctx.moveTo(-10, -14); ctx.lineTo(-12, 14);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, -10); ctx.lineTo(20, -16);
    ctx.moveTo(8, 4); ctx.lineTo(20, 8);
    ctx.stroke();
    return;
  }
  ctx.fillStyle = '#5a3a1a';
  ctx.fillRect(-22, 12, 44, 6);
  ctx.fillRect(-22, -16, 44, 4);
  ctx.strokeStyle = '#3a1f0c';
  ctx.lineWidth = 2;
  ctx.strokeRect(-22, -16, 44, 32);
  for (let x = -18; x <= 18; x += 6) {
    ctx.strokeStyle = '#3a3024';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, -14); ctx.lineTo(x, 12);
    ctx.stroke();
  }
  ctx.fillStyle = '#3a3024';
  ctx.fillRect(-3, 8, 6, 6);
  ctx.fillStyle = '#d4a843';
  ctx.beginPath(); ctx.arc(0, 11, 1.5, 0, Math.PI * 2); ctx.fill();
}

function drawChest(opened) {
  const ctx = state.ctx;
  shadow(18, 14);
  ctx.fillStyle = '#6b4423';
  ctx.fillRect(-18, -8, 36, 22);
  ctx.strokeStyle = '#3a1f0c';
  ctx.lineWidth = 2;
  ctx.strokeRect(-18, -8, 36, 22);
  if (opened) {
    ctx.fillStyle = '#8a6a3a';
    ctx.beginPath();
    ctx.moveTo(-18, -8); ctx.lineTo(-14, -22); ctx.lineTo(18, -22); ctx.lineTo(18, -8);
    ctx.closePath();
    ctx.fill(); ctx.stroke();
    ctx.fillStyle = 'rgba(212,168,67,0.5)';
    ctx.fillRect(-16, -6, 32, 6);
    ctx.fillStyle = '#d4a843';
    ctx.font = 'bold 8px serif';
    ctx.textAlign = 'center';
    ctx.fillText('♪', -8, -2);
    ctx.fillText('♪', 8, -2);
  } else {
    ctx.fillStyle = '#8a6a3a';
    ctx.fillRect(-18, -14, 36, 8);
    ctx.strokeRect(-18, -14, 36, 8);
    ctx.fillStyle = '#3a3024';
    ctx.fillRect(-18, -2, 36, 2);
    ctx.fillRect(-18, 8, 36, 2);
    ctx.fillStyle = '#3a3024';
    ctx.fillRect(-3, -6, 6, 8);
    ctx.fillStyle = '#d4a843';
    ctx.beginPath(); ctx.arc(0, -2, 1.5, 0, Math.PI * 2); ctx.fill();
    const pulse = (Math.sin(state.worldTime * 0.06) + 1) * 0.5;
    ctx.strokeStyle = `rgba(212,168,67,${0.3 + pulse * 0.3})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(0, 4, 24 + pulse * 3, 0, Math.PI * 2);
    ctx.stroke();
  }
}

export function drawWall(w) {
  const ctx = state.ctx;
  if (w.type === 'fence') {
    ctx.fillStyle = '#5a3a1a';
    ctx.fillRect(w.x, w.y, w.w, w.h);
    if (w.w > w.h) {
      for (let x = w.x; x < w.x + w.w; x += 14) {
        ctx.fillStyle = '#3a2818';
        ctx.fillRect(x, w.y - 4, 4, w.h + 8);
      }
    } else {
      for (let y = w.y; y < w.y + w.h; y += 14) {
        ctx.fillStyle = '#3a2818';
        ctx.fillRect(w.x - 4, y, w.w + 8, 4);
      }
    }
  } else if (w.type === 'stonewall') {
    ctx.fillStyle = '#8a8578';
    ctx.fillRect(w.x, w.y, w.w, w.h);
    ctx.strokeStyle = '#3a3024';
    ctx.lineWidth = 2;
    ctx.strokeRect(w.x, w.y, w.w, w.h);
    if (w.w > 200) {
      ctx.fillStyle = '#8a8578';
      for (let x = w.x; x < w.x + w.w; x += 30) {
        ctx.fillRect(x, w.y - 6, 14, 6);
      }
    }
  }
}

// ────────────────────────────────────────────────────────────────────────────
// Notes, recruit point, exit zone, vignette, darkness overlay
// ────────────────────────────────────────────────────────────────────────────

export function drawNote(n) {
  const ctx = state.ctx;
  const t = state.worldTime * 0.06;
  const by = Math.sin(t + n.x * 0.01) * 3;
  ctx.save();
  ctx.translate(n.x, n.y + by);
  const g = ctx.createRadialGradient(0, 0, 2, 0, 0, 18);
  g.addColorStop(0, 'rgba(212,168,67,0.6)');
  g.addColorStop(1, 'rgba(212,168,67,0)');
  ctx.fillStyle = g;
  ctx.fillRect(-18, -18, 36, 36);
  ctx.fillStyle = '#f3e3bf';
  ctx.strokeStyle = '#2a1810';
  ctx.lineWidth = 1.5;
  ctx.fillRect(4, -10, 2, 14);
  ctx.beginPath();
  ctx.ellipse(2, 4, 5, 4, -0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

export function drawRecruitPoint(r, animalDrawer) {
  const ctx = state.ctx;
  const t = state.worldTime * 0.04;
  ctx.save();
  ctx.translate(r.x, r.y);
  const radius = 28 + Math.sin(t) * 4;
  const g = ctx.createRadialGradient(0, 0, 0, 0, 0, radius);
  g.addColorStop(0, 'rgba(212,168,67,0.5)');
  g.addColorStop(1, 'rgba(212,168,67,0)');
  ctx.fillStyle = g;
  ctx.fillRect(-radius, -radius, radius * 2, radius * 2);
  // Caller passes the animal-drawing function so we don't import a cycle.
  animalDrawer(0, 0, r.which, 0, -1, state.worldTime, 1);
  ctx.strokeStyle = 'rgba(212,168,67,0.6)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(0, 0, 24 + Math.sin(t * 1.4) * 2, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

export function drawExit(ex) {
  const ctx = state.ctx;
  const pulse = (Math.sin(state.worldTime * 0.06) + 1) * 0.5;
  ctx.save();
  ctx.fillStyle = `rgba(212,168,67,${0.08 + pulse * 0.1})`;
  ctx.fillRect(ex.x, ex.y, ex.w, ex.h);
  ctx.strokeStyle = `rgba(212,168,67,${0.5 + pulse * 0.3})`;
  ctx.lineWidth = 2;
  ctx.setLineDash([10, 6]);
  ctx.strokeRect(ex.x, ex.y, ex.w, ex.h);
  ctx.setLineDash([]);
  ctx.fillStyle = `rgba(212,168,67,${0.7 + pulse * 0.3})`;
  ctx.font = 'bold 14px Cinzel, serif';
  ctx.textAlign = 'center';
  ctx.fillText(ex.label, ex.x + ex.w / 2, ex.y - 8);
  ctx.restore();
}

/**
 * Forest darkness — radial light around the player + warm glow + per-campfire
 * extra glow. `shakeX`/`shakeY` should match the camera-shake offsets used by
 * the world render.
 */
export function drawDarknessOverlay(L, shakeX, shakeY) {
  const ctx = state.ctx;
  const W = CONFIG.CANVAS_WIDTH, H = CONFIG.CANVAS_HEIGHT;
  const px = player.x - state.cameraX + shakeX;
  const py = player.y - state.cameraY + shakeY;
  let lightRadius = 460;
  if (player.crowT > 0) lightRadius = 600;
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,0.32)';
  ctx.fillRect(0, 0, W, H);
  const grad = ctx.createRadialGradient(px, py, 0, px, py, lightRadius);
  grad.addColorStop(0, 'rgba(0,0,0,0)');
  grad.addColorStop(0.55, 'rgba(0,0,0,0.10)');
  grad.addColorStop(1, 'rgba(0,0,0,0.32)');
  ctx.globalCompositeOperation = 'destination-in';
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);
  ctx.restore();
  // Stronger warm glow around the player so the lit area is clearly visible
  ctx.save();
  const g = ctx.createRadialGradient(px, py, 0, px, py, lightRadius * 0.9);
  g.addColorStop(0, 'rgba(255,210,140,0.45)');
  g.addColorStop(0.4, 'rgba(255,210,140,0.18)');
  g.addColorStop(1, 'rgba(255,210,140,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  ctx.restore();
  // Campfire ambient lights
  for (const d of L.decor) {
    if (d.type === 'campfire') {
      const fx = d.x - state.cameraX + shakeX;
      const fy = d.y - state.cameraY + shakeY;
      if (fx < -150 || fx > W + 150 || fy < -150 || fy > H + 150) continue;
      ctx.save();
      const cg = ctx.createRadialGradient(fx, fy, 0, fx, fy, 140);
      cg.addColorStop(0, 'rgba(255,140,70,0.35)');
      cg.addColorStop(1, 'rgba(255,140,70,0)');
      ctx.fillStyle = cg;
      ctx.fillRect(0, 0, W, H);
      ctx.restore();
    }
  }
}

export function drawVignette() {
  const ctx = state.ctx;
  const W = CONFIG.CANVAS_WIDTH, H = CONFIG.CANVAS_HEIGHT;
  const g = ctx.createRadialGradient(W / 2, H / 2, W * 0.35, W / 2, H / 2, W * 0.7);
  g.addColorStop(0, 'rgba(0,0,0,0)');
  g.addColorStop(1, 'rgba(0,0,0,0.55)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
}