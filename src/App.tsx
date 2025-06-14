import './App.css'
import { Sequencer } from './components/Sequencer'
import type { Song } from './types';
import { useState } from 'react';

function App() {
  const [song, setSong] = useState<Song>({
    id: '1',
    name: 'My Song',
    tempo: 120,
    style: 'electronic',
    mood: 'happy',
    tracks: [],
    metadata: {
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  const handleSongUpdate = (updates: Partial<Song>) => {
    setSong(prev => ({ ...prev, ...updates }));
  };

  return (
    <>
      <Sequencer song={song} onSongUpdate={handleSongUpdate} />
    </>
  )
}

export default App
