import React, { useState } from 'react';
import type { Track, SamplerSettings, SynthSettings } from '../types';
import { SAMPLE_OPTIONS } from '../data/sampleList';

interface InstrumentSettingsModalProps {
  track: Track;
  onUpdate: (updates: Partial<Track>) => void;
  onClose: () => void;
}

const InstrumentSettingsModal: React.FC<InstrumentSettingsModalProps> = ({ track, onUpdate, onClose }) => {
  const [settings, setSettings] = useState(track.settings);

  const handleChange = (field: string, value: any) => {
    const newSettings = { ...settings, [field]: value } as any;
    setSettings(newSettings);
    onUpdate({ settings: newSettings });
  };

  const renderSamplerSettings = () => {
    const s = settings as SamplerSettings;
    return (
      <>
        <label>
          Sample:
          <select
            value={s.sampleUrl}
            onChange={(e) => handleChange('sampleUrl', e.target.value)}
          >
            {SAMPLE_OPTIONS.map(opt => (
              <option key={opt.url} value={opt.url}>{opt.label}</option>
            ))}
          </select>
        </label>
        <label>
          Pitch (st):
          <input
            type="number"
            min={-24}
            max={24}
            value={s.pitch}
            onChange={(e) => handleChange('pitch', Number(e.target.value))}
          />
        </label>
      </>
    );
  };

  const renderSynthSettings = () => {
    const s = settings as SynthSettings;
    return (
      <label>
        Waveform:
        <select
          value={s.waveform}
          onChange={(e) => handleChange('waveform', e.target.value)}
        >
          <option value="sine">Sine</option>
          <option value="square">Square</option>
          <option value="sawtooth">Sawtooth</option>
          <option value="triangle">Triangle</option>
        </select>
      </label>
    );
  };

  // Shared controls
  const baseControls = (
    <>
      <label>
        Volume:
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={settings.volume}
          onChange={(e) => handleChange('volume', Number(e.target.value))}
        />
      </label>
      <label>
        Pan:
        <input
          type="range"
          min={-1}
          max={1}
          step={0.01}
          value={settings.pan}
          onChange={(e) => handleChange('pan', Number(e.target.value))}
        />
      </label>
    </>
  );

  return (
    <div
      onClick={onClose}
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
        zIndex: 2000,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: '#222',
          padding: '20px',
          border: '1px solid #555',
          minWidth: '300px',
          color: 'white',
        }}
      >
        <h3>{track.name} Settings</h3>
        {baseControls}
        {track.instrumentType === 'sampler' ? renderSamplerSettings() : renderSynthSettings()}
      </div>
    </div>
  );
};

export default InstrumentSettingsModal; 