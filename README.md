# Messenger VIP Notifications

Get desktop banner notifications when your important contacts (mother, wife, friends) message you on Facebook Messenger. No more missing messages from the people who matter most!

## Features

- **VIP Contact List**: Add specific people (Mom, Wife, friends) whose messages you want to be notified about
- **Desktop Banner Notifications**: Get instant visual notifications when VIP contacts message you
- **Badge Counter**: Red badge on the extension icon shows unread VIP message count
- **Silent Mode Toggle**: Easily turn off notifications when you need to focus
- **Click to Open**: Click the notification to jump directly to the conversation
- **Auto-Clear Badge**: Badge clears when you view the Messenger tab
- **Works on Both Sites**: Monitors both `facebook.com/messages` and `messenger.com`

## Installation

### For Google Chrome

1. Open Chrome and go to `chrome://extensions/`
2. Enable **Developer mode** (toggle in the top-right corner)
3. Click **Load unpacked**
4. Navigate to this folder (`fb-messenger-notifications-creator`) and select it
5. The extension icon will appear in your toolbar

### For Microsoft Edge

1. Open Edge and go to `edge://extensions/`
2. Enable **Developer mode** (toggle in the left sidebar)
3. Click **Load unpacked**
4. Navigate to this folder (`fb-messenger-notifications-creator`) and select it
5. The extension icon will appear in your toolbar

## How to Use

### Adding VIP Contacts

1. Click the extension icon in your browser toolbar
2. Type a name in the input field (e.g., "Mom", "Wife", "John Smith")
3. Click **Add** or press Enter
4. You can also use the quick-add buttons for common contacts

**Tips for naming:**
- Use the exact name as it appears in Messenger
- Partial matches work (e.g., "Mom" will match "Mom Smith")
- Names are case-insensitive

### Enabling/Disabling Notifications

- **Toggle Silent Mode**: Click the switch at the top of the popup
  - 🔔 Green = Notifications ON
  - 🔕 Red = Silent Mode (no notifications)

### Removing Contacts

- Click the **×** button next to any contact to remove them

## Limitations

- Facebook's title counter only increments for **new unread conversations**, not for each message within the same conversation
- If your wife sends 10 messages in a row, you'll get notified when her **first** message arrives (while unread), but not for subsequent messages in that same conversation
- The extension requires the Messenger tab to be open (can be in background)

## Troubleshooting

### Notifications not appearing?

1. **Check browser notification permissions:**
   - Chrome: `chrome://settings/content/notifications`
   - Edge: `edge://settings/content/notifications`
   - Make sure notifications are allowed for the extension

2. **Check Windows notification settings:**
   - Go to Settings > System > Notifications
   - Make sure Chrome/Edge notifications are enabled

3. **Make sure the Messenger tab is open:**
   - The extension monitors open `facebook.com/messages` or `messenger.com` tabs
   - Keep at least one of these tabs open for monitoring

4. **Verify the contact name:**
   - Make sure the name you added matches how it appears in Messenger
   - Check the browser console (F12) for debug messages

### Extension not loading?

1. Make sure all files are present:
   - `manifest.json`
   - `background.js`
   - `content.js`
   - `popup.html`
   - `popup.css`
   - `popup.js`
   - `icons/icon16.png`
   - `icons/icon48.png`
   - `icons/icon128.png`

2. If icons are missing, run: `node create-icons.js`

## Files Structure

```
fb-messenger-notifications-creator/
├── manifest.json        # Extension configuration
├── background.js        # Service worker (handles notifications)
├── content.js           # Monitors Messenger pages
├── popup.html           # Settings popup UI
├── popup.css            # Popup styles
├── popup.js             # Popup functionality
├── create-icons.js      # Icon generator script
├── generate-icons.html  # Alternative icon generator
├── README.md           # This file
└── icons/
    ├── icon16.png      # Toolbar icon
    ├── icon48.png      # Extension page icon
    └── icon128.png     # Store/install icon
```

## Privacy

This extension:
- **Only runs on** `facebook.com/messages/*` and `messenger.com/*`
- **Stores data locally** in your browser (contact names, silent mode preference)
- **Does NOT** send any data to external servers
- **Does NOT** read your message contents (only sender names for matching)

📄 **[Full Privacy Policy](PRIVACY.md)**

## How It Works

1. The content script monitors the page title for message count changes (which Facebook updates when you have unread messages)
2. When new messages are detected, it scans the chat list for unread conversations
3. If a conversation matches a VIP contact name, it sends a notification request to the background service worker
4. The background worker displays a desktop notification
5. Clicking the notification focuses the Messenger tab

## Support

If you encounter issues:
1. Open the browser console (F12) on the Messenger page
2. Look for messages starting with "Messenger VIP Notifications:"
3. Check if your VIP contacts are being recognized

---

Made with ❤️ for keeping families connected
