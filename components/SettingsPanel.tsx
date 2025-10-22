
import React from 'react';
import { Settings } from '../types';
import { DEFAULT_MODELS, DEFAULT_THEMES } from '../constants';

interface SettingsPanelProps {
  settings: Settings;
  onSettingsChange: (newSettings: Settings) => void;
  isGenerating: boolean;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ settings, onSettingsChange, isGenerating }) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    onSettingsChange({
      ...settings,
      [name]: name.includes('WordCount') ? parseInt(value, 10) : value,
    });
  };

  return (
    <div className="bg-astro-dark/50 backdrop-blur-sm p-6 rounded-lg border border-astro-gold/20 shadow-lg">
      <h2 className="text-2xl font-serif font-bold text-astro-gold mb-6">Settings</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Model Selection */}
        <div>
          <label htmlFor="model" className="block text-sm font-medium text-astro-light/80 mb-1">AI Model</label>
          <select
            id="model"
            name="model"
            value={settings.model}
            onChange={handleInputChange}
            disabled={isGenerating}
            className="w-full bg-astro-dark/70 border border-astro-gold/30 text-astro-light rounded-md p-2 focus:ring-astro-gold focus:border-astro-gold"
          >
            {DEFAULT_MODELS.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          <input
            type="text"
            name="model"
            value={settings.model}
            onChange={handleInputChange}
            disabled={isGenerating}
            placeholder="Or enter a custom model..."
            className="mt-2 w-full bg-astro-dark/70 border border-astro-gold/30 text-astro-light rounded-md p-2 focus:ring-astro-gold focus:border-astro-gold"
          />
        </div>

        {/* Theme Selection */}
        <div>
          <label htmlFor="theme" className="block text-sm font-medium text-astro-light/80 mb-1">Horoscope Theme</label>
          <select
            id="theme"
            name="theme"
            value={settings.theme}
            onChange={handleInputChange}
            disabled={isGenerating}
            className="w-full bg-astro-dark/70 border border-astro-gold/30 text-astro-light rounded-md p-2 focus:ring-astro-gold focus:border-astro-gold"
          >
            {DEFAULT_THEMES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
           <input
            type="text"
            name="theme"
            value={settings.theme}
            onChange={handleInputChange}
            disabled={isGenerating}
            placeholder="Or enter a custom theme..."
            className="mt-2 w-full bg-astro-dark/70 border border-astro-gold/30 text-astro-light rounded-md p-2 focus:ring-astro-gold focus:border-astro-gold"
          />
        </div>

        {/* Daily Word Count */}
        <div>
          <label htmlFor="dailyWordCount" className="block text-sm font-medium text-astro-light/80 mb-1">Daily Horoscope Length (words)</label>
          <input
            type="number"
            id="dailyWordCount"
            name="dailyWordCount"
            value={settings.dailyWordCount}
            onChange={handleInputChange}
            disabled={isGenerating}
            className="w-full bg-astro-dark/70 border border-astro-gold/30 text-astro-light rounded-md p-2 focus:ring-astro-gold focus:border-astro-gold"
            min="20"
            step="5"
          />
        </div>

        {/* Birthday Word Count */}
        <div>
          <label htmlFor="birthdayWordCount" className="block text-sm font-medium text-astro-light/80 mb-1">Birthday Horoscope Length (words)</label>
          <input
            type="number"
            id="birthdayWordCount"
            name="birthdayWordCount"
            value={settings.birthdayWordCount}
            onChange={handleInputChange}
            disabled={isGenerating}
            className="w-full bg-astro-dark/70 border border-astro-gold/30 text-astro-light rounded-md p-2 focus:ring-astro-gold focus:border-astro-gold"
            min="30"
            step="10"
          />
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;