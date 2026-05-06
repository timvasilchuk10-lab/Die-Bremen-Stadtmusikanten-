// ============================================================================
// HUD — DOM-based heads-up display.
//
// Owns:
//   - Companion slots (the four little portraits at top-left)
//   - Ability slots (bottom-left, with cooldown overlay)
//   - Level tag + chapter (top-right)
//   - Note counter (top-right)
//   - Hint banner (bottom-centre)
//   - Press-F prompt (floating world-anchored badge)
//   - Screen flash / camera-shake helpers
//
// All DOM lookups happen here; the rest of the codebase calls high-level
// functions like `showHint`, `updateNoteCount`, etc.
// ============================================================================

import { CONFIG }      from '../config.js';
import { state }       from '../state.js';
import { ANIMAL_DATA } from '../data/animals.js';
import { player }      from '../entities/player.js';
import { paintAnimalPortrait, drawAnimalTopDown } from '../entities/animals.js';
import { dist }        from '../utils/collision.js';
import { getCurrentLevel } from '../levels/level-manager.js';

// ────────────────────────────────────────────────────────────────────────────
// Hint banner
// ────────────────────────────────────────────────────────────────────────────

export function showHint(html, dur = 220) {
  const el = document.getElementById('hint');
  el.innerHTML = html;
  el.classList.add('show');
  player.hintT = dur;
}
export function hideHint() {
  document.getElementById('hint').classList.remove('show');
}

// ────────────────────────────────────────────────────────────────────────────
// Companion / ability slots
// ────────────────────────────────────────────────────────────────────────────

export function updateCompanionUI() {
  for (let i = 0; i < 4; i++) {
    const el = document.getElementById('slot-' + i);
    el.classList.toggle('recruited', player.recruited[i] && player.active !== i);
    el.classList.toggle('active',    player.active === i && player.recruited[i]);
    const abil = document.getElementById('abil-' + i);
    abil.classList.toggle('recruited', player.recruited[i]);
    abil.classList.toggle('active',    player.active === i && player.recruited[i]);
  }
}

export function updateLevelTag() {
  const L = getCurrentLevel();
  document.getElementById('levelChapter').textContent = L.chapter;
  document.getElementById('levelName').textContent    = L.name;
}

export function updateNoteCount() {
  document.getElementById('noteCount').textContent = player.notes;
}

export function setHudNoteTotal(n) {
  document.getElementById('noteTotal').textContent = n;
}

/**
 * Render the shared party HP as a row of heart glyphs.
 * Full heart = ♥  Empty heart = ♡
 */
export function updateHpUI() {
  const el = document.getElementById('hpDisplay');
  if (!el) return;
  const { hp, maxHp } = player;
  let html = '';
  for (let i = 0; i < maxHp; i++) {
    html += `<span class="heart ${i < hp ? 'full' : 'empty'}">${i < hp ? '♥' : '♡'}</span>`;
  }
  el.innerHTML = html;
}

/**
 * Bremen lore counter — only visible while a level has scrolls.
 * Shows e.g. "📜 2 / 5".
 */
export function updateScrollUI() {
  const el = document.getElementById('scrollDisplay');
  if (!el) return;
  const L = getCurrentLevel();
  if (!L.scrolls || L.scrolls.length === 0) {
    el.style.display = 'none';
    return;
  }
  el.style.display = 'flex';
  const total = L.scrolls.length;
  const read  = L.scrolls.filter(s => s.read).length;
  el.innerHTML = `<span class="scroll-icon">📜</span> ${read} / ${total}`;
  if (read === total) el.classList.add('complete');
  else                el.classList.remove('complete');
}

/**
 * Show a parchment-styled achievement toast at the right edge of the screen.
 * Auto-dismisses after ~4.5 seconds. Plays a small chime if audio is on.
 */
export function showAchievement(name) {
  const el = document.getElementById('achievement');
  if (!el) return;
  document.getElementById('achName').textContent = name;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 4500);
}

export function updateAbilitiesUI() {
  for (let i = 0; i < 4; i++) {
    const slot = document.getElementById('abil-' + i);
    const cdEl = slot.querySelector('.ability-cd');
    const cd   = player.abilityCD[i];
    const data = ANIMAL_DATA[i];
    const pct  = cd / data.ability.cooldown;
    cdEl.style.height = (pct * 100) + '%';
    slot.classList.toggle('ready', cd === 0 && player.recruited[i]);
  }
}

