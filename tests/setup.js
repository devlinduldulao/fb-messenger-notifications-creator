// Jest setup file - Chrome API mocks

// Mock Chrome APIs
global.chrome = {
  runtime: {
    getURL: jest.fn((path) => `chrome-extension://test-extension-id/${path}`),
    sendMessage: jest.fn((message, callback) => {
      if (callback) callback({ received: true });
    }),
    onMessage: {
      addListener: jest.fn(),
      removeListener: jest.fn()
    },
    onInstalled: {
      addListener: jest.fn()
    },
    getPlatformInfo: jest.fn((callback) => {
      if (callback) callback({ os: 'win', arch: 'x86-64' });
    }),
    lastError: null
  },
  storage: {
    sync: {
      // Support both Promise-based and callback-based APIs
      get: jest.fn((keys, callback) => {
        const result = { silentMode: false };
        if (callback) {
          callback(result);
          return undefined;
        }
        return Promise.resolve(result);
      }),
      set: jest.fn((items, callback) => {
        if (callback) callback();
        return Promise.resolve();
      })
    },
    onChanged: {
      addListener: jest.fn()
    }
  },
  notifications: {
    create: jest.fn((id, options, callback) => {
      if (callback) callback(id);
    }),
    clear: jest.fn((id, callback) => {
      if (callback) callback(true);
    }),
    onClicked: {
      addListener: jest.fn()
    },
    onClosed: {
      addListener: jest.fn()
    }
  },
  action: {
    setBadgeText: jest.fn(),
    setBadgeBackgroundColor: jest.fn()
  },
  tabs: {
    query: jest.fn((query, callback) => {
      callback([]);
    }),
    create: jest.fn(),
    update: jest.fn(),
    get: jest.fn((tabId) => Promise.resolve({ url: 'https://example.com' })),
    onActivated: {
      addListener: jest.fn()
    }
  },
  windows: {
    update: jest.fn()
  }
};

// Reset all mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
  chrome.runtime.lastError = null;
});
