// Background service worker for Messenger VIP Notifications

console.log('[VIP Background] Service worker starting...');

// Keep service worker alive
const keepAlive = () => {
  chrome.runtime.getPlatformInfo(() => {});
};
setInterval(keepAlive, 20000);

// Initialize default settings when extension is installed
chrome.runtime.onInstalled.addListener(() => {
  console.log('[VIP Background] Extension installed/updated');
  chrome.storage.sync.get(['vipContacts', 'silentMode', 'notifiedMessages'], (result) => {
    if (!result.vipContacts) {
      // Default empty contact list - user will add their own
      chrome.storage.sync.set({ 
        vipContacts: [],
        silentMode: false,
        notifiedMessages: [] // Track which messages we've already notified about
      });
      console.log('[VIP Background] Initialized default settings');
    } else {
      console.log('[VIP Background] Existing settings found:', result);
    }
  });
  
  // Test notification on install
  setTimeout(() => {
    showTestNotification();
  }, 2000);
});

// Show a test notification
function showTestNotification() {
  console.log('[VIP Background] Showing test notification...');
  
  // Use unique ID each time
  const notificationId = `test-notification-${Date.now()}`;
  const iconUrl = chrome.runtime.getURL('icons/icon128.png');
  
  console.log('[VIP Background] Icon URL:', iconUrl);
  
  chrome.notifications.create(notificationId, {
    type: 'basic',
    iconUrl: iconUrl,
    title: '✅ Messenger VIP Notifications Active',
    message: 'You will now receive notifications from your VIP contacts!',
    priority: 2,
    silent: false
  }, (createdId) => {
    if (chrome.runtime.lastError) {
      console.error('[VIP Background] Test notification error:', chrome.runtime.lastError);
      // Try with inline base64 icon as fallback
      chrome.notifications.create(notificationId + '-fallback', {
        type: 'basic',
        iconUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAA7AAAAOwBeShxvQAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAGeSURBVFiF7ZY9TsNAEIW/XUMBHVdIygBCQqKioupGlFRUcASOwBG4AkdAVDQ0dEhQIaXhCnCI2CLYeChsJ46z2PYIiSd5Zc/Mzpt9u7NSCAGTPe2/BnBP+68B6ID6rwH0hPgMnADnwBgYdgReAK/AE3AHXAO7wBqwBDgwB14DE+BYVfe6AqiqAi/AIbALXKrqIvA1ARbAIbAD7AcGq5d9F0REBF4DB8ApcBkRiHfAsM/gqroN7APnwNUvAogX84hN4g64UdVZV6DGOgGFOAqZ6wNUIoIYEphpN6Z2nQAJICuF8N4xqBJB1Aj0jS9U1aQjUAtMAsjV7j+LqCVQl0DdCNQC+C5Bh+h8xKCjBL86ygqg7k2l7ypvlUAdALfSbwngE+ilCqgB/FaB9gJxI5AWAbdYJIAQsQjUjaAtgDqBpAhSBdQByE0gJYJOAPJSiIwAcpNIjKAVgJwkEiOw2w2eIJEYQVMATjsiMYL/ApAvCZEcQasEcluI1Ag6AciNIFVAdQKJEXRKILeFSI0gVUB1AHITSIygFYDcJP4B0S/XYf+QEQYAAAAASUVORK5CYII=',
        title: '✅ Messenger VIP Notifications Active',
        message: 'Notifications are working!',
        priority: 2
      }, (fallbackId) => {
        if (chrome.runtime.lastError) {
          console.error('[VIP Background] Fallback also failed:', chrome.runtime.lastError);
        } else {
          console.log('[VIP Background] Fallback notification shown:', fallbackId);
        }
      });
    } else {
      console.log('[VIP Background] Test notification created:', createdId);
    }
  });
}

// Listen for messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('[VIP Background] Received message:', message);
  
  if (message.type === 'NEW_VIP_MESSAGE') {
    handleNewMessage(message.data);
    sendResponse({ received: true, status: 'processing' });
  } else if (message.type === 'GET_SETTINGS') {
    chrome.storage.sync.get(['vipContacts', 'silentMode'], (result) => {
      console.log('[VIP Background] Sending settings:', result);
      sendResponse(result);
    });
    return true; // Keep channel open for async response
  } else if (message.type === 'TEST_NOTIFICATION') {
    // Allow testing from popup or content script
    showTestNotification();
    sendResponse({ received: true, status: 'test sent' });
  }
  return true;
});