/** Yellow/red flash overlaying the whole game canvas. */
export function doFlash(intensity, color) {
  const el = document.getElementById('flash');
  el.style.background = color || 'var(--gold)';
  el.style.opacity    = intensity;
  setTimeout(() => el.style.opacity = 0, 60);
}

// ────────────────────────────────────────────────────────────────────────────
// Ability icon canvases — re-used by `paintAbilityIcons()` once per init/font-load.
// ────────────────────────────────────────────────────────────────────────────

export function paintAbilityIcons() {
  const icons = [
    // 0 — DONKEY: a kicking leg
    (ictx, s) => {
      ictx.clearRect(0, 0, s, s);
      ictx.save();
      ictx.translate(s / 2, s / 2);
      ictx.fillStyle = '#9d8c78';
      ictx.beginPath();
      ictx.moveTo(-10, -10); ictx.lineTo(-2, -10); ictx.lineTo(-2, 6);
      ictx.lineTo(10, 6); ictx.lineTo(10, 12); ictx.lineTo(-10, 12);
      ictx.closePath(); ictx.fill();
      ictx.strokeStyle = '#3a2818'; ictx.lineWidth = 1; ictx.stroke();
      ictx.fillStyle = '#d4a843';
      ictx.font = 'bold 10px serif';
      ictx.textAlign = 'center';
      ictx.fillText('✦', 11, -7);
      ictx.restore();
    },
    // 1 — DOG: bark waves
    (ictx, s) => {
      ictx.clearRect(0, 0, s, s);
      ictx.save();
      ictx.translate(s / 2, s / 2);
      ictx.strokeStyle = '#c48f5b';
      ictx.lineWidth = 1.5;
      for (let i = 1; i <= 3; i++) {
        ictx.beginPath();
        ictx.arc(-4, 0, 4 * i, -0.6, 0.6);
        ictx.stroke();
      }
      ictx.fillStyle = '#c48f5b';
      ictx.beginPath(); ictx.arc(-9, 0, 3, 0, Math.PI * 2); ictx.fill();
      ictx.beginPath(); ictx.arc(-12, -4, 1.5, 0, Math.PI * 2); ictx.fill();
      ictx.beginPath(); ictx.arc(-12,  4, 1.5, 0, Math.PI * 2); ictx.fill();
      ictx.restore();
    },
    // 2 — CAT: stealth eye
    (ictx, s) => {
      ictx.clearRect(0, 0, s, s);
      ictx.save();
      ictx.translate(s / 2, s / 2);
      ictx.fillStyle = '#fcd9a8';
      ictx.beginPath();
      ictx.ellipse(0, 0, 12, 7, 0, 0, Math.PI * 2);
      ictx.fill();
      ictx.strokeStyle = '#3a1f0c';
      ictx.lineWidth = 1.5;
      ictx.stroke();
      ictx.fillStyle = '#3a1f0c';
      ictx.beginPath();
      ictx.ellipse(0, 0, 2, 6, 0, 0, Math.PI * 2);
      ictx.fill();
      ictx.fillStyle = '#fcd9a8';
      ictx.beginPath(); ictx.arc(-13, -7, 1.5, 0, Math.PI * 2); ictx.fill();
      ictx.beginPath(); ictx.arc( 13, -7, 1.5, 0, Math.PI * 2); ictx.fill();
      ictx.beginPath(); ictx.arc(  0, -10, 1.5, 0, Math.PI * 2); ictx.fill();
      ictx.restore();
    },
    // 3 — ROOSTER: crowing burst
    (ictx, s) => {
      ictx.clearRect(0, 0, s, s);
      ictx.save();
      ictx.translate(s / 2, s / 2);
      ictx.strokeStyle = '#f9a847';
      ictx.lineWidth = 2;
      for (let i = 0; i < 8; i++) {
        const ang = (Math.PI * 2) * i / 8;
        ictx.beginPath();
        ictx.moveTo(Math.cos(ang) * 6, Math.sin(ang) * 6);
        ictx.lineTo(Math.cos(ang) * 12, Math.sin(ang) * 12);
        ictx.stroke();
      }
      ictx.fillStyle = '#e74444';
      ictx.beginPath();
      ictx.moveTo(-4, -2); ictx.lineTo(-2, -5); ictx.lineTo(0, -2);
      ictx.lineTo(2, -5); ictx.lineTo(4, -2); ictx.lineTo(4, 4);
      ictx.lineTo(-4, 4); ictx.closePath();
      ictx.fill();
      ictx.fillStyle = '#f9a847';
      ictx.beginPath();
      ictx.moveTo(4, 0); ictx.lineTo(8, 1); ictx.lineTo(4, 2);
      ictx.closePath(); ictx.fill();
      ictx.restore();
    }
  ];
  for (let i = 0; i < 4; i++) {
    const slot = document.getElementById('abil-' + i);
    if (!slot) continue;
    const c = slot.querySelector('canvas');
    if (c) icons[i](c.getContext('2d'), 36);
  }
}

