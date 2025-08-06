chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (!changeInfo.url && changeInfo.status !== "loading") return;

  const { focus, blocklist = [] } = await chrome.storage.sync.get(["focus", "blocklist"]);

  if (!focus || !blocklist.length) return;

  const url = new URL(tab.url);
  if (blocklist.some(site => url.hostname.includes(site))) {
    chrome.scripting.executeScript({
      target: { tabId },
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
