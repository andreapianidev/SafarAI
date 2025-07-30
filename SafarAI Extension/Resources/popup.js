// SafarAI Popup Script
// Complete chatbot interface in popup

class SafarAIPopup {
    constructor() {
        this.apiKey = null;
        this.currentPageContent = '';
        this.isLoading = false;
        this.currentAbortController = null;
        this.conversationHistory = [];
        this.currentLanguage = 'it'; // Default to Italian
        
        this.initializeTranslations();
        this.initializeElements();
        this.updateInterface(); // Initialize interface with default language
        this.bindEvents();
        this.loadApiKey();
        this.loadConversationHistory();
        this.checkApiKeyStatus();
    }
    
    initializeTranslations() {
        this.translations = {
            it: {
                // Interface elements
                apiKeyPlaceholder: 'Inserisci la chiave API DeepSeek',
                saveButton: 'Salva',
                sendButton: 'Invia',
                messagePlaceholder: 'Fammi qualsiasi domanda su questa pagina...',
                thinkingText: 'Sto pensando...',
                readyStatus: 'Pronto',
                
                // Status messages
                extractingContent: 'Estrazione contenuto in corso...',
                readyLimited: 'Pronto (limitato)',
                contentExtractionFailed: 'Estrazione contenuto fallita',
                apiKeySaved: 'Chiave API salvata',
                errorSavingApiKey: 'Errore nel salvare la chiave API',
                chatCleared: 'Chat cancellata',
                thinking: 'Sto pensando...',
                
                // Error messages
                errorProcessingRequest: 'Scusa, ho riscontrato un errore nell\'elaborazione della tua richiesta. Riprova.',
                unableToExtract: 'Impossibile estrarre il contenuto della pagina. Puoi comunque fare domande generali.',
                systemPageError: 'Questa pagina non può essere analizzata (pagina di sistema o estensione).',
                extractionError: 'Errore nell\'estrazione del contenuto: ',
                noContentAvailable: 'Nessun contenuto disponibile',
                
                // Content extraction failed message
                extractionFailedMessage: '⚠️ **Estrazione contenuto fallita**\n\nNon sono riuscito ad analizzare il contenuto di questa pagina. Prova a:\n\n• **Ricaricare la pagina** e riaprire SafarAI\n• Assicurarti che la pagina sia completamente caricata\n• Verificare che non si tratti di una pagina protetta\n\nPuoi comunque farmi domande generali!',
                
                // Commands and help
                commandsTitle: '🤖 **Comandi SafarAI:**',
                clearCommand: '• **/clear** o **/cancella** - Cancella cronologia chat',
                helpCommand: '• **/help** o **/aiuto** - Mostra questo messaggio di aiuto',
                statusCommand: '• **/status** o **/stato** - Mostra stato attuale',
                tipsTitle: '💡 **Suggerimenti:**',
                tip1: '• Posso analizzare il contenuto della pagina web corrente',
                tip2: '• Fammi domande su quello che stai leggendo',
                tip3: '• Posso aiutarti con riassunti, spiegazioni e altro!',
                
                // Status display
                statusTitle: '📊 **Stato Attuale:**',
                apiKeyStatus: 'Chiave API',
                pageContentStatus: 'Contenuto Pagina',
                extensionStatus: 'Estensione',
                connected: 'Connessa',
                notSet: 'Non impostata',
                loaded: 'Caricato',
                notAvailable: 'Non disponibile',
                active: 'Attiva',
                debugInfo: '💡 **Info Debug:**',
                pagePreview: 'Anteprima contenuto pagina',
                none: 'Nessuno',
                
                // Share messages
                noConversationToShare: '❌ Nessuna conversazione da condividere',
                conversationCopied: '✅ Conversazione copiata negli appunti!',
                shareError: '❌ Errore durante la condivisione',
                conversationTitle: '🤖 Conversazione SafarAI',
                userLabel: '👤 Utente',
                assistantLabel: '🤖 SafarAI',
                
                // Generation stopped
                generationStopped: '⏹️ Generazione interrotta dall\'utente'
            },
            en: {
                // Interface elements
                apiKeyPlaceholder: 'Enter DeepSeek API Key',
                saveButton: 'Save',
                sendButton: 'Send',
                messagePlaceholder: 'Ask me anything about this page...',
                thinkingText: 'Thinking...',
                readyStatus: 'Ready',
                
                // Status messages
                extractingContent: 'Extracting page content...',
                readyLimited: 'Ready (limited)',
                contentExtractionFailed: 'Content extraction failed',
                apiKeySaved: 'API key saved',
                errorSavingApiKey: 'Error saving API key',
                chatCleared: 'Chat cleared',
                thinking: 'Thinking...',
                
                // Error messages
                errorProcessingRequest: 'Sorry, I encountered an error processing your request. Please try again.',
                unableToExtract: 'Unable to extract page content. You can still ask general questions.',
                systemPageError: 'This page cannot be analyzed (system page or extension page).',
                extractionError: 'Error extracting page content: ',
                noContentAvailable: 'No content available',
                
                // Content extraction failed message
                extractionFailedMessage: '⚠️ **Content Extraction Failed**\n\nI couldn\'t analyze the content of this page. Try to:\n\n• **Reload the page** and reopen SafarAI\n• Make sure the page is fully loaded\n• Verify it\'s not a protected page\n\nYou can still ask me general questions!',
                
                // Commands and help
                commandsTitle: '🤖 **SafarAI Commands:**',
                clearCommand: '• **/clear** - Clear chat history',
                helpCommand: '• **/help** - Show this help message',
                statusCommand: '• **/status** - Show current status',
                tipsTitle: '💡 **Tips:**',
                tip1: '• I can analyze the current webpage content',
                tip2: '• Ask me questions about what you\'re reading',
                tip3: '• I can help with summaries, explanations, and more!',
                
                // Status display
                statusTitle: '📊 **Current Status:**',
                apiKeyStatus: 'API Key',
                pageContentStatus: 'Page Content',
                extensionStatus: 'Extension',
                connected: 'Connected',
                notSet: 'Not set',
                loaded: 'Loaded',
                notAvailable: 'Not available',
                active: 'Active',
                debugInfo: '💡 **Debug Info:**',
                pagePreview: 'Current page content preview',
                none: 'None',
                
                // Share messages
                noConversationToShare: '❌ No conversation to share',
                conversationCopied: '✅ Conversation copied to clipboard!',
                shareError: '❌ Error during sharing',
                conversationTitle: '🤖 SafarAI Conversation',
                userLabel: '👤 User',
                assistantLabel: '🤖 SafarAI',
                
                // Generation stopped
                generationStopped: '⏹️ Generation stopped by user'
            }
        };
    }
    
