describe('Popup', () => {
  const renderPopup = () => {
    document.body.innerHTML = `
      <input type="checkbox" id="silentModeToggle">
      <span id="silentModeLabel"></span>
      <button id="testNotificationBtn" type="button">Test notification</button>
      <p id="statusMessage"></p>
    `;
    jest.resetModules();
    require('../popup.js');
    document.dispatchEvent(new Event('DOMContentLoaded'));
  };

  test('loads the saved silent-mode preference', () => {
    chrome.storage.sync.get.mockImplementation((_keys, callback) => callback({ silentMode: true }));
    renderPopup();

    expect(document.getElementById('silentModeToggle').checked).toBe(true);
    expect(document.getElementById('silentModeLabel').textContent).toBe('Silent Mode ON');
  });

  test('saves a changed silent-mode preference and confirms it', () => {
    renderPopup();
    const toggle = document.getElementById('silentModeToggle');
    toggle.checked = true;
    toggle.dispatchEvent(new Event('change'));

    expect(chrome.storage.sync.set).toHaveBeenCalledWith({ silentMode: true }, expect.any(Function));
    expect(document.getElementById('statusMessage').textContent).toBe('Silent mode enabled');
  });

  test('prevents repeat clicks while a test notification request is pending', () => {
    let completeRequest;
    chrome.runtime.sendMessage.mockImplementation((_message, callback) => {
      completeRequest = callback;
    });
    renderPopup();
    const button = document.getElementById('testNotificationBtn');

    button.click();

    expect(button.disabled).toBe(true);
    expect(button.getAttribute('aria-busy')).toBe('true');

    completeRequest({ received: true });

    expect(button.disabled).toBe(false);
    expect(document.getElementById('statusMessage').textContent).toBe('Test notification sent');
  });
});
