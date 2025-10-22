import { OpenRouterMessage, OpenRouterAssistantMessage } from '../types';

const API_URL = "https://openrouter.ai/api/v1/chat/completions";

const callOpenRouter = async <T,>(body: object, apiKey: string): Promise<T> => {
    if (!apiKey) {
        throw new Error("OpenRouter API key is not provided. Please add it in the settings.");
    }

    const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'X-Title': 'The Daily Stars',
        },
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        const errorData = await response.text();
        console.error("OpenRouter API Error:", errorData);
        throw new Error(`API request failed with status ${response.status}: ${errorData}`);
    }

    return response.json() as Promise<T>;
};

type OpenRouterResponse = {
    choices: { message: OpenRouterAssistantMessage }[];
};

export const generateText = async (model: string, messages: OpenRouterMessage[], apiKey: string): Promise<string> => {
    try {
        const response = await callOpenRouter<OpenRouterResponse>({ model, messages }, apiKey);
        return response.choices[0].message.content || "";
    } catch (error) {
        console.error("Error generating text:", error);
        return `Error: Could not generate text. ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
};

export const generateImage = async (model: string, prompt: string, aspectRatio: string, apiKey: string): Promise<string> => {
    try {
        const body = {
            model,
            messages: [{ role: 'user', content: prompt }],
            modalities: ['image', 'text'],
            image_config: { aspect_ratio: aspectRatio }
        };
        const response = await callOpenRouter<OpenRouterResponse>(body, apiKey);
        const images = response.choices[0].message.images;
        if (images && images.length > 0) {
            return images[0].image_url.url;
        }
        return "";
    } catch (error) {
        console.error("Error generating image:", error);
        return `Error: Could not generate image. ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
};