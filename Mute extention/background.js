function enforceMuteRule() {
  chrome.storage.local.get("ison", async (data) => {
    let tabs = await chrome.tabs.query({});
    let [activeTab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    if (data.ison != true) {
      tabs.forEach((tab) => {
        chrome.tabs.update(tab.id, { muted: false });
      });
    } else {
      if (!activeTab) return;

      // Loop over all tabs
      for (let tab of tabs) {
        tab.id === activeTab.id
          ? chrome.tabs.update(tab.id, { muted: false })
          : chrome.tabs.update(tab.id, { muted: true });
      }
    }
  });
}

// Run once at startup
enforceMuteRule();

// Whenever active tab changes
chrome.tabs.onActivated.addListener(() => {
  enforceMuteRule();
});

// Whenever window focus changes
chrome.windows.onFocusChanged.addListener(() => {
  enforceMuteRule();
});

// Whenever a new tab is created
chrome.tabs.onCreated.addListener(() => {
  enforceMuteRule();
});

// Optional: whenever a tab is updated (like navigation/refresh)
chrome.tabs.onUpdated.addListener(() => {
  enforceMuteRule();
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "local" && "ison" in changes) {
    console.log("change");
    enforceMuteRule();
  }
});

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === "install" || "") {
    chrome.tabs.create({
      url: chrome.runtime.getURL("/setting/setting.html")
    });
  }
});

