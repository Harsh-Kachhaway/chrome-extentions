chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type !== "DOWNLOAD_POST") return;

  // Sanitize folder name
  const safeFolder = msg.postTitle.replace(/[<>:"/\\|?*]/g, "");

  msg.files.forEach((file) => {
    const url = `https://drive.google.com/uc?export=download&id=${file.fileId}`;

    chrome.downloads.download({
      url,
      filename: `Classroom/${safeFolder}/${file.fileName}`,
      conflictAction: "uniquify"
    });
  });
});
