import React from 'react';
import type { Track, SequencerDimensions } from '../types';

interface TrackRowProps {
  track: Track;
  dimensions: SequencerDimensions;
  currentStep: number;
  onTrackUpdate: (updates: Partial<Track>) => void;
}

export const TrackRow: React.FC<TrackRowProps> = ({
  track,
  dimensions,
  currentStep,
  onTrackUpdate,
}) => {
  return (
    <>
      {/* Track Header */}
      <div className="track-header" style={{
        backgroundColor: '#2a2a2a',
        padding: '10px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        position: 'sticky',
        left: 0,
        zIndex: 1,
      }}>
        <div style={{ flex: 1 }}>{track.name}</div>
        <button
          onClick={() => onTrackUpdate({ mute: !track.mute })}
          style={{
            backgroundColor: track.mute ? '#ff4444' : '#444',
            border: 'none',
            padding: '4px 8px',
            color: 'white',
            cursor: 'pointer',
          }}
        >
          M
        </button>
        <button
          onClick={() => onTrackUpdate({ solo: !track.solo })}
          style={{
            backgroundColor: track.solo ? '#44ff44' : '#444',
            border: 'none',
            padding: '4px 8px',
            color: 'white',
            cursor: 'pointer',
          }}
        >
          S
        </button>
        <button
          onClick={() => {/* TODO: Open instrument settings modal */}}
          style={{
            backgroundColor: '#444',
            border: 'none',
            padding: '4px 8px',
            color: 'white',
            cursor: 'pointer',
          }}
        >
          ⚙️
        </button>
      </div>

      {/* Track Steps */}
      {Array.from({ length: dimensions.totalSteps }).map((_, step) => {
        const hasNote = track.sequence.some(note => note.step === step);
        const isCurrentStep = step === currentStep;

        return (
          <div
            key={step}
            className="step"
            style={{
              backgroundColor: isCurrentStep ? '#444' : '#2a2a2a',
              border: '1px solid #333',
              height: dimensions.trackHeight,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {hasNote && (
              <div
                style={{
                  width: '80%',
                  height: '80%',
                  backgroundColor: '#666',
                }}
              />
            )}
          </div>
        );
      })}
    </>
  );
};

export default TrackRow; 