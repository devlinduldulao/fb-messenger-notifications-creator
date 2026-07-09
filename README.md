# Messenger Notifications

Get desktop notifications when you receive new Facebook Messenger messages. Never miss an important message!

## Features

- **Desktop Notifications**: Get instant visual notifications for new messages
- **Badge Counter**: Red badge on the extension icon shows unread message count
- **Silent Mode Toggle**: Pause desktop alerts while keeping the unread badge visible
- **Click to Open**: Click the notification to jump directly to Messenger
- **Auto-Clear Badge**: Badge clears when you view the Messenger tab
- **Primary Support**: Monitors `facebook.com/messages` and keeps `messenger.com` compatibility during the migration

## Installation

### For Google Chrome

1. Open Chrome and go to `chrome://extensions/`
2. Enable **Developer mode** (toggle in the top-right corner)
3. Click **Load unpacked**
4. Navigate to this folder and select it
5. The extension icon will appear in your toolbar

### For Microsoft Edge

1. Open Edge and go to `edge://extensions/`
2. Enable **Developer mode** (toggle in the left sidebar)
3. Click **Load unpacked**
4. Navigate to this folder and select it
5. The extension icon will appear in your toolbar

## How to Use

1. Keep a `facebook.com/messages` tab open (can be in background)
2. When a new message arrives, you'll get a desktop notification
3. Click the notification to open Messenger
4. Toggle Silent Mode in the popup when you need to focus

The extension does not show a notification when it is installed. Use **Test notification** in the popup whenever you want to confirm that browser notifications are enabled.

## Troubleshooting

### Notifications not appearing?

1. **Check browser notification permissions:**
   - Chrome: `chrome://settings/content/notifications`
   - Edge: `edge://settings/content/notifications`

2. **Check Windows notification settings:**
   - Go to Settings > System > Notifications
   - Make sure Chrome/Edge notifications are enabled

3. **Make sure the Messenger tab is open**

### Extension not loading?

Make sure all files are present:
- `manifest.json`
- `background.js`
- `content.js`
- `popup.html`
- `popup.css`
- `popup.js`
- `icons/icon16.png`
- `icons/icon48.png`
- `icons/icon128.png`

If icons are missing, run: `node create-icons.js`

## Privacy

This extension:
- **Primarily runs on** `facebook.com/messages/*` and keeps `messenger.com/*` compatibility during the migration
- **Stores only** your silent mode preference in your browser's synced extension storage
- **Does NOT** send any data to servers operated by this extension
- **Does NOT** read your message contents

Full Privacy Policy: [PRIVACY.md](PRIVACY.md)

## Files

```
messenger-notifications/
├── manifest.json        # Extension configuration
├── background.js        # Service worker (handles notifications)
├── content.js           # Monitors Messenger pages
├── popup.html           # Settings popup UI
├── popup.css            # Popup styles
├── popup.js             # Popup functionality
├── create-icons.js      # Icon generator script
├── README.md           # This file
├── PRIVACY.md          # Privacy policy
└── icons/
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

---

Made for keeping connected
