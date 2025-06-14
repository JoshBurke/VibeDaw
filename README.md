# VibeDaw

A web DAW that lets you prompt patterns and instruments with AI.

## Overview

VibeDaw is a web-based Digital Audio Workstation that combines traditional sequencing capabilities with AI-powered pattern and instrument generation. The system is designed to be simple yet powerful, with a focus on intuitive pattern creation and AI-assisted composition.

## Core Concepts

### Song Structure
```typescript
interface Song {
  id: string;
  name: string;
  tempo: number;  // BPM
  tracks: Track[];
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    // Additional metadata for AI context
  };
}
```

### Track System
```typescript
interface Track {
  id: string;
  name: string;
  instrument: Instrument;
  sequence: Note[];
  volume: number;
  pan: number;
  mute: boolean;
  solo: boolean;
}

interface Note {
  step: number;      // Position in sequence (1/16th note resolution)
  pitch: number;     // MIDI note number
  velocity: number;  // 0-127
  duration: number;  // In steps (1/16th notes)
}
```

### Instrument Types
```typescript
interface Instrument {
  id: string;
  name: string;
  type: 'sampler' | 'synthesizer';
  settings: SamplerSettings | SynthSettings;
}

interface SamplerSettings {
  sampleUrl: string;
  pitch: number;     // Pitch adjustment in semitones
  attack: number;    // In seconds
  release: number;   // In seconds
}

interface SynthSettings {
  waveform: 'sine' | 'square' | 'sawtooth' | 'triangle';
  attack: number;    // In seconds
  decay: number;     // In seconds
  sustain: number;   // 0-1
  release: number;   // In seconds
  filterCutoff: number;
  filterResonance: number;
}
```

## Runtime Architecture

The DAW operates on a step-based sequencer system:
- All sequences are quantized to 1/16th note steps
- The runtime maintains a current step position
- On each step:
  1. All notes starting at the current step are triggered
  2. Note durations are scheduled using the Web Audio API
  3. The sequencer advances to the next step based on the tempo

## AI Integration

The system supports AI-assisted generation for:
- Instrument creation and parameter optimization
- Pattern generation based on existing musical context
- Full track generation with multiple instruments
- Style transfer and variation generation

Example prompts:
- "Add a basic hi-hat sequence with triplet fills"
- "Generate a melodic lead synth that complements the existing chord progression"
- "Create a new track with a bass line that follows the current rhythm"

## Data Persistence

Songs can be exported/imported as JSON for easy sharing and version control. The format includes all necessary data to reconstruct the complete song state.

## Technical Implementation

- Built with TypeScript and React
- Uses Web Audio API for sound generation
- Implements a custom sequencer engine
- Integrates with AI models for pattern generation

## Getting Started

[Coming soon]

## Development Roadmap

1. Core sequencer implementation
2. Basic instrument types (sampler and synthesizer)
3. Pattern editing interface
4. AI integration for pattern generation
5. Advanced instrument controls
6. Export/import functionality
7. Collaborative features