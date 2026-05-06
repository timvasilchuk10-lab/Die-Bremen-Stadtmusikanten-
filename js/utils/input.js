// ============================================================================
// INPUT — keyboard handling + touch fallback for mobile.
//
// Two maps:
//   keys:                  { code -> bool }   ⇒ "is the key currently held?"
//   keyPressedThisFrame:   { code -> bool }   ⇒ "did the key transition to
//                                                pressed THIS frame?" — cleared
//                                                at end of every game-loop tick
//
// Touch buttons (in #mobile-controls) and the companion HUD slots dispatch
// directly into these maps so that the rest of the game code is unchanged.
// ============================================================================

export const keys = {};
export const keyPressedThisFrame = {};

// Codes for which we suppress the browser default action (so WASD/arrow keys
// don't scroll the page, space doesn't trigger buttons, etc.)
const PREVENT_DEFAULT_CODES = new Set([
  'Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
  'KeyW', 'KeyA', 'KeyS', 'KeyD', 'KeyE', 'KeyQ',
]);

export function setupInput() {
  document.addEventListener('keydown', (e) => {
    if (!keys[e.code]) keyPressedThisFrame[e.code] = true;
    keys[e.code] = true;
    if (PREVENT_DEFAULT_CODES.has(e.code)) e.preventDefault();
  });

  document.addEventListener('keyup', (e) => {
    keys[e.code] = false;
  });

  setupTouchControls();
  setupJoystick();
}

/** True iff the given key transitioned to pressed during the current frame. */
export function pressed(code) {
  return !!keyPressedThisFrame[code];
}

/** Called by Game at the END of each frame to reset edge-trigger flags. */
export function clearFrameInput() {
  for (const k in keyPressedThisFrame) keyPressedThisFrame[k] = false;
}

// ============================================================================
// TOUCH CONTROLS
// Wires every element with a `data-key` attribute (D-pad buttons, F/Q/E,
// companion HUD slots) directly into the keys / keyPressedThisFrame maps.
// Mouse events also bound, so DevTools mobile emulation works without
// enabling touch emulation specifically.
// ============================================================================

function setupTouchControls() {
  const buttons = document.querySelectorAll(
    '#mobile-controls button[data-key], .companion-slot[data-key]'
  );
  if (!buttons.length) return;

  buttons.forEach(btn => {
    const code = dataKeyToCode(btn.dataset.key);
    if (!code) return;
    let active = false;

    const press = (e) => {
      e.preventDefault();
      if (active) return;
      active = true;
      if (!keys[code]) keyPressedThisFrame[code] = true;
      keys[code] = true;
    };
    const release = (e) => {
      e.preventDefault();
      if (!active) return;
      active = false;
      keys[code] = false;
    };

    btn.addEventListener('touchstart',  press,   { passive: false });
    btn.addEventListener('touchend',    release, { passive: false });
    btn.addEventListener('touchcancel', release, { passive: false });
    btn.addEventListener('mousedown',   press);
    btn.addEventListener('mouseup',     release);
    btn.addEventListener('mouseleave',  release);
  });

  // Suppress long-press context menu on touch buttons
  document.addEventListener('contextmenu', (e) => {
    if (e.target.closest('#mobile-controls, .companion-slot')) e.preventDefault();
  });
}

/** Map data-key attribute values to KeyboardEvent.code values used by the game. */
function dataKeyToCode(key) {
  if (!key) return null;
  if (key.startsWith('Arrow')) return key;          // ArrowUp / Down / Left / Right
  if (/^[a-z]$/i.test(key)) return 'Key' + key.toUpperCase();   // f → KeyF
  if (/^[0-9]$/.test(key))  return 'Digit' + key;               // 1 → Digit1
  return null;
}

// ============================================================================
// VIRTUAL JOYSTICK
// Drives ArrowUp / ArrowDown / ArrowLeft / ArrowRight in the same shared
// `keys` map as the physical keyboard, so game logic doesn't change.
// 8-direction by combining axes (e.g. up + right → diagonal).
// ============================================================================

function setupJoystick() {
  const container = document.getElementById('joystick');
  const base      = document.getElementById('joystick-base');
  const knob      = document.getElementById('joystick-knob');
  if (!container || !base || !knob) return;

  let activeTouchId = null;
  let cx = 0, cy = 0;
  const MAX_RADIUS = 60;   // how far the knob can travel from centre
  const THRESHOLD  = 18;   // deadzone before a direction key activates

  const setKey = (code, isPressed) => {
    if (isPressed) {
      if (!keys[code]) keyPressedThisFrame[code] = true;
      keys[code] = true;
    } else {
      keys[code] = false;
    }
  };

  const releaseAll = () => {
    setKey('ArrowUp',    false);
    setKey('ArrowDown',  false);
    setKey('ArrowLeft',  false);
    setKey('ArrowRight', false);
  };

  const updateKnob = (clientX, clientY) => {
    let dx = clientX - cx;
    let dy = clientY - cy;
    const dist = Math.hypot(dx, dy);
    if (dist > MAX_RADIUS) {
      dx = dx * MAX_RADIUS / dist;
      dy = dy * MAX_RADIUS / dist;
    }
    knob.style.transform = `translate(${dx}px, ${dy}px)`;

    setKey('ArrowUp',    dy < -THRESHOLD);
    setKey('ArrowDown',  dy >  THRESHOLD);
    setKey('ArrowLeft',  dx < -THRESHOLD);
    setKey('ArrowRight', dx >  THRESHOLD);
  };

  const reset = () => {
    knob.style.transform = '';
    container.classList.remove('active');
    activeTouchId = null;
    releaseAll();
  };

  container.addEventListener('touchstart', (e) => {
    if (activeTouchId !== null) return;
    e.preventDefault();
    const t = e.changedTouches[0];
    activeTouchId = t.identifier;
    const rect = base.getBoundingClientRect();
    cx = rect.left + rect.width  / 2;
    cy = rect.top  + rect.height / 2;
    container.classList.add('active');
    updateKnob(t.clientX, t.clientY);
  }, { passive: false });

  // Track move/end on document so the finger can leave the joystick area
  // without losing the gesture.
  document.addEventListener('touchmove', (e) => {
    if (activeTouchId === null) return;
    for (const t of e.changedTouches) {
      if (t.identifier === activeTouchId) {
        e.preventDefault();
        updateKnob(t.clientX, t.clientY);
        break;
      }
    }
  }, { passive: false });

  const endHandler = (e) => {
    if (activeTouchId === null) return;
    for (const t of e.changedTouches) {
      if (t.identifier === activeTouchId) {
        reset();
        break;
      }
    }
  };
  document.addEventListener('touchend',    endHandler);
  document.addEventListener('touchcancel', endHandler);
}