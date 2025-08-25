chrome.tabs.onCreated.addListener((tab) => {
  // Update the newly created tab to go to example.com
  
  // chrome.tabs.move(tab.id, { index: 0 });
});


// List all open tabs
document.getElementById("listTabs").addEventListener("click", () => {
  
  
  
  
  chrome.tabs.query({}, (tabs) => {
    // chrome.tabs.remove(tabs[8].id);
    let tabList = document.getElementById("tabList");
    tabList.innerHTML = ""; // Clear old list
    
    tabs.forEach((tab) => {
      let li = document.createElement("li");
      li.textContent = tab.title;
      // chrome.tabs.reload();

      // Click to switch to tab
      li.addEventListener("click", () => {
        chrome.tabs.update(tab.id, { active: true });
          // chrome.tabs.duplicate(tabs[0].id);
          // chrome.tabs.captureVisibleTab(null, { format: "png" }, (dataUrl) => {
//   console.log("Screenshot:", dataUrl);
// });



      });

      // Right-click to close tab
      li.addEventListener("contextmenu", (e) => {
        e.preventDefault();
        chrome.tabs.remove(tab.id);
      });

      tabList.appendChild(li);
    });
  });
});


