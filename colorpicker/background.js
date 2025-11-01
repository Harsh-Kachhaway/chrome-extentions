chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "CAPTURE_SCREEN") {
    try {
      chrome.tabs.captureVisibleTab(
        null,
        { format: "png" },
        (imageUri) => {
          if (chrome.runtime.lastError) {
            console.error("Capture error:", chrome.runtime.lastError.message);
            sendResponse({
              success: false,
              error: chrome.runtime.lastError.message,
            });
          } else if (!imageUri) {
            sendResponse({
              success: false,
              error: "Capture returned empty imageUri",
            });
          } else {
            sendResponse({ success: true, imageUri });
          }
        }
      );
    } catch (err) {
      console.error("Exception:", err);
      sendResponse({ success: false, error: err.message });
    }

    // IMPORTANT! Keeps the message channel open
    return true;
  }
});
