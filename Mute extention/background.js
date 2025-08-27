let override = [];
let unmute = [];
chrome.storage.local.get(null, (items) => {
  override = items.id;
  unmute = items.unmuteID;
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log(message); // { key: "value" }
  if (message === "clear") {
    enforceMuteRule();
  }
});

function enforceMuteRule() {
  chrome.storage.local.get("ison", async (data) => {
    let tabs = await chrome.tabs.query({});
    let [activeTab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    if (data.ison != true) {
      tabs.forEach((tab) => {
        if (unmute.includes(tab.id)) {
          chrome.tabs.update(tab.id, { muted: false });
        } else if (override.includes(tab.id)) {
          chrome.tabs.update(tab.id, { muted: true });
        } else {
          chrome.tabs.update(tab.id, { muted: false });
        }
      });
    } else {
      // Loop over all tabs
      for (let tab of tabs) {
        if (tab.active == true) {
          if (unmute.includes(tab.id)) {
            chrome.tabs.update(tab.id, { muted: false });
          } else if (override.includes(tab.id)) {
            chrome.tabs.update(tab.id, { muted: true });
          } else {
            chrome.tabs.update(tab.id, { muted: false }); // default for active
          }
        } else  {
          // ✅ Non-active tab rules
          if (override.includes(tab.id)) {
            chrome.tabs.update(tab.id, { muted: true });
          } else if (unmute.includes(tab.id)) {
            chrome.tabs.update(tab.id, { muted: false });
          } else {
            chrome.tabs.update(tab.id, { muted: true }); // default for inactive
          }
        }
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
  chrome.storage.local.get(null, (items) => {
    override = items.id;
  });
  if (area === "local" && "ison" in changes) {
    console.log("change");
    enforceMuteRule();
  }
});

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === "install" || "update") {
    // chrome.tabs.create({
    //   url: chrome.runtime.getURL("/setting/setting.html")
    // });
    chrome.storage.local.set({ id: override });
    chrome.storage.local.set({ unmuteID: unmute });
  }
});
