function parseGitHubUrl(url) {
  const parts = new URL(url).pathname.split("/").filter(Boolean);
  return {
    owner: parts[0],
    repo: parts[1],
    branch: parts[3],
    path: parts.slice(4).join("/"),
  };
}

function injectDownloadButtons() {
  const rows = document.querySelectorAll("tr.react-directory-row");

  rows.forEach((row) => {
    if (row.dataset.ghInjected) return;

    const link = row.querySelector("a.Link--primary");
    const ageDiv = row.querySelector(".react-directory-commit-age");
    if (!link || !ageDiv) return;

    // ⛔ Hide download button for `.files`
    const fileName = link.textContent.trim();
    if (fileName.startsWith(".")) return;

    row.dataset.ghInjected = "true";

    const isFile = link.href.includes("/blob/");
    const isFolder = link.href.includes("/tree/");

    const btn = document.createElement("button");
    btn.textContent = "⬇";
    btn.className = "gh-download-btn";
    btn.title = isFolder ? "Download folder" : "Download file";

    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();

      const fileName = link.textContent.trim();
      const isDotFile = fileName.startsWith(".");

      if (isFile) {
        const rawUrl = link.href
          .replace("github.com", "raw.githubusercontent.com")
          .replace("/blob/", "/");

        const { repo } = parseGitHubUrl(link.href);

        chrome.runtime.sendMessage({
          type: "DOWNLOAD_FILE",
          url: rawUrl,
          filename: isDotFile
            ? `${repo}/.files/${fileName}`
            : `${repo}/${fileName}`,
        });
      }

      if (isFolder) {
        const info = parseGitHubUrl(link.href);

        chrome.runtime.sendMessage({
          type: "DOWNLOAD_FOLDER",
          ...info,
        });
      }
    });

    const td = ageDiv.closest("td");
    if (!td) return;

    const newTd = document.createElement("td");
    newTd.className = "gh-download-cell";

    newTd.appendChild(btn);

    // insert as new column in the same row
    row.appendChild(newTd);
  });
}

const observer = new MutationObserver(injectDownloadButtons);
observer.observe(document.body, { childList: true, subtree: true });
injectDownloadButtons();
