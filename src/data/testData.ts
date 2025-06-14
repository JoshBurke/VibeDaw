import type { Song, Track, Note } from '../types';

// Basic synth melody (C major scale)
const SYNTH_MELODY: Note[] = [
  { step: 0, pitch: 60, velocity: 100, duration: 2 },  // C4
  { step: 2, pitch: 62, velocity: 90, duration: 2 },   // D4
  { step: 4, pitch: 64, velocity: 100, duration: 2 },  // E4
  { step: 6, pitch: 65, velocity: 90, duration: 2 },   // F4
  { step: 8, pitch: 67, velocity: 100, duration: 2 },  // G4
  { step: 10, pitch: 69, velocity: 90, duration: 2 },  // A4
  { step: 12, pitch: 71, velocity: 100, duration: 2 }, // B4
  { step: 14, pitch: 72, velocity: 110, duration: 4 }, // C5
];

// Basic 4-on-the-floor kick pattern
const KICK_PATTERN: Note[] = [
  { step: 0, pitch: 36, velocity: 100, duration: 2 },  // Kick on 1
  { step: 4, pitch: 36, velocity: 100, duration: 2 },  // Kick on 2
  { step: 8, pitch: 36, velocity: 100, duration: 2 },  // Kick on 3
  { step: 12, pitch: 36, velocity: 100, duration: 2 }, // Kick on 4
];

export const TEST_SYNTH_TRACK: Track = {
  id: 'test-synth-1',
  name: 'Test Synth',
  instrumentType: 'synthesizer',
  settings: {
    volume: 0.7,
    pan: 0,
    waveform: 'sine',
  },
  sequence: SYNTH_MELODY,
  mute: false,
  solo: false,
};

export const TEST_SAMPLER_TRACK: Track = {
  id: 'test-sampler-1',
  name: 'Kick',
  instrumentType: 'sampler',
  settings: {
    volume: 1,
    pan: 0,
    sampleUrl: '/Kick Basic.wav',
    pitch: 0,
  },
  sequence: KICK_PATTERN,
  mute: false,
  solo: false,
};

export const TEST_SONG: Song = {
  id: 'test-song-1',
  name: 'Test Song',
  tempo: 120,
  style: 'electronic',
  mood: 'energetic',
  tracks: [TEST_SYNTH_TRACK, TEST_SAMPLER_TRACK],
  metadata: {
    createdAt: new Date(),
    updatedAt: new Date(),
  },
}; 