// Popup JavaScript for Messenger Notifications

document.addEventListener('DOMContentLoaded', () => {
  const silentModeToggle = document.getElementById('silentModeToggle');
  const silentModeLabel = document.getElementById('silentModeLabel');
  const statusMessage = document.getElementById('statusMessage');
  const testNotificationBtn = document.getElementById('testNotificationBtn');
  
  // Initialize
  loadSettings();
  
  // Load settings from storage
  function loadSettings() {
    chrome.storage.sync.get(['silentMode'], (result) => {
      silentModeToggle.checked = result.silentMode || false;
      updateSilentModeLabel();
    });
  }
  
  // Show status message
  function showStatus(message, isError = false) {
    statusMessage.textContent = message;
    statusMessage.className = isError ? 'status error' : 'status';
    setTimeout(() => {
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
      if (silentModeToggle.checked) {
        showStatus('Silent mode enabled');
      } else {
        showStatus('Notifications enabled');
      }
    });
  });
  
  // Test notification button
  testNotificationBtn.addEventListener('click', () => {
    chrome.runtime.sendMessage({ type: 'TEST_NOTIFICATION' }, (response) => {
      if (chrome.runtime.lastError) {
        showStatus('Error: ' + chrome.runtime.lastError.message, true);
      } else {
        showStatus('Test notification sent!');
      }
    });
  });
});
