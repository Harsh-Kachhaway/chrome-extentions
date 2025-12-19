var authuser = 0;

function getAuthUserFromUrl(url) {
  // Extract authuser from the given URL
  let urlParts = url.split("/");
  if (urlParts.length > 4) {
    return urlParts[4];
  }
  return 0;
}

function hasBeenModified(el) {
  return el.querySelector(".clas_download_icon_btn") !== null;
}

// Detect all files that can be downloaded and save them in an array
function DetectFiles() {
  const imgElements = document.querySelectorAll("img");
  imgElements.forEach((imgEl) => {
    // Check if image has data-mime-type attribute and if the parent item has the download button
    if (
      imgEl.getAttribute("data-mime-type") &&
      imgEl.getAttribute("data-mime-type") != "application/vnd.google-apps.kix"
    ) {
      // Get parent item
      var parent = imgEl.parentElement.parentElement.parentElement;

      // Check if it already has been modified
      if (hasBeenModified(parent)) {
        return;
      }

      // Add a download link
      var downloadLink = document.createElement("a");
      downloadLink.classList.add("clas_download_icon_btn");

      const fileId = imgEl.parentElement.parentElement.href.split("/")[5];
      const fileName = imgEl.parentElement.parentElement.title;

      const link =
        "https://drive.google.com/uc?export=download&authuser=" + authuser + "&id=" + fileId;
      downloadLink.download = fileName;
      downloadLink.href = link;

      downloadLink.innerHTML =
        '<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-download" width="44" height="44" viewBox="0 0 24 24" stroke-width="1.5" stroke="#2c3e50" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-2" /><path d="M7 11l5 5l5 -5" /><path d="M12 4l0 12" /></svg>';
      parent.appendChild(downloadLink);
    }
  });
}

function initialize() {
  // Get the current URL and extract the authuser
  const currentUrl = window.location.href;
  authuser = getAuthUserFromUrl(currentUrl);

  // Run DetectFiles initially
  DetectFiles();
}

// Run the initialize function on load
window.addEventListener("load", function () {
  console.log("FIRE LOAD");
  initialize();
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  // Listen for messages sent from background.js
  if (request.message === "update") {
    console.log("New URL: ", request.url); // new URL is now in content scripts!
    authuser = getAuthUserFromUrl(request.url);
    console.log(authuser);
    DetectFiles();
  }
});

var observer = new MutationObserver(function (mutations) {
  DetectFiles();
});

observer.observe(document, {
  attributes: false,
  childList: true,
  characterData: false,
  subtree: true,
});
