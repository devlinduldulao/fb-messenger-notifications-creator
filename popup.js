// Popup JavaScript for Messenger Notifications

document.addEventListener('DOMContentLoaded', () => {
  const silentModeToggle = document.getElementById('silentModeToggle');
  const silentModeLabel = document.getElementById('silentModeLabel');
  const statusMessage = document.getElementById('statusMessage');
  const testNotificationBtn = document.getElementById('testNotificationBtn');
  let statusTimeout;
  
  // Initialize
  loadSettings();
  
  // Load settings from storage
  function loadSettings() {
    chrome.storage.sync.get(['silentMode'], (result) => {
      if (chrome.runtime.lastError) {
        showStatus('Could not load settings', true);
        return;
      }
      silentModeToggle.checked = result.silentMode === true;
      updateSilentModeLabel();
    });
  }
  
  // Show status message
  function showStatus(message, isError = false) {
    clearTimeout(statusTimeout);
    statusMessage.textContent = message;
    statusMessage.className = isError ? 'status error' : 'status';
    statusTimeout = setTimeout(() => {
      statusMessage.textContent = '';
    }, 2000);
  }
  
  // Update silent mode toggle label
  function updateSilentModeLabel() {
    if (silentModeToggle.checked) {
      silentModeLabel.textContent = 'Silent Mode ON';
    } else {
      silentModeLabel.textContent = 'Notifications ON';
    }
  }
  
  // Silent mode toggle
  silentModeToggle.addEventListener('change', () => {
    updateSilentModeLabel();
    chrome.storage.sync.set({ silentMode: silentModeToggle.checked }, () => {
      if (chrome.runtime.lastError) {
        showStatus('Could not save settings', true);
        loadSettings();
        return;
      }
      if (silentModeToggle.checked) {
        showStatus('Silent mode enabled');
      } else {
        showStatus('Notifications enabled');
      }
    });
  });
  
  // Test notification button
  testNotificationBtn.addEventListener('click', () => {
    testNotificationBtn.disabled = true;
    testNotificationBtn.setAttribute('aria-busy', 'true');
    chrome.runtime.sendMessage({ type: 'TEST_NOTIFICATION' }, (response) => {
      testNotificationBtn.disabled = false;
      testNotificationBtn.removeAttribute('aria-busy');
      if (chrome.runtime.lastError) {
        showStatus(`Could not send test: ${chrome.runtime.lastError.message}`, true);
      } else if (!response?.received) {
        showStatus('Could not send test notification', true);
      } else {
        showStatus('Test notification sent');
      }
    });
  });
}, { once: true });
