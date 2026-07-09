// Content script for monitoring the unread count exposed in the Messenger page title.

(() => {
  'use strict';

  const POLL_INTERVAL_MS = 10_000;
  const NOTIFICATION_COOLDOWN_MS = 5_000;

  let silentMode = false;
  let lastNotifiedCount = 0;
  let lastReportedCount = 0;
  let lastNotificationTime = 0;

  function getUnreadCount() {
    const match = document.title.match(/^\((\d+)\)/);
    const count = match ? Number.parseInt(match[1], 10) : 0;
    return Number.isSafeInteger(count) ? count : 0;
  }

  function sendUnreadChange(messageCount, totalUnread) {
    chrome.runtime.sendMessage(
      {
        type: 'UNREAD_COUNT_CHANGED',
        data: { messageCount, totalUnread }
      },
      () => {
        if (chrome.runtime.lastError) {
          console.warn('Messenger Notifications could not reach its service worker.');
        }
      }
    );
  }

  function checkForUnreadChanges() {
    const currentCount = getUnreadCount();
    const now = Date.now();

    if (currentCount < lastNotifiedCount) {
      lastNotifiedCount = currentCount;
    } else if (currentCount > lastNotifiedCount && silentMode) {
      lastNotifiedCount = currentCount;
    } else if (currentCount > lastNotifiedCount && now - lastNotificationTime >= NOTIFICATION_COOLDOWN_MS) {
      const messageCount = currentCount - lastNotifiedCount;
      lastNotifiedCount = currentCount;
      lastReportedCount = currentCount;
      lastNotificationTime = now;
      sendUnreadChange(messageCount, currentCount);
      return;
    }

    if (currentCount !== lastReportedCount) {
      // Keep the badge accurate even when this change does not produce an alert.
      lastReportedCount = currentCount;
      sendUnreadChange(0, currentCount);
    }
  }

  function loadSettings(onComplete) {
    chrome.storage.sync.get(['silentMode'], (result) => {
      if (chrome.runtime.lastError) {
        console.warn('Messenger Notifications could not load its settings.');
      } else {
        silentMode = result.silentMode === true;
      }
      onComplete();
    });
  }

  function startMonitoring() {
    lastNotifiedCount = getUnreadCount();
    lastReportedCount = lastNotifiedCount;
    sendUnreadChange(0, lastNotifiedCount);

    const target = document.head || document.documentElement;
    new MutationObserver(checkForUnreadChanges).observe(target, {
      childList: true,
      characterData: true,
      subtree: true
    });

    window.setInterval(checkForUnreadChanges, POLL_INTERVAL_MS);
  }

  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === 'sync' && changes.silentMode) {
      silentMode = changes.silentMode.newValue === true;
    }
  });

  loadSettings(startMonitoring);
})();
