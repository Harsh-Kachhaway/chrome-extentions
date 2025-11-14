// content.js - robust color picker with overlay capturing events

let canvas = null;
let ctx = null;
let img = null;
let picking = false;
let imageLoaded = false;
let overlay = null;

let cachedImage = null; // main screenshot
let cachedCanvas = null; // canvas for screenshot
let cachedCtx = null;

let lastScrollTime = 0;
let scrollTimeout = null;

// Listen for message from popup or other parts
chrome.runtime.onMessage.addListener((msg) => {
  if (msg?.type === "START_PICKER") startPicker();
});

// Public start function (also used when injecting)
function startPicker() {
  if (picking) return;
  picking = true;
  imageLoaded = false;

  // create overlay immediately so user sees crosshair quickly
  createOverlay();

  // ask background to capture visible tab
  chrome.runtime.sendMessage({ type: "CAPTURE_SCREEN" }, (res) => {
    if (!res?.success) {
      teardown();
      return;
    }

    const img2 = new Image();
    img2.src = res.imageUri;

    img2.onload = () => {
      cachedImage = img2;
      cachedCanvas = document.createElement("canvas");
      cachedCanvas.width = img2.width;
      cachedCanvas.height = img2.height;
      cachedCtx = cachedCanvas.getContext("2d");
      cachedCtx.drawImage(img2, 0, 0);

      imageLoaded = true;
      updateOverlayHint("Click to pick color — Esc to cancel");
    };
  });
}

/* ---------- Canvas setup ---------- */
function setupCanvas(imageUri) {
  img = new Image();
  // mark image as cross-origin anonymous just in case (captureVisibleTab images should be same-origin for extension)
  img.crossOrigin = "anonymous";
  img.onload = () => {
    // create canvas sized to the captured image (device pixels)
    canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);
    imageLoaded = true;

    // show small hint on overlay
    updateOverlayHint("Click to pick color — Esc to cancel");
  };
  img.onerror = (err) => {
    console.error("Image load error:", err);
    teardown();
  };
  img.src = imageUri;
}

/* ---------- Overlay creation and event handling ---------- */
function createOverlay() {
  // if overlay already exists, remove it
  removeOverlay();

  overlay = document.createElement("div");
  overlay.id = "ext-colorpicker-overlay";
  Object.assign(overlay.style, {
    position: "fixed",
    left: "0",
    top: "0",
    width: "100vw",
    height: "100vh",
    zIndex: 2147483647, // max z-index to be on top
    cursor: "crosshair",
    background: "transparent",
    // capture events
    pointerEvents: "auto",
    // ensure overlay doesn't block extension devtools overlays
    touchAction: "none",
  });

  // hint box
  const hint = document.createElement("div");
  hint.id = "ext-colorpicker-hint";
  Object.assign(hint.style, {
    position: "fixed",
    right: "12px",
    top: "12px",
    padding: "6px 8px",
    borderRadius: "6px",
    background: "rgba(0,0,0,0.6)",
    color: "white",
    fontSize: "12px",
    fontFamily: "sans-serif",
    zIndex: 2147483648,
    pointerEvents: "none",
  });
  hint.textContent = "Click to pick color — Esc to cancel";
  overlay.appendChild(hint);

  // create zoom lens
  zoomCanvas = document.createElement("canvas");
  zoomCanvas.width = 120;
  zoomCanvas.height = 120;
  Object.assign(zoomCanvas.style, {
    position: "fixed",
    width: "120px",
    height: "120px",
    borderRadius: "10px",
    overflow: "hidden",
    border: "2px solid rgba(255,255,255,0.7)",
    boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
    zIndex: 2147483648,
    pointerEvents: "none",
    background: "#fff",
  });

  overlay.appendChild(zoomCanvas);
  zoomCtx = zoomCanvas.getContext("2d");
  zoomCtx.imageSmoothingEnabled = false;

  // follow pointer, but use cached screenshot
  overlay.addEventListener("pointermove", onZoomMove, { passive: true });

  // detect scroll stop
  window.addEventListener("scroll", onScroll, { passive: true });

  document.documentElement.appendChild(overlay);

  // Use pointerdown/click in capture phase and non-passive so we can preventDefault
  overlay.addEventListener("pointerdown", onPointerDown, {
    capture: true,
    passive: false,
  });
  overlay.addEventListener("click", onClickCapture, {
    capture: true,
    passive: false,
  });

  // Cancel on Escape
  window.addEventListener("keydown", onKeyDown, true);
}

function updateOverlayHint(text) {
  const h = document.getElementById("ext-colorpicker-hint");
  if (h) h.textContent = text;
}

function removeOverlay() {
  if (!overlay) return;
  overlay.removeEventListener("pointerdown", onPointerDown, { capture: true });
  overlay.removeEventListener("click", onClickCapture, { capture: true });
  try {
    overlay.parentNode?.removeChild(overlay);
  } catch (e) {}
  overlay = null;
  window.removeEventListener("keydown", onKeyDown, true);
}

/* ---------- Event handlers ---------- */

// on pointerdown we prevent the page getting it (captures earlier than click)
function onPointerDown(e) {
  // prevent underlying page from receiving pointerdown (some pages use mousedown to open links)
  e.preventDefault();
  e.stopPropagation();
  // keep pointer capture on overlay
}

