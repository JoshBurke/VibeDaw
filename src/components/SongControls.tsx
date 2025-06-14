import React from 'react';
import type { Song } from '../types';

interface SongControlsProps {
  song: Song;
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
  onSongUpdate: (updates: Partial<Song>) => void;
}

export const SongControls: React.FC<SongControlsProps> = ({
  song,
  isPlaying,
  onPlay,
  onPause,
  onStop,
  onSongUpdate,
}) => {
  return (
    <div className="song-controls" style={{
      display: 'flex',
      gap: '20px',
      padding: '10px',
      backgroundColor: '#2a2a2a',
      alignItems: 'center',
    }}>
      {/* Transport Controls */}
      <div className="transport" style={{ display: 'flex', gap: '8px' }}>
        <button
          onClick={isPlaying ? onPause : onPlay}
          style={{
            backgroundColor: '#444',
            border: 'none',
            padding: '8px 16px',
            color: 'white',
            cursor: 'pointer',
          }}
        >
          {isPlaying ? '⏸' : '▶️'}
        </button>
        <button
          onClick={onStop}
          style={{
            backgroundColor: '#444',
            border: 'none',
            padding: '8px 16px',
            color: 'white',
            cursor: 'pointer',
          }}
        >
          ⏹
        </button>
      </div>

      {/* Song Info */}
      <div className="song-info" style={{ display: 'flex', gap: '20px', flex: 1 }}>
        <input
          type="text"
          value={song.name}
          onChange={(e) => onSongUpdate({ name: e.target.value })}
          placeholder="Song Name"
          style={{
            backgroundColor: '#333',
            border: '1px solid #444',
            color: 'white',
            padding: '8px',
            width: '200px',
          }}
        />
        <div className="tempo" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label>Tempo:</label>
          <input
            type="number"
            value={song.tempo}
            onChange={(e) => onSongUpdate({ tempo: Number(e.target.value) })}
            min="20"
            max="300"
            style={{
              backgroundColor: '#333',
              border: '1px solid #444',
              color: 'white',
              padding: '8px',
              width: '80px',
            }}
          />
        </div>
      </div>

      {/* Import/Export */}
      <div className="import-export" style={{ display: 'flex', gap: '8px' }}>
        <button
          onClick={() => {
            const data = JSON.stringify(song, null, 2);
            const blob = new Blob([data], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${song.name}.json`;
            a.click();
            URL.revokeObjectURL(url);
          }}
          style={{
            backgroundColor: '#444',
            border: 'none',
            padding: '8px 16px',
            color: 'white',
            cursor: 'pointer',
          }}
        >
          Export
        </button>
        <input
          type="file"
          accept=".json"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              const reader = new FileReader();
              reader.onload = (event) => {
                try {
                  const songData = JSON.parse(event.target?.result as string);
                  onSongUpdate(songData);
                } catch (error) {
                  console.error('Error importing song:', error);
                }
              };
              reader.readAsText(file);
            }
          }}
          style={{ display: 'none' }}
          id="import-song"
        />
        <button
          onClick={() => document.getElementById('import-song')?.click()}
          style={{
            backgroundColor: '#444',
            border: 'none',
            padding: '8px 16px',
            color: 'white',
            cursor: 'pointer',
          }}
        >
          Import
        </button>
      </div>
    </div>
  );
};

export default SongControls; 