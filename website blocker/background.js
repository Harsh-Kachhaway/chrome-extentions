const updateRules = async (blocklist) => {
  const rules = blocklist.map((url, index) => ({
    id: index + 1,
    priority: 1,
    action: { type: "block" },
    condition: {
      urlFilter: url,
      resourceTypes: ["main_frame"]
    }
  }));

  chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: rules.map(r => r.id),
    addRules: rules
  });
};

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({ blocklist: [], focus: false });
});

chrome.storage.onChanged.addListener((changes) => {
  chrome.storage.sync.get(["blocklist", "focus"], ({ blocklist, focus }) => {
    if (focus) updateRules(blocklist);
    else updateRules([]); // remove all
  });
});

chrome.declarativeNetRequest.getDynamicRules().then(rules => {
  console.log("Current rules:", rules);
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (!changeInfo.url && !tab.url) return;

  const { focus, blocklist = [] } = await chrome.storage.sync.get(["focus", "blocklist"]);

  if (!focus) return;

  const url = tab.url || changeInfo.url;

  if (blocklist.some(site => url.includes(site))) {
    // Inject script that hides page content
    chrome.scripting.executeScript({
  target: { tabId: tabId },
  func: () => {
    document.body.innerHTML = `
      <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;text-align:center">
        <h1 style="font-size:3rem;">🚫 Blocked during Focus Mode</h1>
        <p style="font-size:1.5rem;">Stay focused, come back later.</p>
      </div>
    `;
    document.title = "Blocked Site";
  }
});

  }
});
