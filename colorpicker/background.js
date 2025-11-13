chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {

  if (msg.type === "CAPTURE_SCREEN") {
    chrome.tabs.captureVisibleTab(
      null,
      { format: "png" },
      (imageUri) => {
        if (chrome.runtime.lastError) {
          sendResponse({
            success: false,
            error: chrome.runtime.lastError.message,
          });
        } else if (!imageUri) {
          sendResponse({
            success: false,
            error: "Empty screenshot",
          });
        } else {
          sendResponse({ success: true, imageUri });
        }
      }
    );

    return true; // keep message channel open
  }

  if (msg.type === "COPY_TO_CLIPBOARD") {
    navigator.clipboard.writeText(msg.text).catch(() => {});
  }

});
