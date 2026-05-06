// ============================================================================
// MENUS — title screen, cutscene parchment, win screen.
//
// All DOM-heavy "screen" UI lives here. The big chunk of code is the title
// screen art (`paintTitleArt`) — a hand-built sunset Bremen scene drawn on a
// dedicated canvas. It is pixel-for-pixel identical to the original.
// ============================================================================

import { state }     from '../state.js';
import { CUTSCENES } from '../data/cutscenes.js';
import { SCROLLS }   from '../data/scrolls.js';
import { paintAnimalPortrait } from '../entities/animals.js';

// ────────────────────────────────────────────────────────────────────────────
// Cutscene parchment
// ────────────────────────────────────────────────────────────────────────────

const cutsceneState = {
  key: null,
  callback: null,
};

export function showCutscene(key, callback) {
  state.status = 'cutscene';
  cutsceneState.key      = key;
  cutsceneState.callback = callback;
  const cs = CUTSCENES[key];
  document.getElementById('cutsceneTitle').textContent    = cs.title;
  document.getElementById('cutsceneSubtitle').textContent = cs.subtitle;
  // Convert paragraphs/sentences array into <p> tags
  const paras = cs.paragraphs || cs.sentences || [];
  document.getElementById('cutsceneBody').innerHTML = paras.map(p => `<p>${p}</p>`).join('');
  document.querySelector('#cutsceneNext').textContent = cs.next || 'Onward';
  document.getElementById('cutscene').classList.add('show');
}

export function dismissCutscene() {
  document.getElementById('cutscene').classList.remove('show');
  setTimeout(() => {
    state.status = 'play';
    if (cutsceneState.callback) {
      const cb = cutsceneState.callback;
      cutsceneState.callback = null;
      cb();
    }
  }, 500);
}

// ────────────────────────────────────────────────────────────────────────────
// Scroll overlay — reuses the same parchment DOM as cutscenes, but does NOT
// trigger any progression callback. Press F or Esc to close.
// ────────────────────────────────────────────────────────────────────────────

let scrollOverlayOpen = false;

export function openScrollOverlay(scrollId) {
  const sc = SCROLLS[scrollId];
  if (!sc) return;
  scrollOverlayOpen = true;
  state.status = 'cutscene';                                  // pauses gameplay
  document.getElementById('cutsceneTitle').textContent    = sc.title;
  document.getElementById('cutsceneSubtitle').textContent = sc.subtitle || '';
  document.getElementById('cutsceneBody').innerHTML =
    (sc.paragraphs || []).map(p => `<p>${p}</p>`).join('');
  document.querySelector('#cutsceneNext').textContent = 'Close';
  document.getElementById('cutscene').classList.add('show');
}

export function closeScrollOverlay() {
  if (!scrollOverlayOpen) return;
  scrollOverlayOpen = false;
  document.getElementById('cutscene').classList.remove('show');
  setTimeout(() => {
    state.status = 'play';
    // Restore the default cutscene button label so the next chapter cutscene
    // doesn't accidentally show "Close".
    document.querySelector('#cutsceneNext').textContent = 'Onward';
  }, 500);
}

export function isScrollOpen() {
  return scrollOverlayOpen;
}

// ────────────────────────────────────────────────────────────────────────────
// Win screen
// ────────────────────────────────────────────────────────────────────────────

export function showWinScreen(finalNoteCount) {
  document.getElementById('finalNotes').textContent = finalNoteCount;
  document.getElementById('winScreen').classList.remove('hidden');
  paintWinSilhouettes();
}

export function hideWinScreen() {
  document.getElementById('winScreen').classList.add('hidden');
}

function paintWinSilhouettes() {
  for (let i = 0; i < 4; i++) {
    const c = document.getElementById('winSil' + i);
    if (c) paintAnimalPortrait(c.getContext('2d'), i, 60);
  }
}

