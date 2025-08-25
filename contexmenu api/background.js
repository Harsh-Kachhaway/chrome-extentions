// Create menu items when extension is installed
chrome.runtime.onInstalled.addListener(() => {
  // Right-click anywhere
  chrome.contextMenus.create({
    id: "sayHello",
    title: "Say Hello 👋",
    contexts: ["all"]
  });

  // Right-click selected text
  chrome.contextMenus.create({
    id: "searchGoogle",
    title: "Search Google for '%s'",
    contexts: ["selection"]
  });

  // Right-click an image
  chrome.contextMenus.create({
    id: "downloadImage",
    title: "Download This Image",
    contexts: ["image"]
  });
});

// Handle clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "sayHello") {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => alert("Hello from your extension!")
    });
  }

  if (info.menuItemId === "searchGoogle") {
    let query = info.selectionText;
    chrome.tabs.create({
      url: "https://www.google.com/search?q=" + encodeURIComponent(query)
    });
  }

  if (info.menuItemId === "downloadImage") {
    chrome.downloads.download({
      url: info.srcUrl
    });
  }
});
