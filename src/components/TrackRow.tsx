import React from 'react';
import type { Track, SequencerDimensions } from '../types';

interface TrackRowProps {
  track: Track;
  dimensions: SequencerDimensions;
  currentStep: number;
  onTrackUpdate: (updates: Partial<Track>) => void;
  onShowSettings: () => void;
  onDelete: () => void;
}

export const TrackRow: React.FC<TrackRowProps> = ({
  track,
  dimensions,
  currentStep,
  onTrackUpdate,
  onShowSettings,
  onDelete,
}) => {
  // Determine pitch range for synth visualisation
  const pitches = track.sequence.map(n => n.pitch);
  const minPitch = pitches.length ? Math.min(...pitches) : 0;
  const maxPitch = pitches.length ? Math.max(...pitches) : 127;

  return (
    <>
      {/* Track Header */}
      <div className="track-header" style={{
        backgroundColor: '#2a2a2a',
        padding: '10px',
        display: 'flex',
        alignItems: 'center',
        gap: '1px',
        position: 'sticky',
        maxHeight: '60px',
        left: 0,
        top: 0,
        zIndex: 0,
      }}>
        <div style={{ flex: 1 }}>{track.name}</div>
        <button
          onClick={() => onTrackUpdate({ mute: !track.mute })}
          style={{
            backgroundColor: track.mute ? '#ff4444' : '#444',
            border: 'none',
            padding: '4px 4px',
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
            padding: '4px 4px',
            color: 'white',
            cursor: 'pointer',
          }}
        >
          S
        </button>
        <button
          onClick={onShowSettings}
          style={{
            backgroundColor: '#444',
            border: 'none',
            padding: '4px 4px',
            color: 'white',
            cursor: 'pointer',
          }}
        >
          ⚙️
        </button>
        <button
          onClick={onDelete}
          style={{
            backgroundColor: '#ff5555',
            border: 'none',
            padding: '4px 4px',
            color: 'white',
            cursor: 'pointer',
          }}
        >
          🗑️
        </button>
      </div>

      {/* Track Steps */}
      {Array.from({ length: dimensions.totalSteps }).map((_, step) => {
        const noteForStep = track.sequence.find(n => n.step === step);
        const hasNote = Boolean(noteForStep);
        const isCurrentStep = step === currentStep;
        const handleCellClick = () => {
          if (track.instrumentType !== 'sampler') return;

          let newSeq;
          if (hasNote) {
            newSeq = track.sequence.filter(n => n.step !== step);
          } else {
            newSeq = [...track.sequence, { step, pitch: 60, velocity: 100, duration: 1 }];
          }
          onTrackUpdate({ sequence: newSeq });
        };

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
            onClick={handleCellClick}
          >
            {hasNote && (
              track.instrumentType === 'sampler' ? (
                <div style={{ width: '80%', height: '80%', backgroundColor: track.color || '#666' }} />
              ) : (
                // Synth visual: thin horizontal line at pitch-relative height
                <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                  <div style={{
                    position: 'absolute',
                    left: '10%',
                    right: '10%',
                    height: '2px',
                    backgroundColor: track.color || '#ccc',
                    top: `${maxPitch === minPitch ? 50 : 100 - ((noteForStep!.pitch - minPitch) / (maxPitch - minPitch)) * 100}%`,
                  }} />
                </div>
              )
            )}
          </div>
        );
      })}
    </>
  );
};

export default TrackRow; 