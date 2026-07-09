describe('Background service worker', () => {
  const loadBackgroundScript = () => {
    jest.resetModules();
    require('../background.js');
  };

  const flushAsyncWork = () => new Promise((resolve) => setTimeout(resolve, 0));

  test('registers its event listeners', () => {
    loadBackgroundScript();

    expect(chrome.runtime.onInstalled.addListener).toHaveBeenCalledTimes(1);
    expect(chrome.runtime.onMessage.addListener).toHaveBeenCalledTimes(1);
    expect(chrome.notifications.onClicked.addListener).toHaveBeenCalledTimes(1);
    expect(chrome.tabs.onActivated.addListener).toHaveBeenCalledTimes(1);
  });

  test('initializes silent mode only when no setting exists', async () => {
    loadBackgroundScript();
    const installed = chrome.runtime.onInstalled.addListener.mock.calls[0][0];
    chrome.storage.sync.get.mockResolvedValue({ silentMode: undefined });

    await installed();

    expect(chrome.storage.sync.set).toHaveBeenCalledWith({ silentMode: false });
  });

  test('updates the badge and creates a notification for new messages', async () => {
    loadBackgroundScript();
    const onMessage = chrome.runtime.onMessage.addListener.mock.calls[0][0];
    const respond = jest.fn();

    onMessage(
      { type: 'UNREAD_COUNT_CHANGED', data: { messageCount: 2, totalUnread: 5 } },
      {},
      respond
    );
    await flushAsyncWork();

    expect(respond).toHaveBeenCalledWith({ received: true });
    expect(chrome.action.setBadgeText).toHaveBeenCalledWith({ text: '5' });
    expect(chrome.action.setBadgeBackgroundColor).toHaveBeenCalledWith({ color: '#d93025' });
    expect(chrome.notifications.create).toHaveBeenCalledWith(
      expect.stringMatching(/^message-/),
      expect.objectContaining({ title: '2 new Messenger messages', message: 'You have 5 unread messages.' }),
      expect.any(Function)
    );
  });

  test('keeps the badge current but suppresses alerts in silent mode', async () => {
    loadBackgroundScript();
    chrome.storage.sync.get.mockResolvedValue({ silentMode: true });
    const onMessage = chrome.runtime.onMessage.addListener.mock.calls[0][0];

    onMessage({ type: 'UNREAD_COUNT_CHANGED', data: { messageCount: 1, totalUnread: 3 } }, {}, jest.fn());
    await flushAsyncWork();

    expect(chrome.action.setBadgeText).toHaveBeenCalledWith({ text: '3' });
    expect(chrome.notifications.create).not.toHaveBeenCalled();
  });

  test('clears the badge without creating an alert when the unread count reaches zero', async () => {
    loadBackgroundScript();
    const onMessage = chrome.runtime.onMessage.addListener.mock.calls[0][0];

    onMessage({ type: 'UNREAD_COUNT_CHANGED', data: { messageCount: 0, totalUnread: 0 } }, {}, jest.fn());
    await flushAsyncWork();

    expect(chrome.action.setBadgeText).toHaveBeenCalledWith({ text: '' });
    expect(chrome.notifications.create).not.toHaveBeenCalled();
  });

  test('caps oversized badge text while retaining the exact unread count for alerts', async () => {
    loadBackgroundScript();
    const onMessage = chrome.runtime.onMessage.addListener.mock.calls[0][0];

    onMessage({ type: 'UNREAD_COUNT_CHANGED', data: { messageCount: 1, totalUnread: 1_000 } }, {}, jest.fn());
    await flushAsyncWork();

    expect(chrome.action.setBadgeText).toHaveBeenCalledWith({ text: '999+' });
    expect(chrome.notifications.create).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ message: 'You have 1000 unread messages.' }),
      expect.any(Function)
    );
  });

  test('ignores malformed unread-count messages', async () => {
    loadBackgroundScript();
    const onMessage = chrome.runtime.onMessage.addListener.mock.calls[0][0];

    onMessage({ type: 'UNREAD_COUNT_CHANGED', data: { messageCount: -1, totalUnread: '3' } }, {}, jest.fn());
    await flushAsyncWork();

    expect(chrome.action.setBadgeText).not.toHaveBeenCalled();
    expect(chrome.notifications.create).not.toHaveBeenCalled();
  });

  test('creates a user-requested test notification', () => {
    loadBackgroundScript();
    const onMessage = chrome.runtime.onMessage.addListener.mock.calls[0][0];

    onMessage({ type: 'TEST_NOTIFICATION' }, {}, jest.fn());

    expect(chrome.notifications.create).toHaveBeenCalledWith(
      expect.stringMatching(/^test-/),
      expect.objectContaining({
        type: 'basic',
        iconUrl: expect.stringContaining('icon128.png'),
        title: 'Messenger Notifications is ready'
      }),
      expect.any(Function)
    );
  });

  test('focuses an existing Messenger tab when a notification is clicked', () => {
    loadBackgroundScript();
    chrome.tabs.query.mockImplementation((_query, callback) => callback([{ id: 12, windowId: 34 }]));
    const onClicked = chrome.notifications.onClicked.addListener.mock.calls[0][0];

    onClicked('message-id');

    expect(chrome.action.setBadgeText).toHaveBeenCalledWith({ text: '' });
    expect(chrome.tabs.update).toHaveBeenCalledWith(12, { active: true });
    expect(chrome.windows.update).toHaveBeenCalledWith(34, { focused: true });
    expect(chrome.notifications.clear).toHaveBeenCalledWith('message-id');
  });

  test('opens Messenger when no matching tab exists', () => {
    loadBackgroundScript();
    const onClicked = chrome.notifications.onClicked.addListener.mock.calls[0][0];

    onClicked('message-id');

    expect(chrome.tabs.create).toHaveBeenCalledWith({ url: 'https://www.facebook.com/messages/' });
  });
});
