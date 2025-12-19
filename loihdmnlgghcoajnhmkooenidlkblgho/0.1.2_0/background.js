//This script is sending updates to ContentScript.js if url changes

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  // read changeInfo data and do something with it
  // like send the new url to contentscripts.js
  if (changeInfo.url) {
    chrome.tabs.sendMessage(tabId, {
      message: "update",
      url: changeInfo.url,
    });
  }
});
