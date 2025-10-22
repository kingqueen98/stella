import React, { useState, useCallback, useRef } from 'react';
import { ZodiacSign, ALL_ZODIAC_SIGNS, HoroscopeData, HoroscopeStatus, Settings, OpenRouterMessage } from '../types';
import { ZODIAC_EMOJI_MAP, INITIAL_SETTINGS } from '../constants';
import { generateText } from '../services/openRouterService';
import LoadingSpinner from './LoadingSpinner';
import SettingsPanel from './SettingsPanel';

const HoroscopeCard: React.FC<{
  sign: ZodiacSign | "Today's Birthday";
  data: { status: HoroscopeStatus; text: string };
  onGenerate: (sign: ZodiacSign | "Today's Birthday") => void;
  isGenerating: boolean;
  apiKey: string;
}> = ({ sign, data, onGenerate, isGenerating, apiKey }) => {
  const isBirthday = sign === "Today's Birthday";
  const emoji = isBirthday ? '🎂' : ZODIAC_EMOJI_MAP[sign as ZodiacSign];
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    // Create a temporary textarea element to hold the text
    const textArea = document.createElement("textarea");
    textArea.value = data.text;

    // Make the textarea invisible and remove it from the layout flow
    textArea.style.position = "fixed";
    textArea.style.top = "-9999px";
    textArea.style.left = "-9999px";
    
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      // Execute the copy command
      document.execCommand('copy');
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }

    // Clean up and remove the textarea
    document.body.removeChild(textArea);
  };

  return (
    <div className="bg-astro-dark/30 backdrop-blur-md rounded-lg border border-astro-gold/20 flex flex-col transition-all duration-300">
      <h3 className="text-xl font-serif font-bold text-astro-gold flex items-center gap-2 p-4">
        {emoji} <span>{sign}</span>
      </h3>
      <div className="bg-white rounded-b-lg p-4 text-gray-800 text-sm flex-grow min-h-[200px] flex flex-col justify-between">
         <div className="flex-grow">
            {data.status === 'loading' && <div className="flex items-center justify-center h-full"><LoadingSpinner /></div>}
            {data.status === 'error' && <p className="text-red-600">{data.text}</p>}
            {data.status === 'success' && <p className="leading-relaxed whitespace-pre-wrap">{data.text}</p>}
            {data.status === 'pending' && <p className="text-gray-400">Ready to generate.</p>}
        </div>
        <div className="mt-4 flex justify-end items-center gap-2">
            {data.status === 'success' && (
                <button onClick={handleCopy} className="text-xs font-bold py-1 px-3 rounded-full bg-astro-dark/10 hover:bg-astro-dark/20 text-astro-dark transition-colors">
                    {isCopied ? 'Copied!' : 'Copy Text'}
                </button>
            )}
            {(data.status === 'pending' || data.status === 'error') && (
                <button 
                    onClick={() => onGenerate(sign)} 
                    disabled={isGenerating || !apiKey} 
                    className="text-xs font-bold py-1 px-3 rounded-full bg-astro-gold hover:bg-astro-gold/80 text-astro-dark transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                    {data.status === 'error' ? 'Retry' : 'Generate'}
                </button>
            )}
        </div>
      </div>
    </div>
  );
};

interface HoroscopeViewProps {
  apiKey: string;
  horoscopeData: HoroscopeData;
  setHoroscopeData: React.Dispatch<React.SetStateAction<HoroscopeData>>;
  planetaryContext: string;
  setPlanetaryContext: React.Dispatch<React.SetStateAction<string>>;
}

