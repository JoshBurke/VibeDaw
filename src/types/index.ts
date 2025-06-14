// Core types for VibeDaw

// Basic types
export type WaveformType = 'sine' | 'square' | 'sawtooth' | 'triangle';
export type InstrumentType = 'sampler' | 'synthesizer';
export type Style = 'electronic' | 'rock' | 'jazz' | 'ambient' | 'pop' | 'classical' | 'experimental';
export type Mood = 'happy' | 'sad' | 'energetic' | 'relaxed' | 'dark' | 'bright' | 'mysterious';

// Note and timing
export interface Note {
  step: number;      // Position in sequence (1/16th note resolution)
  pitch: number;     // MIDI note number (0-127)
  velocity: number;  // 0-127
  duration: number;  // In steps (1/16th notes)
}

// Instrument settings
export interface BaseInstrumentSettings {
  volume: number;    // 0-1
  pan: number;       // -1 to 1
}

export interface SamplerSettings extends BaseInstrumentSettings {
  sampleUrl: string;
  pitch: number;     // Pitch adjustment in semitones
}

export interface SynthSettings extends BaseInstrumentSettings {
  waveform: WaveformType;
}

// Track and Song structure
export interface Track {
  id: string;
  name: string;
  instrumentType: InstrumentType;
  settings: SamplerSettings | SynthSettings;
  sequence: Note[];
  mute: boolean;
  solo: boolean;
}

export interface Song {
  id: string;
  name: string;
  tempo: number;  // BPM
  style: Style;
  mood: Mood;
  tracks: Track[];
  metadata: {
    createdAt: Date;
    updatedAt: Date;
  };
}

// Audio context types
export interface AudioNodeRefs {
  oscillator: OscillatorNode;
  gainNode: GainNode;
}

// Runtime types
export interface SequencerState {
  currentStep: number;
  isPlaying: boolean;
  startTime: number | null;
}

// AI prompt types
export interface GenerationPrompt {
  type: 'instrument' | 'pattern' | 'track';
  description: string;
  context?: {
    existingTracks?: Track[];
    style?: Style;
    mood?: Mood;
  };
}

// UI Utility Types
export interface GridPosition {
  row: number;
  col: number;
}

export interface SequencerDimensions {
  stepsPerBar: number;
  bars: number;
  totalSteps: number;
  stepWidth: number;
  trackHeight: number;
}

export interface ModalState {
  isOpen: boolean;
  trackId: string | null;
  type: 'instrument' | 'settings' | null;
}

// Action Types
export type SequencerAction = 
  | { type: 'PLAY' }
  | { type: 'PAUSE' }
  | { type: 'STOP' }
  | { type: 'SET_TEMPO'; tempo: number }
  | { type: 'ADD_TRACK'; track: Track }
  | { type: 'REMOVE_TRACK'; trackId: string }
  | { type: 'UPDATE_TRACK'; trackId: string; updates: Partial<Track> }
  | { type: 'TOGGLE_MUTE'; trackId: string }
  | { type: 'TOGGLE_SOLO'; trackId: string };

// Audio Engine Types
export interface AudioEngine {
  context: AudioContext;
  masterGain: GainNode;
  trackNodes: Map<string, AudioNodeRefs>;
}

export interface AudioNoteEvent {
  trackId: string;
  note: Note;
  startTime: number;
  duration: number;
}

export interface AudioScheduler {
  scheduleNote: (event: AudioNoteEvent) => void;
  cancelNote: (trackId: string, step: number) => void;
  clearScheduledNotes: () => void;
}

// Track Creation Types
export type TrackCreationType = 'sampler' | 'synthesizer' | 'prompt';

export interface TrackCreationOptions {
  type: TrackCreationType;
  name: string;
  instrumentType: InstrumentType;
  settings: SamplerSettings | SynthSettings;
} 