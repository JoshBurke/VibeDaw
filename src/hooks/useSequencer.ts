import { useState, useCallback, useEffect, useRef } from 'react';
import type { Song } from '../types';
import { useAudioEngine } from './useAudioEngine';

export const useSequencer = (song: Song) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const animationFrameRef = useRef<number>(0);
  const lastStepTimeRef = useRef<number>(0);
  const audioEngine = useAudioEngine();

  // Calculate step duration in seconds
  // For 120 BPM:
  // - One beat = 60/120 = 0.5 seconds
  // - One 16th note = 0.5/4 = 0.125 seconds
  const stepDuration = (60 / song.tempo) / 4;

  const totalSteps = 64; // 4 bars of 16 steps

  const play = useCallback(async () => {
    console.log('Starting playback...');
    // Ensure audio context is running
    await audioEngine.resume();
    setIsPlaying(true);
    lastStepTimeRef.current = performance.now();
    
    // Schedule notes for the first step immediately
    const startTime = audioEngine.getCurrentTime() + 0.1; // Small delay to ensure context is ready
    song.tracks.forEach(track => {
      if (track.mute) return;

      const notesAtStep = track.sequence.filter(note => note.step === 0);
      console.log('Initial step notes:', {
        trackId: track.id,
        noteCount: notesAtStep.length
      });
      
      notesAtStep.forEach(note => {
        const duration = note.duration * stepDuration;
        audioEngine.scheduleNote({
          trackId: track.id,
          note,
          startTime,
          duration,
          track,
        });
      });
    });
    
    console.log('Playback started');
  }, [audioEngine, song.tracks, stepDuration]);

  const pause = useCallback(() => {
    setIsPlaying(false);
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    audioEngine.clearScheduledNotes();
  }, [audioEngine]);

  const stop = useCallback(() => {
    setIsPlaying(false);
    setCurrentStep(0);
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    audioEngine.clearScheduledNotes();
  }, [audioEngine]);

  useEffect(() => {
    if (!isPlaying) return;

    const updateStep = (timestamp: number) => {
      const elapsed = (timestamp - lastStepTimeRef.current) / 1000; // Convert to seconds
      
      if (elapsed >= stepDuration) {
        let nextStep = (currentStep + 1) % totalSteps;

        // Early-loop logic: if we'll land at a bar boundary (multiple of 16)
        // and there are no notes past that boundary, restart from 0.
        if (nextStep % 16 === 0) {
          const futureHasNotes = song.tracks.some(track => {
            if (track.mute) return false;
            return track.sequence.some(note => note.step >= nextStep);
          });

          if (!futureHasNotes) {
            nextStep = 0;
            // Clear any lingering scheduled notes from previous loop
            audioEngine.clearScheduledNotes();
          }
        }
        
        setCurrentStep(nextStep);
        lastStepTimeRef.current = timestamp;

        // Schedule notes for the next step
        const startTime = audioEngine.getCurrentTime() + stepDuration; // Schedule slightly ahead
        song.tracks.forEach(track => {
          if (track.mute) return;

          const notesAtStep = track.sequence.filter(note => note.step === nextStep);
        //   console.log('Notes at step:', {
        //     step: nextStep,
        //     trackId: track.id,
        //     noteCount: notesAtStep.length
        //   });
          
          notesAtStep.forEach(note => {
            const duration = note.duration * stepDuration;
            audioEngine.scheduleNote({
              trackId: track.id,
              note,
              startTime,
              duration,
              track,
            });
          });
        });
      }

      animationFrameRef.current = requestAnimationFrame(updateStep);
    };

    animationFrameRef.current = requestAnimationFrame(updateStep);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, stepDuration, currentStep, song.tracks, audioEngine]);

  return {
    isPlaying,
    currentStep,
    play,
    pause,
    stop,
  };
}; 