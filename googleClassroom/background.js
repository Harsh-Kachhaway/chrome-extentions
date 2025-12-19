// Background / Service Worker (MV3)

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (!changeInfo.url) return;

  // Only react to Google Classroom URLs
  if (!changeInfo.url.includes("classroom.google.com")) return;

  chrome.tabs.sendMessage(
    tabId,
    {
      message: "update",
      url: changeInfo.url
    },
    () => {
      // Ignore error if content script not injected yet
      if (chrome.runtime.lastError) return;
    }
  );
});
