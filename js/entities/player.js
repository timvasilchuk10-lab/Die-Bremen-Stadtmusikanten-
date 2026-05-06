// ============================================================================
// PLAYER — the four-companions character + everything that's "the player's"
// state (active animal, recruited flags, ability cooldowns, stealth/kick/bark/
// crow timers, hint-banner timer).
//
// The actual update logic (movement, abilities, music attack, recruit/chest
// interaction, exit handling) lives in `update.js` so this file stays a clean
// data definition + the per-frame mutators called by Game.update().
// ============================================================================

import { CONFIG }               from '../config.js';
import { state }                from '../state.js';
import { ANIMAL_DATA }          from '../data/animals.js';
import { keys, pressed }        from '../utils/input.js';
import { dist, rectOverlap,
         activeBox,
         moveAndCollide }       from '../utils/collision.js';
import { spawnDust,
         spawnNoteBurst,
         spawnImpact,
         spawnMusicWave,
         spawnBarkWave,
         spawnCrowWave,
         spawnDot }              from '../utils/particles.js';
import { playSFX, playRecruit,
         playInstrument,
         playMusicChord,
         playNote, getNoteFreq,
         toggleMusic }           from '../audio/sound-manager.js';
import { showHint, doFlash,
         updateCompanionUI,
         updateNoteCount,
         updateHpUI,
         updateScrollUI,
         showAchievement,
         updateAbilitiesUI }     from '../ui/hud.js';
import { openScrollOverlay }    from '../ui/menus.js';
import { getCurrentLevel,
         advanceLevel,
         loadLevel,
         resetCurrentLevel }     from '../levels/level-manager.js';

// ────────────────────────────────────────────────────────────────────────────
// Player state — single shared object, mutated in place.
// ────────────────────────────────────────────────────────────────────────────
export const player = {
  x: 0, y: 0,
  vx: 0, vy: 0,
  active: 0,
  recruited: [true, false, false, false],
  facingX: 1, facingY: 0,
  stacked: false,
  notes: 0,
  hp: 4,
  maxHp: 4,
  invuln: 0,
  hitFlash: 0,
  walkT: 0,
  spawnX: 0, spawnY: 0,
  hintT: 0,
  // Per-animal ability cooldowns (frames remaining)
  abilityCD:     [0, 0, 0, 0],
  abilityActive: [0, 0, 0, 0],
  // Cat stealth flag
  stealthT: 0,
  // Donkey kick window
  kickT: 0,
  // Dog bark wave
  barkT: 0,
  // Rooster crow window
  crowT: 0,
};

/** Reset for a new run. Called by restartGame(). */
export function resetPlayer() {
  player.notes = 0;
  player.hp    = CONFIG.PLAYER_MAX_HP;
  player.maxHp = CONFIG.PLAYER_MAX_HP;
  player.recruited = [true, false, false, false];
  player.active = 0;
  player.stacked = false;
  player.invuln = 0;
  player.hitFlash = 0;
  player.abilityCD     = [0, 0, 0, 0];
  player.abilityActive = [0, 0, 0, 0];
  player.stealthT = 0;
  player.kickT = 0;
  player.barkT = 0;
  player.crowT = 0;
}

/**
 * Party wipe — red flash, pause, retry current level.
 * Resets enemies/notes from pristine snapshot; keeps recruited companions.
 */
function triggerGameOver() {
  player.hp = 0;
  updateHpUI();
  doFlash(0.8, '#8a0000');
  state.cameraShake = 20;
  showHint('The party fell… <em>trying again</em>', 220);

  // Freeze the game loop briefly using 'cutscene' status (loop skips updatePlayer).
  state.status = 'cutscene';
  setTimeout(() => {
    resetCurrentLevel();
    player.hp     = CONFIG.PLAYER_MAX_HP;
    player.invuln = CONFIG.PLAYER_INVULN_FRAMES * 2; // safe frames on respawn
    player.stacked = false;
    updateHpUI();
    loadLevel(state.currentLevel);
    state.status = 'play';
  }, 1800);
}

