# Privacy Policy for Messenger VIP Notifications

**Last Updated:** February 6, 2026

## Overview

Messenger VIP Notifications is a browser extension that helps you get desktop notifications when specific contacts message you on Facebook Messenger. Your privacy is important to us, and this policy explains what data we collect, how we use it, and your rights.

## Data Collection

### What We Collect
- **VIP Contact Names**: Names you manually enter (e.g., "Mom", "Wife") to identify whose messages should trigger notifications
- **Preferences**: Your silent mode setting (on/off)

### What We Do NOT Collect
- ❌ Message contents
- ❌ Conversation history
- ❌ Personal information
- ❌ Browsing history
- ❌ Any data from pages outside Facebook Messenger
- ❌ Analytics or usage statistics

## Data Storage

All data is stored **locally in your browser** using Chrome's `storage.sync` API:
- Data syncs across your signed-in browsers (same Google/Microsoft account)
- Data never leaves your browser or synced profile
- No data is sent to external servers
- No third-party services are used

## Permissions Used

| Permission | Why It's Needed |
|-----------|-----------------|
| `notifications` | Display desktop notifications when VIP contacts message you |
| `storage` | Save your VIP contact list and preferences |
| `activeTab` | Access the current tab to check for Messenger pages |
| `tabs` | Detect when you switch to Messenger tab (to clear badge) |
| `host_permissions` (facebook.com, messenger.com) | Monitor Messenger pages for incoming messages |

## How The Extension Works

1. The extension monitors Facebook Messenger page titles for unread message indicators
2. When new messages are detected, it checks sender names against your VIP contact list
3. If a match is found (and silent mode is off), a desktop notification is displayed
4. **No message content is ever read** - only sender names visible in the chat list are checked

## Data Sharing

We do **NOT** share, sell, or transmit any data to:
- Third parties
- Analytics services
- Advertising networks
- External servers of any kind

## Your Rights

You can:
- **View your data**: Click the extension icon to see your saved contacts
- **Delete your data**: Remove individual contacts or uninstall the extension
- **Export your data**: Your contacts are visible in the extension popup

## Children's Privacy

This extension does not knowingly collect any information from children under 13.

## Changes to This Policy

If we update this privacy policy, the "Last Updated" date will be revised. Continued use of the extension after changes constitutes acceptance of the new policy.

## Contact

If you have questions about this privacy policy, please open an issue on our GitHub repository.

## Open Source

This extension is open source. You can review the complete source code to verify our privacy practices.

---

*This extension is not affiliated with, endorsed by, or connected to Meta Platforms, Inc. (Facebook/Messenger).*
