// Popup JavaScript for Messenger VIP Notifications

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const silentModeToggle = document.getElementById('silentModeToggle');
  const silentModeLabel = document.getElementById('silentModeLabel');
  const contactInput = document.getElementById('contactInput');
  const addContactBtn = document.getElementById('addContactBtn');
  const contactsList = document.getElementById('contactsList');
  const emptyState = document.getElementById('emptyState');
  const statusMessage = document.getElementById('statusMessage');
  const quickAddButtons = document.querySelectorAll('.quick-add-btn');
  const testNotificationBtn = document.getElementById('testNotificationBtn');
  
  let vipContacts = [];
  
  // Initialize
  loadSettings();
  
  // Load settings from storage
  function loadSettings() {
    chrome.storage.sync.get(['vipContacts', 'silentMode'], (result) => {
      vipContacts = result.vipContacts || [];
      silentModeToggle.checked = result.silentMode || false;
      updateSilentModeLabel();
      renderContacts();
      updateQuickAddButtons();
    });
  }
  
  // Save settings to storage
  function saveSettings() {
    chrome.storage.sync.set({ 
      vipContacts: vipContacts,
      silentMode: silentModeToggle.checked
    }, () => {
      showStatus('Settings saved!');
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
      silentModeLabel.textContent = '🔕 Silent Mode ON';
    } else {
      silentModeLabel.textContent = '🔔 Notifications ON';
    }
  }
  
  // Render contacts list
  function renderContacts() {
    contactsList.innerHTML = '';
    
    if (vipContacts.length === 0) {
      emptyState.classList.remove('hidden');
      return;
    }
    
    emptyState.classList.add('hidden');
    
    vipContacts.forEach((contact, index) => {
      const contactItem = document.createElement('div');
      contactItem.className = 'contact-item';
      contactItem.innerHTML = `
        <span class="contact-name">
          <span class="contact-icon">${getContactIcon(contact)}</span>
          ${escapeHtml(contact)}
        </span>
        <button class="remove-btn" data-index="${index}" title="Remove">×</button>
      `;
      contactsList.appendChild(contactItem);
    });
    
    // Add remove button listeners
    document.querySelectorAll('.remove-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const index = parseInt(e.target.dataset.index);
        removeContact(index);
      });
    });
  }
  
  // Get icon for contact based on name
  function getContactIcon(name) {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('mom') || lowerName.includes('mother') || lowerName.includes('mama')) {
      return '👩';
    } else if (lowerName.includes('dad') || lowerName.includes('father') || lowerName.includes('papa')) {
      return '👨';
    } else if (lowerName.includes('wife')) {
      return '💑';
    } else if (lowerName.includes('husband')) {
      return '💑';
    } else if (lowerName.includes('sister') || lowerName.includes('sis')) {
      return '👧';
    } else if (lowerName.includes('brother') || lowerName.includes('bro')) {
      return '👦';
    } else {
      return '👤';
    }
  }
  
  // Escape HTML to prevent XSS
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
  
  // Add a new contact
  function addContact(name) {
    const trimmedName = name.trim();
    
    if (!trimmedName) {
      showStatus('Please enter a name', true);
      return false;
    }
    
    // Check for duplicates (case-insensitive)
    if (vipContacts.some(c => c.toLowerCase() === trimmedName.toLowerCase())) {
      showStatus('Contact already exists', true);
      return false;
    }
    
    vipContacts.push(trimmedName);
    saveSettings();
    renderContacts();
    updateQuickAddButtons();
    return true;
  }
  
  // Remove a contact
  function removeContact(index) {
    vipContacts.splice(index, 1);
    saveSettings();
    renderContacts();
    updateQuickAddButtons();
  }
  
  // Update quick add buttons state
  function updateQuickAddButtons() {
    quickAddButtons.forEach(btn => {
      const name = btn.dataset.name;
      if (vipContacts.some(c => c.toLowerCase() === name.toLowerCase())) {
        btn.classList.add('added');
        btn.textContent = `✓ ${name}`;
      } else {
        btn.classList.remove('added');
        btn.textContent = `+ ${name}`;
      }
    });
  }
  
  // Event Listeners
  
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
  
  // Add contact button
  addContactBtn.addEventListener('click', () => {
    if (addContact(contactInput.value)) {
      contactInput.value = '';
      contactInput.focus();
    }
  });
  
  // Enter key in input
  contactInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      if (addContact(contactInput.value)) {
        contactInput.value = '';
      }
    }
  });
  
  // Quick add buttons
  quickAddButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const name = btn.dataset.name;
      if (!btn.classList.contains('added')) {
        addContact(name);
      }
    });
  });
  
  // Test notification button
  testNotificationBtn.addEventListener('click', () => {
    console.log('Testing notification...');
    chrome.runtime.sendMessage({ type: 'TEST_NOTIFICATION' }, (response) => {
      if (chrome.runtime.lastError) {
        showStatus('Error: ' + chrome.runtime.lastError.message, true);
        console.error('Test notification error:', chrome.runtime.lastError);
      } else {
        showStatus('Test notification sent!');
        console.log('Test notification response:', response);
      }
    });
  });
});
