// Tests for background.js functionality

describe('Background Service Worker', () => {
  // Helper to simulate loading background.js
  function loadBackgroundScript() {
    // Clear module cache
    jest.resetModules();
    // Load the script
    require('../background.js');
  }

  describe('Extension Installation', () => {
    test('should register onInstalled listener', () => {
      loadBackgroundScript();
      expect(chrome.runtime.onInstalled.addListener).toHaveBeenCalled();
    });

    test('should initialize silentMode to false on install', () => {
      loadBackgroundScript();
      
      // Get the onInstalled callback
      const installCallback = chrome.runtime.onInstalled.addListener.mock.calls[0][0];
      
      // Mock storage.get to return undefined for silentMode (support both callback and promise)
      chrome.storage.sync.get.mockImplementation((keys, callback) => {
        if (callback) {
          callback({ silentMode: undefined });
          return undefined;
        }
        return Promise.resolve({ silentMode: undefined });
      });
      
      installCallback();
      
      expect(chrome.storage.sync.set).toHaveBeenCalledWith({ silentMode: false });
    });
  });

  describe('Message Handling', () => {
    test('should register onMessage listener', () => {
      loadBackgroundScript();
      expect(chrome.runtime.onMessage.addListener).toHaveBeenCalled();
    });

    test('should handle NEW_MESSAGE type', () => {
      loadBackgroundScript();
      
      const messageCallback = chrome.runtime.onMessage.addListener.mock.calls[0][0];
      const sendResponse = jest.fn();
      
      const message = {
        type: 'NEW_MESSAGE',
        data: {
          messageCount: 1,
          totalUnread: 5,
          timestamp: Date.now()
        }
      };
      
      messageCallback(message, {}, sendResponse);
      
      expect(sendResponse).toHaveBeenCalledWith({ 
        received: true, 
        status: 'processing' 
      });
      
      // Clear any pending async operations from handleNewMessage
      jest.clearAllMocks();
    });

    test('should handle TEST_NOTIFICATION type', () => {
      // Reset mocks to isolate this test
      jest.clearAllMocks();
      
      loadBackgroundScript();
      
      const messageCallback = chrome.runtime.onMessage.addListener.mock.calls[0][0];
      const sendResponse = jest.fn();
      
      messageCallback({ type: 'TEST_NOTIFICATION' }, {}, sendResponse);
      
      expect(sendResponse).toHaveBeenCalledWith({ 
        received: true, 
        status: 'test sent' 
      });
    });
  });

  describe('Notifications', () => {
    test('should create notification with correct icon path (.jpeg)', async () => {
      // Reset mocks to isolate this test
      jest.clearAllMocks();
      
      loadBackgroundScript();
      
      // Trigger test notification via message
      const messageCallback = chrome.runtime.onMessage.addListener.mock.calls[0][0];
      messageCallback({ type: 'TEST_NOTIFICATION' }, {}, jest.fn());
      
      // Wait for any async operations
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(chrome.notifications.create).toHaveBeenCalled();
      
      const createCall = chrome.notifications.create.mock.calls[0];
      const options = createCall[1];
      
      expect(options.iconUrl).toContain('icon128.jpeg');
      expect(options.iconUrl).not.toContain('.png');
    });

    test('should use correct notification options', async () => {
      // Reset mocks to isolate this test
      jest.clearAllMocks();
      
      loadBackgroundScript();
      
      const messageCallback = chrome.runtime.onMessage.addListener.mock.calls[0][0];
      messageCallback({ type: 'TEST_NOTIFICATION' }, {}, jest.fn());
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const createCall = chrome.notifications.create.mock.calls[0];
      const options = createCall[1];
      
      expect(options.type).toBe('basic');
      expect(options.priority).toBe(2);
      expect(options.silent).toBe(false);
      expect(options.title).toBeDefined();
      expect(options.message).toBeDefined();
    });
  });

  describe('Badge Updates', () => {
    test('should set badge text when unread count > 0', async () => {
      // Reset mocks to avoid interference from previous tests
      jest.clearAllMocks();
      
      loadBackgroundScript();
      
      const messageCallback = chrome.runtime.onMessage.addListener.mock.calls[0][0];
      
      // Mock Promise-based storage.get
      chrome.storage.sync.get.mockImplementation((keys, callback) => {
        if (callback) {
          callback({ silentMode: false });
          return undefined;
        }
        return Promise.resolve({ silentMode: false });
      });
      
      messageCallback({
        type: 'NEW_MESSAGE',
        data: { messageCount: 1, totalUnread: 3, timestamp: Date.now() }
      }, {}, jest.fn());
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(chrome.action.setBadgeText).toHaveBeenCalledWith({ text: '3' });
      expect(chrome.action.setBadgeBackgroundColor).toHaveBeenCalledWith({ color: '#FF3B30' });
    });

    test('should clear badge when count is 0', async () => {
      loadBackgroundScript();
      
      const messageCallback = chrome.runtime.onMessage.addListener.mock.calls[0][0];
      
      // Mock Promise-based storage.get
      chrome.storage.sync.get.mockImplementation((keys, callback) => {
        if (callback) {
          callback({ silentMode: false });
          return undefined;
        }
        return Promise.resolve({ silentMode: false });
      });
      
      messageCallback({
        type: 'NEW_MESSAGE',
        data: { messageCount: 0, totalUnread: 0, timestamp: Date.now() }
      }, {}, jest.fn());
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(chrome.action.setBadgeText).toHaveBeenCalledWith({ text: '' });
    });
  });

  describe('Silent Mode', () => {
    test('should skip notification when silent mode is enabled', async () => {
      loadBackgroundScript();
      
      const messageCallback = chrome.runtime.onMessage.addListener.mock.calls[0][0];
      
      // Enable silent mode via Promise-based API
      chrome.storage.sync.get.mockImplementation((keys, callback) => {
        if (callback) {
          callback({ silentMode: true });
          return undefined;
        }
        return Promise.resolve({ silentMode: true });
      });
      
      // Clear previous notification calls
      chrome.notifications.create.mockClear();
      
      messageCallback({
        type: 'NEW_MESSAGE',
        data: { messageCount: 1, totalUnread: 5, timestamp: Date.now() }
      }, {}, jest.fn());
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Should not create notification for NEW_MESSAGE when silent
      // Note: Only one call should exist (from initialization test notification)
      const callsForNewMessage = chrome.notifications.create.mock.calls.filter(
        call => !call[0].includes('test-notification')
      );
      expect(callsForNewMessage.length).toBe(0);
    });
  });

  describe('Notification Click Handler', () => {
    test('should register notification click listener', () => {
      loadBackgroundScript();
      expect(chrome.notifications.onClicked.addListener).toHaveBeenCalled();
    });

    test('should focus existing messenger tab on click', () => {
      loadBackgroundScript();
      
      const clickCallback = chrome.notifications.onClicked.addListener.mock.calls[0][0];
      
      const mockTab = { id: 123, windowId: 456 };
      chrome.tabs.query.mockImplementation((query, callback) => {
        callback([mockTab]);
      });
      
      clickCallback('test-notification-id');
      
      expect(chrome.tabs.update).toHaveBeenCalledWith(123, { active: true });
      expect(chrome.windows.update).toHaveBeenCalledWith(456, { focused: true });
      expect(chrome.notifications.clear).toHaveBeenCalledWith('test-notification-id');
    });

    test('should open new messenger tab if none exists', () => {
      loadBackgroundScript();
      
      const clickCallback = chrome.notifications.onClicked.addListener.mock.calls[0][0];
      
      chrome.tabs.query.mockImplementation((query, callback) => {
        callback([]);
      });
      
      clickCallback('test-notification-id');
      
      expect(chrome.tabs.create).toHaveBeenCalledWith({ url: 'https://www.messenger.com/' });
    });
  });
});