/**
 * The fairy-tale moment: all four animals stack at the cottage window and make
 * their music. The robbers — convinced they're being attacked by monsters —
 * burst out of the cottage door and scatter into the night.
 */
function triggerCottagePanic(L) {
  L.panicTriggered = true;

  // Triple chord + layered shockwaves
  playMusicChord();
  setTimeout(() => playMusicChord(), 180);
  setTimeout(() => playMusicChord(), 360);
  spawnMusicWave(player.x, player.y);
  setTimeout(() => spawnMusicWave(player.x - 50, player.y - 30), 100);
  setTimeout(() => spawnMusicWave(player.x + 50, player.y - 30), 200);

  // Big cinematic feedback
  state.cameraShake = 30;
  doFlash(0.85, '#f9c247');
  setTimeout(() => doFlash(0.5, '#f9c247'), 220);

  // Door position — robbers visibly burst out from here.
  const door = L.cottageDoor || { x: L.windowZone.x + 50, y: L.windowZone.y - 45 };

  // Big dust puff at the door
  for (let i = 0; i < 18; i++) {
    spawnDot(door.x + (Math.random() - 0.5) * 40,
             door.y + (Math.random() - 0.5) * 20,
             '#a89878');
  }

  // Teleport every alive robber to the door and have them burst outward.
  // Spread them in a fan pointed AWAY from the player so they're visible.
  let i = 0;
  for (const e of L.enemies) {
    if (!e.alive) continue;
    // Snap to door with small jitter
    e.x = door.x + (Math.random() - 0.5) * 36 - e.w / 2;
    e.y = door.y + (Math.random() - 0.5) * 20 - e.h / 2;
    e.panicked = true;
    e.fleeT = 0;
    e.stunned = 0;
    e.hitFlash = 18;            // visible flash so the player notices them spawning
    // Flee direction: outward from cottage, fanned away from player
    const cx = e.x + e.w / 2, cy = e.y + e.h / 2;
    let baseAng = Math.atan2(cy - player.y, cx - player.x);
    // Spread the i-th robber across a 140° fan centered on baseAng
    const spread = (i - 2.5) * 0.45;   // ~26° per robber
    const ang = baseAng + spread;
    e.fleeDx = Math.cos(ang);
    e.fleeDy = Math.sin(ang);
    i++;
  }

  showHint('"What manner of beasts are these?!" — the robbers FLEE into the night!', 320);
}

/** Convenience accessors. */
export function currentAnimal() {
  return ANIMAL_DATA[player.active];
}

// ────────────────────────────────────────────────────────────────────────────
// Onward: per-frame logic (movement, abilities, music, exit, etc.)
// ────────────────────────────────────────────────────────────────────────────

/** Tick all per-animal cooldown timers and the ability-active timers. */
export function updateAbilities() {
  for (let i = 0; i < 4; i++) {
    if (player.abilityCD[i] > 0) player.abilityCD[i]--;
    if (player.abilityActive[i] > 0) player.abilityActive[i]--;
  }
  if (player.kickT > 0) player.kickT--;
  if (player.barkT > 0) player.barkT--;
  if (player.crowT > 0) player.crowT--;
  if (player.stealthT > 0) player.stealthT--;
}

/**
 * Apply damage to a single robber. Centralised so wave attacks can share the
 * exact same flinch / iframe / knockback / death-shake flow.
 */
function damageEnemy(e, dmg) {
  if (!e.alive) return;
  e.hp -= dmg;
  e.hitFlash = 14;
  e.iframes  = 28; // ~0.47s — stops a single wave from double-hitting
  e.stunned  = Math.max(e.stunned, 45);
  // Tiny knockback away from the player
  const ex = e.x + e.w / 2;
  const ey = e.y + e.h / 2;
  const ang = Math.atan2(ey - player.y, ex - player.x);
  e.cx += Math.cos(ang) * 12;
  e.cy += Math.sin(ang) * 12;
  if (e.hp <= 0) {
    e.alive = false;
    state.cameraShake = Math.max(state.cameraShake, 6);
  }
}

