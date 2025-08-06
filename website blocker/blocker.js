// Hide entire page instantly
document.documentElement.style.display = "none";

// Optional: block only when focus mode is enabled
chrome.storage.sync.get("focus", ({ focus }) => {
  if (!focus) {
    document.documentElement.style.display = ""; // unhide if focus mode is off
  }
});
