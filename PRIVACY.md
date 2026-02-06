# Privacy Policy for Messenger Notifications

**Last Updated:** February 6, 2026

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

All data is stored **locally in your browser** using Chrome`s storage API:
- Data syncs across your signed-in browsers (same Google/Microsoft account)
- Data never leaves your browser
- No data is sent to external servers
- No third-party services are used

## Permissions Used

| Permission | Why It`s Needed |
|-----------|-----------------|
| `notifications` | Display desktop notifications for new messages |
| `storage` | Save your silent mode preference |
| `activeTab` | Access the current tab to check for Messenger pages |
| `tabs` | Detect when you switch to Messenger tab (to clear badge) |
| `host_permissions` (facebook.com, messenger.com) | Monitor Messenger pages for new messages |

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
