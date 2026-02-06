// Background service worker for Messenger Notifications

console.log('[Messenger Background] Service worker starting...');

// Keep service worker alive
const keepAlive = () => {
  chrome.runtime.getPlatformInfo(() => {});
};
setInterval(keepAlive, 20000);

// Track unread messages for badge
let unreadCount = 0;

// Initialize default settings when extension is installed
chrome.runtime.onInstalled.addListener(() => {
  console.log('[Messenger Background] Extension installed/updated');
  chrome.storage.sync.get(['silentMode'], (result) => {
    if (result.silentMode === undefined) {
      chrome.storage.sync.set({ silentMode: false });
      console.log('[Messenger Background] Initialized default settings');
    }
  });
  
  // Show test notification on install
  setTimeout(() => {
    showTestNotification();
  }, 2000);
});

// Show a test notification
function showTestNotification() {
  console.log('[Messenger Background] Showing test notification...');
  
  const notificationId = `test-notification-${Date.now()}`;
  const iconUrl = chrome.runtime.getURL('icons/icon128.jpeg');
  
  chrome.notifications.create(notificationId, {
    type: 'basic',
    iconUrl: iconUrl,
    title: 'Messenger Notifications Active',
    message: 'You will now receive notifications for new messages!',
    priority: 2,
    silent: false
  }, (createdId) => {
    if (chrome.runtime.lastError) {
      console.error('[Messenger Background] Notification error:', chrome.runtime.lastError);
    } else {
      console.log('[Messenger Background] Test notification created:', createdId);
    }
  });
}

// Update the extension badge
function updateBadge(count) {
  unreadCount = count;
  if (count > 0) {
    chrome.action.setBadgeText({ text: count.toString() });
    chrome.action.setBadgeBackgroundColor({ color: '#FF3B30' });
  } else {
    chrome.action.setBadgeText({ text: '' });
  }
}

// Listen for messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('[Messenger Background] Received message:', message);
  
  if (message.type === 'NEW_MESSAGE') {
    handleNewMessage(message.data);
    sendResponse({ received: true, status: 'processing' });
  } else if (message.type === 'TEST_NOTIFICATION') {
    showTestNotification();
    sendResponse({ received: true, status: 'test sent' });
  }
  return true;
});

// Handle new message notification
async function handleNewMessage(data) {
  console.log('[Messenger Background] handleNewMessage:', data);
  
  const { messageCount, totalUnread, timestamp } = data;
  
  // Check if silent mode is enabled
  const settings = await chrome.storage.sync.get(['silentMode']);
  
  if (settings.silentMode) {
    console.log('[Messenger Background] Silent mode enabled, skipping');
    return;
  }
  
  // Update badge count
  updateBadge(totalUnread);
  
  // Create notification
  const notificationId = `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const iconUrl = chrome.runtime.getURL('icons/icon128.jpeg');
  
  let title, message;
  if (messageCount > 1) {
    title = `${messageCount} new messages`;
    message = `You have ${totalUnread} unread messages on Messenger`;
  } else {
    title = 'New message';
    message = totalUnread > 1 
      ? `You have ${totalUnread} unread messages on Messenger`
      : 'You have a new message on Messenger';
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
      console.error('[Messenger Background] Notification FAILED:', chrome.runtime.lastError);
    } else {
      console.log('[Messenger Background] Notification CREATED:', createdId);
    }
  });
}

// Handle notification click - focus on Messenger tab
chrome.notifications.onClicked.addListener((notificationId) => {
  // Clear the badge
  updateBadge(0);
  
  // Find and focus the Messenger tab
  chrome.tabs.query({ url: ['https://www.facebook.com/messages/*', 'https://www.messenger.com/*'] }, (tabs) => {
    if (tabs.length > 0) {
      chrome.tabs.update(tabs[0].id, { active: true });
      chrome.windows.update(tabs[0].windowId, { focused: true });
    } else {
      chrome.tabs.create({ url: 'https://www.messenger.com/' });
    }
  });
  chrome.notifications.clear(notificationId);
});

// Clear badge when user views the messenger tab
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  try {
    const tab = await chrome.tabs.get(activeInfo.tabId);
    if (tab.url && (tab.url.includes('facebook.com/messages') || tab.url.includes('messenger.com'))) {
      updateBadge(0);
    }
  } catch (e) {
    // Tab might not exist
  }
});

// Clear notification when dismissed
chrome.notifications.onClosed.addListener((notificationId, byUser) => {
  console.log(`Notification ${notificationId} closed${byUser ? ' by user' : ''}`);
});