export function paintCompanionPortraits() {
  for (let i = 0; i < 4; i++) {
    const slot = document.getElementById('slot-' + i);
    if (!slot) continue;
    // Remove the duplicate "1/2/3/4" key label — already shown on the ability bar.
    const keyLabel = slot.querySelector('.companion-key');
    if (keyLabel) keyLabel.remove();
    const c = slot.querySelector('canvas');
    if (c) paintAnimalPortrait(c.getContext('2d'), i, 40);
  }
}

// ────────────────────────────────────────────────────────────────────────────
// Press-F prompt — DOM badge floating above the nearest interactable.
// ────────────────────────────────────────────────────────────────────────────

export function updateFPrompt() {
  if (state.status !== 'play') {
    document.getElementById('fPrompt').classList.remove('show');
    return;
  }
  const L = getCurrentLevel();
  const W = CONFIG.CANVAS_WIDTH;
  let target = null;
  let text = 'Recruit';

  if (!player.stacked) {
    for (const r of L.recruits) {
      if (player.recruited[r.which]) continue;
      if (dist(player.x, player.y, r.x, r.y) < 60) {
        target = { x: r.x, y: r.y - 40 };
        text = `Recruit ${ANIMAL_DATA[r.which].ename}`;
        break;
      }
    }
    if (!target) {
      for (const d of L.decor) {
        if (d.type === 'chest' && !d.opened && dist(player.x, player.y, d.x, d.y) < 40) {
          target = { x: d.x, y: d.y - 30 };
          text = 'Open Chest';
          break;
        }
      }
    }
    // Scrolls — show "Read" / "Read again". Tighter radius keeps the prompt
    // an in-world reaction, not a from-across-the-plaza marker.
    if (!target && L.scrolls) {
      for (const s of L.scrolls) {
        if (dist(player.x, player.y, s.x, s.y) < 45) {
          target = { x: s.x, y: s.y - 18 };
          text = s.read ? 'Read again' : 'Read';
          break;
        }
      }
    }
    // Cottage window when not yet stacked — guide the player to press Q first.
    if (!target && L.windowZone && !L.panicTriggered &&
        player.recruited[0] && player.recruited[1] && player.recruited[2] && player.recruited[3] &&
        dist(player.x, player.y, L.windowZone.x, L.windowZone.y) < L.windowZone.r) {
      target = { x: L.windowZone.x, y: L.windowZone.y - 50 };
      text = '[Q] · Stack first';
    }
  } else {
    // Cottage window — strongest priority when stacked with all four animals
    if (L.windowZone && !L.panicTriggered &&
        player.recruited[0] && player.recruited[1] && player.recruited[2] && player.recruited[3] &&
        dist(player.x, player.y, L.windowZone.x, L.windowZone.y) < L.windowZone.r) {
      target = { x: L.windowZone.x, y: L.windowZone.y - 50 };
      text = 'Play Music!';
    }
    if (!target) {
      for (const e of L.enemies) {
        if (!e.alive) continue;
        const ex = e.x + e.w / 2;
        const ey = e.y + e.h / 2;
        if (dist(player.x, player.y, ex, ey) < 240) {
          target = { x: player.x, y: player.y - 80 };
          text = 'Play Music';
          break;
        }
      }
    }
  }

  const el = document.getElementById('fPrompt');
  if (target) {
    const canvas = state.canvas;
    const scale = canvas.getBoundingClientRect().width / W;
    const rect  = canvas.getBoundingClientRect();
    const sx = rect.left + (target.x - state.cameraX) * scale;
    const sy = rect.top  + (target.y - state.cameraY) * scale;
    el.style.left = sx + 'px';
    el.style.top  = sy + 'px';
    // If the text already starts with a [KEY] marker, use it as-is.
    // Otherwise default to [F].
    const html = /^\[\w+\]/.test(text) ? text : '[F] · ' + text;
    document.getElementById('fPromptText').innerHTML = html;
    el.classList.add('show');
  } else {
    el.classList.remove('show');
  }
}

// Re-export drawAnimalTopDown so other UI files don't need to know about
// /entities/animals.js (handy for future refactors).
export { drawAnimalTopDown };