// ────────────────────────────────────────────────────────────────────────────
// Title art — hand-drawn sunset Bremen scene
// ────────────────────────────────────────────────────────────────────────────

export function paintTitleArt() {
  const cv = document.getElementById('titleArtCanvas');
  if (!cv) return;
  const tctx = cv.getContext('2d');
  const cw = cv.width, ch = cv.height;
  tctx.clearRect(0, 0, cw, ch);

  // SKY — multi-stop sunset gradient
  const sky = tctx.createLinearGradient(0, 0, 0, ch * 0.85);
  sky.addColorStop(0,    '#1a1028');
  sky.addColorStop(0.18, '#3a1f3a');
  sky.addColorStop(0.42, '#7a3838');
  sky.addColorStop(0.65, '#d49445');
  sky.addColorStop(0.82, '#e5b860');
  sky.addColorStop(1,    '#5a2818');
  tctx.fillStyle = sky;
  tctx.fillRect(0, 0, cw, ch);

  // STARS in upper sky
  tctx.fillStyle = 'rgba(255,255,230,0.85)';
  const starSeed = [
    [40, 18, 1], [85, 32, 0.6], [130, 14, 1.2], [180, 40, 0.7],
    [225, 22, 1], [270, 8, 0.8], [320, 28, 0.6], [370, 12, 1],
    [420, 36, 0.9], [465, 18, 0.7], [510, 24, 1.1], [555, 10, 0.6]
  ];
  for (const [sx, sy, sr] of starSeed) {
    tctx.beginPath();
    tctx.arc(sx, sy, sr, 0, Math.PI * 2);
    tctx.fill();
    if (sr >= 1) {
      tctx.fillRect(sx - 0.3, sy - 3, 0.6, 6);
      tctx.fillRect(sx - 3, sy - 0.3, 6, 0.6);
    }
  }

  // CRESCENT MOON
  const moonX = cw - 90, moonY = 55;
  const moonGlow = tctx.createRadialGradient(moonX, moonY, 0, moonX, moonY, 60);
  moonGlow.addColorStop(0, 'rgba(255,235,180,0.35)');
  moonGlow.addColorStop(1, 'rgba(255,235,180,0)');
  tctx.fillStyle = moonGlow;
  tctx.fillRect(moonX - 60, moonY - 60, 120, 120);
  tctx.fillStyle = '#f4d39f';
  tctx.beginPath(); tctx.arc(moonX, moonY, 24, 0, Math.PI * 2); tctx.fill();
  tctx.fillStyle = '#7a3838';
  tctx.beginPath(); tctx.arc(moonX + 8, moonY - 2, 22, 0, Math.PI * 2); tctx.fill();
  tctx.fillStyle = 'rgba(255,250,220,0.6)';
  tctx.beginPath(); tctx.arc(moonX - 6, moonY - 8, 6, 0, Math.PI * 2); tctx.fill();

  // BIRDS
  tctx.strokeStyle = '#1a0d10';
  tctx.lineWidth = 1.5;
  tctx.lineCap = 'round';
  function drawBird(bx, by, size) {
    tctx.beginPath();
    tctx.moveTo(bx - size, by + size * 0.5);
    tctx.lineTo(bx, by);
    tctx.lineTo(bx + size, by + size * 0.5);
    tctx.stroke();
  }
  drawBird(180, 80, 6);
  drawBird(195, 88, 5);
  drawBird(210, 78, 5);
  drawBird(165, 88, 4);
  drawBird(150, 78, 4);

  // DISTANT MOUNTAINS
  tctx.fillStyle = 'rgba(60,40,60,0.5)';
  tctx.beginPath();
  tctx.moveTo(0, 200);
  tctx.lineTo(60, 165);  tctx.lineTo(110, 185);
  tctx.lineTo(170, 155); tctx.lineTo(230, 180);
  tctx.lineTo(290, 158); tctx.lineTo(350, 175);
  tctx.lineTo(420, 150); tctx.lineTo(490, 178);
  tctx.lineTo(560, 160); tctx.lineTo(cw, 175);
  tctx.lineTo(cw, ch); tctx.lineTo(0, ch);
  tctx.closePath();
  tctx.fill();

  // MIST
  const mist = tctx.createLinearGradient(0, 170, 0, 220);
  mist.addColorStop(0, 'rgba(220,180,140,0)');
  mist.addColorStop(0.5, 'rgba(220,180,140,0.35)');
  mist.addColorStop(1, 'rgba(220,180,140,0)');
  tctx.fillStyle = mist;
  tctx.fillRect(0, 170, cw, 50);

  // BREMEN CITY silhouette
  const cityY = 200;
  tctx.fillStyle = '#1a0d1a';
  tctx.fillRect(220, cityY + 22, cw - 250, 14);
  for (let x = 220; x < cw - 30; x += 12) {
    tctx.fillRect(x, cityY + 18, 6, 4);
  }

  // CATHEDRAL
  const cathX = 320;
  tctx.fillRect(cathX - 22, cityY - 20, 14, 56);
  tctx.fillRect(cathX + 8, cityY - 20, 14, 56);
  tctx.beginPath();
  tctx.moveTo(cathX - 24, cityY - 20);
  tctx.lineTo(cathX - 15, cityY - 50);
  tctx.lineTo(cathX - 6, cityY - 20);
  tctx.closePath(); tctx.fill();
  tctx.beginPath();
  tctx.moveTo(cathX + 6, cityY - 20);
  tctx.lineTo(cathX + 15, cityY - 50);
  tctx.lineTo(cathX + 24, cityY - 20);
  tctx.closePath(); tctx.fill();
  tctx.fillStyle = '#d4a843';
  tctx.fillRect(cathX - 15.5, cityY - 56, 1, 5);
  tctx.fillRect(cathX - 17, cityY - 53, 4, 1);
  tctx.fillRect(cathX + 14.5, cityY - 56, 1, 5);
  tctx.fillRect(cathX + 13, cityY - 53, 4, 1);
  tctx.fillStyle = '#1a0d1a';
  tctx.fillRect(cathX - 8, cityY - 4, 16, 40);
  tctx.beginPath();
  tctx.moveTo(cathX - 10, cityY - 4);
  tctx.lineTo(cathX, cityY - 16);
  tctx.lineTo(cathX + 10, cityY - 4);
  tctx.closePath(); tctx.fill();
  tctx.fillStyle = '#f9c247';
  tctx.fillRect(cathX - 5, cityY + 6, 2, 5);
  tctx.fillRect(cathX + 3, cityY + 6, 2, 5);
  tctx.fillRect(cathX - 17, cityY - 4, 1.5, 4);
  tctx.fillRect(cathX + 15, cityY - 4, 1.5, 4);

  // RATHAUS
  const rathX = 410;
  tctx.fillStyle = '#1a0d1a';
  tctx.fillRect(rathX - 28, cityY - 6, 56, 42);
  tctx.beginPath();
  tctx.moveTo(rathX - 28, cityY - 6);
  for (let i = 0; i <= 6; i++) {
    const dx = rathX - 28 + (56 / 6) * i;
    const dy = cityY - 6 - 4 + (i % 2) * -4;
    tctx.lineTo(dx, dy);
  }
  tctx.lineTo(rathX + 28, cityY - 6);
  tctx.closePath(); tctx.fill();
  tctx.fillRect(rathX - 32, cityY - 18, 6, 54);
  tctx.fillRect(rathX + 26, cityY - 18, 6, 54);
  tctx.beginPath();
  tctx.moveTo(rathX - 33, cityY - 18);
  tctx.lineTo(rathX - 29, cityY - 26);
  tctx.lineTo(rathX - 25, cityY - 18);
  tctx.closePath(); tctx.fill();
  tctx.beginPath();
  tctx.moveTo(rathX + 25, cityY - 18);
  tctx.lineTo(rathX + 29, cityY - 26);
  tctx.lineTo(rathX + 33, cityY - 18);
  tctx.closePath(); tctx.fill();
  tctx.fillStyle = '#f9c247';
  for (let i = 0; i < 4; i++) {
    tctx.fillRect(rathX - 18 + i * 12, cityY + 6, 2, 4);
  }
  tctx.fillStyle = '#8a2c2c';
  tctx.fillRect(rathX - 1, cityY - 12, 4, 8);
  tctx.fillStyle = '#d4a843';
  tctx.fillRect(rathX, cityY - 10, 2, 2);

  // HANSEATIC HOUSES
  tctx.fillStyle = '#1a0d1a';
  const houses = [
    [240, 14, 30], [264, 18, 26], [285, 12, 22],
    [355, 10, 22], [378, 16, 26], [392, 12, 24],
    [450, 14, 24], [475, 10, 22], [497, 14, 28],
    [525, 16, 22], [549, 12, 26], [572, 14, 24],
    [596, 18, 22],
  ];
  for (const [hx, hh, hw] of houses) {
    tctx.fillRect(hx, cityY - hh, hw, hh + 36);
    tctx.beginPath();
    tctx.moveTo(hx, cityY - hh);
    tctx.lineTo(hx + 3, cityY - hh - 3);
    tctx.lineTo(hx + 7, cityY - hh - 1);
    tctx.lineTo(hx + 10, cityY - hh - 5);
    tctx.lineTo(hx + 13, cityY - hh - 1);
    tctx.lineTo(hx + Math.min(hw - 5, 16), cityY - hh - 4);
    tctx.lineTo(hx + hw - 3, cityY - hh - 1);
    tctx.lineTo(hx + hw, cityY - hh);
    tctx.closePath(); tctx.fill();
  }
  tctx.fillStyle = '#f9c247';
  for (const [hx, hh, hw] of houses) {
    tctx.fillRect(hx + hw / 2 - 1, cityY - hh / 2, 2, 3);
    tctx.fillRect(hx + hw / 2 - 1, cityY + 4, 2, 3);
  }

  // City gate
  tctx.fillStyle = '#1a0d1a';
  tctx.fillRect(cw - 40, cityY - 12, 26, 50);
  tctx.beginPath();
  tctx.moveTo(cw - 40, cityY - 12);
  tctx.lineTo(cw - 27, cityY - 22);
  tctx.lineTo(cw - 14, cityY - 12);
  tctx.closePath(); tctx.fill();

  // FOREGROUND HILL
  const hillGrad = tctx.createLinearGradient(0, ch - 60, 0, ch);
  hillGrad.addColorStop(0, '#0f0708');
  hillGrad.addColorStop(1, '#1a0a0a');
  tctx.fillStyle = hillGrad;
  tctx.beginPath();
  tctx.moveTo(0, ch);
  tctx.lineTo(0, ch - 50);
  tctx.quadraticCurveTo(cw * 0.3, ch - 90, cw * 0.5, ch - 70);
  tctx.quadraticCurveTo(cw * 0.7, ch - 50, cw, ch - 70);
  tctx.lineTo(cw, ch);
  tctx.closePath();
  tctx.fill();

  // FRAMING TREES
  tctx.fillStyle = '#0a0508';
  tctx.fillRect(28, ch - 130, 6, 60);
  tctx.beginPath(); tctx.arc(31, ch - 145, 24, 0, Math.PI * 2); tctx.fill();
  tctx.beginPath(); tctx.arc(20, ch - 130, 18, 0, Math.PI * 2); tctx.fill();
  tctx.beginPath(); tctx.arc(40, ch - 130, 18, 0, Math.PI * 2); tctx.fill();
  tctx.beginPath(); tctx.arc(31, ch - 160, 16, 0, Math.PI * 2); tctx.fill();
  tctx.fillRect(cw - 50, ch - 110, 6, 50);
  tctx.beginPath(); tctx.arc(cw - 47, ch - 125, 22, 0, Math.PI * 2); tctx.fill();
  tctx.beginPath(); tctx.arc(cw - 58, ch - 110, 16, 0, Math.PI * 2); tctx.fill();
  tctx.beginPath(); tctx.arc(cw - 36, ch - 115, 16, 0, Math.PI * 2); tctx.fill();
  tctx.beginPath(); tctx.arc(95, ch - 60, 12, 0, Math.PI * 2); tctx.fill();
  tctx.beginPath(); tctx.arc(cw - 95, ch - 55, 14, 0, Math.PI * 2); tctx.fill();

  // HALO behind tower
  const towerCenter = { x: 175, y: ch - 100 };
  const halo = tctx.createRadialGradient(towerCenter.x, towerCenter.y, 0, towerCenter.x, towerCenter.y, 130);
  halo.addColorStop(0,   'rgba(255,210,140,0.35)');
  halo.addColorStop(0.5, 'rgba(255,180,100,0.18)');
  halo.addColorStop(1,   'rgba(255,180,100,0)');
  tctx.fillStyle = halo;
  tctx.fillRect(towerCenter.x - 130, towerCenter.y - 130, 260, 260);

  // ANIMAL TOWER silhouette
  tctx.save();
  tctx.translate(towerCenter.x, towerCenter.y + 36);
  tctx.fillStyle = '#0a0508';
  // Donkey
  tctx.beginPath(); tctx.ellipse(0, 0, 42, 24, 0, 0, Math.PI * 2); tctx.fill();
  tctx.fillRect(-30, 14, 7, 22);
  tctx.fillRect(-18, 16, 6, 20);
  tctx.fillRect( 14, 14, 7, 22);
  tctx.fillRect( 26, 16, 6, 20);
  tctx.beginPath(); tctx.ellipse(34, -10, 14, 16, 0.2, 0, Math.PI * 2); tctx.fill();
  tctx.beginPath(); tctx.ellipse(44, -2, 6, 5, 0, 0, Math.PI * 2); tctx.fill();
  tctx.beginPath(); tctx.ellipse(30, -28, 4, 12, -0.2, 0, Math.PI * 2); tctx.fill();
  tctx.beginPath(); tctx.ellipse(40, -28, 4, 12,  0.2, 0, Math.PI * 2); tctx.fill();
  tctx.beginPath();
  tctx.moveTo(-40, -2); tctx.lineTo(-50, 4); tctx.lineTo(-46, -4); tctx.closePath();
  tctx.fill();
  // Dog
  tctx.beginPath(); tctx.ellipse(-2, -42, 28, 18, 0, 0, Math.PI * 2); tctx.fill();
  tctx.beginPath(); tctx.arc(20, -50, 12, 0, Math.PI * 2); tctx.fill();
  tctx.beginPath(); tctx.ellipse(30, -48, 6, 4, 0, 0, Math.PI * 2); tctx.fill();
  tctx.beginPath(); tctx.ellipse(15, -60, 5, 8, -0.3, 0, Math.PI * 2); tctx.fill();
  tctx.beginPath(); tctx.arc(-22, -42, 6, -Math.PI / 2, Math.PI * 1.3); tctx.fill();
  // Cat
  tctx.beginPath(); tctx.ellipse(0, -72, 18, 13, 0, 0, Math.PI * 2); tctx.fill();
  tctx.beginPath(); tctx.arc(13, -78, 9, 0, Math.PI * 2); tctx.fill();
  tctx.beginPath(); tctx.moveTo(8, -86); tctx.lineTo(10, -94); tctx.lineTo(14, -82); tctx.closePath(); tctx.fill();
  tctx.beginPath(); tctx.moveTo(15, -88); tctx.lineTo(19, -94); tctx.lineTo(20, -80); tctx.closePath(); tctx.fill();
  tctx.beginPath(); tctx.arc(-16, -76, 6, -Math.PI / 2, Math.PI / 2); tctx.fill();
  // Rooster
  tctx.beginPath(); tctx.ellipse(2, -98, 12, 10, 0, 0, Math.PI * 2); tctx.fill();
  tctx.beginPath(); tctx.arc(11, -106, 7, 0, Math.PI * 2); tctx.fill();
  tctx.beginPath();
  tctx.moveTo(-8, -98);
  tctx.quadraticCurveTo(-22, -110, -16, -94);
  tctx.quadraticCurveTo(-24, -100, -22, -86);
  tctx.quadraticCurveTo(-12, -88, -8, -94);
  tctx.closePath();
  tctx.fill();
  tctx.beginPath();
  tctx.moveTo(7, -110); tctx.lineTo(9, -116);
  tctx.lineTo(11, -110); tctx.lineTo(13, -118);
  tctx.lineTo(15, -110); tctx.lineTo(17, -116);
  tctx.lineTo(17, -106); tctx.lineTo(7, -106);
  tctx.closePath();
  tctx.fill();
  tctx.fillStyle = '#3a1a08';
  tctx.beginPath();
  tctx.moveTo(17, -106); tctx.lineTo(24, -104); tctx.lineTo(17, -102);
  tctx.closePath(); tctx.fill();
  tctx.restore();

  // MUSIC NOTES drifting up
  const noteData = [
    { x: 230, y: ch - 145, size: 16, opacity: 0.85 },
    { x: 252, y: ch - 175, size: 13, opacity: 0.75 },
    { x: 215, y: ch - 195, size: 11, opacity: 0.65 },
    { x: 270, y: ch - 210, size: 10, opacity: 0.55 },
    { x: 130, y: ch - 175, size: 14, opacity: 0.7 },
    { x: 100, y: ch - 200, size: 11, opacity: 0.55 },
    { x: 295, y: ch - 240, size:  9, opacity: 0.45 },
  ];
  tctx.fillStyle = '#d4a843';
  for (const n of noteData) {
    tctx.globalAlpha = n.opacity;
    tctx.font = `bold ${n.size}px serif`;
    tctx.fillText(n.size > 12 ? '♫' : '♪', n.x, n.y);
  }
  tctx.globalAlpha = 1;

  // ATMOSPHERIC FOG
  const fog = tctx.createLinearGradient(0, ch - 100, 0, ch - 60);
  fog.addColorStop(0, 'rgba(120,80,60,0)');
  fog.addColorStop(0.5, 'rgba(180,130,90,0.3)');
  fog.addColorStop(1, 'rgba(120,80,60,0)');
  tctx.fillStyle = fog;
  tctx.fillRect(0, ch - 100, cw, 40);

  // VIGNETTE
  const vg = tctx.createRadialGradient(cw / 2, ch / 2, cw * 0.3, cw / 2, ch / 2, cw * 0.75);
  vg.addColorStop(0, 'rgba(0,0,0,0)');
  vg.addColorStop(1, 'rgba(0,0,0,0.65)');
  tctx.fillStyle = vg;
  tctx.fillRect(0, 0, cw, ch);

  // Top dark band
  const topGrad = tctx.createLinearGradient(0, 0, 0, 30);
  topGrad.addColorStop(0, 'rgba(10,5,10,0.55)');
  topGrad.addColorStop(1, 'rgba(10,5,10,0)');
  tctx.fillStyle = topGrad;
  tctx.fillRect(0, 0, cw, 30);
}

// ────────────────────────────────────────────────────────────────────────────
// Title screen visibility
// ────────────────────────────────────────────────────────────────────────────

export function hideTitleScreen() {
  document.getElementById('titleScreen').classList.add('hidden');
}