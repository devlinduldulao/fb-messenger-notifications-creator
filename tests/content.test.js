// Tests for content.js functionality

describe('Content Script', () => {
  let originalTitle;
  
  beforeEach(() => {
    // Save original title
    originalTitle = document.title;
    // Reset document title
    document.title = 'Messenger';
    // Clear module cache
    jest.resetModules();
  });

  afterEach(() => {
    // Restore title
    document.title = originalTitle;
    // Clean up any global debug object
    delete window.MessengerDebug;
  });

  // Helper to load the content script
  function loadContentScript() {
    require('../content.js');
  }

  describe('Initialization', () => {
    test('should load settings on init', () => {
      loadContentScript();
      expect(chrome.storage.sync.get).toHaveBeenCalledWith(
        ['silentMode'],
        expect.any(Function)
      );
    });

    test('should register storage change listener', () => {
      loadContentScript();
      expect(chrome.storage.onChanged.addListener).toHaveBeenCalled();
    });

    test('should expose debug interface', () => {
      loadContentScript();
      expect(window.MessengerDebug).toBeDefined();
      expect(typeof window.MessengerDebug.status).toBe('function');
      expect(typeof window.MessengerDebug.reset).toBe('function');
    });
  });

  describe('Message Count Detection', () => {
    test('should extract count from title with format "(N)"', () => {
      document.title = '(5) Messenger';
      loadContentScript();
      
      const status = {};
      const originalLog = console.log;
      console.log = (msg, data) => {
        if (msg === '[Messenger Status]') {
          Object.assign(status, data);
        }
      };
      
      window.MessengerDebug.status();
      
      console.log = originalLog;
      expect(status.currentCount).toBe(5);
    });

    test('should return 0 when no count in title', () => {
      document.title = 'Messenger';
      loadContentScript();
      
      const status = {};
      const originalLog = console.log;
      console.log = (msg, data) => {
        if (msg === '[Messenger Status]') {
          Object.assign(status, data);
        }
      };
      
      window.MessengerDebug.status();
      
      console.log = originalLog;
      expect(status.currentCount).toBe(0);
    });

    test('should handle double digit counts', () => {
      document.title = '(42) Messenger';
      loadContentScript();
      
      const status = {};
      const originalLog = console.log;
      console.log = (msg, data) => {
        if (msg === '[Messenger Status]') {
          Object.assign(status, data);
        }
      };
      
      window.MessengerDebug.status();
      
      console.log = originalLog;
      expect(status.currentCount).toBe(42);
    });

    test('should handle triple digit counts', () => {
      document.title = '(999) Messenger';
      loadContentScript();
      
      const status = {};
      const originalLog = console.log;
      console.log = (msg, data) => {
        if (msg === '[Messenger Status]') {
          Object.assign(status, data);
        }
      };
      
      window.MessengerDebug.status();
      
      console.log = originalLog;
      expect(status.currentCount).toBe(999);
    });
  });

  describe('New Message Detection', () => {
    test('should have sendMessage available for notifications', async () => {
      document.title = 'Messenger';
      loadContentScript();
      
      // Wait for initialization
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Verify chrome.runtime.sendMessage is available
      expect(chrome.runtime.sendMessage).toBeDefined();
    });

    test('should track unread count from title', async () => {
      document.title = '(5) Messenger';
      loadContentScript();
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const status = {};
      const originalLog = console.log;
      console.log = (msg, data) => {
        if (msg === '[Messenger Status]') {
          Object.assign(status, data);
        }
      };
      
      window.MessengerDebug.status();
      
      console.log = originalLog;
      // Should have detected 5 as initial count
      expect(status.currentCount).toBe(5);
      expect(status.lastNotifiedCount).toBe(5);
    });
  });

  describe('Silent Mode', () => {
    test('should load silent mode setting on init', async () => {
      chrome.storage.sync.get.mockImplementation((keys, callback) => {
        if (callback) {
          callback({ silentMode: true });
          return undefined;
        }
        return Promise.resolve({ silentMode: true });
      });
      
      document.title = 'Messenger';
      loadContentScript();
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Verify settings were loaded
      expect(chrome.storage.sync.get).toHaveBeenCalledWith(
        ['silentMode'],
        expect.any(Function)
      );
    });

    test('should update silent mode when storage changes', () => {
      loadContentScript();
      
      const storageChangeCallback = chrome.storage.onChanged.addListener.mock.calls[0][0];
      
      // Simulate storage change
      storageChangeCallback(
        { silentMode: { newValue: true } },
        'sync'
      );
      
      // Verify the change was processed (we can check via debug)
      const status = {};
      const originalLog = console.log;
      console.log = (msg, data) => {
        if (msg === '[Messenger Status]') {
          Object.assign(status, data);
        }
      };
      
      window.MessengerDebug.status();
      
      console.log = originalLog;
      expect(status.silentMode).toBe(true);
    });
  });

  describe('Debug Interface', () => {
    test('should reset counters via debug interface', () => {
      document.title = '(10) Messenger';
      loadContentScript();
      
      // Reset counters
      window.MessengerDebug.reset();
      
      const status = {};
      const originalLog = console.log;
      console.log = (msg, data) => {
        if (msg === '[Messenger Status]') {
          Object.assign(status, data);
        }
      };
      
      window.MessengerDebug.status();
      
      console.log = originalLog;
      expect(status.lastNotifiedCount).toBe(0);
    });
  });
});
