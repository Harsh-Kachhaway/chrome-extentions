chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === "DOWNLOAD_FOLDER") {
    chrome.downloads.download({
      url: msg.url,
      filename: msg.filename,
      conflictAction: "uniquify",
      saveAs: true, // 👈 keep this TRUE
    });
  }
});
