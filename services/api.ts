import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
// Fix: Added .ts extension to fix module resolution error.
// Fix: Import AIStrategySuggestion from types.ts to centralize type definitions.
import { MarketSentiment, BotStrategy, AIStrategySuggestion, MarketNews, NewsArticle } from "../types.ts";
// Fix: Added .ts extension to fix module resolution error.
// Fix: Imported the getBotStrategies function instead of the non-existent BOT_STRATEGIES constant.
import { getBotStrategies } from "../constants.ts";

// We need the strategy definitions to build the prompt. A dummy translator is sufficient
// as we will be using the language-agnostic `id` property for robustness.
const BOT_STRATEGIES = getBotStrategies(key => key);

const getAiClient = (): GoogleGenAI => {
    const apiKey = localStorage.getItem('geminiApiKey');
    if (!apiKey) {
        // Throw an error with a key that can be translated by the UI layer.
        throw new Error("API_KEY_NOT_CONFIGURED");
    }
    return new GoogleGenAI({ apiKey });
};


/**
 * Suggests a detailed, parameterized trading bot strategy using the Gemini API.
 * @param pair The trading pair (e.g., "BTC/USDT").
 * @returns An object containing the suggested strategy, its parameters, and the reasoning behind it.
 */
export const getAIStrategySuggestion = async (pair: string): Promise<AIStrategySuggestion> => {
    try {
        // Test error logging
        if (pair === 'DOGE/USDT') {
            throw new Error(`Simulated Error: DOGE strategy analysis failed due to extreme market volatility.`);
        }
        
        const ai = getAiClient();

        const strategyOptions = BOT_STRATEGIES.map(s => `"${s.id}"`).join(', ');
        const parameterDetails = BOT_STRATEGIES.map(s => `- For strategy ID "${s.id}", specify parameters: ${s.parameters.map(p => `'${p.id}'`).join(', ')}`).join('\n');
        
        // Fix: The variable 's' was out of scope in the original .reduce() call.
        // Refactored to a single .reduce() over BOT_STRATEGIES to ensure 's' (the strategy) is available
        // when constructing the parameter description.
        const parameterProperties = BOT_STRATEGIES.reduce((acc, s) => {
            s.parameters.forEach(param => {
                // Deduplicate parameters in case they are shared across strategies
                if (!acc[param.id]) {
                    acc[param.id] = {
                        type: param.type === 'number' ? Type.NUMBER : Type.STRING,
                        description: `Parameter '${param.id}' for strategy ${s.id}. Only include if chosen strategy is '${s.id}'.`
                    };
                }
            });
            return acc;
        }, {} as Record<string, { type: Type; description: string }>);


        const prompt = `
            Act as an expert quantitative trading analyst for the crypto market.
            Analyze the current market conditions for the trading pair ${pair} based on technical indicators (like RSI, MACD, Bollinger Bands) and overall market sentiment.
            
            Based on your analysis, recommend a trading bot strategy from the following available strategy IDs: [${strategyOptions}].
            
            Provide a detailed, parameterized configuration for the chosen strategy.
            ${parameterDetails}
            
            Also, provide a brief 'reasoning' for your choice (max 25 words).
            
            Return the result as a single, clean JSON object. The "name" key in the response MUST be one of the provided strategy IDs. The object should have the keys "name", "parameters", and "reasoning".
            Only include the relevant parameters for the chosen strategy inside the "parameters" object.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        name: { type: Type.STRING, description: `The ID of the strategy. Must be one of: [${strategyOptions}]` },
                        parameters: {
                            type: Type.OBJECT,
                            description: "An object containing the parameters for the chosen strategy. Should only contain keys relevant to the chosen 'name'.",
                            properties: parameterProperties,
                        },
                        reasoning: { type: Type.STRING, description: "A brief explanation for the strategy choice."}
                    },
                    required: ["name", "parameters", "reasoning"]
                }
            }
        });
        
        const jsonText = response.text.trim();
        const suggestionData = JSON.parse(jsonText);

        if (typeof suggestionData.name === 'string' && typeof suggestionData.parameters === 'object' && typeof suggestionData.reasoning === 'string') {
             return suggestionData as AIStrategySuggestion;
        }
       
        console.error("Parsed JSON does not match AIStrategySuggestion structure:", suggestionData);
        throw new Error("Failed to parse strategy suggestion from API.");

    } catch (error) {
        console.error("Error fetching AI strategy suggestion:", error);
        // Rethrow to be handled by the component
        throw error;
    }
};

/**
 * Analyzes and returns the market sentiment for a given crypto pair.
 * @param pair The trading pair (e.g., "BTC/USDT").
 * @returns A MarketSentiment object. Throws an error on failure.
 */
export const getMarketSentiment = async (pair: string): Promise<MarketSentiment> => {
    const ai = getAiClient();
    const prompt = `Analyze the current market sentiment for the crypto pair ${pair} based on recent price action, news, and social media trends. Provide your analysis as a JSON object with two keys: "score" (a number between -1.0 for very bearish and 1.0 for very bullish) and "summary" (a brief, one-sentence explanation of the sentiment, max 15 words).`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    score: {
                        type: Type.NUMBER,
                        description: "Sentiment score from -1.0 to 1.0"
                    },
                    summary: {
                        type: Type.STRING,
                        description: "A brief summary of the sentiment."
                    }
                },
                required: ["score", "summary"]
            }
        }
    });

    const jsonText = response.text.trim();
    const sentimentData = JSON.parse(jsonText);

    if (typeof sentimentData.score === 'number' && typeof sentimentData.summary === 'string') {
            return sentimentData as MarketSentiment;
    }
    
    console.error("Parsed JSON does not match MarketSentiment structure:", sentimentData);
    throw new Error("Failed to parse sentiment data from API.");
}

/**
 * Fetches recent news for a crypto pair using Google Search grounding.
 * @param pair The trading pair (e.g., "BTC/USDT").
 * @returns A MarketNews object. Throws an error on failure.
 */
export const getMarketNews = async (pair: string): Promise<MarketNews> => {
    const ai = getAiClient();
    const cryptoAsset = pair.split('/')[0]; // e.g., 'BTC' from 'BTC/USDT'
    const prompt = `Provide a brief one or two sentence summary of the latest significant news for ${cryptoAsset} from the last 24-48 hours. Also, list the key news articles that you found.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            tools: [{ googleSearch: {} }],
        },
    });

    const summary = response.text;
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    const articles: NewsArticle[] = groundingChunks
        .map((chunk: any) => {
            const url = chunk.web?.uri || '';
            if (!url) return null;

            let source = 'Unknown';
            try {
                source = new URL(url).hostname.replace(/^www\./, '');
            } catch (e) {
                // ignore invalid URLs
            }

            return {
                title: chunk.web?.title || 'Untitled Article',
                url,
                source,
            };
        })
        .filter((article): article is NewsArticle => article !== null && !!article.url)
        // Deduplicate articles based on URL
        .filter((article, index, self) => 
            index === self.findIndex((a) => a.url === article.url)
        );


    return { summary, articles };
};