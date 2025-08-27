let mute = [];
let unmute = [];

// Load saved data
chrome.storage.local.get(["muteID", "unmuteID"], (items) => {
  mute = (items && items.muteID) || [];
  unmute = (items && items.unmuteID) || [];
});

// Handle messages
chrome.runtime.onMessage.addListener((msg) => {
  if (msg === "clear") enforceMuteRule();
});

// Core mute logic
async function enforceMuteRule() {
  const { ison } = await chrome.storage.local.get("ison");
  const tabs = await chrome.tabs.query({});
  const [activeTab] = await chrome.tabs.query({
    active: true,
    currentWindow: true,
  });

  for (let tab of tabs) {
    let shouldMute;

    if (!ison) {
      // Global mute OFF
      shouldMute = mute.includes(tab.id);
    } else {
      // Global mute ON
      if (tab.active) {
        shouldMute = mute.includes(tab.id); // active tab follows mute list
      } else {
        shouldMute = !unmute.includes(tab.id) || mute.includes(tab.id);
      }
    }

    chrome.tabs.update(tab.id, { muted: shouldMute });
  }
}

// Run at startup
enforceMuteRule();

// Events that trigger re-check
[
  chrome.tabs.onActivated,
  chrome.windows.onFocusChanged,
  chrome.tabs.onCreated,
  chrome.tabs.onUpdated,
].forEach((ev) => ev.addListener(enforceMuteRule));

// Storage updates
chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== "local") return;

  if (changes.muteID) mute = changes.muteID.newValue || [];
  if (changes.unmuteID) unmute = changes.unmuteID.newValue || [];

  if (changes.ison) enforceMuteRule();
});

// Install / Update
chrome.runtime.onInstalled.addListener(() => {
  chrome.tabs.create({
    url: chrome.runtime.getURL("/setting/setting.html"),
  });
  chrome.storage.local.set({ muteID: mute, unmuteID: unmute });
});
