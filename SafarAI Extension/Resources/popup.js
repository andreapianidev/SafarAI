// SafarAI Popup Script
// Complete chatbot interface in popup

class SafarAIPopup {
    constructor() {
        this.apiKey = null;
        this.currentPageContent = '';
        this.isLoading = false;
        
        this.initializeElements();
        this.bindEvents();
        this.loadApiKey();
        this.checkApiKeyStatus();
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
            loading: document.getElementById('loading'),
            status: document.getElementById('status')
        };
    }
    
    bindEvents() {
        this.elements.saveApiKeyBtn.addEventListener('click', () => this.saveApiKey());
        this.elements.sendButton.addEventListener('click', () => this.sendMessage());
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
            this.updateStatus('API key saved', 'success');
        } catch (error) {
            console.error('Error saving API key:', error);
            this.updateStatus('Error saving API key', 'error');
        }
    }
    
    checkApiKeyStatus() {
        if (this.apiKey) {
            this.elements.apiKeySection.style.display = 'none';
            this.elements.chatContainer.style.display = 'flex';
            this.extractPageContent();
        } else {
            this.elements.apiKeySection.style.display = 'flex';
            this.elements.chatContainer.style.display = 'none';
        }
    }
    
    async extractPageContent() {
        try {
            this.updateStatus('Extracting page content...', 'loading');
            
            // Get active tab
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            if (!tab) {
                throw new Error('No active tab found');
            }
            
            // Check if it's a valid web page
            if (!tab.url || tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://') || tab.url.startsWith('moz-extension://')) {
                this.currentPageContent = 'This page cannot be analyzed (system page or extension page).';
                this.updateStatus('Ready (limited)', 'success');
                return;
            }
            
            // Try to get cached content from background script first
            try {
                const response = await chrome.runtime.sendMessage({ action: 'getPageContent' });
                
                if (response && response.success && response.content && response.content.content) {
                    this.currentPageContent = this.formatPageContent(response.content);
                    this.updateStatus('Ready', 'success');
                    return;
                }
            } catch (bgError) {
                console.log('Background script not available, trying direct extraction');
            }
            
            // Fallback: Send message to content script
            try {
                const contentResponse = await chrome.tabs.sendMessage(tab.id, { action: 'extractPageContent' });
                
                if (contentResponse && contentResponse.success && contentResponse.content) {
                    this.currentPageContent = this.formatPageContent(contentResponse.content);
                    this.updateStatus('Ready', 'success');
                    return;
                }
            } catch (contentError) {
                console.log('Content script not responding, trying executeScript');
            }
            
            // Final fallback: Execute script directly
            const result = await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                function: this.extractPageContentScript
            });
            
            if (result && result[0] && result[0].result) {
                this.currentPageContent = result[0].result;
                this.updateStatus('Ready', 'success');
            } else {
                throw new Error('Failed to extract page content');
            }
            
        } catch (error) {
            console.error('Error extracting page content:', error);
            this.updateStatus('Content extraction failed', 'error');
            this.currentPageContent = 'Unable to extract page content. You can still ask general questions.';
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
                content: 'Error extracting page content: ' + error.message,
                extractedAt: new Date().toISOString()
            };
        }
    }
    
    async sendMessage() {
        const message = this.elements.messageInput.value.trim();
        if (!message || this.isLoading) return;
        
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
        
        // Show typing indicator
        this.showTypingIndicator();
        this.setLoadingState(true);
        
        try {
            const response = await this.callDeepSeekAPI(message);
            this.hideTypingIndicator();
            this.addMessage(response, 'assistant');
        } catch (error) {
            console.error('Error calling API:', error);
            this.hideTypingIndicator();
            this.addMessage('Sorry, I encountered an error processing your request. Please try again.', 'assistant');
        } finally {
            this.setLoadingState(false);
        }
    }
    
    handleSpecialCommands(message) {
        const command = message.toLowerCase().trim();
        
        switch (command) {
            case '/clear':
                this.clearChat();
                return true;
            case '/help':
                this.showHelp();
                return true;
            case '/status':
                this.showStatus();
                return true;
            default:
                return false;
        }
    }
    
    clearChat() {
        this.elements.messages.innerHTML = '';
        this.addMessage('Chat cleared! 🧹', 'assistant');
    }
    
    showHelp() {
        const helpText = `🤖 **SafarAI Commands:**

• **/clear** - Clear chat history
• **/help** - Show this help message
• **/status** - Show current status

💡 **Tips:**
• I can analyze the current webpage content
• Ask me questions about what you're reading
• I can help with summaries, explanations, and more!`;
        this.addMessage(helpText, 'assistant');
    }
    
    showStatus() {
        const hasApiKey = !!this.apiKey;
        const hasPageContent = !!this.currentPageContent && this.currentPageContent !== 'Unable to extract page content. You can still ask general questions.';
        const contentLength = this.currentPageContent ? this.currentPageContent.length : 0;
        
        const statusText = `📊 **Current Status:**

• API Key: ${hasApiKey ? '✅ Connected' : '❌ Not set'}
• Page Content: ${hasPageContent ? `✅ Loaded (${contentLength} chars)` : '❌ Not available'}
• Extension: ✅ Active

💡 **Debug Info:**
• Current page content preview: ${this.currentPageContent ? this.currentPageContent.substring(0, 100) + '...' : 'None'}`;
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
            return formatted || 'No content available';
        }
        
        return 'No content available';
    }
    
    async callDeepSeekAPI(userMessage) {
        const hasValidContent = this.currentPageContent && 
                               this.currentPageContent !== 'Unable to extract page content. You can still ask general questions.' &&
                               this.currentPageContent !== 'This page cannot be analyzed (system page or extension page).';
        
        const systemPrompt = hasValidContent ? 
            `You are SafarAI, a helpful AI assistant integrated into Safari. You have access to the content of the current web page. Answer questions about the page content, summarize information, or help with any queries the user has.

Current page content:
${this.currentPageContent}

Please provide helpful, accurate responses based on the page content when relevant. If the question is not related to the page content, you can still provide general assistance.` :
            `You are SafarAI, a helpful AI assistant integrated into Safari. The current page content is not available for analysis, but you can still provide general assistance and answer questions to the best of your ability.`;

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
            })
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
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${role}`;
        
        if (role === 'assistant') {
            // Simple markdown-like formatting
            content = content
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/\*(.*?)\*/g, '<em>$1</em>')
                .replace(/`(.*?)`/g, '<code>$1</code>')
                .replace(/```([\s\S]*?)```/g, '<pre>$1</pre>')
                .replace(/\n/g, '<br>');
            
            // Add typing effect for assistant messages
            this.elements.messages.appendChild(messageDiv);
            this.typeMessage(messageDiv, content);
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
        this.elements.loading.style.display = loading ? 'flex' : 'none';
        
        if (loading) {
            this.updateStatus('Thinking...', 'loading');
        } else {
            this.updateStatus('Ready', 'success');
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