    initializeElements() {
        this.elements = {
            apiKeySection: document.getElementById('apiKeySection'),
            apiKeyInput: document.getElementById('apiKeyInput'),
            saveApiKeyBtn: document.getElementById('saveApiKey'),
            chatContainer: document.getElementById('chatContainer'),
            messages: document.getElementById('messages'),
            messageInput: document.getElementById('messageInput'),
            sendButton: document.getElementById('sendButton'),
            stopButton: document.getElementById('stopButton'),
            shareButton: document.getElementById('shareButton'),
            loading: document.getElementById('loading'),
            status: document.getElementById('status')
        };
    }
    
    t(key) {
        return this.translations[this.currentLanguage][key] || key;
    }
    
    setLanguage(lang) {
        this.currentLanguage = lang;
        this.updateInterface();
    }
    
    updateInterface() {
        // Update interface elements
        this.elements.apiKeyInput.placeholder = this.t('apiKeyPlaceholder');
        this.elements.saveApiKeyBtn.textContent = this.t('saveButton');
        this.elements.sendButton.textContent = this.t('sendButton');
        this.elements.messageInput.placeholder = this.t('messagePlaceholder');
        
        // Update loading text
        const loadingSpan = this.elements.loading.querySelector('span');
        if (loadingSpan) {
            loadingSpan.textContent = this.t('thinkingText');
        }
        
        // Update status if it's showing ready
        if (this.elements.status.textContent === 'Pronto' || this.elements.status.textContent === 'Ready') {
            this.elements.status.textContent = this.t('readyStatus');
        }
    }
    
