// ---------------- HELPERS ----------------

function extractFileId(href) {
  const match = href.match(/\/d\/([a-zA-Z0-9_-]+)/);
  return match ? match[1] : null;
}

// IMPORTANT: extract filename WITH extension
function extractFileName(anchor) {
  // 1️⃣ title attribute (most reliable)
  if (anchor.title && anchor.title.includes(".")) {
    return anchor.title.trim();
  }

  // 2️⃣ visible text
  const text = anchor.innerText.trim();
  if (text.includes(".")) {
    return text;
  }

  // 3️⃣ fallback
  return "file";
}

// ---------------- CORE ----------------

function injectDownloadAllButtons() {
  const posts = document.querySelectorAll("li.tfGBod");

  posts.forEach((post) => {
    if (post.querySelector(".clas_download_all")) return;

    // Header area
    const header =
      post.querySelector(".xVnXCf") ||
      post.querySelector(".jWCzBe") ||
      post;

    if (!header) return;

    // Post title (from your HTML)
    const titleEl = post.querySelector("span.Vu2fZd.Cx437e");
    const postTitle = titleEl ? titleEl.innerText.trim() : "Classwork";

    // All Drive files in this post
    const fileLinks = post.querySelectorAll(
      'a[href*="drive.google.com/file/d/"]'
    );
    if (fileLinks.length === 0) return;

    // Button
    const btn = document.createElement("button");
    btn.className = "clas_download_all";
    btn.textContent = "⬇ Download All";

    btn.onclick = () => {
      const files = [];

      fileLinks.forEach((a) => {
        const fileId = extractFileId(a.href);
        if (!fileId) return;

        files.push({
          fileId,
          fileName: extractFileName(a) // ✅ FIX
        });
      });

      chrome.runtime.sendMessage({
        type: "DOWNLOAD_POST",
        postTitle,
        files
      });
    };

    header.appendChild(btn);
  });
}

// ---------------- SPA OBSERVER ----------------

const observer = new MutationObserver(() => {
  injectDownloadAllButtons();
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});

// Initial run
injectDownloadAllButtons();