function onClickCapture(e) {
  e.preventDefault();
  e.stopPropagation();

  // hide zoom lens before screen capture
  if (zoomCanvas) zoomCanvas.style.visibility = "hidden";

  chrome.runtime.sendMessage({ type: "CAPTURE_SCREEN" }, (res) => {
    // restore zoom lens
    if (zoomCanvas) zoomCanvas.style.visibility = "visible";

    if (!res?.success) {
      updateOverlayHint("Screenshot failed");
      return;
    }

    const img = new Image();
    img.src = res.imageUri;

    img.onload = () => {
      const dpr = window.devicePixelRatio || 1;

      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = img.width;
      tempCanvas.height = img.height;
      const tempCtx = tempCanvas.getContext("2d");

      tempCtx.drawImage(img, 0, 0);

      const x = Math.round(e.clientX * dpr);
      const y = Math.round(e.clientY * dpr);

      let pixel;
      try {
        pixel = tempCtx.getImageData(x, y, 1, 1).data;
      } catch (err) {
        updateOverlayHint("Pixel read error");
        return;
      }

      const hex = rgbToHex(pixel[0], pixel[1], pixel[2]);
      showResultOverlay(hex);
      tryCopyToClipboard(hex);

      setTimeout(teardown, 3000);
    };
  });
}

function onKeyDown(e) {
  if (e.key === "Escape") {
    // cancel
    e.preventDefault();
    e.stopPropagation();
    teardown();
  }
}

/* ---------- UI for result ---------- */
function showResultOverlay(hex, r, g, b) {
  updateOverlayHint(`Picked: ${hex}`);
  // small color square near hint
  let square = document.getElementById("ext-colorpicker-result-square");
  if (!square) {
    square = document.createElement("div");
    square.id = "ext-colorpicker-result-square";
    Object.assign(square.style, {
      position: "fixed",
      right: "12px",
      top: "44px",
      width: "36px",
      height: "36px",
      borderRadius: "6px",
      border: "1px solid rgba(255,255,255,0.6)",
      zIndex: 2147483648,
      pointerEvents: "none",
    });
    document.documentElement.appendChild(square);
  }
  square.style.background = hex;
  // optional: copy to clipboard using background message
  tryCopyToClipboard(hex);
}

/* ---------- Utility: copy to clipboard via background (clipboardWrite may be needed) ---------- */
function tryCopyToClipboard(hex) {
  // Try navigator.clipboard first
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(hex).then(
      () => updateOverlayHint(`Copied ${hex}`),
      () => {
        // fallback to messaging background
        chrome.runtime.sendMessage({ type: "COPY_TO_CLIPBOARD", text: hex });
      }
    );
  } else {
    chrome.runtime.sendMessage({ type: "COPY_TO_CLIPBOARD", text: hex });
  }
}

/* ---------- Cleanup ---------- */
function teardown() {
  removeOverlay();
  imageLoaded = false;
  if (canvas) {
    canvas.width = 0;
    canvas.height = 0;
    canvas = null;
    ctx = null;
  }
  // remove any result square if present
  const sq = document.getElementById("ext-colorpicker-result-square");
  if (sq) sq.parentNode?.removeChild(sq);
  picking = false;
}

/* ---------- Helpers ---------- */
function rgbToHex(r, g, b) {
  return (
    "#" +
    [r, g, b]
      .map((x) => {
        const s = x.toString(16);
        return s.length === 1 ? "0" + s : s;
      })
      .join("")
      .toUpperCase()
  );
}

function onZoomMove(e) {
  if (!cachedImage || !zoomCtx) return;

  // move zoom lens near cursor
  zoomCanvas.style.left = e.clientX + 20 + "px";
  zoomCanvas.style.top = e.clientY + 20 + "px";

  const dpr = window.devicePixelRatio || 1;

  const sx = Math.round(e.clientX * dpr - 20);
  const sy = Math.round(e.clientY * dpr - 20);

  zoomCtx.clearRect(0, 0, zoomCanvas.width, zoomCanvas.height);

  try {
    zoomCtx.drawImage(
      cachedImage,
      sx,
      sy,
      40,
      40,
      0,
      0,
      120,
      120 // zoom output
    );
  } catch (_) {}
}

function onScroll() {
  console.log("working");
  if (zoomCanvas) zoomCanvas.style.visibility = "hidden";

  lastScrollTime = Date.now();

  if (scrollTimeout) clearTimeout(scrollTimeout);

  scrollTimeout = setTimeout(() => {
    // scrolling stopped → refresh screenshot
    chrome.runtime.sendMessage({ type: "CAPTURE_SCREEN" }, (res) => {
      if (zoomCanvas) zoomCanvas.style.visibility = "visible";
      if (!res?.success) return;

      const img2 = new Image();
      img2.src = res.imageUri;

      img2.onload = () => {
        cachedImage = img2;
        cachedCanvas.width = img2.width;
        cachedCanvas.height = img2.height;
        cachedCtx.drawImage(img2, 0, 0);
      };
    });
  }, 160); // wait for scroll to stop
}

/* ---------- Expose startPicker in page context so scripting.executeScript can call it ----------
   If you prefer not to expose, you can keep using chrome.runtime message. */
window.startPicker = startPicker;
