describe('Content script', () => {
  const loadContentScript = () => {
    jest.resetModules();
    require('../content.js');
  };

  beforeEach(() => {
    jest.useFakeTimers();
    document.title = 'Messenger';
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('loads the saved setting and reports the initial unread count without an alert', () => {
    document.title = '(4) Messenger';
    loadContentScript();

    expect(chrome.storage.sync.get).toHaveBeenCalledWith(['silentMode'], expect.any(Function));
    expect(chrome.runtime.sendMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'UNREAD_COUNT_CHANGED',
        data: { messageCount: 0, totalUnread: 4 }
      }),
      expect.any(Function)
    );
  });

  test('reports a title-count increase as new messages', () => {
    loadContentScript();
    chrome.runtime.sendMessage.mockClear();

    document.title = '(3) Messenger';
    jest.advanceTimersByTime(10_000);

    expect(chrome.runtime.sendMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { messageCount: 3, totalUnread: 3 }
      }),
      expect.any(Function)
    );
  });

  test('does not queue a desktop alert while silent mode is enabled', () => {
    chrome.storage.sync.get.mockImplementation((_keys, callback) => callback({ silentMode: true }));
    loadContentScript();
    chrome.runtime.sendMessage.mockClear();

    document.title = '(2) Messenger';
    jest.advanceTimersByTime(10_000);

    expect(chrome.runtime.sendMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { messageCount: 0, totalUnread: 2 }
      }),
      expect.any(Function)
    );
  });

  test('reports a lower count so the badge can be cleared or reduced', () => {
    document.title = '(5) Messenger';
    loadContentScript();
    chrome.runtime.sendMessage.mockClear();

    document.title = '(1) Messenger';
    jest.advanceTimersByTime(10_000);

    expect(chrome.runtime.sendMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { messageCount: 0, totalUnread: 1 }
      }),
      expect.any(Function)
    );
  });

  test('keeps the badge accurate when an unread count rises and then falls', () => {
    document.title = '(3) Messenger';
    loadContentScript();
    chrome.runtime.sendMessage.mockClear();

    document.title = '(4) Messenger';
    jest.advanceTimersByTime(10_000);
    document.title = '(3) Messenger';
    jest.advanceTimersByTime(10_000);

    expect(chrome.runtime.sendMessage).toHaveBeenLastCalledWith(
      expect.objectContaining({ data: { messageCount: 0, totalUnread: 3 } }),
      expect.any(Function)
    );
  });

  test('updates its silent-mode state when storage changes', () => {
    loadContentScript();
    const onChanged = chrome.storage.onChanged.addListener.mock.calls[0][0];
    onChanged({ silentMode: { newValue: true } }, 'sync');
    chrome.runtime.sendMessage.mockClear();

    document.title = '(1) Messenger';
    jest.advanceTimersByTime(10_000);

    expect(chrome.runtime.sendMessage).toHaveBeenCalledWith(
      expect.objectContaining({ data: { messageCount: 0, totalUnread: 1 } }),
      expect.any(Function)
    );
  });
});
