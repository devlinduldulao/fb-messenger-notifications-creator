// Chrome API mocks shared by the extension tests.

global.chrome = {
  runtime: {
    getURL: jest.fn(),
    sendMessage: jest.fn(),
    onMessage: { addListener: jest.fn() },
    onInstalled: { addListener: jest.fn() },
    lastError: null
  },
  storage: {
    sync: { get: jest.fn(), set: jest.fn() },
    onChanged: { addListener: jest.fn() }
  },
  notifications: {
    create: jest.fn(),
    clear: jest.fn(),
    onClicked: { addListener: jest.fn() }
  },
  action: { setBadgeText: jest.fn(), setBadgeBackgroundColor: jest.fn() },
  tabs: {
    query: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    get: jest.fn(),
    onActivated: { addListener: jest.fn() }
  },
  windows: { update: jest.fn() }
};

beforeEach(() => {
  jest.clearAllMocks();
  chrome.runtime.lastError = null;
  chrome.runtime.getURL.mockImplementation((path) => `chrome-extension://test/${path}`);
  chrome.runtime.sendMessage.mockImplementation((_message, callback) => callback?.({ received: true }));
  chrome.storage.sync.get.mockImplementation((_keys, callback) => {
    const result = { silentMode: false };
    if (callback) {
      callback(result);
      return undefined;
    }
    return Promise.resolve(result);
  });
  chrome.storage.sync.set.mockImplementation((_items, callback) => {
    callback?.();
    return Promise.resolve();
  });
  chrome.notifications.create.mockImplementation((id, _options, callback) => callback?.(id));
  chrome.notifications.clear.mockImplementation((_id, callback) => callback?.(true));
  chrome.tabs.query.mockImplementation((_query, callback) => callback([]));
  chrome.tabs.get.mockResolvedValue({ url: 'https://example.com/' });
});
