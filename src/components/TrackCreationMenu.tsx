import React from 'react';
import type { TrackCreationType, TrackCreationOptions } from '../types';

interface TrackCreationMenuProps {
  onSelect: (options: TrackCreationOptions) => void;
}

export const TrackCreationMenu: React.FC<TrackCreationMenuProps> = ({ onSelect }) => {
  const handleSelect = (type: TrackCreationType) => {
    const defaultOptions: TrackCreationOptions = {
      type,
      name: type === 'sampler' ? 'New Sampler' : type === 'synthesizer' ? 'New Synth' : 'AI Generated',
      instrumentType: type === 'prompt' ? 'synthesizer' : type,
      settings: type === 'sampler' 
        ? {
            volume: 1,
            pan: 0,
            sampleUrl: '/Kick Basic.wav', // Default sample
            pitch: 0,
          }
        : {
            volume: 1,
            pan: 0,
            waveform: 'sine',
          },
    };
    onSelect(defaultOptions);
  };

  return (
    <div
      style={{
        position: 'absolute',
        backgroundColor: '#2a2a2a',
        border: '1px solid #444',
        padding: '8px',
        zIndex: 1000,
      }}
    >
      <button
        onClick={() => handleSelect('sampler')}
        style={{
          display: 'block',
          width: '100%',
          textAlign: 'left',
          padding: '8px 16px',
          backgroundColor: '#333',
          border: 'none',
          color: 'white',
          cursor: 'pointer',
          marginBottom: '4px',
        }}
      >
        Sampler
      </button>
      <button
        onClick={() => handleSelect('synthesizer')}
        style={{
          display: 'block',
          width: '100%',
          textAlign: 'left',
          padding: '8px 16px',
          backgroundColor: '#333',
          border: 'none',
          color: 'white',
          cursor: 'pointer',
          marginBottom: '4px',
        }}
      >
        Synthesizer
      </button>
      <button
        onClick={() => handleSelect('prompt')}
        style={{
          display: 'block',
          width: '100%',
          textAlign: 'left',
          padding: '8px 16px',
          backgroundColor: '#333',
          border: 'none',
          color: 'white',
          cursor: 'pointer',
        }}
      >
        AI Prompt
      </button>
    </div>
  );
};

export default TrackCreationMenu; 