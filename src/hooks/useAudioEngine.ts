import { useRef, useCallback, useEffect } from 'react';
import type { Track, AudioEngine, AudioNoteEvent, AudioScheduler, SamplerSettings, AudioNodes } from '../types';

// Fade time for click-free envelopes (seconds)
const FADE_TIME = 0.01; // 10 ms

export const useAudioEngine = () => {
  const engineRef = useRef<AudioEngine | null>(null);
  const scheduledNotesRef = useRef<Map<string, AudioNoteEvent>>(new Map());
  const sampleBuffersRef = useRef<Map<string, AudioBuffer>>(new Map());
  const isInitializedRef = useRef(false);

  // Initialize audio context and nodes
  const initialize = useCallback(() => {
    if (engineRef.current) return;

    console.log('Initializing audio context...');
    const context = new AudioContext();
    // Master signal chain: track sums -> masterGain -> compressor -> destination
    const masterGain = context.createGain();
    masterGain.gain.value = 0.8; // initial headroom

    const compressor = context.createDynamicsCompressor();
    // Gentle limiting settings – tweak as needed
    compressor.threshold.value = -9;  // dBFS
    compressor.knee.value = 10;
    compressor.ratio.value = 20;
    compressor.attack.value = 0.003;
    compressor.release.value = 0.05;

    masterGain.connect(compressor);
    compressor.connect(context.destination);

    engineRef.current = {
      context,
      masterGain,
      compressor,
      trackNodes: new Map(),
    };
    console.log('Audio context initialized:', context.state);
    isInitializedRef.current = true;
  }, []);

  // Pre-initialize audio context
  useEffect(() => {
    initialize();
    return () => {
      if (engineRef.current) {
        engineRef.current.context.close();
        engineRef.current = null;
        isInitializedRef.current = false;
      }
    };
  }, [initialize]);

  // Resume audio context (required for Chrome)
  const resume = useCallback(async () => {
    if (!isInitializedRef.current) {
      await initialize();
    }
    const engine = engineRef.current!;
    console.log('Audio context state before resume:', engine.context.state);
    if (engine.context.state === 'suspended') {
      await engine.context.resume();
      console.log('Audio context resumed:', engine.context.state);
    }
  }, [initialize]);

  // Get current time from audio context
  const getCurrentTime = useCallback(() => {
    if (!engineRef.current) initialize();
    return engineRef.current!.context.currentTime;
  }, [initialize]);

  // Load a sample
  const loadSample = useCallback(async (url: string): Promise<AudioBuffer> => {
    if (!engineRef.current) initialize();

    const engine = engineRef.current!;
    const cachedBuffer = sampleBuffersRef.current.get(url);
    if (cachedBuffer) return cachedBuffer;

    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await engine.context.decodeAudioData(arrayBuffer);
      sampleBuffersRef.current.set(url, audioBuffer);
      return audioBuffer;
    } catch (error) {
      console.error('Error loading sample:', error);
      throw error;
    }
  }, [initialize]);

  // Pre-load samples for a track
  const preloadTrackSamples = useCallback(async (track: Track) => {
    if (track.instrumentType === 'sampler') {
      const settings = track.settings as SamplerSettings;
      try {
        await loadSample(settings.sampleUrl);
        console.log('Pre-loaded sample for track:', track.id);
      } catch (error) {
        console.error('Failed to pre-load sample for track:', track.id, error);
      }
    }
  }, [loadSample]);

  // Create or get audio nodes for a track
  const getTrackNodes = useCallback(async (trackId: string, track: Track) => {
    if (!engineRef.current) initialize();

    const engine = engineRef.current!;
    let nodes = engine.trackNodes.get(trackId);

    if (!nodes) {
      if (track.instrumentType === 'sampler') {
        // Sampler track: one gain node that handles volume; no oscillator
        const gainNode = engine.context.createGain();
        gainNode.connect(engine.masterGain);
        gainNode.gain.value = track.settings.volume;

        nodes = { gainNode } as AudioNodes;
      } else {
        // For synths, create and start the oscillator
        const oscillator = engine.context.createOscillator();
        const gainNode = engine.context.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(engine.masterGain);
        
        const settings = track.settings as any;
        console.log("settings", settings);
        oscillator.type = settings.waveform;
        gainNode.gain.value = track.settings.volume;
        
        oscillator.start();
        
        nodes = { oscillator, gainNode } as AudioNodes;
      }
      engine.trackNodes.set(trackId, nodes);
    } else {
      // Update existing nodes with latest settings – avoid sudden gain jump
      if (track.instrumentType === 'synthesizer' && nodes.oscillator) {
        const s = track.settings as any;
        nodes.oscillator.type = s.waveform;
      }
    }

    return nodes;
  }, [initialize]);

  // Helper to apply a smooth gain envelope avoiding clicks
  const applyGainEnvelope = (
    gain: GainNode['gain'],
    start: number,
    duration: number,
    targetGain: number,
  ) => {
    const attackEnd = start + FADE_TIME;
    const releaseStart = start + duration - FADE_TIME;

    // Cancel anything previously scheduled at or after start
    gain.cancelScheduledValues(start);

    // Attack
    gain.setValueAtTime(0.0001, start);
    gain.exponentialRampToValueAtTime(targetGain || 0.0001, attackEnd);

    // Sustain
    gain.setValueAtTime(targetGain || 0.0001, releaseStart);

    // Release
    gain.exponentialRampToValueAtTime(0.0001, start + duration);
    // Ensure it reaches exact 0 shortly after
    gain.setValueAtTime(0, start + duration + FADE_TIME);
  };

  // Schedule a note to play
  const scheduleNote = useCallback(async (event: AudioNoteEvent) => {
    if (!engineRef.current) initialize();

    const engine = engineRef.current!;
    // console.log('Scheduling note:', {
    //   trackId: event.trackId,
    //   step: event.note.step,
    //   startTime: event.startTime,
    //   duration: event.duration,
    //   contextTime: engine.context.currentTime
    // });

    const nodes = await getTrackNodes(event.trackId, event.track);

    const velocityGain = event.note.velocity / 127;

    if (event.track.instrumentType === 'sampler') {
      // Handle monophonic sampler: fade out any currently playing source
      const samplerNodes = nodes as AudioNodes;

      if (samplerNodes.currentSource && samplerNodes.currentGain) {
        // Fade out existing source
        samplerNodes.currentGain.gain.cancelScheduledValues(event.startTime);
        samplerNodes.currentGain.gain.setTargetAtTime(0.0001, event.startTime, FADE_TIME / 5);
        samplerNodes.currentSource.stop(event.startTime + FADE_TIME * 2);
      }

      // Create and start new source
      const settings = event.track.settings as SamplerSettings;
      const buffer = await loadSample(settings.sampleUrl);
      const source = engine.context.createBufferSource();
      source.buffer = buffer;

      // Apply pitch adjustment
      if (settings.pitch !== 0) {
        source.playbackRate.value = Math.pow(2, settings.pitch / 12);
      }

      // Ensure track-level gain is at the correct volume (in case it was faded out)
      samplerNodes.gainNode.gain.cancelScheduledValues(event.startTime);
      samplerNodes.gainNode.gain.setValueAtTime(settings.volume ?? 1, event.startTime);

      const noteGain = engine.context.createGain();
      source.connect(noteGain);
      noteGain.connect(samplerNodes.gainNode);

      applyGainEnvelope(noteGain.gain, event.startTime, event.duration, velocityGain);

      source.start(event.startTime);
      source.stop(event.startTime + event.duration + FADE_TIME * 2);

      // Update references for monophony
      samplerNodes.currentSource = source;
      samplerNodes.currentGain = noteGain;
    } else {
      // Synth track: use persistent oscillator and envelope
      const { oscillator, gainNode } = nodes;
      if (oscillator) {
        const frequency = 440 * Math.pow(2, (event.note.pitch - 69) / 12);
        // Glide (quick) to new frequency
        oscillator.frequency.setTargetAtTime(frequency, event.startTime, 0.005);
      }

      const trackVolume = (event.track.settings as any).volume ?? 1;
      applyGainEnvelope(
        gainNode.gain,
        event.startTime,
        event.duration,
        velocityGain * trackVolume,
      );
    }

    // Store reference to scheduled note
    scheduledNotesRef.current.set(`${event.trackId}-${event.note.step}`, event);
  }, [initialize, getTrackNodes, loadSample]);

  // Cancel a scheduled note
  const cancelNote = useCallback((trackId: string, step: number) => {
    const noteKey = `${trackId}-${step}`;
    const note = scheduledNotesRef.current.get(noteKey);
    if (note) {
      const nodes = engineRef.current?.trackNodes.get(trackId) as AudioNodes | undefined;
      if (nodes) {
        // Fade out gracefully
        const now = engineRef.current!.context.currentTime;
        nodes.gainNode.gain.cancelScheduledValues(now);
        nodes.gainNode.gain.setTargetAtTime(0.0001, now, FADE_TIME / 5);
      }
      scheduledNotesRef.current.delete(noteKey);
    }
  }, []);

  // Clear all scheduled notes
  const clearScheduledNotes = useCallback(() => {
    if (!engineRef.current) return;

    const engine = engineRef.current;
    engine.trackNodes.forEach((nodes: AudioNodes) => {
      const ctxNow = engine.context.currentTime;
      nodes.gainNode.gain.cancelScheduledValues(ctxNow);
      nodes.gainNode.gain.setTargetAtTime(0.0001, ctxNow, FADE_TIME / 5);
      if (nodes.currentSource) {
        nodes.currentSource.stop(ctxNow + FADE_TIME * 2);
      }
    });
    scheduledNotesRef.current.clear();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (engineRef.current) {
        engineRef.current.trackNodes.forEach((nodes: AudioNodes) => {
          if (nodes.oscillator) {
            nodes.oscillator.stop();
            nodes.oscillator.disconnect();
          }
          if (nodes.currentSource) {
            nodes.currentSource.stop();
            nodes.currentSource.disconnect();
          }
          nodes.gainNode.disconnect();
        });
        engineRef.current.masterGain.disconnect();
        engineRef.current.context.close();
      }
    };
  }, []);

  return {
    scheduleNote,
    cancelNote,
    clearScheduledNotes,
    getTrackNodes,
    resume,
    getCurrentTime,
    preloadTrackSamples,
  } as AudioScheduler;
}; 