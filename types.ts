// FIX: Removed a self-referential import of 'OpenRouterMessageContent' that was causing a conflict.

export enum ZodiacSign {
  Aries = "Aries",
  Taurus = "Taurus",
  Gemini = "Gemini",
  Cancer = "Cancer",
  Leo = "Leo",
  Virgo = "Virgo",
  Libra = "Libra",
  Scorpio = "Scorpio",
  Sagittarius = "Sagittarius",
  Capricorn = "Capricorn",
  Aquarius = "Aquarius",
  Pisces = "Pisces",
}

export const ALL_ZODIAC_SIGNS = Object.values(ZodiacSign);

export type Horoscope = {
  sign: ZodiacSign | "Today's Birthday";
  text: string;
};

export type HoroscopeStatus = 'pending' | 'loading' | 'success' | 'error';

export type HoroscopeData = {
  [key in ZodiacSign | "Today's Birthday"]: {
    status: HoroscopeStatus;
    text: string;
  }
};

export type Settings = {
  model: string;
  theme: string;
  dailyWordCount: number;
  birthdayWordCount: number;
};

export type AppView = 'horoscopes' | 'natal' | 'image' | 'chat' | 'library';

export interface OpenRouterMessage {
  role: 'user' | 'assistant' | 'system';
  content: string | OpenRouterMessageContent[];
}

export interface OpenRouterMessageContent {
    type: "text" | "image_url";
    text?: string;
    image_url?: { url: string };
}

export interface OpenRouterImage {
  type: "image_url",
  image_url: {
    url: string;
  }
}

export interface OpenRouterAssistantMessage extends OpenRouterMessage {
    role: "assistant";
    content: string;
    images?: OpenRouterImage[];
}

export type GeneratedImageData = {
  id: string;
  url: string;
  prompt: string;
};

export type NatalChartReport = {
  id: string;
  name: string;
  birthDate: string;
  birthTime: string;
  birthLocation: string;
  userDirective: string;
  reading: string;
};

// Types for the Astrology Book Data
export interface AstrologyBook {
  book_title: string;
  sections: Section[];
}

export interface Section {
  section_number: string;
  section_title: string;
  pages: string[];
  chapters: Chapter[];
}

export interface Chapter {
  chapter_number: string;
  chapter_title: string;
  page: string;
  content: string;
}