import React, { useState, useRef, useEffect } from 'react';
import type { Song, Track, SequencerDimensions, TrackCreationOptions } from '../types';
import TrackRow from './TrackRow';
import SongControls from './SongControls';
import TrackCreationMenu from './TrackCreationMenu';
import { useSequencer } from '../hooks/useSequencer';
import InstrumentSettingsModal from './InstrumentSettingsModal';

interface SequencerProps {
  song: Song;
  onSongUpdate: (updates: Partial<Song>) => void;
}

const defaultDimensions: SequencerDimensions = {
  stepsPerBar: 16,
  bars: 4,
  totalSteps: 64,
  stepWidth: 40,
  trackHeight: 60,
};

export const Sequencer: React.FC<SequencerProps> = ({ song, onSongUpdate }) => {
  const { isPlaying, currentStep, play, pause, stop } = useSequencer(song);
  const [showTrackMenu, setShowTrackMenu] = useState(false);
  const addButtonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [settingsTrackId, setSettingsTrackId] = useState<string | null>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        addButtonRef.current &&
        !addButtonRef.current.contains(event.target as Node)
      ) {
        setShowTrackMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAddTrack = (options: TrackCreationOptions) => {
    const newTrack: Track = {
      id: crypto.randomUUID(),
      name: options.name,
      instrumentType: options.instrumentType,
      settings: options.settings,
      sequence: [],
      mute: false,
      solo: false,
    };

    onSongUpdate({
      tracks: [...song.tracks, newTrack],
    });
    setShowTrackMenu(false);
  };

  return (
    <div className="sequencer" style={{
      backgroundColor: '#1a1a1a',
      color: '#ffffff',
      padding: '20px',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <SongControls
        song={song}
        isPlaying={isPlaying}
        onPlay={play}
        onPause={pause}
        onStop={stop}
        onSongUpdate={onSongUpdate}
      />
      
      <div className="tracks-container" style={{
        flex: 1,
        overflow: 'auto',
        marginTop: '20px',
        position: 'relative',
      }}>
        <div className="tracks-grid" style={{
          display: 'grid',
          gridTemplateColumns: `200px repeat(${defaultDimensions.totalSteps}, ${defaultDimensions.stepWidth}px)`,
          gap: '1px',
          backgroundColor: '#333',
        }}>
          {/* Track Headers */}
          <div className="track-header" style={{
            backgroundColor: '#2a2a2a',
            padding: '10px',
            position: 'sticky',
            left: 0,
            zIndex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
          }}>
            <div style={{ fontWeight: 'bold' }}>Track</div>
            <button
              ref={addButtonRef}
              onClick={() => setShowTrackMenu(!showTrackMenu)}
              style={{
                backgroundColor: '#444',
                border: 'none',
                padding: '8px',
                color: 'white',
                cursor: 'pointer',
                width: '100%',
                zIndex: 1000,
              }}
            >
              + Add Track
            </button>
            {showTrackMenu && (
              <div ref={menuRef} style={{ position: 'absolute', top: '100%', left: 0, zIndex: 1000 }}>
                <TrackCreationMenu
                  onSelect={handleAddTrack}
                />
              </div>
            )}
          </div>
          
          {/* Step Numbers */}
          {Array.from({ length: defaultDimensions.totalSteps }).map((_, i) => (
            <div key={i} className="step-header" style={{
              backgroundColor: '#2a2a2a',
              padding: '10px',
              textAlign: 'center',
              fontSize: '12px',
            }}>
              {i + 1}
            </div>
          ))}

          {/* Track Rows */}
          {song.tracks.map((track) => (
            <TrackRow
              key={track.id}
              track={track}
              dimensions={defaultDimensions}
              currentStep={currentStep}
              onTrackUpdate={(updates: Partial<Track>) => onSongUpdate({
                tracks: song.tracks.map(t => 
                  t.id === track.id ? { ...t, ...updates } : t
                )
              })}
              onShowSettings={() => setSettingsTrackId(track.id)}
            />
          ))}
        </div>
      </div>

      {settingsTrackId && (
        <InstrumentSettingsModal
          track={song.tracks.find(t => t.id === settingsTrackId)!}
          onUpdate={(updates) => onSongUpdate({
            tracks: song.tracks.map(t => t.id === settingsTrackId ? { ...t, ...updates } : t)
          })}
          onClose={() => setSettingsTrackId(null)}
        />
      )}
    </div>
  );
};

export default Sequencer; 