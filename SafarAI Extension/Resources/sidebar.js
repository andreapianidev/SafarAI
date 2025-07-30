class SafarAISidebar {
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
            
            // Try to get cached content from background script first
            const response = await chrome.runtime.sendMessage({ action: 'getPageContent' });
            
            if (response && response.success && response.content) {
                this.currentPageContent = response.content;
                this.updateStatus('Ready', 'success');
                return;
            }
            
            // Fallback: Extract content directly from active tab
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            if (!tab) {
                throw new Error('No active tab found');
            }
            
            // Execute content script to extract page content
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
            this.updateStatus('Error extracting content', 'error');
            this.currentPageContent = '';
        }
    }
    
    extractPageContentScript() {
        // Remove script tags, style tags, and other non-content elements
        const elementsToRemove = document.querySelectorAll('script, style, nav, header, footer, aside, .ad, .advertisement, .sidebar, .menu');
        elementsToRemove.forEach(el => el.remove());
        
        // Get main content areas
        const contentSelectors = [
            'main',
            'article',
            '.content',
            '.main-content',
            '.post-content',
            '.entry-content',
            'body'
        ];
        
        let content = '';
        for (const selector of contentSelectors) {
            const element = document.querySelector(selector);
            if (element) {
                content = element.innerText || element.textContent || '';
                break;
            }
        }
        
        // Clean up the content
        content = content
            .replace(/\s+/g, ' ')  // Replace multiple whitespace with single space
            .replace(/\n\s*\n/g, '\n')  // Remove empty lines
            .trim();
        
        // Limit content length to avoid API limits
        if (content.length > 8000) {
            content = content.substring(0, 8000) + '...';
        }
        
        return content;
    }
    
    async sendMessage() {
        const message = this.elements.messageInput.value.trim();
        if (!message || this.isLoading) return;
        
        this.elements.messageInput.value = '';
        this.elements.messageInput.style.height = 'auto';
        
        // Add user message to chat
        this.addMessage(message, 'user');
        
        // Show loading state
        this.setLoadingState(true);
        
        try {
            const response = await this.callDeepSeekAPI(message);
            this.addMessage(response, 'assistant');
        } catch (error) {
            console.error('Error calling API:', error);
            this.addMessage('Sorry, I encountered an error processing your request. Please try again.', 'assistant');
        } finally {
            this.setLoadingState(false);
        }
    }
    
    async callDeepSeekAPI(userMessage) {
        const systemPrompt = `You are SafarAI, a helpful AI assistant integrated into Safari. You have access to the content of the current web page. Answer questions about the page content, summarize information, or help with any queries the user has.

Current page content:
${this.currentPageContent}

Please provide helpful, accurate responses based on the page content when relevant. If the question is not related to the page content, you can still provide general assistance.`;

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
            
            messageDiv.innerHTML = content;
        } else {
            messageDiv.textContent = content;
        }
        
        this.elements.messages.appendChild(messageDiv);
        this.elements.messages.scrollTop = this.elements.messages.scrollHeight;
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

// Initialize the sidebar when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new SafarAISidebar();
});