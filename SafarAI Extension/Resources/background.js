// SafarAI Background Script
console.log('SafarAI background script loaded');

// Store page content for each tab
const pageContentCache = new Map();

// Handle extension installation
chrome.runtime.onInstalled.addListener(() => {
    console.log('SafarAI extension installed');
    
    // Set up context menu items if needed
    chrome.contextMenus.create({
        id: 'safarai-ask',
        title: 'Ask SafarAI about this page',
        contexts: ['page']
    });
});

// Handle messages from content scripts and sidebar
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('Background received message:', request);
    
    switch (request.action) {
        case 'pageContentExtracted':
            // Store the extracted content for the tab
            if (sender.tab) {
                pageContentCache.set(sender.tab.id, request.data);
                console.log('Stored page content for tab:', sender.tab.id);
            }
            break;
            
        case 'getPageContent':
            // Return cached content for the active tab
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                if (tabs[0]) {
                    const content = pageContentCache.get(tabs[0].id);
                    sendResponse({ success: true, content: content });
                } else {
                    sendResponse({ success: false, error: 'No active tab' });
                }
            });
            return true; // Keep message channel open
            
        case 'openSidebar':
            // Open the sidebar panel
            chrome.sidePanel.open({ windowId: sender.tab?.windowId });
            break;
    }
});

// Handle tab updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url) {
        // Clear cached content when page changes
        pageContentCache.delete(tabId);
        console.log('Cleared cache for tab:', tabId);
    }
});

// Handle tab removal
chrome.tabs.onRemoved.addListener((tabId) => {
    pageContentCache.delete(tabId);
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === 'safarai-ask' && tab) {
        chrome.sidePanel.open({ windowId: tab.windowId });
    }
});

// Handle action (toolbar button) clicks
chrome.action.onClicked.addListener((tab) => {
    chrome.sidePanel.open({ windowId: tab.windowId });
});