// Handle new message notification
async function handleNewMessage(data) {
  console.log('[VIP Background] handleNewMessage called with:', data);
  
  const { senderName, messagePreview, timestamp, messageCount } = data;
  
  // Check if silent mode is enabled
  const settings = await chrome.storage.sync.get(['silentMode']);
  
  if (settings.silentMode) {
    console.log('[VIP Background] Silent mode enabled, skipping notification for:', senderName);
    return;
  }
  
  // Show notification immediately - deduplication is handled by content script
  const notificationId = `vip-msg-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
  
  console.log('[VIP Background] Creating notification:', notificationId);
  
  // Use chrome.runtime.getURL for proper icon path
  const iconUrl = chrome.runtime.getURL('icons/icon128.png');
  
  // Build notification message - include message count if multiple
  let title = `💬 Message from ${senderName}`;
  let message = messagePreview || 'New message received';
  
  if (messageCount && messageCount > 1) {
    title = `💬 ${messageCount} messages from ${senderName}`;
    message = `Latest: ${messagePreview || 'New messages received'}`;
  }
  
  chrome.notifications.create(notificationId, {
    type: 'basic',
    iconUrl: iconUrl,
    title: title,
    message: message,
    priority: 2,
    silent: false
  }, (createdId) => {
    if (chrome.runtime.lastError) {
      console.error('[VIP Background] Notification error:', chrome.runtime.lastError);
      // Try with a data URL as fallback
      tryFallbackNotification(notificationId, senderName, messagePreview);
    } else {
      console.log('[VIP Background] Notification created successfully:', createdId);
    }
  });
}

// Fallback notification without icon
function tryFallbackNotification(notificationId, senderName, messagePreview) {
  console.log('[VIP Background] Trying fallback notification without custom icon...');
  
  chrome.notifications.create(notificationId + '-fallback', {
    type: 'basic',
    iconUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAA7AAAAOwBeShxvQAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAGeSURBVFiF7ZY9TsNAEIW/XUMBHVdIygBCQqKioupGlFRUcASOwBG4AkdAVDQ0dEhQIaXhCnCI2CLYeChsJ46z2PYIiSd5Zc/Mzpt9u7NSCAGTPe2/BnBP+68B6ID6rwH0hPgMnADnwBgYdgReAK/AE3AHXAO7wBqwBDgwB14DE+BYVfe6AqiqAi/AIbALXKrqIvA1ARbAIbAD7AcGq5d9F0REBF4DB8ApcBkRiHfAsM/gqroN7APnwNUvAogX84hN4g64UdVZV6DGOgGFOAqZ6wNUIoIYEphpN6Z2nQAJICuF8N4xqBJB1Aj0jS9U1aQjUAtMAsjV7j+LqCVQl0DdCNQC+C5Bh+h8xKCjBL86ygqg7k2l7ypvlUAdALfSbwngE+ilCqgB/FaB9gJxI5AWAbdYJIAQsQjUjaAtgDqBpAhSBdQByE0gJYJOAPJSiIwAcpNIjKAVgJwkEiOw2w2eIJEYQVMATjsiMYL/ApAvCZEcQasEcluI1Ag6AciNIFVAdQKJEXRKILeFSI0gVUB1AHITSIygFYDcJP4B0S/XYf+QEQYAAAAASUVORK5CYII=',
    title: `💬 Message from ${senderName}`,
    message: messagePreview || 'New message received',
    priority: 2,
    requireInteraction: true
  }, (createdId) => {
    if (chrome.runtime.lastError) {
      console.error('[VIP Background] Fallback notification also failed:', chrome.runtime.lastError);
    } else {
      console.log('[VIP Background] Fallback notification created:', createdId);
    }
  });
}

// Handle notification click - focus on Facebook Messenger tab
chrome.notifications.onClicked.addListener((notificationId) => {
  if (notificationId.startsWith('vip-msg-')) {
    // Find and focus the Messenger tab
    chrome.tabs.query({ url: ['https://www.facebook.com/messages/*', 'https://www.messenger.com/*'] }, (tabs) => {
      if (tabs.length > 0) {
        chrome.tabs.update(tabs[0].id, { active: true });
        chrome.windows.update(tabs[0].windowId, { focused: true });
      } else {
        // Open Messenger if no tab exists
        chrome.tabs.create({ url: 'https://www.messenger.com/' });
      }
    });
    chrome.notifications.clear(notificationId);
  }
});

// Clear notification when dismissed
chrome.notifications.onClosed.addListener((notificationId, byUser) => {
  console.log(`Notification ${notificationId} closed${byUser ? ' by user' : ''}`);
});