/** Run one frame of "player tries to use their special ability". */
function tryUseAbility() {
  const idx = player.active;
  if (!player.recruited[idx]) return;
  if (player.abilityCD[idx] > 0) {
    showHint('Ability still recovering...', 60);
    return;
  }
  const data = ANIMAL_DATA[idx];
  player.abilityCD[idx]     = data.ability.cooldown;
  player.abilityActive[idx] = data.ability.duration;
  doFlash(0.25, data.ability.tint);

  const L = getCurrentLevel();
  if (idx === 0) {
    // DONKEY: Heavy Kick
    player.kickT = 24;
    state.cameraShake = 8;
    playInstrument(0, 110, 1.0);
    spawnImpact(player.x + player.facingX * 30, player.y + player.facingY * 30, '#d4a843');
    // Break crates and stun robbers in front
    const reachX = player.x + player.facingX * 50;
    const reachY = player.y + player.facingY * 50;
    for (const d of L.decor) {
      if (d.type === 'crate' && !d.broken) {
        if (dist(reachX, reachY, d.x, d.y) < 50) {
          d.broken = true;
          spawnImpact(d.x, d.y, '#6b4423');
          for (let i = 0; i < 8; i++) {
            spawnDot(d.x, d.y,
                     (Math.random() - 0.5) * 4, (Math.random() - 0.5) * 4,
                     '#6b4423', 35, 4);
          }
          playSFX(140, 0.25, 'sawtooth', 0.10);
        }
      }
    }
    // Knock back robbers in arc
    for (const e of L.enemies) {
      if (!e.alive) continue;
      const ex = e.x + e.w / 2;
      const ey = e.y + e.h / 2;
      const dotProd = (ex - player.x) * player.facingX + (ey - player.y) * player.facingY;
      if (dist(player.x, player.y, ex, ey) < 70 && dotProd > 0) {
        e.cx = ex + player.facingX * 40;
        e.cy = ey + player.facingY * 40;
        e.stunned = 50;
        spawnImpact(ex, ey, '#3a1f0c');
      }
    }
    showHint('A mighty kick!', 80);
  } else if (idx === 1) {
    // DOG: Bark
    player.barkT = 20;
    state.cameraShake = 6;
    playInstrument(1, 220, 0.8);
    setTimeout(() => playInstrument(1, 330, 0.8), 80);
    setTimeout(() => playInstrument(1, 440, 0.8), 160);
    spawnBarkWave(player.x, player.y);
    for (const e of L.enemies) {
      if (!e.alive) continue;
      const ex = e.x + e.w / 2;
      const ey = e.y + e.h / 2;
      if (dist(player.x, player.y, ex, ey) < 150) {
        e.stunned = 70;
      }
    }
    showHint('A piercing bark stuns the robbers!', 90);
  } else if (idx === 2) {
    // CAT: Stealth
    player.stealthT = 240;
    playInstrument(2, 440, 0.8);
    setTimeout(() => playInstrument(2, 660, 0.8), 200);
    for (let i = 0; i < 12; i++) {
      const ang = (Math.PI * 2) * i / 12;
      spawnDot(player.x, player.y, Math.cos(ang) * 1.5, Math.sin(ang) * 1.5,
               '#fcd9a8', 50, 4);
    }
    showHint('Stealth! Robbers cannot see you.', 100);
  } else if (idx === 3) {
    // ROOSTER: Crow + dash
    player.crowT = 180;
    state.cameraShake = 5;
    playInstrument(3, 880, 0.9);
    setTimeout(() => playInstrument(3, 1320, 0.7), 120);
    spawnCrowWave(player.x, player.y);
    // Dash forward
    moveAndCollide(player.facingX * 60, player.facingY * 60);
    // Stun small foes (all robbers in 110px)
    for (const e of L.enemies) {
      if (!e.alive) continue;
      const ex = e.x + e.w / 2;
      const ey = e.y + e.h / 2;
      if (dist(player.x, player.y, ex, ey) < 110) {
        e.stunned = 50;
      }
    }
    showHint('A mighty crow! The light spreads.', 100);
  }
  updateAbilitiesUI();
}

