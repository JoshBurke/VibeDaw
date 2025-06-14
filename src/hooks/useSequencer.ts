import { useState, useCallback, useEffect, useRef } from 'react';
import type { Song } from '../types';

export const useSequencer = (song: Song) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const animationFrameRef = useRef<number>(0);
  const lastStepTimeRef = useRef<number>(0);

  const stepDuration = (60 / song.tempo) * 4; // Duration of a 1/16th note in seconds

  const play = useCallback(() => {
    setIsPlaying(true);
    lastStepTimeRef.current = performance.now();
  }, []);

  const pause = useCallback(() => {
    setIsPlaying(false);
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  }, []);

  const stop = useCallback(() => {
    setIsPlaying(false);
    setCurrentStep(0);
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  }, []);

  useEffect(() => {
    if (!isPlaying) return;

    const updateStep = (timestamp: number) => {
      const elapsed = (timestamp - lastStepTimeRef.current) / 1000; // Convert to seconds
      
      if (elapsed >= stepDuration) {
        setCurrentStep((prev) => (prev + 1) % 64); // 64 steps (4 bars of 16 steps)
        lastStepTimeRef.current = timestamp;
      }

      animationFrameRef.current = requestAnimationFrame(updateStep);
    };

    animationFrameRef.current = requestAnimationFrame(updateStep);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, stepDuration]);

  return {
    isPlaying,
    currentStep,
    play,
    pause,
    stop,
  };
}; 