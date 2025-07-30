// SafarAI Configuration Template
// Copy this file to config.js and fill in your values
// DO NOT commit config.js to version control

const SafarAIConfig = {
    // Development Configuration
    development: {
        apiKey: 'your-deepseek-api-key-here',
        apiUrl: 'https://api.deepseek.com/v1/chat/completions',
        debugMode: true,
        logLevel: 'info'
    },
    
    // Production Configuration
    production: {
        apiKey: '', // Leave empty - will be entered by user
        apiUrl: 'https://api.deepseek.com/v1/chat/completions',
        debugMode: false,
        logLevel: 'error'
    },
    
    // Default Settings
    defaults: {
        maxTokens: 2000,
        temperature: 0.7,
        model: 'deepseek-chat',
        contentMaxLength: 8000
    }
};

// Export configuration
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SafarAIConfig;
} else if (typeof window !== 'undefined') {
    window.SafarAIConfig = SafarAIConfig;
}