# Privacy Policy for Messenger Notifications

**Last Updated:** July 9, 2026

## Overview

Messenger Notifications is a browser extension that sends you desktop notifications when you receive new Facebook Messenger messages. Your privacy is important to us.

## Data Collection

### What We Collect
- **Silent Mode Preference**: Whether you have notifications enabled or disabled

### What We Do NOT Collect
- Message contents
- Sender names or contact information
- Conversation history
- Personal information
- Browsing history
- Analytics or usage statistics

## Data Storage

The silent mode preference is stored using the browser's synced extension storage. If you enable browser sync, the browser provider may synchronize that preference across your signed-in browsers. The extension itself does not transmit data to any server, and it does not use third-party analytics or advertising services.

## Permissions Used

| Permission | Why It`s Needed |
|-----------|-----------------|
| `notifications` | Display desktop notifications for new messages |
| `storage` | Save your silent mode preference |
| `tabs` | Detect when you switch to Messenger tab (to clear badge) |
| Messenger site access | Run the content script on `facebook.com/messages` and `messenger.com` to monitor the unread count in the page title |

## How The Extension Works

1. The extension monitors Facebook Messenger page titles for unread message count
2. When the count increases, a desktop notification is displayed
3. No message content is ever read - only the unread count from the page title

## Data Sharing

We do **NOT** share, sell, or transmit any data to:
- Third parties
- Analytics services
- Advertising networks
- External servers of any kind

## Your Rights

You can:
- **Delete your data**: Uninstall the extension to remove all stored preferences
- **Control notifications**: Use silent mode to disable notifications anytime

## Children`s Privacy

This extension does not knowingly collect any information from children under 13.

## Changes to This Policy

If we update this privacy policy, the "Last Updated" date will be revised.

## Contact

If you have questions about this privacy policy, please open an issue on our GitHub repository.

## Open Source

This extension is open source. You can review the complete source code to verify our privacy practices.

---

*This extension is not affiliated with, endorsed by, or connected to Meta Platforms, Inc. (Facebook/Messenger).*
