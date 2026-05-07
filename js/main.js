// ============================================================================
// MAIN — entry point for the game.
//
// Boots in this order:
//   1. Wire up keyboard input
//   2. Find the canvas, set state.canvas / state.ctx
//   3. Construct Game
//   4. Paint static UI: companion portraits, ability icons, title art
//   5. Hook up the title screen "Begin the Tale" button
//   6. Hook up the win-screen "Tell the Tale Again" button
//   7. Hook up the cutscene "Onward" button
//   8. Wire up audio toggle button + lazy-init audio on first user gesture
//   9. Set up canvas resize handler
//  10. Start the game loop
// ============================================================================

import { CONFIG }            from './config.js';
import { state }             from './state.js';
import { Game }              from './game.js';
import { setupInput }        from './utils/input.js';
import { initAudio,
         wakeUpAudioContext,
         toggleMusic }       from './audio/sound-manager.js';
import { player, resetPlayer } from './entities/player.js';
import { LEVELS, loadLevel,
         resetAllLevels }    from './levels/level-manager.js';
import { paintCompanionPortraits, paintAbilityIcons,
         updateCompanionUI, updateNoteCount,
         setHudNoteTotal, updateHpUI, updateScrollUI }   from './ui/hud.js';
import { paintTitleArt,
         hideTitleScreen,
         hideWinScreen,
         showCutscene,
         dismissCutscene,
         closeScrollOverlay,
         isScrollOpen }     from './ui/menus.js';

// ────────────────────────────────────────────────────────────────────────────
// Boot
// ────────────────────────────────────────────────────────────────────────────

const canvas = document.getElementById('game');
setupInput();
const game = new Game(canvas);

// Initial UI paint
updateCompanionUI();
updateHpUI();
updateScrollUI();
paintCompanionPortraits();
paintAbilityIcons();
paintTitleArt();

// Repaint canvas-rendered UI once webfonts have loaded — otherwise the very
// first paint can fall back to plain serif and look wrong.
if (document.fonts && document.fonts.ready) {
  document.fonts.ready.then(() => {
    paintCompanionPortraits();
    paintAbilityIcons();
    paintTitleArt();
  });
}

// ────────────────────────────────────────────────────────────────────────────
// Title screen → start the adventure
// ────────────────────────────────────────────────────────────────────────────

function beginAdventure() {
  initAudio();
  hideTitleScreen();
  loadLevel(0);
  showCutscene('intro', () => {});
  updateCompanionUI();
  updateNoteCount();
  player.hintT = 0;
  setTimeout(() => {
    if (state.status === 'play') {
      // Show a friendly first hint
      import('./ui/hud.js').then(m => {
        m.showHint('Use <span class="key">W A S D</span> to walk. Press <span class="key">F</span> near a companion to recruit.', 240);
      });
    }
  }, 800);
}

document.getElementById('beginBtn').addEventListener('click', beginAdventure);

// Mobile: tap anywhere to begin (document-level so z-index never blocks it).
document.addEventListener('touchend', function onFirstTap() {
  const ts = document.getElementById('titleScreen');
  if (ts && !ts.classList.contains('hidden')) {
    document.removeEventListener('touchend', onFirstTap);
    beginAdventure();
  }
}, { passive: true });

// ────────────────────────────────────────────────────────────────────────────
// Win screen → restart the whole game
// ────────────────────────────────────────────────────────────────────────────

function restartGame() {
  resetAllLevels();
  resetPlayer();
  updateCompanionUI();
  updateNoteCount();
  updateHpUI();
  updateScrollUI();
  hideWinScreen();
  loadLevel(0);
  state.status = 'play';
  showCutscene('intro', () => {});
}

document.getElementById('restartBtn').addEventListener('click', restartGame);

// Mobile: tap anywhere on the win screen to restart.
const winScreen = document.getElementById('winScreen');
if (winScreen) {
  winScreen.addEventListener('touchend', (e) => {
    if (winScreen.classList.contains('hidden')) return;
    e.preventDefault();
    restartGame();
  }, { passive: false });
}

// ────────────────────────────────────────────────────────────────────────────
// Cutscene "Onward"
// ────────────────────────────────────────────────────────────────────────────

// The same parchment is used for chapter cutscenes AND scroll lore overlays.
// If a scroll is open, "Close" routes to closeScrollOverlay; else "Onward"
// dismisses the chapter cutscene as before.
document.getElementById('cutsceneNext').addEventListener('click', () => {
  if (isScrollOpen()) closeScrollOverlay();
  else                dismissCutscene();
});

// Mobile: tap anywhere on the cutscene parchment to advance.
const cutsceneEl = document.getElementById('cutscene');
if (cutsceneEl) {
  cutsceneEl.addEventListener('touchend', (e) => {
    if (!cutsceneEl.classList.contains('show')) return;
    e.preventDefault();
    if (isScrollOpen()) closeScrollOverlay();
    else                dismissCutscene();
  }, { passive: false });
}

// Esc / F also close a scroll overlay (scrolls only, not chapter cutscenes).
document.addEventListener('keydown', (e) => {
  if (!isScrollOpen()) return;
  if (e.code === 'Escape' || e.code === 'KeyF') {
    e.preventDefault();
    closeScrollOverlay();
  }
});

// ────────────────────────────────────────────────────────────────────────────
// Audio toggle button (visibility is controlled by sound-manager.initAudio)
// ────────────────────────────────────────────────────────────────────────────

document.getElementById('audioBtn').addEventListener('click', toggleMusic);

// Lazy-init audio on first user gesture (autoplay policy).
// Once is enough — we keep the listeners short-lived.
document.addEventListener('click',   () => initAudio(), { once: true });
document.addEventListener('keydown', () => initAudio(), { once: true });
document.addEventListener('touchend', () => initAudio(), { once: true });

// Wake the AudioContext if the browser parked it.
document.addEventListener('click',   wakeUpAudioContext);
document.addEventListener('keydown', wakeUpAudioContext);
document.addEventListener('touchend', wakeUpAudioContext);

// ────────────────────────────────────────────────────────────────────────────
// Canvas resize — keep aspect ratio while filling the viewport.
// ────────────────────────────────────────────────────────────────────────────

function resizeCanvas() {
  const aspect = CONFIG.CANVAS_WIDTH / CONFIG.CANVAS_HEIGHT;
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  let cw, ch;
  if (vw / vh > aspect) {
    ch = vh * 0.96;
    cw = ch * aspect;
  } else {
    cw = vw * 0.98;
    ch = cw / aspect;
  }
  canvas.style.width  = cw + 'px';
  canvas.style.height = ch + 'px';
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// ────────────────────────────────────────────────────────────────────────────
// Go!
// ────────────────────────────────────────────────────────────────────────────

// iOS-reliable orientation detection for rotate hint.
// Uses setProperty('important') to beat CSS !important in portrait media query.
const rotateHint     = document.getElementById('rotate-hint');
const mobileControls = document.getElementById('mobile-controls');
function checkOrientation() {
  if (!rotateHint) return;
  const isPortrait = window.innerHeight > window.innerWidth;
  rotateHint.style.setProperty('display', isPortrait ? 'flex' : 'none', 'important');
  if (mobileControls) {
    mobileControls.style.setProperty('display', isPortrait ? 'none' : 'block', 'important');
  }
}
window.addEventListener('resize', checkOrientation);
// iOS fires orientationchange BEFORE dimensions update — check at 100, 300, 600ms
window.addEventListener('orientationchange', () => {
  setTimeout(checkOrientation, 100);
  setTimeout(checkOrientation, 300);
  setTimeout(checkOrientation, 600);
});
checkOrientation();

game.start();