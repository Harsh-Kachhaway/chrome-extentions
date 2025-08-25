const fontSelect = document.getElementById("fontSelect");
const fontSize = document.getElementById("fontSize");
const fontSizeValue = document.getElementById("fontSizeValue");

// Update label display
fontSize.oninput = () => {
  fontSizeValue.textContent = fontSize.value + "px";
};

// Load saved values when popup opens
chrome.storage.sync.get(["fontFamily", "fontSize"], (data) => {
  if (data.fontFamily) fontSelect.value = data.fontFamily;
  if (data.fontSize) {
    fontSize.value = data.fontSize;
    fontSizeValue.textContent = data.fontSize + "px";
  }
});

// Function to send font update message to content script
function sendFontUpdate() {
  const selectedFont = fontSelect.value;
  const selectedSize = fontSize.value;

  // Save new values to storage
  chrome.storage.sync.set({
    fontFamily: selectedFont,
    fontSize: selectedSize
  });

  // Send message to the content script
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, {
      type: "UPDATE_FONT",
      fontFamily: selectedFont,
      fontSize: selectedSize
    });
  });
}

// Add listeners
fontSelect.addEventListener("change", sendFontUpdate);
fontSize.addEventListener("change", sendFontUpdate);
