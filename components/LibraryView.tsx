import React, { useState } from 'react';
import { astrologyBook } from '../data/astrologyBook';
import { Section, Chapter } from '../types';

const ChapterContent: React.FC<{ chapter: Chapter }> = ({ chapter }) => {
    return (
        <div className="bg-astro-dark/30 p-4 rounded-b-lg border-l border-r border-b border-astro-gold/20">
            <p className="text-astro-light whitespace-pre-wrap leading-relaxed">{chapter.content}</p>
        </div>
    )
}

const SectionItem: React.FC<{ section: Section }> = ({ section }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [activeChapter, setActiveChapter] = useState<string | null>(null);
    
    const toggleChapter = (chapterNumber: string) => {
        setActiveChapter(activeChapter === chapterNumber ? null : chapterNumber);
    }

    return (
        <div className="mb-4">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full text-left bg-astro-dark/50 p-4 rounded-lg border border-astro-gold/20 flex justify-between items-center transition-all duration-300 hover:bg-astro-dark/70"
            >
                <div>
                    <p className="text-xs text-astro-gold/70">Section {section.section_number}</p>
                    <h3 className="text-xl font-serif text-astro-gold">{section.section_title}</h3>
                </div>
                 <svg
                    className={`w-6 h-6 text-astro-gold transition-transform duration-300 ${isExpanded ? 'transform rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
            </button>
            {isExpanded && (
                <div className="py-2 pl-4">
                    {section.chapters.map(chapter => (
                        <div key={chapter.chapter_number} className="my-2">
                             <button onClick={() => toggleChapter(chapter.chapter_number)} className="w-full text-left p-3 rounded-lg hover:bg-astro-dark/40 text-astro-light">
                                <span className="font-bold mr-2">Chapter {chapter.chapter_number}:</span> {chapter.chapter_title}
                             </button>
                             {activeChapter === chapter.chapter_number && <ChapterContent chapter={chapter} />}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}


const LibraryView: React.FC = () => {
    return (
        <div className="space-y-6">
             <div className="bg-astro-dark/50 backdrop-blur-sm p-6 rounded-lg border border-astro-gold/20 shadow-lg space-y-2">
                <h2 className="text-3xl font-serif font-bold text-astro-gold">{astrologyBook.book_title}</h2>
                <p className="text-astro-light/80">by Sepharial (1920 Edition)</p>
                <p className="text-sm text-astro-light/60 pt-2">A foundational text integrated into Stella's knowledge base. Explore the classic wisdom that guides her translations of the cosmos.</p>
            </div>

            <div>
                {astrologyBook.sections.map(section => (
                    <SectionItem key={section.section_number} section={section} />
                ))}
            </div>
        </div>
    )
};

export default LibraryView;
