const fontSelect = document.getElementById("fontSelect");
const fontSize = document.getElementById("fontSize");
const fontSizeValue = document.getElementById("fontSizeValue");

// Show current value
fontSize.oninput = () => {
  fontSizeValue.textContent = fontSize.value + "px";
};

// Load saved settings
chrome.storage.sync.get(["fontFamily", "fontSize"], (data) => {
  if (data.fontFamily) fontSelect.value = data.fontFamily;
  if (data.fontSize) {
    fontSize.value = data.fontSize;
    fontSizeValue.textContent = data.fontSize + "px";
  }
});

function updateFontSettings() {
  const selectedFont = fontSelect.value;
  const selectedSize = fontSize.value;

  // Save to storage
  chrome.storage.sync.set({
    fontFamily: selectedFont,
    fontSize: selectedSize,
  });

  // Inject into active tab immediately
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      func: (font, size) => {
        const old = document.getElementById("font-style-extension");
        if (old) old.remove();

        const style = document.createElement("style");
        style.id = "font-style-extension";

        // Convert size from string to number and compute line height
        const fontSize = parseInt(size);
        const lineHeight = Math.round(fontSize * 1); // Adjust multiplier if needed

        style.innerText = `
  html, body, p, span, div, h1, h2, h3, h4, h5, h6,
  a, li, td, th, strong, em, b, i, button, label,
  section *, article *, main *, header *, footer * {
    font-family: '${font}' !important;
    font-size: ${size}px !important;
    line-height: ${lineHeight}px !important;
  }
`;

        document.head.appendChild(style);
      },
      args: [selectedFont, selectedSize],
    });
  });
}

// Event listeners
fontSelect.addEventListener("change", updateFontSettings);
fontSize.addEventListener("change", updateFontSettings);

