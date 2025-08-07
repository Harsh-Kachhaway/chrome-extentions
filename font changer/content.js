function applyFontStyles(font, size) {
  const fontSize = parseInt(size || "16");
  const lineHeight = Math.round(fontSize * 1.5);

  const tags = [
    "p", "span", "div", "h1", "h2", "h3", "h4", "h5", "h6",
    "a", "li", "td", "th", "strong", "em", "b", "i", "button", "label"
  ];

  tags.forEach(tag => {
    document.querySelectorAll(tag).forEach(el => {
      el.style.setProperty("font-family", font, "important");
      el.style.setProperty("font-size", `${fontSize}px`, "important");
      el.style.setProperty("line-height", `${lineHeight}px`, "important");
    });
  });
}

// Initial load
chrome.storage.sync.get(["fontFamily", "fontSize"], (data) => {
  applyFontStyles(data.fontFamily || "Arial", data.fontSize || "16");
});

// Listen for changes from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "UPDATE_FONT") {
    applyFontStyles(message.fontFamily, message.fontSize);
  }
});
