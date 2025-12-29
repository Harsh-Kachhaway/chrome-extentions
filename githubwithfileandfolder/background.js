async function downloadFolder({ owner, repo, branch, path }) {
  const apiUrl = `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`;
  const res = await fetch(apiUrl);
  const data = await res.json();

  if (!data.tree) return;

  const files = data.tree.filter(
    item => item.type === 'blob' && item.path.startsWith(path + '/')
  );

  for (const file of files) {
    const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${file.path}`;

    chrome.downloads.download({
      url: rawUrl,
      filename: file.path, // Chrome auto-creates folders
      conflictAction: 'uniquify',
      saveAs: false
    });
  }
}

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === 'DOWNLOAD_FILE') {
    chrome.downloads.download({
      url: msg.url,
      filename: msg.filename,
      conflictAction: 'uniquify',
      saveAs: false
    });
  }

  if (msg.type === 'DOWNLOAD_FOLDER') {
    downloadFolder(msg);
  }
});