const HoroscopeView: React.FC<HoroscopeViewProps> = ({ apiKey, horoscopeData, setHoroscopeData, planetaryContext, setPlanetaryContext }) => {
  const [settings, setSettings] = useState<Settings>(INITIAL_SETTINGS);
  const [userDirective, setUserDirective] = useState('');
  const [isContextLoading, setIsContextLoading] = useState(false);
  const contextPromiseRef = useRef<Promise<string> | null>(null);
  
  const isAnyHoroscopeLoading = Object.values(horoscopeData).some(d => d.status === 'loading');

  const generateSingleHoroscope = useCallback(async (sign: ZodiacSign | "Today's Birthday") => {
    setHoroscopeData(prev => ({ ...prev, [sign]: { status: 'loading', text: '' } }));

    try {
        let context = planetaryContext;
        if (!context) {
            if (!contextPromiseRef.current) {
                setIsContextLoading(true);
                const date = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
                const planetarySummaryPrompt = `For today, ${date}, please provide a summary of the key planetary alignments and aspects. Describe it as the "cosmic weather report" for the day, focusing on the major energetic signatures that will influence everyone. This will be used as context for Stella's horoscopes.`;
                contextPromiseRef.current = generateText(settings.model, [{role: 'user', content: planetarySummaryPrompt}], apiKey);
            }
            context = await contextPromiseRef.current;
            setPlanetaryContext(context);
            setIsContextLoading(false);
        }
        
        const date = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        const isBirthday = sign === "Today's Birthday";
        const wordCount = isBirthday ? settings.birthdayWordCount : settings.dailyWordCount;
        
        const promptTarget = isBirthday ? "those celebrating their birthday" : sign;
        const promptIntro = isBirthday 
            ? `Your task is to write an uplifting and reflective horoscope for the year ahead for ${promptTarget} on ${date}.`
            : `Your task is to write an empowering and poetic daily horoscope for ${sign} for ${date}.`;

        const userDirectiveText = userDirective 
            ? `However, you MUST prioritize the following User Directive, allowing it to shape the final tone and focus: "${userDirective}"`
            : '';

        const prompt = `${promptIntro}

The general "cosmic weather report" is: "${context}".

Here are your instructions:
1.  **Synthesize, Don't List:** Read the cosmic weather report for context, but do not simply repeat it. Instead, interpret how those energies would feel specifically for ${promptTarget}.
2.  **Natural Flow:** Write a seamless, natural-sounding paragraph. Weave the astrological insights and your empowering advice (your "Cosmic Counsel") together into a single narrative. The advice should feel like an organic part of the message, an invitation for them to engage with the day's energy.
3.  **Tone & Style:** The core tone should be "${settings.theme}". ${userDirectiveText}
4.  **Word Count:** The reading must be strictly around ${wordCount} words.
5.  **Illuminate Paths:** Remember your purpose: empower the user and illuminate potential paths, not predict a fixed future.`;

      const messages: OpenRouterMessage[] = [
        { role: 'system', content: `You are Stella, a wise and nurturing cosmic mentor. Your purpose is to translate the complex map of the cosmos into beautiful, flowing prose to help users navigate their lives. You must write in a natural, paragraph-based style. AVOID using bullet points, numbered lists, or breaking your response into starkly separate sections like "Cosmic Vibes" and "Cosmic Counsel". Your entire response should be a single, cohesive piece of writing.` },
        { role: 'user', content: prompt }
      ];

        const text = await generateText(settings.model, messages, apiKey);
        if (text.startsWith('Error:')) { throw new Error(text); }
        setHoroscopeData(prev => ({ ...prev, [sign]: { status: 'success', text } }));

    } catch (error: unknown) {
        contextPromiseRef.current = null;
        setIsContextLoading(false);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        setHoroscopeData(prev => ({ ...prev, [sign]: { status: 'error', text: errorMessage } }));
    }
  }, [settings, apiKey, planetaryContext, setPlanetaryContext, setHoroscopeData, userDirective]);

  return (
    <div className="space-y-8">
      <SettingsPanel settings={settings} onSettingsChange={setSettings} isGenerating={isAnyHoroscopeLoading || isContextLoading} />
      
      <div className="bg-astro-dark/50 backdrop-blur-sm p-6 rounded-lg border border-astro-gold/20 shadow-lg">
          <label htmlFor="horoscope-directive" className="block text-lg font-serif text-astro-gold mb-2">Horoscope Directive (Optional)</label>
          <p className="text-astro-light/80 text-sm mb-3">Guide Stella's voice for this session. Ask for a specific theme, focus, or writing style (e.g., "Focus on creativity," "Write like a stoic philosopher").</p>
          <textarea
              id="horoscope-directive"
              value={userDirective}
              onChange={(e) => setUserDirective(e.target.value)}
              placeholder="e.g., Make it feel like a cozy chat over tea..."
              className="input-style w-full h-20"
              disabled={isAnyHoroscopeLoading || isContextLoading}
          />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ALL_ZODIAC_SIGNS.map(sign => (
          <HoroscopeCard 
            key={sign} 
            sign={sign} 
            data={horoscopeData[sign]} 
            onGenerate={generateSingleHoroscope}
            isGenerating={isAnyHoroscopeLoading || isContextLoading}
            apiKey={apiKey}
          />
        ))}
         <div className="lg:col-span-3 md:col-span-2">
            <HoroscopeCard 
                sign="Today's Birthday" 
                data={horoscopeData["Today's Birthday"]} 
                onGenerate={generateSingleHoroscope}
                isGenerating={isAnyHoroscopeLoading || isContextLoading}
                apiKey={apiKey}
            />
         </div>
      </div>
    </div>
  );
};

export default HoroscopeView;