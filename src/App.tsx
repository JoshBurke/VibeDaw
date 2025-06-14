import './App.css'
import { Sequencer } from './components/Sequencer'
import type { Song } from './types';
import { useState } from 'react';
import { EMPTY_SONG } from './data/testData';

function App() {
  const [song, setSong] = useState<Song>(EMPTY_SONG);

  return (
    <div className="App max-w-screen">
      <img src="/logo.png" alt="VibeDaw Logo" className="w-100 pl-5"/>
      <Sequencer
        song={song}
        onSongUpdate={(updates) => setSong(prev => ({ ...prev, ...updates }))}
      />
    </div>
  )
}

export default App
