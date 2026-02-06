// Content script for monitoring Facebook Messenger messages

(function() {
  'use strict';
  
  console.log('Messenger VIP Notifications: Content script loaded');
  
  let vipContacts = [];
  let silentMode = false;
  let lastTitleCount = 0;
  let lastNotifiedCount = 0;
  let lastNotifiedTime = 0; // Prevent rapid notifications
  let isMonitoring = false;
  
  // Load settings from storage
  function loadSettings() {
    // Use storage API directly instead of messaging (more reliable)
    chrome.storage.sync.get(['vipContacts', 'silentMode'], (result) => {
      if (chrome.runtime.lastError) {
        console.error('[VIP] Error loading settings:', chrome.runtime.lastError);
        return;
      }
      vipContacts = result.vipContacts || [];
      silentMode = result.silentMode || false;
      console.log('[VIP] Settings loaded - Contacts:', vipContacts, 'Silent:', silentMode);
    });
  }
  
  // Listen for settings updates
  chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'sync') {
      if (changes.vipContacts) {
        vipContacts = changes.vipContacts.newValue || [];
        console.log('VIP Contacts updated:', vipContacts);
      }
      if (changes.silentMode !== undefined) {
        silentMode = changes.silentMode.newValue;
        console.log('Silent mode updated:', silentMode);
      }
    }
  });
  
  // Remove emojis and special characters for comparison
  function stripEmojis(text) {
    return text
      .replace(/[\u{1F600}-\u{1F64F}]/gu, '') // Emoticons
      .replace(/[\u{1F300}-\u{1F5FF}]/gu, '') // Misc Symbols and Pictographs
      .replace(/[\u{1F680}-\u{1F6FF}]/gu, '') // Transport and Map
      .replace(/[\u{1F1E0}-\u{1F1FF}]/gu, '') // Flags
      .replace(/[\u{2600}-\u{26FF}]/gu, '')   // Misc symbols
      .replace(/[\u{2700}-\u{27BF}]/gu, '')   // Dingbats
      .replace(/[\u{FE00}-\u{FEFF}]/gu, '')   // Variation Selectors
      .replace(/[\u{1F900}-\u{1F9FF}]/gu, '') // Supplemental Symbols
      .replace(/[\u{1FA00}-\u{1FA6F}]/gu, '') // Chess Symbols
      .replace(/[\u{1FA70}-\u{1FAFF}]/gu, '') // Symbols and Pictographs Extended-A
      .replace(/[\u{231A}-\u{231B}]/gu, '')   // Watch, Hourglass
      .replace(/[\u{23E9}-\u{23F3}]/gu, '')   // Media controls
      .replace(/[\u{23F8}-\u{23FA}]/gu, '')   // Media controls
      .replace(/[\u{25AA}-\u{25AB}]/gu, '')   // Squares
      .replace(/[\u{25B6}]/gu, '')            // Play button
      .replace(/[\u{25C0}]/gu, '')            // Reverse button
      .replace(/[\u{25FB}-\u{25FE}]/gu, '')   // Squares
      .replace(/[\u{2614}-\u{2615}]/gu, '')   // Umbrella, Hot beverage
      .replace(/[\u{2648}-\u{2653}]/gu, '')   // Zodiac
      .replace(/[\u{267F}]/gu, '')            // Wheelchair
      .replace(/[\u{2693}]/gu, '')            // Anchor
      .replace(/[\u{26A1}]/gu, '')            // High voltage
      .replace(/[\u{26AA}-\u{26AB}]/gu, '')   // Circles
      .replace(/[\u{26BD}-\u{26BE}]/gu, '')   // Sports
      .replace(/[\u{26C4}-\u{26C5}]/gu, '')   // Weather
      .replace(/[\u{26CE}]/gu, '')            // Ophiuchus
      .replace(/[\u{26D4}]/gu, '')            // No entry
      .replace(/[\u{26EA}]/gu, '')            // Church
      .replace(/[\u{26F2}-\u{26F3}]/gu, '')   // Fountain, Golf
      .replace(/[\u{26F5}]/gu, '')            // Sailboat
      .replace(/[\u{26FA}]/gu, '')            // Tent
      .replace(/[\u{26FD}]/gu, '')            // Fuel pump
      .trim();
  }

  // Check if a name matches any VIP contact (case-insensitive partial match)
  function isVipContact(name) {
    if (!name || vipContacts.length === 0) return false;
    
    // Normalize: lowercase, strip emojis, trim whitespace
    const normalizedName = stripEmojis(name.toLowerCase()).trim();
    
    console.log('[VIP Debug] Checking name:', name, '-> normalized:', normalizedName);
    console.log('[VIP Debug] VIP contacts:', vipContacts);
    
    const match = vipContacts.some(contact => {
      const normalizedContact = stripEmojis(contact.toLowerCase()).trim();
      
      // Multiple matching strategies:
      // 1. Exact match
      // 2. Contact name is contained in sender name
      // 3. Sender name is contained in contact name
      // 4. First few characters match (for partial names)
      const exactMatch = normalizedName === normalizedContact;
      const contactInSender = normalizedName.includes(normalizedContact);
      const senderInContact = normalizedContact.includes(normalizedName);
      
      // Partial match: at least 3 characters match from the start
      const minLen = Math.min(normalizedName.length, normalizedContact.length);
      const partialMatch = minLen >= 3 && 
        normalizedName.substring(0, minLen) === normalizedContact.substring(0, minLen);
      
      const isMatch = exactMatch || contactInSender || senderInContact || partialMatch;
      
      if (isMatch) {
        console.log('[VIP Debug] MATCH FOUND! Contact:', contact, 'matched with:', name);
      }
      
      return isMatch;
    });
    
    return match;
  }
  
  // Extract message count from page title
  function getMessageCountFromTitle() {
    const title = document.title;
    const match = title.match(/^\((\d+)\)/);
    return match ? parseInt(match[1], 10) : 0;
  }
  
  // Find unread message elements in the chat list
  function findUnreadMessages() {
    const unreadMessages = [];
    
    // Try different selectors for Facebook Messenger conversations
    // Facebook's DOM changes frequently, so we try multiple approaches
    const selectors = [
      // Facebook Messenger web (messenger.com)
      '[data-testid="mwthreadlist-item"]',
      // Facebook Messages (facebook.com/messages)
      '[role="row"][aria-label]',
      '[role="listitem"]',
      // Generic conversation rows with links
      'a[href*="/t/"]',
      'a[href*="messages/t"]',
      'div[data-testid*="thread"]',
      // Try finding chat rows by common Facebook class patterns
      '[class*="x1n2onr6"][class*="x1ja2u2z"]',
      '[role="gridcell"]',
      // More generic: any clickable div that might be a conversation
      'div[tabindex="0"][role="row"]',
      'div[tabindex="-1"][role="row"]'
    ];
    
    for (const selector of selectors) {
      try {
        const elements = document.querySelectorAll(selector);
        console.log('[VIP Debug] Selector:', selector, '- found', elements.length, 'elements');
        
        elements.forEach(el => {
          // Check for unread indicators - Facebook uses various methods
          const hasUnreadIndicator = 
            el.querySelector('[data-testid="unread-indicator"]') ||
            el.querySelector('[aria-label*="unread"]') ||
            el.querySelector('[aria-label*="Unread"]') ||
            el.querySelector('span[class*="x1rg5ohu"]') || // Blue dot indicator
            el.querySelector('div[class*="x1rg5ohu"]');
          
          // Look for the bold text that indicates unread (font-weight >= 600)
          const hasBoldText = el.querySelector('[style*="font-weight: 700"]') ||
                             el.querySelector('[style*="font-weight:700"]') ||
                             el.querySelector('[style*="font-weight: 600"]') ||
                             el.querySelector('[style*="font-weight:600"]');
          
          // Check for blue dot (unread indicator)
          const hasBlueDot = Array.from(el.querySelectorAll('div, span')).some(child => {
            const style = window.getComputedStyle(child);
            const bgColor = style.backgroundColor;
            // Facebook blue is roughly rgb(0, 132, 255) or similar
            return bgColor.includes('0, 132, 255') || 
                   bgColor.includes('0, 100, 224') ||
                   bgColor.includes('10, 132, 255');
          });
          
          if (hasUnreadIndicator || hasBoldText || hasBlueDot) {
            if (!unreadMessages.includes(el)) {
              unreadMessages.push(el);
            }
          }
        });
        
        if (unreadMessages.length > 0) {
          console.log('[VIP Debug] Found unread messages with selector:', selector);
          break;
        }
      } catch (e) {
        console.log('[VIP Debug] Selector error:', selector, e);
      }
    }
    
    // If no unread indicators found, try getting ALL conversation items for debugging
    if (unreadMessages.length === 0) {
      console.log('[VIP Debug] No unread indicators found. Trying to find any conversations...');
      for (const selector of selectors) {
        const elements = document.querySelectorAll(selector);
        if (elements.length > 0) {
          console.log('[VIP Debug] Found', elements.length, 'conversation elements with:', selector);
          // Add first few for debugging
          elements.forEach((el, i) => {
            if (i < 3) {
              const name = extractSenderName(el);
              console.log('[VIP Debug] Conversation', i, ':', name);
            }
          });
          break;
        }
      }
    }
    
    return unreadMessages;
  }
  
  // Extract sender name from a conversation element
  function extractSenderName(element) {
    // Try various selectors to find the name
    const nameSelectors = [
      '[data-testid="mwthreadlist-item-name"]',
      'span[dir="auto"]',
      'span[class*="x1lliihq"]',
      '[role="heading"]',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'strong',
      // Try finding any span with text that looks like a name
      'span'
    ];
    
    let candidates = [];
    
    for (const selector of nameSelectors) {
      const nameEls = element.querySelectorAll(selector);
      nameEls.forEach(nameEl => {
        if (nameEl && nameEl.textContent) {
          const text = nameEl.textContent.trim();
          // Skip if it looks like a timestamp, message preview, or is too short/long
          if (text.length >= 2 && 
              text.length < 60 && 
              !text.match(/^\d+[hm]$/) &&           // Not "2h" or "5m"
              !text.match(/^\d+:\d+/) &&            // Not "12:30"
              !text.match(/^(yesterday|today|monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i) &&
              !text.match(/^(just now|ago|min|hour|day|week)/i) &&
              !text.includes('sent a photo') &&
              !text.includes('sent a video') &&
              !text.includes('sent a sticker') &&
              !text.includes('reacted to') &&
              element.contains(nameEl)) {
            candidates.push({ text, element: nameEl, selector });
          }
        }
      });
      
      // If we found good candidates, pick the first one (usually the name)
      if (candidates.length > 0 && selector !== 'span') {
        break;
      }
    }
    
    // Prefer candidates that appear first (usually the name is at the top)
    if (candidates.length > 0) {
      // Sort by DOM position (earlier = likely the name)
      candidates.sort((a, b) => {
        const posA = a.element.getBoundingClientRect().top;
        const posB = b.element.getBoundingClientRect().top;
        return posA - posB;
      });
      
      return candidates[0].text;
    }
    
    // Try aria-label as fallback
    const ariaLabel = element.getAttribute('aria-label');
    if (ariaLabel) {
      // Usually format is "Conversation with [Name]" or just "[Name]"
      const match = ariaLabel.match(/(?:Conversation with |Chat with )?(.+?)(?:,|\.|$)/);
      if (match) return match[1].trim();
    }
    
    // Try the link href to extract name (messenger.com/t/username)
    const link = element.querySelector('a[href*="/t/"]') || element.closest('a[href*="/t/"]');
    if (link) {
      const href = link.getAttribute('href');
      const match = href.match(/\/t\/([^\/\?]+)/);
      if (match) {
        // This gives us the username/id, not the display name, but useful for debugging
        console.log('[VIP Debug] Found thread ID:', match[1]);
      }
    }
    
    return null;
  }
  
  // Extract message preview from a conversation element
  function extractMessagePreview(element) {
    // Try to find the message preview text
    const previewSelectors = [
      '[data-testid="mwthreadlist-item-snippet"]',
      'span[class*="x1n2onr6"]',
      'span[dir="auto"]:last-child'
    ];
    
    for (const selector of previewSelectors) {
      const previewEl = element.querySelector(selector);
      if (previewEl && previewEl.textContent.trim()) {
        const preview = previewEl.textContent.trim();
        if (preview.length > 0 && preview.length < 200) {
          return preview.substring(0, 100) + (preview.length > 100 ? '...' : '');
        }
      }
    }
    
    return 'New message';
  }
  
  // Main function to check for new VIP messages
  function checkForVipMessages() {
    if (silentMode) {
      return;
    }
    
    // Only use title-based detection - most reliable
    const currentCount = getMessageCountFromTitle();
    
    // Prevent rapid notifications (minimum 5 seconds between notifications)
    const now = Date.now();
    if (now - lastNotifiedTime < 5000) {
      return;
    }
    
    // Only notify if count increased
    if (currentCount > lastNotifiedCount) {
      const newMessages = currentCount - lastNotifiedCount;
      console.log('[VIP] New messages detected:', newMessages, '(title count:', currentCount, ')');
      
      // Find VIP sender
      let vipSenderFound = null;
      let messagePreview = 'New message';
      
      const conversations = findAllConversations();
      for (const element of conversations) {
        const senderName = extractSenderName(element);
        if (senderName && isVipContact(senderName)) {
          vipSenderFound = senderName;
          messagePreview = extractMessagePreview(element);
          break;
        }
      }
      
      if (vipSenderFound) {
        console.log('[VIP] *** Notifying for:', vipSenderFound, '***');
        
        chrome.runtime.sendMessage({
          type: 'NEW_VIP_MESSAGE',
          data: {
            senderName: vipSenderFound,
            messagePreview: messagePreview,
            timestamp: now,
            messageCount: newMessages
          }
        }, (response) => {
          if (chrome.runtime.lastError) {
            console.error('[VIP] Error:', chrome.runtime.lastError);
          }
        });
        
        lastNotifiedTime = now;
      }
      
      // Always update counter to prevent re-triggering
      lastNotifiedCount = currentCount;
    }
    
    // Reset when user reads messages
    if (currentCount < lastNotifiedCount) {
      lastNotifiedCount = currentCount;
    }
    
    lastTitleCount = currentCount;
  }
  
  // Find ALL conversation elements
  function findAllConversations() {
    const conversations = [];
    
    const selectors = [
      'a[href*="/t/"]',
      'a[href*="messages/t"]', 
      '[role="row"]',
      '[role="listitem"]'
    ];
    
    for (const selector of selectors) {
      try {
        const elements = document.querySelectorAll(selector);
        if (elements.length > 0) {
          elements.forEach(el => conversations.push(el));
          break;
        }
      } catch (e) {
        // Continue
      }
    }
    
    return conversations;
  }
  
  // Monitor title changes only
  function setupMutationObserver() {
    const titleObserver = new MutationObserver(() => {
      checkForVipMessages();
    });
    
    const titleElement = document.querySelector('title');
    if (titleElement) {
      titleObserver.observe(titleElement, { 
        childList: true, 
        characterData: true, 
        subtree: true 
      });
      console.log('[VIP] Title observer set up');
    }
  }
  
  // Fallback: Poll for changes periodically
  function startPolling() {
    if (isMonitoring) return;
    isMonitoring = true;
    
    // Check every 3 seconds (reduced frequency)
    setInterval(() => {
      if (!silentMode) {
        checkForVipMessages();
      }
    }, 3000);
    
    console.log('[VIP] Polling started (every 3s)');
  }
  
  // Initialize when page is ready
  function init() {
    console.log('[VIP] Messenger VIP Notifications: Initializing...');
    console.log('[VIP] Page URL:', window.location.href);
    
    loadSettings();
    
    // Keep reloading settings periodically
    setInterval(loadSettings, 30000);
    
    // Wait for page to fully load
    if (document.readyState === 'complete') {
      startMonitoring();
    } else {
      window.addEventListener('load', startMonitoring);
    }
  }
  
  function startMonitoring() {
    console.log('[VIP] Starting monitoring...');
    
    // Initialize counters
    lastTitleCount = getMessageCountFromTitle();
    lastNotifiedCount = lastTitleCount;
    lastNotifiedTime = Date.now();
    
    console.log('[VIP] Initial title count:', lastTitleCount);
    console.log('[VIP] VIP contacts:', vipContacts);
    
    setupMutationObserver();
    startPolling();
  }
  
  // Start the extension
  init();
  
  // Expose debug functions
  window.VIPDebug = {
    status: () => {
      const titleCount = getMessageCountFromTitle();
      console.log('[VIP Status]', {
        vipContacts,
        silentMode,
        titleCount,
        lastNotifiedCount,
        willNotify: titleCount > lastNotifiedCount
      });
      return { vipContacts, titleCount, lastNotifiedCount };
    },
    reset: () => {
      lastTitleCount = 0;
      lastNotifiedCount = 0;
      lastNotifiedTime = 0;
      console.log('[VIP] Counters reset');
    },
    check: () => {
      lastNotifiedTime = 0; // Allow immediate notification
      checkForVipMessages();
    },
    testNotification: (name) => {
      chrome.runtime.sendMessage({
        type: 'NEW_VIP_MESSAGE',
        data: {
          senderName: name || 'Test',
          messagePreview: 'Test ' + new Date().toLocaleTimeString(),
          timestamp: Date.now(),
          messageCount: 1
        }
      }, (r) => console.log('[VIP] Test sent:', r));
    },
    contacts: () => vipContacts,
    addContact: (name) => {
      if (!vipContacts.includes(name)) {
        vipContacts.push(name);
        chrome.storage.sync.set({ vipContacts });
      }
      return vipContacts;
    },
    matchTest: (name) => isVipContact(name),
    reload: loadSettings,
    scanPage: () => {
      const names = [];
      findAllConversations().forEach(el => {
        const name = extractSenderName(el);
        if (name && !names.includes(name)) names.push(name);
      });
      console.log('[VIP] Conversations:', names);
      return names;
    }
  };
  
  console.log('[VIP] Ready! Commands: VIPDebug.status(), .testNotification("name"), .reset()');
  
})();
