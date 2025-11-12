// This is a declaration file to provide type hints for the 'ccxt' library.
// In a real project, you would install this with 'npm install ccxt @types/ccxt'.
declare module 'ccxt' {
    export class Exchange {
        constructor(config?: any);
        fetchBalance(params?: any): Promise<any>;
        fetchMyTrades(symbol?: string, since?: number, limit?: number, params?: any): Promise<any[]>;
        // Add other methods as needed
    }

    export class binance extends Exchange {}
    export class coinbase extends Exchange {}
    export class kucoin extends Exchange {}
    
    export class AuthenticationError extends Error {}

    const ccxt: {
        binance: typeof binance;
        coinbase: typeof coinbase;
        kucoin: typeof kucoin;
        AuthenticationError: typeof AuthenticationError;
        // Add other exchanges
        [key: string]: typeof Exchange | any;
    };
    
    export default ccxt;
}
