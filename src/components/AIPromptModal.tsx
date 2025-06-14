import React, { useState } from 'react';

interface AIPromptModalProps {
  onConfirm: (description: string) => void;
  onCancel: () => void;
}

const AIPromptModal: React.FC<AIPromptModalProps> = ({ onConfirm, onCancel }) => {
  const [text, setText] = useState('');

  return (
    <div
      onClick={onCancel}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0,0,0,0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 3000,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ backgroundColor: '#222', padding: 20, border: '1px solid #555', color: 'white', minWidth: 300 }}
      >
        <h4>Describe the track you want</h4>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="e.g. Funky bassline, hihats, 4-on-the-floor kick"
          style={{ width: '100%', marginBottom: 12 }}
        />
        <button onClick={() => onConfirm(text)} style={{ marginRight: 8 }}>Generate</button>
        <button onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
};

export default AIPromptModal; 