// ============================================================================
// CUTSCENES — narrative parchment screens shown between chapters.
// Identical to the original monolith.
// ============================================================================

export const CUTSCENES = {
  intro: {
    title: 'Chapter I',
    subtitle: '— The Road Begins —',
    art: 'village',
    paragraphs: [
      'Long ago, in a land of mills and crooked old roads, there lived a donkey grown too weak to grind the miller\'s grain. His master, hard of heart, prepared the knife. But the donkey, hearing of it, fled into the night and set out for Bremen — for it was said that even the old might find a home there, and even the broken might learn to sing.',
      'Along the way he met a hound, a cat, and a rooster. Each had been cast aside; each was old, and tired, and sore afraid. But each, hearing the donkey\'s tale, said the same: better to play music in Bremen than to die in silence here.',
      'And so four companions set out together. The road was long. The forests were dark. And, though they did not yet know it, robbers kept watch upon the way.',
    ],
    next: 'Walk the Road',
  },
  afterVillage: {
    title: 'Chapter II',
    subtitle: '— The Forest Road —',
    art: 'forest',
    paragraphs: [
      'Behind them lay the village, with its mill and its barn and its sleeping houses. Before them stretched the forest — older than the village, older than the road itself. The trees pressed close. The light grew thin.',
      'They had heard tales of robbers in these woods: men who had built a cottage off the path and fed themselves on what travellers carried. Alone, none of the four could frighten a child.',
      '"Climb upon my back," said the donkey. "Stand upon the dog. The cat upon the dog. The rooster upon the cat. Together we shall be a tower of song — and what man, in the dark, would not flee from such a thing?"',
    ],
    next: 'Into the Forest',
  },
  afterForest: {
    title: 'Chapter III',
    subtitle: '— The River Crossing —',
    art: 'river',
    paragraphs: [
      'They had passed through the forest — but the road was not yet won. Before them stretched a broad, grey river, fed by autumn rains, swift and cold.',
      'A single bridge spanned the water, and upon it stood the robbers\' watch: torches, clubs, and stolen sacks slung at their belts. The four hid in the reeds and counted them, and counted them again.',
      'There was no other way to Bremen. They would cross — by bridge, or by stepping stones, or by song. Whatever it took to reach the city.',
    ],
    next: 'Cross the River',
  },
  afterRiver: {
    title: 'Chapter IV',
    subtitle: '— The Robbers\' Cottage —',
    art: 'cottage',
    paragraphs: [
      'Through the last of the trees, a single window glowed. Within, the robbers feasted on stolen bread, their laughter sharp as broken bowls.',
      'The four companions crouched in the dark, and the donkey laid out the plan one final time: a tower, a song, and a sound so terrible the robbers would believe a four-headed beast had come to claim their roof.',
      'Climb. Sing. And let no man among them remember the road back.',
    ],
    next: 'Frighten the Robbers',
  },
  afterCottage: {
    title: 'Chapter V',
    subtitle: '— The Gates of Bremen —',
    art: 'bremen',
    paragraphs: [
      'The robbers ran. They swore later, in some far village, that they had seen a great horned beast, four-headed, that howled and hissed and crowed all at once, with eyes of flame and a song that shook the trees.',
      'The cottage was theirs. The forest grew quieter. And by morning, through a gap between the pines, the four companions saw it at last: red-roofed Bremen, walled and waiting, banners stirring above the gates.',
      'They had only to walk in. They had only to find the Markt — where the Rathaus and the Roland stood watch — and the bronze statue that the city had kept for them, all this long while, before they had even arrived.',
    ],
    next: 'Enter Bremen',
  },
};