    bindEvents() {
        this.elements.saveApiKeyBtn.addEventListener('click', () => this.saveApiKey());
        this.elements.sendButton.addEventListener('click', () => this.sendMessage());
        this.elements.stopButton.addEventListener('click', () => this.stopGeneration());
        this.elements.shareButton.addEventListener('click', () => this.shareConversation());
        this.elements.messageInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        
        // Auto-resize textarea
        this.elements.messageInput.addEventListener('input', () => {
            this.elements.messageInput.style.height = 'auto';
            this.elements.messageInput.style.height = this.elements.messageInput.scrollHeight + 'px';
        });
    }
    
    async loadApiKey() {
        try {
            const result = await chrome.storage.local.get(['deepseekApiKey']);
            if (result.deepseekApiKey) {
                this.apiKey = result.deepseekApiKey;
                this.elements.apiKeyInput.value = '••••••••••••••••';
            } else {
                // Development: Check if there's a default API key
                const defaultKey = 'sk-aab15da3b3f74a189bb73a75dc433f92';
                if (defaultKey && defaultKey.startsWith('sk-')) {
                    this.apiKey = defaultKey;
                    this.elements.apiKeyInput.value = '••••••••••••••••';
                    // Optionally save to storage for persistence
                    await chrome.storage.local.set({ deepseekApiKey: defaultKey });
                }
            }
            // Always check API key status after loading
            this.checkApiKeyStatus();
        } catch (error) {
            console.error('Error loading API key:', error);
        }
    }
    
    async saveApiKey() {
        const apiKey = this.elements.apiKeyInput.value.trim();
        if (!apiKey || apiKey === '••••••••••••••••') return;
        
        try {
            await chrome.storage.local.set({ deepseekApiKey: apiKey });
            this.apiKey = apiKey;
            this.elements.apiKeyInput.value = '••••••••••••••••';
            this.checkApiKeyStatus();
            this.updateStatus(this.t('apiKeySaved'), 'success');
        } catch (error) {
            console.error('Error saving API key:', error);
            this.updateStatus(this.t('errorSavingApiKey'), 'error');
        }
    }
    
    checkApiKeyStatus() {
        if (this.apiKey) {
            this.elements.apiKeySection.style.display = 'none';
            this.elements.chatContainer.style.display = 'flex';
            this.elements.shareButton.style.display = 'flex';
            this.extractPageContent();
        } else {
            this.elements.apiKeySection.style.display = 'flex';
            this.elements.chatContainer.style.display = 'none';
            this.elements.shareButton.style.display = 'none';
        }
    }
    
    async loadConversationHistory() {
        try {
            const result = await chrome.storage.local.get(['conversationHistory']);
            if (result.conversationHistory) {
                this.conversationHistory = result.conversationHistory;
                this.restoreMessages();
            }
        } catch (error) {
            console.error('Error loading conversation history:', error);
        }
    }
    
    async saveConversationHistory() {
        try {
            await chrome.storage.local.set({ conversationHistory: this.conversationHistory });
        } catch (error) {
            console.error('Error saving conversation history:', error);
        }
    }
    
    restoreMessages() {
        this.elements.messages.innerHTML = '';
        this.conversationHistory.forEach(message => {
            this.addMessageToDOM(message.content, message.role, false);
        });
    }
    
