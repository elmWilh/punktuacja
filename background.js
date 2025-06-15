chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'openOrUpdateErsaTab' && message.url) {
    chrome.tabs.query({}, (tabs) => {
      const targetDomain = 'ersa.emea.intra.acer.com';
      const existingTab = tabs.find(tab => {
        try {
          return new URL(tab.url).hostname === targetDomain;
        } catch {
          return false;
        }
      });

      if (existingTab) {
        chrome.tabs.update(existingTab.id, { url: message.url });
      } else {
        chrome.tabs.create({ url: message.url, active: false });
      }
    });
  } else if (message.action === 'openEditPopup' && message.lpn) {
    const url = chrome.runtime.getURL('popup.html?editLpn=' + encodeURIComponent(message.lpn));
    chrome.tabs.create({ url, active: true });
  }
});
