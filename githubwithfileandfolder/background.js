const activeFolderDownloads = new Map();

/**
 * Show Chrome notification
 */
function notify(title, message) {
  chrome.notifications.create({
    type: "basic",
    iconUrl: "icon128.png", // optional, can remove if you don’t have one
    title,
    message
  });
}

/**
 * Track completed downloads
 */
chrome.downloads.onChanged.addListener((delta) => {
  if (!delta.state || delta.state.current !== "complete") return;

  // Check if this download belongs to a folder download
  for (const [key, info] of activeFolderDownloads.entries()) {
    info.completed++;

    if (info.completed >= info.total) {
      notify("Download completed", "Folder download completed");
      activeFolderDownloads.delete(key);
    }
    return;
  }

  // Single file download
  notify("Download completed", "File download completed");
});

/**
 * Download a single file
 */
function downloadFile({ url, filename }) {
  chrome.downloads.download({
    url,
    filename,
    conflictAction: "uniquify",
    saveAs: false
  });
}

/**
 * Download folder recursively
 */
async function downloadFolder({ owner, repo, branch, path }) {
  const apiUrl = `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`;
  const res = await fetch(apiUrl);
  const data = await res.json();

  if (!data.tree) return;

  const files = data.tree.filter(
    (item) => item.type === "blob" && item.path.startsWith(path + "/")
  );

  if (!files.length) return;

  const folderKey = `${repo}/${path}`;
  activeFolderDownloads.set(folderKey, {
    total: files.length,
    completed: 0
  });

  for (const file of files) {
    const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${file.path}`;

    chrome.downloads.download({
      url: rawUrl,
      filename: `${repo}/${file.path}`,
      conflictAction: "uniquify",
      saveAs: false
    });
  }
}

/**
 * Message handler
 */
chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === "DOWNLOAD_FILE") {
    downloadFile(msg);
  }

  if (msg.type === "DOWNLOAD_FOLDER") {
    downloadFolder(msg);
  }
});
