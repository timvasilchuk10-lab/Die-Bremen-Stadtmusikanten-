// ============================================================================
// GAME — central class that owns the game loop and the render pipeline.
//
// Responsibilities:
//   - run requestAnimationFrame
//   - call updatePlayer() / updateParticles() during 'play' state
//   - clear & draw the canvas (background, sorted decor/notes/recruits/
//     enemies/player, exit zone, particles, optional darkness overlay,
//     vignette, stack ring)
//   - tick the hint banner timer
//   - clear edge-trigger inputs at the end of each frame
//
// Most concrete logic lives in the player/levels/ui/utils modules.
// ============================================================================

import { CONFIG }                 from './config.js';
import { state }                  from './state.js';
import { keys, clearFrameInput }  from './utils/input.js';
import { player, updatePlayer }   from './entities/player.js';
import {
  drawTiledBackground, drawGroundDetails,
  drawDecor, getDecorBaseline,
  drawWall, drawNote, drawRecruitPoint,
  drawScroll,
  drawExit, drawDarknessOverlay, drawVignette,
}                                 from './utils/renderer.js';
import { drawAnimalByIndex,
         drawPlayer }             from './entities/animals.js';
import { drawRobber }             from './entities/enemies.js';
import { particles, updateParticles, drawParticle } from './utils/particles.js';
import { getCurrentLevel }        from './levels/level-manager.js';
import { hideHint, updateFPrompt } from './ui/hud.js';

// ────────────────────────────────────────────────────────────────────────────
// Game
// ────────────────────────────────────────────────────────────────────────────

export class Game {
  constructor(canvas) {
    state.canvas = canvas;
    state.ctx    = canvas.getContext('2d');
  }

  /** Kick off the game loop. Call once after main.js has booted everything. */
  start() {
    const loop = () => {
      this.tick();
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  /** One frame: update + render. */
  tick() {
    state.worldTime++;

    if (state.status === 'play') updatePlayer();
    updateParticles();

    // Hint banner countdown
    if (player.hintT > 0) {
      player.hintT--;
      if (player.hintT === 0) hideHint();
    }

    if (state.status === 'play' || state.status === 'cutscene') {
      this.render();
      updateFPrompt();
    } else if (state.status === 'title') {
      // Title screen: just paint a flat backdrop behind the overlay.
      const ctx = state.ctx;
      ctx.fillStyle = '#07050a';
      ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
    }

    clearFrameInput();
  }

  /** Render the world: background → sorted entities → exit → effects. */
  render() {
    const ctx = state.ctx;
    const W = CONFIG.CANVAS_WIDTH, H = CONFIG.CANVAS_HEIGHT;
    const L = getCurrentLevel();

    // Camera shake
    let shakeX = 0, shakeY = 0;
    if (state.cameraShake > 0) {
      shakeX = (Math.random() - 0.5) * state.cameraShake;
      shakeY = (Math.random() - 0.5) * state.cameraShake;
      state.cameraShake *= 0.85;
      if (state.cameraShake < 0.2) state.cameraShake = 0;
    }

    // Background tiles
    drawTiledBackground(L.tileType);

    // World transform (camera + shake)
    ctx.save();
    ctx.translate(-state.cameraX + shakeX, -state.cameraY + shakeY);

    // Ground details (paths, plaza ring, etc.)
    drawGroundDetails(L);

    // Build a simple paint-sort queue keyed by visual baseline. This is a
    // poor-man's depth sort that gives the painterly look-from-above feel.
    const renderQueue = [];
    for (const d of L.decor) {
      renderQueue.push({ y: d.y + getDecorBaseline(d), fn: () => drawDecor(d) });
    }
    for (const r of L.recruits) {
      if (!player.recruited[r.which]) {
        renderQueue.push({ y: r.y + 12, fn: () => drawRecruitPoint(r, drawAnimalByIndex) });
      }
    }
    for (const n of L.notes) {
      renderQueue.push({ y: n.y, fn: () => drawNote(n) });
    }
    if (L.scrolls) {
      for (const s of L.scrolls) {
        // Halo turns on a bit BEFORE the prompt (at 70px) so the player feels
        // the object inviting attention before the prompt label appears (45px).
        const near = Math.hypot(player.x - s.x, player.y - s.y) < 70;
        renderQueue.push({
          y: s.y + 4,
          fn: () => {
            ctx.save();
            ctx.translate(s.x, s.y);
            drawScroll(s.read, near);
            ctx.restore();
          }
        });
      }
    }
    for (const e of L.enemies) {
      if (e.alive) renderQueue.push({ y: e.y + 16, fn: () => drawRobber(e) });
    }
    renderQueue.push({ y: player.y + 8, fn: () => drawPlayer() });
    for (const w of L.walls) {
      renderQueue.push({ y: w.y + w.h, fn: () => drawWall(w) });
    }
    renderQueue.sort((a, b) => a.y - b.y);
    for (const item of renderQueue) item.fn();

    // Exit + particles (drawn on top of world objects)
    drawExit(L.exit);

    // Cottage window quest marker — a pulsing yellow ring directs the player
    // to the panic-trigger zone until they activate it.
    if (L.windowZone && !L.panicTriggered) {
      const wz = L.windowZone;
      const t = state.worldTime * 0.08;
      const pulse = 0.55 + Math.sin(t) * 0.25;
      ctx.save();
      ctx.strokeStyle = `rgba(249,194,71,${pulse})`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(wz.x, wz.y, wz.r + Math.sin(t) * 6, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = `rgba(249,194,71,${pulse * 0.18})`;
      ctx.beginPath();
      ctx.arc(wz.x, wz.y, wz.r * 0.9, 0, Math.PI * 2);
      ctx.fill();
      // Floating arrow pointing up to the cottage
      ctx.fillStyle = `rgba(249,194,71,${pulse})`;
      const ay = wz.y - 28 + Math.sin(t * 1.5) * 4;
      ctx.beginPath();
      ctx.moveTo(wz.x, ay - 10);
      ctx.lineTo(wz.x - 7, ay + 2);
      ctx.lineTo(wz.x + 7, ay + 2);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    for (const p of particles) drawParticle(p);

    ctx.restore();

    // Optional level-darkness overlay (forest/cottage)
    if (L.darkness) drawDarknessOverlay(L, shakeX, shakeY);

    // Always-on vignette
    drawVignette();

    // Stacked-tower ring
    if (player.stacked) {
      ctx.save();
      ctx.translate(-state.cameraX + shakeX, -state.cameraY + shakeY);
      ctx.strokeStyle = 'rgba(212,168,67,0.3)';
      ctx.lineWidth = 2;
      const r = 60 + Math.sin(state.worldTime * 0.1) * 10;
      ctx.beginPath();
      ctx.arc(player.x, player.y, r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  }
}