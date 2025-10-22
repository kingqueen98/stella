import React, { useState } from 'react';
import { generateText, generateImage } from '../services/openRouterService';
import LoadingSpinner from './LoadingSpinner';
import { DEFAULT_IMAGE_MODELS } from '../constants';
import { GeneratedImageData } from '../types';

const ASPECT_RATIOS = ["1:1", "16:9", "9:16", "4:3", "3:4"];

interface ImageGenViewProps {
  apiKey: string;
  generatedImages: GeneratedImageData[];
  setGeneratedImages: React.Dispatch<React.SetStateAction<GeneratedImageData[]>>;
}

const ImageGenView: React.FC<ImageGenViewProps> = ({ apiKey, generatedImages, setGeneratedImages }) => {
    const [prompt, setPrompt] = useState('');
    const [model, setModel] = useState(DEFAULT_IMAGE_MODELS[0]);
    const [aspectRatio, setAspectRatio] = useState('1:1');
    const [isLoading, setIsLoading] = useState(false);
    const [isPromptLoading, setIsPromptLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGeneratePrompt = async () => {
        setIsPromptLoading(true);
        setError(null);
        const instruction = `I am Stella, a cosmic guide. I need an idea for a beautiful, mystical image. Please give me a short, vivid, and artistic image generation prompt based on an astrological or esoteric theme. Phrase it as if you are describing a vision you've just received from the cosmos.`;
        try {
            const newPrompt = await generateText('openai/gpt-4o', [{ role: 'user', content: instruction }], apiKey);
            setPrompt(newPrompt);
        } catch (e) {
            setError('Failed to generate a prompt.');
        }
        setIsPromptLoading(false);
    };

    const handleGenerateImage = async () => {
        if (!prompt) {
            setError("Please enter a prompt.");
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            const imageUrl = await generateImage(model, prompt, aspectRatio, apiKey);
            if (imageUrl.startsWith('Error:')) {
              throw new Error(imageUrl);
            }
            const newImage: GeneratedImageData = {
              id: `${Date.now()}-${Math.random()}`,
              url: imageUrl,
              prompt: prompt,
            };
            setGeneratedImages(prevImages => [newImage, ...prevImages]);
        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : "An unknown error occurred while generating the image.";
            setError(errorMessage);
        }
        setIsLoading(false);
    };
    
    const handleDownload = (imageUrl: string, imagePrompt: string) => {
        const link = document.createElement('a');
        link.href = imageUrl;
        const filename = imagePrompt.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '-').substring(0, 50) || 'the-daily-stars-image';
        link.download = `${filename}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };


    return (
        <div className="space-y-6">
            <div className="bg-astro-dark/50 backdrop-blur-sm p-6 rounded-lg border border-astro-gold/20 shadow-lg space-y-4">
                <h2 className="text-2xl font-serif font-bold text-astro-gold">Image Generation</h2>
                <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Enter your artistic vision..."
                    className="input-style w-full h-24"
                    disabled={isLoading || isPromptLoading}
                />
                <div className="flex flex-col sm:flex-row gap-4">
                    <button onClick={handleGeneratePrompt} disabled={isLoading || isPromptLoading || !apiKey} className="btn-secondary flex-1 flex items-center justify-center">
                        {isPromptLoading && <LoadingSpinner size="w-5 h-5 mr-2"/>}
                        Generate Prompt for Me
                    </button>
                    <button onClick={handleGenerateImage} disabled={isLoading || isPromptLoading || !apiKey} className="btn-primary flex-1 flex items-center justify-center">
                        {isLoading && <LoadingSpinner size="w-5 h-5 mr-2"/>}
                        Generate Image
                    </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="image-model-select" className="block text-sm font-medium text-astro-light/80 mb-1">Image Model</label>
                        <select 
                            id="image-model-select"
                            value={model} 
                            onChange={(e) => setModel(e.target.value)} 
                            disabled={isLoading}
                            className="input-style w-full"
                        >
                            {DEFAULT_IMAGE_MODELS.map(m => <option key={m} value={m}>{m}</option>)}
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
                    <div>
                        <label htmlFor="aspect-ratio-select" className="block text-sm font-medium text-astro-light/80 mb-1">Aspect Ratio</label>
                        <select 
                            id="aspect-ratio-select"
                            value={aspectRatio} 
                            onChange={(e) => setAspectRatio(e.target.value)} 
                            disabled={isLoading}
                            className="input-style w-full"
                        >
                            {ASPECT_RATIOS.map(ar => <option key={ar} value={ar}>{ar}</option>)}
                        </select>
                    </div>
                </div>
                {error && <p className="text-red-400 text-center">{error}</p>}
            </div>

            {isLoading && (
                <div className="bg-astro-dark/50 backdrop-blur-sm p-6 rounded-lg border border-astro-gold/20 shadow-lg flex justify-center items-center min-h-[300px]">
                    <LoadingSpinner size="w-12 h-12" />
                    <p className="ml-4 text-astro-light text-lg">Generating your masterpiece...</p>
                </div>
            )}

            {generatedImages.length > 0 && (
                <div className="space-y-6">
                    <h3 className="text-xl font-serif font-bold text-astro-gold">Generated Images</h3>
                    {generatedImages.map(image => (
                        <div key={image.id} className="bg-astro-dark/50 backdrop-blur-sm p-6 rounded-lg border border-astro-gold/20 shadow-lg">
                            <img src={image.url} alt={image.prompt} className="max-w-full rounded-lg shadow-2xl mx-auto" />
                            <div className="mt-4 flex flex-col md:flex-row justify-between items-center gap-4">
                                <p className="text-astro-light/80 text-sm italic text-center md:text-left">"{image.prompt}"</p>
                                <button 
                                    onClick={() => handleDownload(image.url, image.prompt)} 
                                    className="btn-secondary px-4 py-2 flex items-center gap-2"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                      <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                    Download
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const styles = `
    .btn-secondary {
        background-color: transparent;
        color: #F9DA82;
        border: 1px solid #F9DA82;
        font-weight: bold;
        padding: 0.75rem 2rem;
        border-radius: 9999px;
        transition: all 0.3s;
    }
    .btn-secondary:hover {
        background-color: rgb(249 218 130 / 0.1);
    }
    .btn-secondary:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
`;
export const ImageGenStyleInjector = () => <style>{styles}</style>;

export default ImageGenView;