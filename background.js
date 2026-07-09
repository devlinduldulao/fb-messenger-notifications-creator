// Service worker for Messenger Notifications.

const MESSENGER_HOME_URL = 'https://www.facebook.com/messages/';
const MESSENGER_TAB_PATTERNS = [
  'https://www.facebook.com/messages/*',
  'https://www.messenger.com/*'
];

function isMessengerUrl(url) {
  try {
    const { hostname, pathname } = new URL(url);
    return (
      (hostname === 'www.facebook.com' && (pathname === '/messages' || pathname.startsWith('/messages/'))) ||
      hostname === 'www.messenger.com'
    );
  } catch {
    return false;
  }
}

function isValidUnreadCount(value) {
  return Number.isSafeInteger(value) && value >= 0;
}

function updateBadge(count) {
  const text = count > 999 ? '999+' : count > 0 ? String(count) : '';
  chrome.action.setBadgeText({ text });

  if (count > 0) {
    chrome.action.setBadgeBackgroundColor({ color: '#d93025' });
  }
}

function createNotification({ title, message, idPrefix }) {
  const uniqueSuffix = globalThis.crypto?.randomUUID?.() || Math.random().toString(36).slice(2);
  const notificationId = `${idPrefix}-${Date.now()}-${uniqueSuffix}`;

  chrome.notifications.create(
    notificationId,
    {
      type: 'basic',
      iconUrl: chrome.runtime.getURL('icons/icon128.png'),
      title,
      message,
      priority: 2
    },
    () => {
      if (chrome.runtime.lastError) {
        console.error('Unable to create notification:', chrome.runtime.lastError.message);
      }
    }
  );
}

function showTestNotification() {
  createNotification({
    idPrefix: 'test',
    title: 'Messenger Notifications is ready',
    message: 'You will be notified when new Messenger messages arrive.'
  });
}

async function handleUnreadChange({ messageCount, totalUnread }) {
  if (!isValidUnreadCount(messageCount) || !isValidUnreadCount(totalUnread)) {
    return;
  }

  // Silent mode controls desktop alerts only; the badge remains useful feedback.
  updateBadge(totalUnread);

  if (messageCount === 0 || totalUnread === 0) {
    return;
  }

  const { silentMode = false } = await chrome.storage.sync.get(['silentMode']);
  if (silentMode) {
    return;
  }

  const title = messageCount === 1 ? 'New Messenger message' : `${messageCount} new Messenger messages`;
  const message = totalUnread === 1
    ? 'You have 1 unread message.'
    : `You have ${totalUnread} unread messages.`;

  createNotification({ idPrefix: 'message', title, message });
}

chrome.runtime.onInstalled.addListener(async () => {
  const { silentMode } = await chrome.storage.sync.get(['silentMode']);
  if (silentMode === undefined) {
    await chrome.storage.sync.set({ silentMode: false });
  }
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type === 'UNREAD_COUNT_CHANGED') {
    void handleUnreadChange(message.data).catch((error) => {
      console.error('Unable to process unread count:', error);
    });
    sendResponse({ received: true });
    return;
  }

  if (message?.type === 'TEST_NOTIFICATION') {
    showTestNotification();
    sendResponse({ received: true });
  }
});

chrome.notifications.onClicked.addListener((notificationId) => {
  updateBadge(0);

  chrome.tabs.query({ url: MESSENGER_TAB_PATTERNS }, (tabs) => {
    const [tab] = tabs;
    if (tab?.id !== undefined && tab.windowId !== undefined) {
      chrome.tabs.update(tab.id, { active: true });
      chrome.windows.update(tab.windowId, { focused: true });
    } else {
      chrome.tabs.create({ url: MESSENGER_HOME_URL });
    }
  });

  chrome.notifications.clear(notificationId);
});

chrome.tabs.onActivated.addListener(async ({ tabId }) => {
  try {
    const tab = await chrome.tabs.get(tabId);
    if (isMessengerUrl(tab.url)) {
      updateBadge(0);
    }
  } catch {
    // The tab may have been closed before Chrome resolves the request.
  }
});
