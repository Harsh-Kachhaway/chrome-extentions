document.getElementById("notifyBtn").addEventListener("click", () => {
  chrome.runtime.sendMessage({ action: "notify" });
});
document.getElementById("basicBtn").addEventListener("click", () => {
  chrome.runtime.sendMessage({ action: "basic" });
});
document.getElementById("listBtn").addEventListener("click", () => {
  chrome.runtime.sendMessage({ action: "list" });
});
document.getElementById("bannerBtn").addEventListener("click", () => {
  chrome.runtime.sendMessage({ action: "image" });
});
document.getElementById("progressBtn").addEventListener("click", () => {
  chrome.runtime.sendMessage({ action: "progress" });
});
