import React, { useState } from 'react';
import type { TrackCreationType, TrackCreationOptions, Song } from '../types';
import { callAnthropic, parseJSONFromResponse, type TrackSpecResponse } from '../ai/anthropicClient';
import AIPromptModal from './AIPromptModal';

interface TrackCreationMenuProps {
  onSelect: (options: TrackCreationOptions) => void;
  song: Song;
}

export const TrackCreationMenu: React.FC<TrackCreationMenuProps> = ({ onSelect, song }) => {
  const [stage, setStage] = useState<'choose' | 'desc' | 'loading' | 'preview'>('choose');
  const [aiOptions, setAiOptions] = useState<TrackCreationOptions | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSelect = async (type: TrackCreationType) => {
    if (type !== 'prompt') {
      const defaultOptions: TrackCreationOptions = {
        type,
        name: type === 'sampler' ? 'New Sampler' : 'New Synth',
        instrumentType: type,
        settings: type === 'sampler'
          ? {
              volume: 1,
              pan: 0,
              sampleUrl: '/Kick Basic.wav',
              pitch: 0,
            }
          : {
              volume: 1,
              pan: 0,
              waveform: 'sine',
            },
      };
      onSelect(defaultOptions);
      return;
    }

    // For AI prompt, move to description stage first
    setStage('desc');
  };

  const generateAITrack = async (description: string) => {
    try {
      setStage('loading');
      const raw = await callAnthropic(song, 'track', undefined, description);
      const parsed = parseJSONFromResponse<TrackSpecResponse>(raw);
      const options: TrackCreationOptions = {
        type: 'prompt',
        name: parsed.name,
        instrumentType: parsed.instrumentType,
        settings: parsed.settings as any,
        sequence: parsed.sequence as any,
      };
      setAiOptions(options);
      setStage('preview');
    } catch (e:any) {
      console.error(e);
      setError(e.message || 'Error generating track');
      setStage('choose');
    }
  };

  return (
    <div style={{ position: 'absolute', backgroundColor: '#2a2a2a', border: '1px solid #444', padding: '8px', zIndex: 1000, minWidth: '300px' }}>
      {stage === 'choose' && (
        <>
          <button onClick={() => handleSelect('sampler')} style={btnStyle}>Sampler</button>
          <button onClick={() => handleSelect('synthesizer')} style={btnStyle}>Synthesizer</button>
          <button onClick={() => handleSelect('prompt')} style={btnStyle}>AI Prompt</button>
        </>
      )}

      {stage === 'loading' && <div style={{ color: 'white' }}>Generating track…</div>}

      {stage === 'preview' && aiOptions && (
        <div style={{ color: 'white' }}>
          <h4>Preview</h4>
          <p>Name: {aiOptions.name}</p>
          <p>Type: {aiOptions.instrumentType}</p>
          <button onClick={() => { onSelect(aiOptions); }} style={btnStyle}>Approve</button>
          <button onClick={() => { setStage('choose'); setAiOptions(null); }} style={btnStyle}>Cancel</button>
        </div>
      )}

      {error && <div style={{ color: 'red' }}>{error}</div>}

      {stage === 'desc' && (
        <AIPromptModal
          onConfirm={(text) => generateAITrack(text)}
          onCancel={() => setStage('choose')}
        />
      )}
    </div>
  );
};

const btnStyle: React.CSSProperties = {
  display: 'block',
  width: '100%',
  textAlign: 'left',
  padding: '8px 16px',
  backgroundColor: '#333',
  border: 'none',
  color: 'white',
  cursor: 'pointer',
  marginBottom: '4px',
};

export default TrackCreationMenu; 