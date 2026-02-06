// Content script for monitoring Facebook Messenger messages

(function() {
  'use strict';
  
  console.log('Messenger Notifications: Content script loaded');
  
  let silentMode = false;
  let lastTitleCount = 0;
  let lastNotifiedCount = 0;
  let lastNotifiedTime = 0;
  let isMonitoring = false;
  
  // Load settings from storage
  function loadSettings() {
    chrome.storage.sync.get(['silentMode'], (result) => {
      if (chrome.runtime.lastError) {
        console.error('[Messenger] Error loading settings:', chrome.runtime.lastError);
        return;
      }
      silentMode = result.silentMode || false;
      console.log('[Messenger] Silent mode:', silentMode);
    });
  }
  
  // Listen for settings updates
  chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'sync') {
      if (changes.silentMode !== undefined) {
        silentMode = changes.silentMode.newValue;
        console.log('[Messenger] Silent mode updated:', silentMode);
      }
    }
  });
  
  // Extract message count from page title
  function getMessageCountFromTitle() {
    const title = document.title;
    const match = title.match(/^\((\d+)\)/);
    return match ? parseInt(match[1], 10) : 0;
  }
  
  // Main function to check for new messages
  function checkForNewMessages() {
    if (silentMode) {
      return;
    }
    
    const currentCount = getMessageCountFromTitle();
    
    // Prevent rapid notifications (minimum 5 seconds between)
    const now = Date.now();
    if (now - lastNotifiedTime < 5000) {
      return;
    }
    
    // Only notify if count increased
    if (currentCount > lastNotifiedCount) {
      const newMessages = currentCount - lastNotifiedCount;
      console.log('[Messenger] New messages detected:', newMessages, '(total unread:', currentCount, ')');
      
      chrome.runtime.sendMessage({
        type: 'NEW_MESSAGE',
        data: {
          messageCount: newMessages,
          totalUnread: currentCount,
          timestamp: now
        }
      }, (response) => {
        if (chrome.runtime.lastError) {
          console.error('[Messenger] Error:', chrome.runtime.lastError);
        }
      });
      
      lastNotifiedTime = now;
      lastNotifiedCount = currentCount;
    }
    
    // Reset when user reads messages
    if (currentCount < lastNotifiedCount) {
      lastNotifiedCount = currentCount;
    }
    
    lastTitleCount = currentCount;
  }
  
  // Monitor title changes
  function setupMutationObserver() {
    const titleObserver = new MutationObserver(() => {
      checkForNewMessages();
    });
    
    const titleElement = document.querySelector('title');
    if (titleElement) {
      titleObserver.observe(titleElement, { 
        childList: true, 
        characterData: true, 
        subtree: true 
      });
      console.log('[Messenger] Title observer set up');
    }
  }
  
  // Fallback: Poll for changes periodically
  function startPolling() {
    if (isMonitoring) return;
    isMonitoring = true;
    
    setInterval(() => {
      if (!silentMode) {
        checkForNewMessages();
      }
    }, 3000);
    
    console.log('[Messenger] Polling started (every 3s)');
  }
  
  // Initialize when page is ready
  function init() {
    console.log('[Messenger] Initializing...');
    console.log('[Messenger] Page URL:', window.location.href);
    
    loadSettings();
    
    // Keep reloading settings periodically
    setInterval(loadSettings, 30000);
    
    if (document.readyState === 'complete') {
      startMonitoring();
    } else {
      window.addEventListener('load', startMonitoring);
    }
  }
  
  function startMonitoring() {
    console.log('[Messenger] Starting monitoring...');
    
    // Initialize counters
    lastTitleCount = getMessageCountFromTitle();
    lastNotifiedCount = lastTitleCount;
    lastNotifiedTime = Date.now();
    
    console.log('[Messenger] Initial unread count:', lastTitleCount);
    
    setupMutationObserver();
    startPolling();
  }
  
  // Start the extension
  init();
  
  // Debug helper
  window.MessengerDebug = {
    status: () => {
      console.log('[Messenger Status]', {
        silentMode,
        currentCount: getMessageCountFromTitle(),
        lastNotifiedCount
      });
    },
    reset: () => {
      lastTitleCount = 0;
      lastNotifiedCount = 0;
      lastNotifiedTime = 0;
      console.log('[Messenger] Counters reset');
    }
  };
  
  console.log('[Messenger] Ready! Debug: MessengerDebug.status()');
  
})();
