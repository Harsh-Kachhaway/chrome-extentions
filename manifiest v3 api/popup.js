// Change background color
document.getElementById("bgColor").addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      func: () => { document.body.style.backgroundColor = "lightblue"; }
    });
  });
});

// Inject CSS
document.getElementById("injectCSS").addEventListener("click", () => {
  // alert("hello")
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting.insertCSS({
      target: { tabId: tabs[0].id },
      files: ["styles.css"]
    });
  });
});

// Modify text
document.getElementById("modifyText").addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      func: () => {
        document.body.innerText = "Hello Chrome Extension!";
      }
    });
  });
});
