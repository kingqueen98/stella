import { HoroscopeData, Settings, ZodiacSign, ALL_ZODIAC_SIGNS } from './types';

export const DEFAULT_MODELS = [
  'openai/gpt-4o',
  // FIX: Updated deprecated 'gemini-pro' to the recommended 'gemini-2.5-pro' model.
  'google/gemini-2.5-pro',
  'anthropic/claude-3-haiku',
  'mistralai/mistral-large',
  'meta-llama/llama-3-70b-instruct',
];

export const DEFAULT_IMAGE_MODELS = [
    'google/gemini-2.5-flash-image-preview',
    'openai/dall-e-3',
    'fal.ai/stable-diffusion-v3-medium',
    // FIX: Updated deprecated 'imagen-2' to a newer version.
    'google/imagen-4.0',
    'midjourney',
];

export const DEFAULT_THEMES = [
  "Mystical & Esoteric",
  "Modern & Actionable",
  "Poetic & Reflective",
  "Humorous & Lighthearted",
  "Stoic & Philosophical",
];

export const ZODIAC_EMOJI_MAP: { [key in ZodiacSign]: string } = {
  [ZodiacSign.Aries]: '♈',
  [ZodiacSign.Taurus]: '♉',
  [ZodiacSign.Gemini]: '♊',
  [ZodiacSign.Cancer]: '♋',
  [ZodiacSign.Leo]: '♌',
  [ZodiacSign.Virgo]: '♍',
  [ZodiacSign.Libra]: '♎',
  [ZodiacSign.Scorpio]: '♏',
  [ZodiacSign.Sagittarius]: '♐',
  [ZodiacSign.Capricorn]: '♑',
  [ZodiacSign.Aquarius]: '♒',
  [ZodiacSign.Pisces]: '♓',
};

export const INITIAL_SETTINGS: Settings = {
  model: DEFAULT_MODELS[0],
  theme: DEFAULT_THEMES[0],
  dailyWordCount: 75,
  birthdayWordCount: 120,
};

const initialHoroscopeState = {
  status: 'pending' as const,
  text: '',
};

export const INITIAL_HOROSCOPE_DATA: HoroscopeData = {
  ...ALL_ZODIAC_SIGNS.reduce((acc, sign) => {
    acc[sign] = { ...initialHoroscopeState };
    return acc;
  }, {} as Partial<HoroscopeData>),
  "Today's Birthday": { ...initialHoroscopeState },
} as HoroscopeData;