    async extractPageContent() {
        try {
            this.updateStatus(this.t('extractingContent'), 'loading');
            
            // Get active tab
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            if (!tab) {
                throw new Error('No active tab found');
            }
            
            // Check if it's a valid web page
            if (!tab.url || tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://') || tab.url.startsWith('moz-extension://')) {
                this.currentPageContent = this.t('systemPageError');
                this.updateStatus(this.t('readyLimited'), 'success');
                return;
            }
            
            // Try to get cached content from background script first
            try {
                const response = await chrome.runtime.sendMessage({ action: 'getPageContent' });
                
                if (response && response.success && response.content && response.content.content) {
                    this.currentPageContent = this.formatPageContent(response.content);
                    this.updateStatus(this.t('readyStatus'), 'success');
                    return;
                }
            } catch (bgError) {
                console.log('Script di background non disponibile, provo estrazione diretta');
            }
            
            // Fallback: Send message to content script
            try {
                const contentResponse = await chrome.tabs.sendMessage(tab.id, { action: 'extractPageContent' });
                
                if (contentResponse && contentResponse.success && contentResponse.content) {
                    this.currentPageContent = this.formatPageContent(contentResponse.content);
                    this.updateStatus(this.t('readyStatus'), 'success');
                    return;
                }
            } catch (contentError) {
                console.log('Content script non risponde, provo executeScript');
            }
            
            // Final fallback: Execute script directly
            const result = await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                function: this.extractPageContentScript
            });
            
