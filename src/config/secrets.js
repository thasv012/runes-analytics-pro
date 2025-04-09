// src/config/secrets.js

// IMPORTANT: DO NOT commit real API keys directly into your repository.
// Use environment variables or a secure configuration management system.

// Example using environment variables (suitable for Node.js or build environments like Vite/Next.js)
// In a browser-only context without a build step, you might need to hardcode them (less secure)
// or use a backend proxy to handle API keys.

// Vite/Modern JS (using import.meta.env)
// Make sure to define these in your .env file (e.g., VITE_GENIIDATA_API_KEY=your_key)
const getEnvVar = (key, defaultValue = null) => {
    // Check import.meta.env first (Vite, etc.)
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
        return import.meta.env[key];
    }
    // Fallback for process.env (Node.js, some bundlers)
    if (typeof process !== 'undefined' && process.env && process.env[key]) {
        return process.env[key];
    }
    // Warning if not found and no default
    if (!defaultValue) {
         console.warn(`[Secrets] Environment variable ${key} not found. Using default: ${defaultValue}`);
    }
    return defaultValue;
};

export const Secrets = {
    GENIIDATA_KEY: import.meta.env.VITE_GENIIDATA_KEY || '',
    OKX_KEY: import.meta.env.VITE_OKX_KEY || '',
    MAGICEDEN_KEY: import.meta.env.VITE_MAGICEDEN_KEY || '',
    // Add other keys like Ordiscan if needed
    // ORDISCAN_KEY: import.meta.env.VITE_ORDISCAN_KEY || '', 
};

// Log loaded keys (optional, for debugging only - avoid in production)
// console.log("[Secrets] Loaded API Keys:", Secrets);

export default Secrets; 