// SafarAI Content Script
// This script runs in the context of web pages to extract content

console.log('SafarAI content script loaded');

// Listen for messages from the extension
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'extractPageContent') {
        try {
            const content = extractPageContent();
            sendResponse({ success: true, content: content });
        } catch (error) {
            console.error('Error extracting page content:', error);
            sendResponse({ success: false, error: error.message });
        }
        return true; // Keep the message channel open for async response
    }
});

function extractPageContent() {
    // Create a clone of the document to avoid modifying the original
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
    
    // Limit content length to avoid API limits (about 8000 characters)
    if (content.length > 8000) {
        content = content.substring(0, 8000) + '\n\n[Content truncated...]';
    }
    
    // Add page metadata
    const title = document.title || '';
    const url = window.location.href;
    const description = document.querySelector('meta[name="description"]')?.content || '';
    
    const pageInfo = {
        title,
        url,
        description,
        content,
        extractedAt: new Date().toISOString()
    };
    
    return pageInfo;
}

// Auto-extract content when the page is fully loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            try {
                const content = extractPageContent();
                chrome.runtime.sendMessage({
                    action: 'pageContentExtracted',
                    data: content
                });
            } catch (error) {
                console.error('Error auto-extracting page content:', error);
            }
        }, 1000);
    });
} else {
    // Page is already loaded
    setTimeout(() => {
        try {
            const content = extractPageContent();
            chrome.runtime.sendMessage({
                action: 'pageContentExtracted',
                data: content
            });
        } catch (error) {
            console.error('Error auto-extracting page content:', error);
        }
    }, 1000);
}
