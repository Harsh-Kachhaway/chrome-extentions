chrome.runtime.onMessage.addListener((message, sender) => {
  if (message.action === "inject_script" && sender.tab && sender.tab.id) {
    chrome.scripting.executeScript({
      target: { tabId: sender.tab.id },
      files: ['injected.js']
    }).then(() => {
      console.log("Injected script successfully.");
    }).catch(err => {
      console.error("Script injection failed:", err);
    });
  }
});
