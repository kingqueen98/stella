import React, { useState, useEffect } from 'react';
import HoroscopeView from './components/HoroscopeView';
import NatalChartView, { NatalChartStyleInjector } from './components/NatalChartView';
import ImageGenView, { ImageGenStyleInjector } from './components/ImageGenView';
import ChatView from './components/ChatView';
import LibraryView from './components/LibraryView';
import { AppView, GeneratedImageData, NatalChartReport, HoroscopeData } from './types';
import { INITIAL_HOROSCOPE_DATA } from './constants';

const NavButton: React.FC<{
    label: string;
    isActive: boolean;
    onClick: () => void;
    icon: string;
}> = ({ label, isActive, onClick, icon }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg transition-colors duration-200 ${
            isActive
                ? 'bg-astro-gold text-astro-dark font-bold'
                : 'text-astro-light/70 hover:bg-astro-dark/50 hover:text-astro-light'
        }`}
    >
        <span className="text-2xl">{icon}</span>
        <span>{label}</span>
    </button>
);


const App: React.FC = () => {
    const [activeView, setActiveView] = useState<AppView>('horoscopes');
    const [apiKey, setApiKey] = useState<string>(() => localStorage.getItem('openrouter_api_key') || '');
    
    // Lifted state for session persistence
    const [generatedImages, setGeneratedImages] = useState<GeneratedImageData[]>([]);
    const [natalChartReports, setNatalChartReports] = useState<NatalChartReport[]>([]);
    const [horoscopeData, setHoroscopeData] = useState<HoroscopeData>(INITIAL_HOROSCOPE_DATA);
    const [planetaryContext, setPlanetaryContext] = useState<string>('');


    useEffect(() => {
        localStorage.setItem('openrouter_api_key', apiKey);
    }, [apiKey]);
    
    useEffect(() => {
        const handleBeforeUnload = (event: BeforeUnloadEvent) => {
            const hasGeneratedHoroscopes = Object.values(horoscopeData).some(h => h.status === 'success');
            if (generatedImages.length > 0 || natalChartReports.length > 0 || hasGeneratedHoroscopes) {
                event.preventDefault();
                event.returnValue = 'You have unsaved generated content. Are you sure you want to leave? This will clear your session.';
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [generatedImages, natalChartReports, horoscopeData]);


    const renderView = () => {
        switch (activeView) {
            case 'horoscopes': return <HoroscopeView apiKey={apiKey} horoscopeData={horoscopeData} setHoroscopeData={setHoroscopeData} planetaryContext={planetaryContext} setPlanetaryContext={setPlanetaryContext} />;
            case 'natal': return <NatalChartView apiKey={apiKey} natalChartReports={natalChartReports} setNatalChartReports={setNatalChartReports} />;
            case 'image': return <ImageGenView apiKey={apiKey} generatedImages={generatedImages} setGeneratedImages={setGeneratedImages} />;
            case 'chat': return <ChatView apiKey={apiKey} />;
            case 'library': return <LibraryView />;
            default: return <HoroscopeView apiKey={apiKey} horoscopeData={horoscopeData} setHoroscopeData={setHoroscopeData} planetaryContext={planetaryContext} setPlanetaryContext={setPlanetaryContext} />;
        }
    };
    
    return (
        <>
            <NatalChartStyleInjector />
            <ImageGenStyleInjector />
            <div className="min-h-screen bg-astro-dark font-sans bg-fixed" style={{backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'28\' height=\'49\' viewBox=\'0 0 28 49\'%3E%3Cg fill-rule=\'evenodd\'%3E%3Cg id=\'hexagons\' fill=\'%23f9da82\' fill-opacity=\'0.05\' fill-rule=\'nonzero\'%3E%3Cpath d=\'M13.99 9.25l13 7.5v15l-13 7.5L1 31.75v-15l12.99-7.5zM3 17.9v12.7l10.99 6.34 11-6.35V17.9l-11-6.34L3 17.9zM0 15l12.99-7.5L26 15v19L13 41.5 0 34V15z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}>
                <div className="flex flex-col lg:flex-row max-w-screen-2xl mx-auto p-4 lg:p-8 gap-8">
                    {/* Sidebar Navigation */}
                    <aside className="lg:w-64 flex-shrink-0">
                        <div className="p-4 bg-astro-dark/30 backdrop-blur-md rounded-lg border border-astro-gold/20 sticky top-8">
                            <header className="text-center mb-6">
                                <h1 className="text-4xl font-serif font-bold text-astro-gold tracking-wider">The Daily</h1>
                                <h2 className="text-3xl font-serif font-bold text-astro-light">Stars</h2>
                                <p className="text-xs text-astro-gold/70 mt-1">GUIDE TO THE STARS</p>
                            </header>
                            <nav className="space-y-2">
                                <NavButton label="Horoscopes" icon="✨" isActive={activeView === 'horoscopes'} onClick={() => setActiveView('horoscopes')} />
                                <NavButton label="Natal Chart" icon="🔮" isActive={activeView === 'natal'} onClick={() => setActiveView('natal')} />
                                <NavButton label="Image Gen" icon="🎨" isActive={activeView === 'image'} onClick={() => setActiveView('image')} />
                                <NavButton label="Chat" icon="💬" isActive={activeView === 'chat'} onClick={() => setActiveView('chat')} />
                                <NavButton label="Library" icon="📚" isActive={activeView === 'library'} onClick={() => setActiveView('library')} />
                            </nav>
                            <div className="mt-6 pt-6 border-t border-astro-gold/20">
                                <label htmlFor="apiKey" className="block text-sm font-medium text-astro-light/80 mb-1">OpenRouter Key</label>
                                <input
                                    type="password"
                                    id="apiKey"
                                    name="apiKey"
                                    value={apiKey}
                                    onChange={(e) => setApiKey(e.target.value)}
                                    placeholder="sk-or-..."
                                    className="w-full bg-astro-dark/70 border border-astro-gold/30 text-astro-light rounded-md p-2 focus:ring-astro-gold focus:border-astro-gold"
                                />
                                <p className="text-xs text-astro-light/50 mt-2">
                                    Your key is stored locally. Get one from <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer" className="underline hover:text-astro-gold">OpenRouter.ai</a>.
                                </p>
                            </div>
                        </div>
                    </aside>

                    {/* Main Content */}
                    <main className="flex-grow">
                         {!apiKey && (
                            <div className="bg-yellow-900/50 border border-yellow-600 text-yellow-200 px-4 py-3 rounded-lg mb-6 text-center">
                                Please enter your OpenRouter API key in the sidebar to begin. 
                                It is stored locally on your computer.
                            </div>
                        )}
                        {renderView()}
                    </main>
                </div>
            </div>
        </>
    );
};

export default App;