            if (result && result[0] && result[0].result) {
                this.currentPageContent = result[0].result;
                this.updateStatus(this.t('readyStatus'), 'success');
            } else {
                throw new Error(this.t('extractionError').replace(': ', ''));
            }
            
        } catch (error) {
            console.error('Error extracting page content:', error);
            this.updateStatus(this.t('contentExtractionFailed'), 'error');
            this.currentPageContent = this.t('unableToExtract');
            
            // Show reload suggestion message in chat
            this.addMessage(this.t('extractionFailedMessage'), 'assistant');
        }
    }
    
    extractPageContentScript() {
        try {
            // Create a clone to avoid modifying the original document
            const docClone = document.cloneNode(true);
            
            // Remove unwanted elements
            const unwantedSelectors = [
                'script', 'style', 'noscript', 'iframe', 'embed', 'object',
                'nav', 'header', 'footer', 'aside', '.sidebar', '.menu',
                '.ad', '.advertisement', '.ads', '.popup', '.modal',
                '.cookie-banner', '.newsletter', '.social-share',
                '[role="banner"]', '[role="navigation"]', '[role="complementary"]'
            ];
            
            unwantedSelectors.forEach(selector => {
                const elements = docClone.querySelectorAll(selector);
                elements.forEach(el => el.remove());
            });
            
            // Try to find main content areas in order of preference
            const contentSelectors = [
                'main',
                'article',
                '[role="main"]',
                '.main-content',
                '.content',
                '.post-content',
                '.entry-content',
                '.article-content',
                '#content',
                '#main',
                'body'
            ];
            
            let contentElement = null;
            for (const selector of contentSelectors) {
                contentElement = docClone.querySelector(selector);
                if (contentElement && contentElement.textContent.trim().length > 100) {
                    break;
                }
            }
            
            if (!contentElement) {
                contentElement = docClone.body || docClone.documentElement;
            }
            
            // Extract text content
            let content = contentElement.textContent || contentElement.innerText || '';
            
            // Clean up the content
            content = content
                .replace(/\s+/g, ' ')           // Replace multiple whitespace with single space
                .replace(/\n\s*\n\s*\n/g, '\n\n') // Remove excessive line breaks
                .replace(/^\s+|\s+$/g, '')     // Trim whitespace
                .replace(/\t/g, ' ');          // Replace tabs with spaces
            
            // Limit content length to avoid API limits
            if (content.length > 8000) {
                content = content.substring(0, 8000) + '\n\n[Content truncated...]';
            }
            
            // Add page metadata
            const pageInfo = {
                title: document.title || '',
                url: window.location.href,
                description: document.querySelector('meta[name="description"]')?.content || '',
                content: content,
                extractedAt: new Date().toISOString()
            };
            
            return pageInfo;
            
        } catch (error) {
            console.error('Error in extractPageContentScript:', error);
            return {
                title: document.title || '',
                url: window.location.href,
                content: this.t('extractionError') + error.message,
                extractedAt: new Date().toISOString()
            };
        }
    }
    
    async sendMessage() {
        const message = this.elements.messageInput.value.trim();
        if (!message || this.isLoading) return;
        
        // Detect and set language based on user input
        const detectedLang = this.detectLanguage(message);
        if (detectedLang !== this.currentLanguage) {
            this.setLanguage(detectedLang);
        }
        
        // Check for special commands
        if (this.handleSpecialCommands(message)) {
            this.elements.messageInput.value = '';
            this.elements.messageInput.style.height = 'auto';
            return;
        }
        
        this.elements.messageInput.value = '';
        this.elements.messageInput.style.height = 'auto';
        
        // Add user message to chat
        this.addMessage(message, 'user');
        
        // Show typing indicator and stop button
        this.showTypingIndicator();
        this.setLoadingState(true);
        
        try {
            const response = await this.callDeepSeekAPI(message);
            this.hideTypingIndicator();
            if (response) {
                this.addMessage(response, 'assistant');
            }
        } catch (error) {
            this.hideTypingIndicator();
            if (error.name === 'AbortError') {
                console.log('Request was aborted');
            } else {
                console.error('Error calling API:', error);
                this.addMessage(this.t('errorProcessingRequest'), 'assistant');
            }
        } finally {
            this.setLoadingState(false);
            this.currentAbortController = null;
        }
    }
    
    handleSpecialCommands(message) {
        const command = message.toLowerCase().trim();
        
        switch (command) {
            case '/clear':
            case '/cancella':
                this.clearChat();
                return true;
            case '/help':
            case '/aiuto':
                this.showHelp();
                return true;
            case '/status':
            case '/stato':
                this.showStatus();
                return true;
            default:
                return false;
        }
    }
    
    clearChat() {
        this.elements.messages.innerHTML = '';
        this.conversationHistory = [];
        this.saveConversationHistory();
        this.updateStatus(this.t('chatCleared'), 'success');
        setTimeout(() => {
            this.updateStatus(this.t('readyStatus'), 'success');
        }, 2000);
    }
    
    stopGeneration() {
        if (this.currentAbortController) {
            this.currentAbortController.abort();
            this.currentAbortController = null;
        }
        this.hideTypingIndicator();
        this.setLoadingState(false);
        this.addMessage(this.t('generationStopped'), 'assistant');
    }
    
    async shareConversation() {
        if (this.conversationHistory.length === 0) {
            this.addMessage(this.t('noConversationToShare'), 'assistant');
            return;
        }
        
        const conversationText = this.conversationHistory
            .map(msg => `${msg.role === 'user' ? this.t('userLabel') : this.t('assistantLabel')}: ${msg.content}`)
            .join('\n\n');
        
        const shareText = `${this.t('conversationTitle')}\n\n${conversationText}`;
        
        try {
            if (navigator.share) {
                await navigator.share({
                    title: 'Conversazione SafarAI',
                    text: shareText
                });
            } else {
                await navigator.clipboard.writeText(shareText);
                this.addMessage(this.t('conversationCopied'), 'assistant');
            }
        } catch (error) {
            console.error('Error sharing conversation:', error);
            this.addMessage(this.t('shareError'), 'assistant');
        }
    }
    
    showHelp() {
        const helpText = `${this.t('commandsTitle')}

${this.t('clearCommand')}
${this.t('helpCommand')}
${this.t('statusCommand')}

${this.t('tipsTitle')}
${this.t('tip1')}
${this.t('tip2')}
${this.t('tip3')}`;
        this.addMessage(helpText, 'assistant');
    }
    
    showStatus() {
        const hasApiKey = !!this.apiKey;
        const hasPageContent = !!this.currentPageContent && this.currentPageContent !== this.t('unableToExtract');
        const contentLength = this.currentPageContent ? this.currentPageContent.length : 0;
        
        const statusText = `${this.t('statusTitle')}

• ${this.t('apiKeyStatus')}: ${hasApiKey ? '✅ ' + this.t('connected') : '❌ ' + this.t('notSet')}
• ${this.t('pageContentStatus')}: ${hasPageContent ? `✅ ${this.t('loaded')} (${contentLength} ${this.currentLanguage === 'it' ? 'caratteri' : 'chars'})` : '❌ ' + this.t('notAvailable')}
• ${this.t('extensionStatus')}: ✅ ${this.t('active')}

${this.t('debugInfo')}
• ${this.t('pagePreview')}: ${this.currentPageContent ? this.currentPageContent.substring(0, 100) + '...' : this.t('none')}`;
        this.addMessage(statusText, 'assistant');
    }
    
    formatPageContent(pageData) {
        if (typeof pageData === 'string') {
            return pageData;
        }
        
        if (pageData && typeof pageData === 'object') {
            let formatted = '';
            if (pageData.title) formatted += `Title: ${pageData.title}\n`;
            if (pageData.url) formatted += `URL: ${pageData.url}\n`;
            if (pageData.description) formatted += `Description: ${pageData.description}\n`;
            if (pageData.content) formatted += `\nContent:\n${pageData.content}`;
            return formatted || this.t('noContentAvailable');
        }
        
        return this.t('noContentAvailable');
    }
    
    detectLanguage(text) {
        // Simple language detection based on common words and patterns
        const italianWords = ['il', 'la', 'di', 'che', 'e', 'a', 'un', 'per', 'in', 'con', 'come', 'del', 'della', 'sono', 'cosa', 'può', 'puoi', 'questo', 'questa', 'aiuto', 'grazie', 'prego', 'bene', 'molto', 'anche', 'essere', 'fare', 'dire', 'andare', 'vedere'];
        const englishWords = ['the', 'is', 'at', 'which', 'on', 'and', 'a', 'to', 'an', 'as', 'are', 'was', 'for', 'with', 'his', 'they', 'i', 'that', 'it', 'have', 'from', 'or', 'one', 'had', 'by', 'word', 'but', 'not', 'what', 'all', 'were', 'we', 'when', 'your', 'can', 'said', 'there', 'each', 'which', 'she', 'do', 'how', 'their', 'if', 'will', 'up', 'other', 'about', 'out', 'many', 'then', 'them', 'these', 'so', 'some', 'her', 'would', 'make', 'like', 'into', 'him', 'has', 'two', 'more', 'go', 'no', 'way', 'could', 'my', 'than', 'first', 'been', 'call', 'who', 'its', 'now', 'find', 'long', 'down', 'day', 'did', 'get', 'come', 'made', 'may', 'part'];
        
        const words = text.toLowerCase().split(/\\s+/);
        let italianScore = 0;
        let englishScore = 0;
        
        words.forEach(word => {
            if (italianWords.includes(word)) italianScore++;
            if (englishWords.includes(word)) englishScore++;
        });
        
        // Default to Italian if scores are equal or low
        return italianScore >= englishScore ? 'it' : 'en';
    }

    async callDeepSeekAPI(userMessage) {
        const hasValidContent = this.currentPageContent && 
                               this.currentPageContent !== this.t('unableToExtract') &&
                               this.currentPageContent !== this.t('systemPageError');
        
        // Detect user's language
        const userLanguage = this.detectLanguage(userMessage);
        
        const systemPrompt = hasValidContent ? 
            (userLanguage === 'it' ? 
                `Sei SafarAI, un assistente AI utile integrato in Safari. Hai accesso al contenuto della pagina web corrente. Rispondi alle domande sul contenuto della pagina, riassumi informazioni o aiuta con qualsiasi richiesta dell'utente.

Contenuto della pagina corrente:
${this.currentPageContent}

Fornisci risposte utili e accurate basate sul contenuto della pagina quando pertinente. Se la domanda non è correlata al contenuto della pagina, puoi comunque fornire assistenza generale. Rispondi sempre in italiano.` :
                `You are SafarAI, a helpful AI assistant integrated into Safari. You have access to the content of the current web page. Answer questions about the page content, summarize information, or help with any queries the user has.

Current page content:
${this.currentPageContent}

Please provide helpful, accurate responses based on the page content when relevant. If the question is not related to the page content, you can still provide general assistance. Always respond in English.`) :
            (userLanguage === 'it' ? 
                `Sei SafarAI, un assistente AI utile integrato in Safari. Il contenuto della pagina corrente non è disponibile per l'analisi, ma puoi comunque fornire assistenza generale e rispondere alle domande al meglio delle tue capacità. Rispondi sempre in italiano.` :
                `You are SafarAI, a helpful AI assistant integrated into Safari. The current page content is not available for analysis, but you can still provide general assistance and answer questions to the best of your ability. Always respond in English.`);

        // Create abort controller for this request
        this.currentAbortController = new AbortController();
        
        const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`
            },
            body: JSON.stringify({
                model: 'deepseek-chat',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userMessage }
                ],
                max_tokens: 2000,
                temperature: 0.7
            }),
            signal: this.currentAbortController.signal
        });
        
        if (!response.ok) {
            throw new Error(`API request failed: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (!data.choices || !data.choices[0] || !data.choices[0].message) {
            throw new Error('Invalid API response format');
        }
        
        return data.choices[0].message.content;
    }
    
    addMessage(content, role) {
        // Save to conversation history
        this.conversationHistory.push({ content, role, timestamp: Date.now() });
        this.saveConversationHistory();
        
        this.addMessageToDOM(content, role, true);
    }
    
    addMessageToDOM(content, role, withTyping = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${role}`;
        
        if (role === 'assistant') {
            // Simple markdown-like formatting
            const formattedContent = content
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/\*(.*?)\*/g, '<em>$1</em>')
                .replace(/`(.*?)`/g, '<code>$1</code>')
                .replace(/```([\s\S]*?)```/g, '<pre>$1</pre>')
                .replace(/\n/g, '<br>');
            
            this.elements.messages.appendChild(messageDiv);
            
            if (withTyping) {
                // Add typing effect for new assistant messages
                this.typeMessage(messageDiv, formattedContent);
            } else {
                // No typing effect for restored messages
                messageDiv.innerHTML = formattedContent;
            }
        } else {
            messageDiv.textContent = content;
            this.elements.messages.appendChild(messageDiv);
        }
        
        this.elements.messages.scrollTop = this.elements.messages.scrollHeight;
    }
    
    typeMessage(element, htmlContent, speed = 30) {
        element.innerHTML = '';
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = htmlContent;
        const text = tempDiv.textContent || tempDiv.innerText || '';
        
        let i = 0;
        const timer = setInterval(() => {
            if (i < text.length) {
                element.textContent += text.charAt(i);
                i++;
                this.elements.messages.scrollTop = this.elements.messages.scrollHeight;
            } else {
                clearInterval(timer);
                // Apply HTML formatting after typing is complete
                element.innerHTML = htmlContent;
            }
        }, speed);
    }
    
    showTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'typing-indicator';
        typingDiv.id = 'typing-indicator';
        
        for (let i = 0; i < 3; i++) {
            const dot = document.createElement('div');
            dot.className = 'typing-dot';
            typingDiv.appendChild(dot);
        }
        
        this.elements.messages.appendChild(typingDiv);
        this.elements.messages.scrollTop = this.elements.messages.scrollHeight;
    }
    
    hideTypingIndicator() {
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }
    
    setLoadingState(loading) {
        this.isLoading = loading;
        this.elements.sendButton.disabled = loading;
        this.elements.sendButton.style.display = loading ? 'none' : 'flex';
        this.elements.stopButton.style.display = loading ? 'flex' : 'none';
        this.elements.loading.style.display = loading ? 'flex' : 'none';
        
        if (loading) {
            this.updateStatus(this.t('thinking'), 'loading');
        } else {
            this.updateStatus(this.t('readyStatus'), 'success');
        }
    }
    
    updateStatus(message, type = 'info') {
        this.elements.status.textContent = message;
        this.elements.status.className = `status ${type}`;
    }
}

// Initialize the popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new SafarAIPopup();
});