/**
 * NOTE: This file provides a template for connecting to a REAL crypto exchange using the 'ccxt' library.
 *
 * --- CRITICAL INFORMATION FOR BROWSER-BASED USAGE ---
 * Direct API calls from a web browser to an exchange (like Binance) will fail due to the browser's
 * Same-Origin Policy (CORS), leading to a "fetch failed" error. To solve this, all API requests must
 * be routed through a proxy server. This implementation has been updated to use a proxy.
 *
 * --- '403 Forbidden' Error from Proxy ---
 * The public 'cors-anywhere' proxy used in this example requires temporary activation. If you see a
 * 403 error, it means you need to visit the proxy's landing page and click a button to request access.
 * 1. Go to: https://cors-anywhere.herokuapp.com/
 * 2. Click the button "Request temporary access to the demo server".
 * 3. Return to this app and try connecting again.
 *
 * For a real application, you MUST run your own secure proxy to protect your API keys.
 */
import ccxt, { AuthenticationError } from 'ccxt';
import { AccountBalance, Trade } from '../types.ts';

const getExchangeClient = (exchangeId: string, apiKey: string, apiSecret: string) => {
    // The 'ccxt' object is dynamically populated, so we check for property existence.
    if (!ccxt.hasOwnProperty(exchangeId)) {
        throw new Error(`The exchange '${exchangeId}' is not supported by the ccxt library.`);
    }

    const exchangeClass = ccxt[exchangeId];

    // --- CORS Proxy Configuration ---
    // A proxy is required for browser-based applications to bypass CORS restrictions.
    // IMPORTANT: The example URL below is for demonstration only and requires activation.
    const proxy = 'https://cors-anywhere.herokuapp.com/';

    const exchange = new exchangeClass({
        apiKey,
        secret: apiSecret,
        // The 'proxy' property tells ccxt to route all requests through this server.
        proxy: proxy,
        options: {
            'adjustForTimeDifference': true,
            'defaultType': 'spot', // Explicitly set to spot market to avoid futures/other API calls
            // New optimization: This prevents an initial call to fetch all currency data,
            // which can be slow and is often the source of CORS/proxy errors like the one
            // seen with Binance's /sapi/v1/capital/config/getall endpoint.
            'fetchCurrencies': false,
        }
    });

    return exchange;
};

export const getAccountBalance = async (exchangeId: string, apiKey: string, apiSecret: string): Promise<AccountBalance> => {
    const client = getExchangeClient(exchangeId, apiKey, apiSecret);
    try {
        const balance = await client.fetchBalance();
        
        // The balance object from ccxt is complex. We simplify it for our app's state.
        return {
            usdt: balance.free['USDT'] || 0,
            btc: balance.free['BTC'] || 0,
        };
    } catch (e) {
        const errorMessage = (e as Error).message;
        console.error(`[realExchangeApi] Failed to fetch balance for ${exchangeId}:`, e);

        // Check for geo-restriction error from exchanges like Binance
        if (errorMessage.includes('451') || errorMessage.toLowerCase().includes('restricted location')) {
            throw new Error("GEO_RESTRICTION_ERROR");
        }

        // Specific check for the cors-anywhere activation error
        if (errorMessage.includes('403') && (errorMessage.includes('corsdemo') || errorMessage.includes('Forbidden'))) {
            throw new Error("CORS_PROXY_ACTIVATION_REQUIRED");
        }
        
        if (e instanceof AuthenticationError) {
            throw new Error("Invalid API Key provided.");
        }
        // Use a generic error for other issues (network, etc.)
        throw new Error("Failed to fetch account balance. This may be due to network issues or CORS errors. Ensure a CORS proxy is configured if running in a browser.");
    }
};

export const getTrades = async (exchangeId: string, apiKey: string, apiSecret: string): Promise<Trade[]> => {
    const client = getExchangeClient(exchangeId, apiKey, apiSecret);
    try {
        // Fetch trades for the most common pair as an example. A real app might need to fetch for multiple pairs.
        const recentTrades = await client.fetchMyTrades('BTC/USDT', undefined, 50); // Fetch last 50 trades for BTC/USDT

        // Transform the data from the ccxt format to our application's Trade type
        return recentTrades.map((trade: any) => ({
            id: trade.id,
            botId: 'N/A (Real)', // Real trades don't originate from our local bots
            pair: trade.symbol,
            type: trade.side as 'buy' | 'sell',
            amount: trade.amount,
            price: trade.price,
            timestamp: new Date(trade.timestamp),
        })).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    } catch (e) {
        const errorMessage = (e as Error).message;
        console.error(`[realExchangeApi] Failed to fetch trades for ${exchangeId}:`, e);
        
        // Check for geo-restriction error from exchanges like Binance
        if (errorMessage.includes('451') || errorMessage.toLowerCase().includes('restricted location')) {
            throw new Error("GEO_RESTRICTION_ERROR");
        }
        
        // Specific check for the cors-anywhere activation error
        if (errorMessage.includes('403') && (errorMessage.includes('corsdemo') || errorMessage.includes('Forbidden'))) {
            throw new Error("CORS_PROXY_ACTIVATION_REQUIRED");
        }

        throw new Error("Failed to fetch recent trades. This may be due to network issues or CORS errors. Ensure a CORS proxy is configured if running in a browser.");
    }
};

// Note: getBots is not implemented here because exchanges don't have a concept of our local bots.
// The bot list would be managed locally, but their trades would come from getTrades.