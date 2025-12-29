function injectDownloadButtons() {
  const rows = document.querySelectorAll("tr.react-directory-row");

  rows.forEach((row) => {
    if (row.dataset.downloadInjected) return;

    const link = row.querySelector("a.Link--primary");
    const ageDiv = row.querySelector(".react-directory-commit-age");
    if (!link || !ageDiv) return;

    row.dataset.downloadInjected = "true";

    const isFolder = link.href.includes("/tree/");
    const isFile = link.href.includes("/blob/");

    let downloadUrl = "";
    let filename = "";

    if (isFile) {
      downloadUrl = link.href
        .replace("github.com", "raw.githubusercontent.com")
        .replace("/blob/", "/");
      filename = link.textContent.trim();
    }

    if (isFolder) {
      const { owner, repo, branch, path } = parseFolderUrl(link.href);
      downloadUrl = `https://github.com/${owner}/${repo}/archive/refs/heads/${branch}.zip?path=${path}`;
    }

    const btn = document.createElement("button");
    btn.textContent = "⬇";
    btn.className = "gh-oneclick-download";
    btn.title = isFolder ? "Download folder" : "Download file";

    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      e.preventDefault();

      if (isFolder) {
        chrome.runtime.sendMessage({
          type: "DOWNLOAD_FOLDER",
          url: downloadUrl,
        });
        return;
      }

      // file logic stays same
    });

    ageDiv.insertAdjacentElement("afterend", btn);
  });
}

function parseFolderUrl(url) {
  const parts = new URL(url).pathname.split("/").filter(Boolean);
  return {
    owner: parts[0],
    repo: parts[1],
    branch: parts[3],
    path: parts.slice(4).join("/"),
  };
}

const observer = new MutationObserver(injectDownloadButtons);
observer.observe(document.body, { childList: true, subtree: true });
injectDownloadButtons();
