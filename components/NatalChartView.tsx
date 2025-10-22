import React, { useState, useEffect } from 'react';
import { generateText } from '../services/openRouterService';
import LoadingSpinner from './LoadingSpinner';
import { OpenRouterMessage, NatalChartReport } from '../types';
import { DEFAULT_MODELS } from '../constants';
import { marked } from 'marked';

interface NatalChartViewProps {
  apiKey: string;
  natalChartReports: NatalChartReport[];
  setNatalChartReports: React.Dispatch<React.SetStateAction<NatalChartReport[]>>;
}

const ReportItem: React.FC<{ report: NatalChartReport }> = ({ report }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [parsedReading, setParsedReading] = useState<string>('');
    const [isParsing, setIsParsing] = useState(false);

    useEffect(() => {
        if (isExpanded && report.reading && !parsedReading) {
            setIsParsing(true);
            (async () => {
                setParsedReading(await marked.parse(report.reading));
                setIsParsing(false);
            })();
        }
    }, [isExpanded, report.reading, parsedReading]);
    
    const handleDownload = () => {
        if (!report.reading) return;
        const blob = new Blob([report.reading], { type: 'text/markdown;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        const filename = report.name.trim().toLowerCase().replace(/\s+/g, '-') || 'natal-chart';
        link.download = `${filename}-report.md`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    return (
         <div className="bg-astro-dark/50 backdrop-blur-sm rounded-lg border border-astro-gold/20 shadow-lg">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full text-left p-4 flex justify-between items-center transition-colors duration-300 hover:bg-astro-dark/70"
            >
                <div>
                    <h3 className="text-xl font-serif text-astro-gold">{report.name}</h3>
                    <p className="text-xs text-astro-light/70">{report.birthDate} at {report.birthTime} - {report.birthLocation}</p>
                </div>
                 <svg
                    className={`w-6 h-6 text-astro-gold transition-transform duration-300 ${isExpanded ? 'transform rotate-180' : ''}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
            </button>
            {isExpanded && (
                <div className="p-1 border-t border-astro-gold/20">
                     <div className="bg-white p-6 rounded-b-lg shadow-inner">
                        {isParsing ? (
                             <div className="flex justify-center items-center h-48"><LoadingSpinner size="w-10 h-10" /></div>
                        ) : (
                            <>
                                <div className="flex justify-end mb-4">
                                    <button onClick={handleDownload} className="btn-secondary">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 inline-block" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                                        Download Report
                                    </button>
                                </div>
                                <div
                                    className="natal-chart-output text-gray-800 font-serif"
                                    dangerouslySetInnerHTML={{ __html: parsedReading }}
                                />
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};


const NatalChartView: React.FC<NatalChartViewProps> = ({ apiKey, natalChartReports, setNatalChartReports }) => {
    const [name, setName] = useState('');
    const [birthDate, setBirthDate] = useState('');
    const [birthTime, setBirthTime] = useState('');
    const [birthLocation, setBirthLocation] = useState('');
    const [userDirective, setUserDirective] = useState('');
    const [model, setModel] = useState(DEFAULT_MODELS[0]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerateChart = async () => {
        if (!name || !birthDate || !birthTime || !birthLocation) {
            setError("Please fill in all birth details.");
            return;
        }
        setIsLoading(true);
        setError(null);

        const userDirectiveText = userDirective 
            ? `\n\n**Persona and Style:** You MUST adopt this specific persona for the entire report: "${userDirective}". This directive is the most important instruction and overrides all other stylistic guides.`
            : `\n\n**Persona and Style:** Your persona is Stella, a wise and nurturing cosmic mentor. Your purpose is to translate the user's personal cosmic blueprint to help them navigate their life. Your writing style is authoritative yet compassionate, poetic yet grounded, and always empowering. You illuminate paths and potential; you do not predict a fixed future. Frame your insights as "invitations" and "opportunities" for growth.`;

        const prompt = `Generate a comprehensive natal chart report for ${name}, born on ${birthDate} at ${birthTime} in ${birthLocation}.

Follow this structure precisely:

1. **Report Header** — At the top, list: Name, Birth Date, Birth Time, Birth Location, and the calculated Latitude & Longitude.
2. **Introduction** — An introductory paragraph framing the chart as a personal cosmic blueprint.
3. **Planetary Table** — A markdown table with: Planet | Sign | Degree | House | Element | Modality | Ruling Energy.
4. **House Placement Table** — List Houses 1–12 with Sign, Degree, and any Planets Present.
5. **Aspect Grid Table** — Use symbols (☌ ☍ △ □ ⚹) with orbs.
6. **Interpretive Sections** — Provide a detailed interpretation for every major placement and aspect (Sun, Moon, Mercury, Venus, Mars, Jupiter, Saturn, Uranus, Neptune, Pluto, North Node, Ascendant, Midheaven).
7. **Psychological Themes** — Sections for Core Wound, Love Pattern, Shadow and Integration Path.
8. **Karmic Signature** — An analysis based on the Lunar Nodes and Pluto.
9. **Relationship Dynamics** — Insights from Venus, the Moon, and the Descendant.
10. **Life Trajectory Summary** — A concluding paragraph summarizing the chart's main themes.

**Formatting Rules:**
- The output will be on a white background. All text must be dark for readability.
- Use markdown for structure.
- Use astrological symbols (☉ ☾ ☿ ♀ ♂ ♃ ♄ ♅ ♆ ♇ ☊) where appropriate.
- There are NO word count restrictions. Be as detailed and thorough as necessary.
${userDirectiveText}

**CRITICAL REQUIREMENT:** You MUST generate the complete report. Do not use placeholders like "...(Continue with interpretations...)" or stop before analyzing all required sections. The entire report, with all interpretations filled out, must be completed. This is not optional.`;

        const messages: OpenRouterMessage[] = [
            { role: 'user', content: prompt }
        ];

        try {
            const reading = await generateText(model, messages, apiKey);
            if (reading.startsWith('Error:')) {
              throw new Error(reading);
            }
            const newReport: NatalChartReport = {
                id: `${Date.now()}-${name}`,
                name,
                birthDate,
                birthTime,
                birthLocation,
                userDirective,
                reading,
            };
            setNatalChartReports(prev => [newReport, ...prev]);
        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : "An unknown error occurred while generating the chart reading.";
            setError(errorMessage);
        }
        setIsLoading(false);
    };

    return (
        <div className="space-y-6">
            <div className="bg-astro-dark/50 backdrop-blur-sm p-6 rounded-lg border border-astro-gold/20 shadow-lg space-y-4">
                <h2 className="text-2xl font-serif font-bold text-astro-gold">Natal Chart Reading</h2>
                <p className="text-astro-light/80 text-sm">Enter birth details to generate a personalized reading. Reports will be saved for your session below.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                        <label className="block text-sm font-medium text-astro-light/80 mb-1">Name</label>
                        <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Jane Doe" className="input-style" disabled={isLoading} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-astro-light/80 mb-1">Birth Date</label>
                        <input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} className="input-style" disabled={isLoading}/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-astro-light/80 mb-1">Birth Time</label>
                        <input type="time" value={birthTime} onChange={(e) => setBirthTime(e.target.value)} className="input-style" disabled={isLoading} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-astro-light/80 mb-1">Birth Location</label>
                        <input type="text" value={birthLocation} onChange={(e) => setBirthLocation(e.target.value)} placeholder="e.g., New York, NY" className="input-style" disabled={isLoading} />
                    </div>
                </div>

                 <div>
                    <label htmlFor="user-directive" className="block text-sm font-medium text-astro-light/80 mb-1">User Directive (Optional)</label>
                    <textarea id="user-directive" value={userDirective} onChange={(e) => setUserDirective(e.target.value)} placeholder="e.g., 'Write in the style of Carl Sagan' or 'Focus on my karmic path and past lives.'" className="input-style w-full h-20" disabled={isLoading} />
                </div>

                <div>
                     <label htmlFor="model-natal" className="block text-sm font-medium text-astro-light/80 mb-1">AI Model</label>
                     <select id="model-natal" value={model} onChange={(e) => setModel(e.target.value)} disabled={isLoading} className="input-style w-full">
                        {DEFAULT_MODELS.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                    <input
                        type="text"
                        value={model}
                        onChange={(e) => setModel(e.target.value)}
                        placeholder="Or enter a custom model..."
                        className="input-style w-full mt-2"
                        disabled={isLoading}
                    />
                </div>
                
                <button onClick={handleGenerateChart} disabled={isLoading || !apiKey} className="btn-primary w-full flex items-center justify-center">
                    {isLoading && <LoadingSpinner size="w-5 h-5 mr-2"/>}
                    {isLoading ? 'Generating...' : 'Generate & Add Report'}
                </button>
                {error && <p className="text-red-400 text-center">{error}</p>}
            </div>
            
            {natalChartReports.length > 0 && (
                <div className="space-y-4">
                     <h3 className="text-xl font-serif font-bold text-astro-gold">Generated Reports</h3>
                     {natalChartReports.map(report => (
                         <ReportItem key={report.id} report={report} />
                     ))}
                </div>
            )}
        </div>
    );
};

const styles = `
    .input-style {
        width: 100%;
        background-color: #151026; /* bg-astro-dark */
        border: 1px solid rgb(249 218 130 / 0.4); /* border-astro-gold/40 */
        color: #E2E1EF; /* text-astro-light */
        border-radius: 0.375rem; /* rounded-md */
        padding: 0.5rem;
    }
    .input-style:focus {
        --tw-ring-color: #F9DA82; /* ring-astro-gold */
        border-color: #F9DA82; /* border-astro-gold */
        outline: none;
    }
    .btn-primary {
        background-color: #F9DA82; /* bg-astro-gold */
        color: #151026; /* text-astro-dark */
        font-weight: bold;
        padding: 0.75rem 2rem;
        border-radius: 9999px;
        transition: all 0.3s;
    }
    .btn-primary:hover {
        background-color: #E2E1EF; /* hover:bg-astro-light */
    }
    .btn-primary:disabled {
        background-color: #6B7280; /* disabled:bg-gray-500 */
        cursor: not-allowed;
    }
    .btn-secondary {
        background-color: transparent;
        color: #151026; /* astro-dark */
        border: 1px solid #151026; /* astro-dark */
        font-weight: bold;
        padding: 0.5rem 1rem;
        border-radius: 9999px;
        transition: all 0.3s;
    }
    .btn-secondary:hover {
        background-color: rgb(21 16 38 / 0.05);
    }
    /* For date and time picker icon color */
    .input-style::-webkit-calendar-picker-indicator {
        filter: invert(0.8) sepia(1) saturate(5) hue-rotate(350deg);
    }
    /* Styles for rendered markdown output on a white background */
    .natal-chart-output h1, .natal-chart-output h2, .natal-chart-output h3, .natal-chart-output h4 {
        color: #151026; /* astro-dark */
        font-family: 'Playfair Display', serif;
        margin-top: 1.5rem;
        margin-bottom: 0.75rem;
    }
     .natal-chart-output h1 { font-size: 2em; }
     .natal-chart-output h2 { font-size: 1.75em; }
     .natal-chart-output h3 { font-size: 1.5em; }
     .natal-chart-output h4 { font-size: 1.25em; }
    
    .natal-chart-output p {
        margin-bottom: 1rem;
        line-height: 1.7;
        color: #374151; /* gray-700 */
    }
    .natal-chart-output table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 1.5rem;
        font-family: 'Inter', sans-serif;
    }
    .natal-chart-output th, .natal-chart-output td {
        border: 1px solid #e5e7eb; /* gray-200 */
        padding: 0.75rem;
        text-align: left;
    }
    .natal-chart-output td {
        color: #374151; /* gray-700 */
    }
    .natal-chart-output th {
        background-color: #f3f4f6; /* gray-100 */
        color: #111827; /* gray-900 */
        font-weight: bold;
    }
`;
export const NatalChartStyleInjector = () => <style>{styles}</style>;

export default NatalChartView;