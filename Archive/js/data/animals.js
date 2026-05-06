// ============================================================================
// ANIMAL DATA — the four Stadtmusikanten and their abilities.
// Identical to the original monolith.
// ============================================================================

export const ANIMAL_DATA = [
  { // 0 DONKEY
    name: 'Esel', ename: 'Donkey',
    color: '#9d8c78', accent: '#5a4a3a', mane: '#3a2a1a', belly: '#bca996',
    bodyLen: 30, bodyWid: 18, headSize: 12,
    speedMult: 0.88, idleBob: 0.04,
    ability: {
      name: 'Heavy Kick',
      desc: 'Kicks down crates & wooden barriers, knocks back robbers',
      cooldown: 360,  // 6s @ 60fps
      duration: 24,   // 0.4s active
      range: 70,
      tint: '#d4a843',
    },
    instrument: { type: 'drum' },  // bass drum
  },
  { // 1 DOG
    name: 'Hund', ename: 'Dog',
    color: '#8b5a2b', accent: '#4d2e15', mane: '#3a2a1a', belly: '#c48f5b',
    bodyLen: 24, bodyWid: 15, headSize: 11,
    speedMult: 1.18, idleBob: 0.06,
    ability: {
      name: 'Bark',
      desc: 'A piercing bark stuns nearby robbers',
      cooldown: 300,  // 5s
      duration: 90,   // 1.5s stun lasts on targets
      range: 150,
      tint: '#c48f5b',
    },
    instrument: { type: 'lute' },
  },
  { // 2 CAT
    name: 'Katze', ename: 'Cat',
    color: '#d97706', accent: '#7c2d12', mane: '#3a1f0a', belly: '#fcd9a8',
    bodyLen: 20, bodyWid: 12, headSize: 10,
    speedMult: 1.10, idleBob: 0.08,
    ability: {
      name: 'Stealth',
      desc: 'Become invisible to robbers for 4 seconds',
      cooldown: 480,  // 8s
      duration: 240,  // 4s
      range: 0,
      tint: '#fcd9a8',
    },
    instrument: { type: 'violin' },
  },
  { // 3 ROOSTER
    name: 'Hahn', ename: 'Rooster',
    color: '#b91c1c', accent: '#450a0a', mane: '#7a0a0a', belly: '#e7c59d',
    bodyLen: 18, bodyWid: 13, headSize: 10,
    speedMult: 1.02, idleBob: 0.10,
    ability: {
      name: 'Crow',
      desc: 'A mighty crow — extends light, dashes forward, scares small foes',
      cooldown: 300,  // 5s
      duration: 180,  // 3s light bonus
      range: 90,      // dash forward
      tint: '#f9a847',
    },
    instrument: { type: 'flute' },
  },
];
