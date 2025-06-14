import type { Song, Track } from '../types';
import { SAMPLE_OPTIONS } from '../data/sampleList';

export type PromptMode = 'instrument' | 'sequence' | 'track';

// ---------- Base context (shared across modes) ----------
export const buildContextPrompt = (song: Song): string => {
  const summary = {
    id: song.id,
    name: song.name,
    tempo: song.tempo,
    style: song.style,
    mood: song.mood,
    tracks: song.tracks.map(t => ({
      id: t.id,
      name: t.name,
      instrumentType: t.instrumentType,
      settings: t.settings,
      sequenceLength: t.sequence.length,
    })),
  };

  return `You are VibeDaw's composition-assistant. Current song JSON:\n${JSON.stringify(summary, null, 2)}\n`;
};

// ---------- Mode-specific suffixes ----------
const instrumentSuffix = (targetTrack: Track): string => `\nTASK: Design a new instrument for the track "${targetTrack.name}" (id=${targetTrack.id}).\nExpectations:\n• Return JSON matching the InstrumentSpec interface below. DO NOT return in a code block, just the JSON. \n• Settings should be musically appropriate for the style/mood.\n• Do NOT include commentary – only JSON.\n\ninterface InstrumentSpec {\n  name: string;            // Human-friendly name\n  instrumentType: 'sampler' | 'synthesizer';\n  settings: SamplerSettings | SynthSettings;\n}\n\nFor sampler settings choose from the provided sample list.\nSample list: ${JSON.stringify(SAMPLE_OPTIONS)}\n`;

const sequenceSuffix = (targetTrack: Track): string => `\nTASK: Modify or regenerate the pattern for track "${targetTrack.name}" (id=${targetTrack.id}).\n DO NOT return in a code block, just the JSON. Provide 1 bar (16 steps) if the track is empty, otherwise keep length consistent.\nReturn JSON matching SequenceSpec only.\n\ninterface Note { step:number; pitch:number; velocity:number; duration:number }\ninterface SequenceSpec { notes: Note[] }\n\nNo extra keys – just the object.\n`;

const trackSuffix = (): string => `\nTASK: Create an additional track for this song.\nReturn full Track JSON matching TrackSpec. DO NOT return in a code block, just the JSON. Use available samples if drum sample is requested.\n\ninterface TrackSpec {\n  name:string; instrumentType:'sampler'|'synthesizer'; settings:SamplerSettings|SynthSettings; sequence: Note[];\n}\n\nNo commentary – only JSON.`;

export const buildPrompt = (song: Song, mode: PromptMode, targetTrack?: Track): string => {
  const base = buildContextPrompt(song);
  switch (mode) {
    case 'instrument':
      if (!targetTrack) throw new Error('targetTrack required for instrument mode');
      return base + instrumentSuffix(targetTrack);
    case 'sequence':
      if (!targetTrack) throw new Error('targetTrack required for sequence mode');
      return base + sequenceSuffix(targetTrack);
    case 'track':
      return base + trackSuffix();
  }
}; 