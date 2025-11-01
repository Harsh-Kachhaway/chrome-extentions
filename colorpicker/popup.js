document.addEventListener("DOMContentLoaded", async () => {
  const btn = document.getElementById("start");

  btn.addEventListener("click", async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        if (typeof startPicker === "function") startPicker();
        else alert("Content script not ready yet.");
      },
    });

    window.close();
  });
});
