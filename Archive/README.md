# Die Bremer Stadtmusikanten — The Road to Bremen

A 2D HTML5 Canvas adventure based on the Brothers Grimm fairytale.
PRESS PLAY 2026 jam winner. Theme: MEDIEVAL.

## Quick start

This game uses ES6 modules and runs straight in the browser — no bundler,
no `npm install`. **But:** browsers refuse to load ES modules from
`file://` URLs, so you need a local web server.

```bash
# From the project root:
python3 -m http.server 8000
# Then open http://localhost:8000
```

Other one-liners that work:

```bash
npx serve .
# or
php -S localhost:8000
```

## Controls

| Key       | Action                                      |
|-----------|---------------------------------------------|
| W A S D   | walk (arrow keys also work)                 |
| 1 2 3 4   | switch active companion                     |
| F         | recruit · interact · play music (when stacked) |
| E         | use the active animal's special ability     |
| Q         | stack into / out of a tower                 |
| M         | toggle background music                     |

## Project layout

```
bremen-game/
├── index.html                — minimal markup, <script type="module">
├── css/styles.css            — all styles (no inline CSS in the HTML)
├── js/
│   ├── main.js               — entry point, wires everything up
│   ├── config.js             — tunables: canvas size, speeds, level list
│   ├── state.js              — shared mutable state (camera, worldTime, etc.)
│   ├── game.js               — Game class: loop + render pipeline
│   ├── data/
│   │   ├── animals.js        — ANIMAL_DATA (donkey/dog/cat/rooster + abilities)
│   │   └── cutscenes.js      — chapter parchment text
│   ├── levels/
│   │   ├── level-manager.js  — loadLevel, advanceLevel, resetAllLevels
│   │   ├── village.js        — Chapter I
│   │   ├── forest.js         — Chapter II
│   │   ├── river.js          — Chapter III
│   │   ├── cottage.js        — Chapter IV
│   │   └── bremen.js         — Chapter V (final)
│   ├── entities/
│   │   ├── player.js         — player state + per-frame update logic
│   │   ├── animals.js        — drawAnimalTopDown, drawPlayer, portraits
│   │   ├── enemies.js        — drawRobber
│   │   └── npcs.js           — (placeholder, ready for new NPC types)
│   ├── ui/
│   │   ├── hud.js            — companion slots, ability bar, hints, F-prompt
│   │   └── menus.js          — title art, cutscene parchment, win screen
│   ├── audio/
│   │   └── sound-manager.js  — synthesized WebAudio (no asset files)
│   └── utils/
│       ├── input.js          — keyboard handling (keys + edge triggers)
│       ├── collision.js      — AABB, decorSolids, moveAndCollide
│       ├── particles.js      — particle system + spawners
│       └── renderer.js       — all canvas drawing utilities + decor sprites
└── assets/                   — for future image / sound / data files
```

## Adding a new level

1. Create `js/levels/your-level.js` exporting a level object (copy
   `village.js` as a template).
2. Import it at the top of `js/levels/level-manager.js` and add it to the
   `LEVELS` array in the right order.
3. Add a matching entry in `CONFIG.LEVELS` in `js/config.js`.
4. (Optional) Add a cutscene in `js/data/cutscenes.js` and reference it
   from `CONFIG.CUTSCENE_BEFORE_LEVEL`.

## Adding new content

- **New decor type:** add a sprite function in `js/utils/renderer.js`,
  add a case in `drawDecor()`, give it a baseline in `getDecorBaseline()`,
  and (if it's solid) a rule in `decorSolids()` in `js/utils/collision.js`.
- **New ability:** edit the relevant entry in `ANIMAL_DATA`
  (`js/data/animals.js`), then add the ability case in `tryUseAbility()`
  inside `js/entities/player.js`.
- **New NPC:** put the drawing function and dispatcher in
  `js/entities/npcs.js`, wire it up via the level data.

## Credits

- Built by **Tim, Alikhan, Nazar** + team for PRESS PLAY 2026.
- Refactored into ES6 modules in May 2026.
- Original tale: Brothers Grimm. Statue: Gerhard Marcks, Bremen, 1953.
