let count = 0;

chrome.action.onClicked.addListener((tab) => {
  console.log(count)
  count++;
  chrome.action.setBadgeText({ text: String(count) });
  chrome.action.setBadgeBackgroundColor({ color: "blue" });
});