/**
 * Per-frame player update. Reads input, moves, handles all ability/recruit/
 * music/exit logic, updates camera & enemies. Called from Game.update().
 */
export function updatePlayer() {
  const a = currentAnimal();
  const L = getCurrentLevel();
  const W = CONFIG.CANVAS_WIDTH, H = CONFIG.CANVAS_HEIGHT;

  // Switch animals
  for (let i = 0; i < 4; i++) {
    if (pressed('Digit' + (i + 1)) && player.recruited[i] && !player.stacked) {
      player.active = i;
      playSFX(500 + i * 80, 0.06, 'triangle', 0.06);
      updateCompanionUI();
    }
  }

  // Stack toggle
  if (pressed('KeyQ')) {
    const count = player.recruited.filter(Boolean).length;
    if (count >= 2) {
      player.stacked = !player.stacked;
      if (player.stacked) {
        playRecruit();
        doFlash(0.35);
        state.cameraShake = 8;
        showHint('Stacked! Press <span class="key">F</span> to play music. <span class="key">Q</span> to unstack.', 180);
      } else {
        showHint('Unstacked.', 60);
      }
    } else {
      showHint('Recruit at least one more companion to stack.', 120);
    }
  }

  // Ability (E)
  if (pressed('KeyE') && !player.stacked) {
    tryUseAbility();
  }

  // Movement
  let dx = 0, dy = 0;
  if (keys['KeyA'] || keys['ArrowLeft'])  dx -= 1;
  if (keys['KeyD'] || keys['ArrowRight']) dx += 1;
  if (keys['KeyW'] || keys['ArrowUp'])    dy -= 1;
  if (keys['KeyS'] || keys['ArrowDown'])  dy += 1;

  let speed = CONFIG.PLAYER_BASE_SPEED * a.speedMult;
  if (player.stacked) speed *= CONFIG.STACK_SPEED_MULT;
  if (player.stealthT > 0 && player.active === 2) speed *= CONFIG.STEALTH_SPEED_MULT;

  if (dx !== 0 || dy !== 0) {
    const len = Math.hypot(dx, dy);
    dx /= len; dy /= len;
    player.facingX = dx;
    player.facingY = dy;
    player.walkT += speed * 0.15;
    moveAndCollide(dx * speed, dy * speed);
    if (state.worldTime % 14 === 0 && !player.stacked) {
      spawnDust(player.x - dx * 8, player.y - dy * 8);
    }
    // Walking instrument hint: occasional soft note matching active animal
    if (state.worldTime % 90 === 0) {
      playInstrument(player.active, 220 + player.active * 110, 0.25);
    }
  }

  // Recruit / interact (F) when not stacked
  if (!player.stacked && pressed('KeyF')) {
    let acted = false;
    // Recruits
    for (const r of L.recruits) {
      if (player.recruited[r.which]) continue;
      if (dist(player.x, player.y, r.x, r.y) < 60) {
        player.recruited[r.which] = true;
        playRecruit();
        doFlash(0.5);
        state.cameraShake = 10;
        spawnMusicWave(r.x, r.y);
        const aData = ANIMAL_DATA[r.which];
        showHint(`<b>${aData.name}</b> joins! Press <span class="key">${r.which + 1}</span> to play as ${aData.ename}.`, 220);
        updateCompanionUI();
        // Cage release: open the cage if there's one near this recruit
        for (const d of L.decor) {
          if (d.type === 'cage' && !d.broken && dist(d.x, d.y, r.x, r.y) < 30) {
            d.broken = true;
            spawnImpact(d.x, d.y, '#6b4423');
          }
        }
        acted = true;
        break;
      }
    }
    // Chests
    if (!acted) {
      for (const d of L.decor) {
        if (d.type === 'chest' && !d.opened) {
          if (dist(player.x, player.y, d.x, d.y) < 36) {
            d.opened = true;
            // Burst of bonus notes
            for (let k = 0; k < 5; k++) {
              setTimeout(() => {
                player.notes++;
                spawnNoteBurst(d.x + (Math.random() - 0.5) * 30, d.y + (Math.random() - 0.5) * 30);
                playNote(player.notes);
                updateNoteCount();
              }, k * 100);
            }
            doFlash(0.4);
            state.cameraShake = 8;
            showHint('A chest of musical treasures!', 140);
            acted = true;
            break;
          }
        }
      }
    }
    // Scrolls (Bremen lore) — open parchment overlay; can re-read.
    if (!acted && L.scrolls) {
      for (const s of L.scrolls) {
        if (dist(player.x, player.y, s.x, s.y) < 45) {
          const wasUnread = !s.read;
          if (wasUnread) {
            s.read = true;
            updateScrollUI();
            // First-time read: gentle gold flash + soft sound.
            doFlash(0.15, '#d4a843');
            playSFX(660, 0.18, 'sine', 0.05);
            // All five collected — celebrate with an achievement toast.
            const total = L.scrolls.length;
            const read  = L.scrolls.filter(x => x.read).length;
            if (read === total) {
              setTimeout(() => showAchievement('Loremaster of Bremen'), 600);
            }
          }
          openScrollOverlay(s.id);
          acted = true;
          break;
        }
      }
    }
  }

  // Music attack (when stacked, F) — damages instead of insta-kill, costs notes
  if (player.stacked && pressed('KeyF')) {
    // ── COTTAGE WINDOW SCENE ─────────────────────────────────────────────────
    // Fairy-tale moment: all 4 stacked at the window → robbers flee in panic.
    // Triggers ONCE per level, only if all 4 animals are recruited.
    if (L.windowZone && !L.panicTriggered &&
        player.recruited[0] && player.recruited[1] && player.recruited[2] && player.recruited[3] &&
        dist(player.x, player.y, L.windowZone.x, L.windowZone.y) < L.windowZone.r) {
      triggerCottagePanic(L);
      return;
    }
    // ── Regular music attack ────────────────────────────────────────────────
    if (player.notes < CONFIG.MUSIC_NOTE_COST) {
      // Not enough notes — fail feedback, no attack
      showHint('Not enough notes to play music! <span class="key">♪</span> ' + player.notes + ' / ' + CONFIG.MUSIC_NOTE_COST, 110);
      playSFX(110, 0.18, 'square', 0.06);
      setTimeout(() => playSFX(80, 0.20, 'square', 0.06), 90);
    } else {
      player.notes -= CONFIG.MUSIC_NOTE_COST;
      updateNoteCount();
      playMusicChord();
      spawnMusicWave(player.x, player.y);
      state.cameraShake = 14;
      doFlash(0.55);
      showHint('Music rings — the robbers stagger!', 100);
      for (const e of L.enemies) {
        if (!e.alive) continue;
        if (e.iframes > 0) continue; // can't double-hit on the same wave
        const ex = e.x + e.w / 2;
        const ey = e.y + e.h / 2;
        if (dist(player.x, player.y, ex, ey) < CONFIG.MUSIC_DAMAGE_RANGE) {
          damageEnemy(e, 1);
          spawnImpact(ex, ey, '#3a1f0c');
          playSFX(180 - Math.random() * 40, 0.25, 'sawtooth', 0.07);
        }
      }
    }
  }

  // Notes pickup
  for (let i = L.notes.length - 1; i >= 0; i--) {
    const n = L.notes[i];
    if (dist(player.x, player.y, n.x, n.y) < 26) {
      L.notes.splice(i, 1);
      player.notes++;
      spawnNoteBurst(n.x, n.y);
      playNote(player.notes);
      // Active animal's instrument plays the note
      const f = getNoteFreq(player.notes);
      playInstrument(player.active, f, 0.6);
      updateNoteCount();
    }
  }

  // Messages
  for (const m of L.messages) {
    if (m.triggered && m.once) continue;
    const r = { x: m.x, y: m.y, w: m.w, h: m.h };
    const pr = activeBox();
    if (rectOverlap(pr, r)) {
      showHint(m.text, 200);
      m.triggered = true;
    }
  }

  // Enemies update + contact
  if (player.invuln > 0) player.invuln--;
  for (const e of L.enemies) {
    if (!e.alive) continue;
    if (e.stunned  > 0) e.stunned--;
    if (e.iframes  > 0) e.iframes--;
    if (e.hitFlash > 0) e.hitFlash--;
    // Panicked robbers ignore patrol & player — they sprint off the map.
    if (e.panicked) {
      e.x += e.fleeDx * 2.6;
      e.y += e.fleeDy * 2.6;
      e.fleeT = (e.fleeT || 0) + 1;
      // Once they've cleared the visible area, mark dead.
      if (e.fleeT > 180 ||
          e.x < -50 || e.x > L.width + 50 ||
          e.y < -50 || e.y > L.height + 50) {
        e.alive = false;
      }
      continue;
    }
    if (e.stunned === 0) {
      e.t += e.speed * 0.045;
      if (e.patrolType === 'horizontal') {
        e.x = e.cx + Math.sin(e.t) * e.range;
        e.y = e.cy;
      } else if (e.patrolType === 'vertical') {
        e.x = e.cx;
        e.y = e.cy + Math.sin(e.t) * e.range;
      } else if (e.patrolType === 'circle') {
        e.x = e.cx + Math.cos(e.t) * e.range;
        e.y = e.cy + Math.sin(e.t) * e.range;
      }
    }
    // Contact damage if not stacked, not stealthed
    const stealthed = player.stealthT > 0 && player.active === 2;
    if (!player.stacked && !stealthed && player.invuln === 0 && e.stunned === 0) {
      const ex = e.x + e.w / 2;
      const ey = e.y + e.h / 2;
      if (dist(player.x, player.y, ex, ey) < CONFIG.CONTACT_DAMAGE_RANGE) {
        const ang = Math.atan2(player.y - ey, player.x - ex);
        player.x += Math.cos(ang) * 30;
        player.y += Math.sin(ang) * 30;
        player.invuln = CONFIG.PLAYER_INVULN_FRAMES;
        player.hitFlash = 16;
        state.cameraShake = 12;
        doFlash(0.35, '#c77f7a');
        playSFX(200, 0.2, 'sawtooth', 0.10);
        player.hp -= CONFIG.ROBBER_DAMAGE;
        updateHpUI();
        if (player.hp <= 0) {
          triggerGameOver();
        } else {
          showHint('A robber struck you! Stack with <span class="key">Q</span>, then play music with <span class="key">F</span>.', 160);
        }
      }
    }
  }
  if (player.hitFlash > 0) player.hitFlash--;

  // Exit
  const ex = L.exit;
  const exRect = { x: ex.x, y: ex.y, w: ex.w, h: ex.h };
  if (rectOverlap(activeBox(), exRect)) {
    const anyAlive = L.enemies.some(e => e.alive);
    if (anyAlive) {
      showHint('Robbers still prowl. Stack and play music to scatter them.', 130);
    } else {
      advanceLevel(() => {
        // onWin callback — trigger the win screen via menus.
        import('../ui/menus.js').then(m => m.showWinScreen(player.notes));
      });
    }
  }

  if (pressed('KeyM')) toggleMusic();

  // Camera follow
  state.cameraX += ((player.x - W / 2) - state.cameraX) * CONFIG.CAMERA_LERP;
  state.cameraY += ((player.y - H / 2) - state.cameraY) * CONFIG.CAMERA_LERP;
  state.cameraX = Math.max(0, Math.min(L.width  - W, state.cameraX));
  state.cameraY = Math.max(0, Math.min(L.height - H, state.cameraY));

  updateAbilities();
  updateAbilitiesUI();
}