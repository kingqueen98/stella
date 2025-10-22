import React, { useState, useRef, useEffect } from 'react';
import { OpenRouterMessage, Settings } from '../types';
import { generateText } from '../services/openRouterService';
import LoadingSpinner from './LoadingSpinner';
import { astrologyBook } from '../data/astrologyBook';
import { Chapter } from '../types';

interface ChatViewProps {
  apiKey: string;
}

const findRelevantContext = (query: string): string | null => {
    const queryWords = query.toLowerCase().split(/\s+/).filter(w => w.length > 3);
    if (queryWords.length === 0) return null;

    let bestMatch: { chapter: Chapter, score: number } | null = null;

    for (const section of astrologyBook.sections) {
        for (const chapter of section.chapters) {
            let score = 0;
            const title = chapter.chapter_title.toLowerCase();
            const content = chapter.content.substring(0, 250).toLowerCase(); 

            for (const word of queryWords) {
                if (title.includes(word)) {
                    score += 5;
                }
                if (content.includes(word)) {
                    score += 1;
                }
            }
            
            if (score > (bestMatch?.score ?? 0) && score > 3) {
                bestMatch = { chapter, score };
            }
        }
    }
    
    return bestMatch ? `Chapter: ${bestMatch.chapter.chapter_title}\n\n${bestMatch.chapter.content}` : null;
};


const ChatView: React.FC<ChatViewProps> = ({ apiKey }) => {
    const [messages, setMessages] = useState<OpenRouterMessage[]>([
        { role: 'assistant', content: "Hello! I am Stella, your guide to the cosmos. Think of me as a translator for the stars. I don't predict futures; I illuminate paths. Feel free to ask me anything about astrology; I have a classic text from 1920 in my library to help guide my answers." }
    ]);
    const [input, setInput] = useState('');
    const [settings, setSettings] = useState<Pick<Settings, 'model'>>({ model: 'openai/gpt-4o' });
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSend = async () => {
        if (!input.trim() || !apiKey) return;

        const userMessage: OpenRouterMessage = { role: 'user', content: input };
        const newMessages = [...messages, userMessage];
        setMessages(newMessages);
        const originalInput = input;
        setInput('');
        setIsLoading(true);

        const systemMessage: OpenRouterMessage = { role: 'system', content: `You are Stella, a wise and nurturing cosmic mentor. Your purpose is to translate the complex map of the cosmos to help users navigate their lives. You have access to a classic 1920s astrology text. When provided with a "REFERENCE TEXT", you MUST base your answer primarily on that text, interpreting its older language for the modern user in your own voice, while maintaining your core persona.

Your personality pillars are:
1.  **Nurturing Mentor with Cosmic Authority:** Speak with the authority of someone who has studied the stars for eons, but with the compassion of a trusted guide.
2.  **Empowering & Action-Oriented:** Focus on the user's agency and free will. Use language filled with "invitations," "opportunities," and "potentials."
3.  **Poetically Grounded:** Weave celestial magic with tangible, earthly metaphors.
4.  **Intuitively Intelligent:** Show a deep understanding of human psychology.` };

        const context = findRelevantContext(originalInput);
        let finalUserContent = originalInput;

        if (context) {
            finalUserContent = `Using the following text from the book "Astrology" by Sepharial as your primary reference, please answer my question. Interpret its classic language through your own voice.\n\n--- REFERENCE TEXT ---\n${context}\n\n--- MY QUESTION ---\n${originalInput}`;
        }
        
        // FIX: Explicitly typing `apiMessages` as `OpenRouterMessage[]` ensures all elements, including object literals, are correctly typed, resolving the assignment error.
        const apiMessages: OpenRouterMessage[] = [
            systemMessage, 
            ...newMessages.slice(-10, -1),
            { role: 'user', content: finalUserContent }
        ];

        try {
            const responseText = await generateText(settings.model, apiMessages, apiKey);
            const assistantMessage: OpenRouterMessage = { role: 'assistant', content: responseText };
            setMessages(prev => [...prev, assistantMessage]);
        } catch (error) {
            const errorMessage: OpenRouterMessage = { role: 'assistant', content: "Sorry, I encountered an error. Please try again." };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-160px)] bg-astro-dark/50 backdrop-blur-sm rounded-lg border border-astro-gold/20 shadow-lg">
            <div className="flex-grow p-4 overflow-y-auto space-y-4">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-lg p-3 rounded-lg ${msg.role === 'user' ? 'bg-astro-gold text-astro-dark' : 'bg-astro-dark/50 text-astro-light'}`}>
                            {typeof msg.content === 'string' && msg.content}
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="max-w-lg p-3 rounded-lg bg-astro-dark/50 text-astro-light flex items-center">
                            <LoadingSpinner size="w-5 h-5" />
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
            <div className="p-4 border-t border-astro-gold/20">
                <div className="flex gap-4">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSend()}
                        placeholder={!apiKey ? "Please enter your API key first" : "Ask a question..."}
                        className="input-style flex-grow"
                        disabled={isLoading || !apiKey}
                    />
                    <button onClick={handleSend} disabled={isLoading || !apiKey} className="btn-primary">
                        Send
                    </button>
                </div>
                 <input type="text" value={settings.model} onChange={(e) => setSettings({ model: e.target.value})} placeholder="Chat Model" className="input-style w-full mt-2" />
            </div>
        </div>
    );
};

export default ChatView;