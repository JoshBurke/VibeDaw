import './App.css'
import { Sequencer } from './components/Sequencer'
import type { Song } from './types';
import { useState } from 'react';
import { TEST_SONG } from './data/testData';

function App() {
  const [song, setSong] = useState<Song>(TEST_SONG);

  return (
    <div className="App">
      <Sequencer
        song={song}
        onSongUpdate={(updates) => setSong(prev => ({ ...prev, ...updates }))}
      />
    </div>
  )
}

export default App
