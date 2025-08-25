chrome.tabs.onCreated.addListener((tab) => {
  // Update the newly created tab to go to example.com
  // chrome.tabs.move(tab.id, { index: 0 });
  console.log("hello")
  
});
chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
  // chrome.tabs.create({ url: "https://example.com", active: false });
  
});

chrome.tabs.onActivated.addListener((activeInfo) => {
  // chrome.tabs.create({ url: "https://example.com", active: true });
// chrome.tabs.update({ url: "https://google.com" });s

});
