var authuser = "0";

// ---------------- HELPERS ----------------

function getAuthUserFromUrl(url) {
  const match = url.match(/\/u\/(\d+)/);
  return match ? match[1] : "0";
}

function extractFileId(href) {
  const match = href.match(/\/d\/([a-zA-Z0-9_-]+)/);
  return match ? match[1] : null;
}

function hasBeenModified(container) {
  return container.querySelector(".clas_download_icon_btn") !== null;
}

// ---------------- CORE ----------------

function DetectFiles() {
  const imgElements = document.querySelectorAll(
    'img[data-mime-type]:not([data-mime-type="application/vnd.google-apps.kix"])'
  );

  imgElements.forEach((imgEl) => {
    const anchor = imgEl.closest("a");
    if (!anchor || !anchor.href) return;

    // 👇 SAME LOGIC AS YOUR STABLE CODE
    const container = anchor.parentElement?.parentElement;
    if (!container || hasBeenModified(container)) return;

    const fileId = extractFileId(anchor.href);
    if (!fileId) return;

    const fileName = anchor.title || "download";

    const btn = document.createElement("a");
    btn.className = "clas_download_icon_btn";
    btn.href = `https://drive.google.com/uc?export=download&authuser=${authuser}&id=${fileId}`;
    btn.download = fileName;
    btn.title = "Download";

    btn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
        viewBox="0 0 24 24" fill="none" stroke="currentColor"
        stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
        <polyline points="7 10 12 15 17 10"/>
        <line x1="12" y1="15" x2="12" y2="3"/>
      </svg>
    `;

    container.appendChild(btn);
  });
}

// ---------------- INIT ----------------

function initialize() {
  authuser = getAuthUserFromUrl(window.location.href);
  DetectFiles();
}

window.addEventListener("load", initialize);

// ---------------- BACKGROUND MSG ----------------

chrome.runtime.onMessage.addListener((req) => {
  if (req.message === "update" && req.url) {
    authuser = getAuthUserFromUrl(req.url);
    DetectFiles();
  }
});

// ---------------- OBSERVER ----------------

const observer = new MutationObserver(() => {
  DetectFiles();
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});
