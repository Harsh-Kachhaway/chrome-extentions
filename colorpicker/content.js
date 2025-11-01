// content.js - robust color picker with overlay capturing events

let canvas = null;
let ctx = null;
let img = null;
let picking = false;
let imageLoaded = false;
let overlay = null;

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
    if (chrome.runtime.lastError) {
      console.error("Message error:", chrome.runtime.lastError.message);
      teardown();
      return;
    }
    if (!res || !res.success) {
      console.error("Failed to capture:", res?.error);
      teardown();
      return;
    }
    setupCanvas(res.imageUri);
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

  document.documentElement.appendChild(overlay);

  // Use pointerdown/click in capture phase and non-passive so we can preventDefault
  overlay.addEventListener("pointerdown", onPointerDown, { capture: true, passive: false });
  overlay.addEventListener("click", onClickCapture, { capture: true, passive: false });

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
  // prevent page navigation
  e.preventDefault();
  e.stopPropagation();

  if (!imageLoaded || !canvas || !ctx) {
    // still loading: show message
    updateOverlayHint("Preparing screenshot... please wait");
    return;
  }

  // compute coordinates relative to viewport and convert to image pixels
  // clientX/clientY are viewport CSS pixels
  const clientX = e.clientX;
  const clientY = e.clientY;

  // Calculate device pixel coordinate according to devicePixelRatio and scroll
  // captureVisibleTab captures the currently visible viewport. Use window.devicePixelRatio and scroll offsets.
  const dpr = window.devicePixelRatio || 1;
  const x_img = Math.round((clientX + window.scrollX) * dpr);
  const y_img = Math.round((clientY + window.scrollY) * dpr);

  // Clamp to canvas bounds
  const xClamped = Math.min(Math.max(x_img, 0), canvas.width - 1);
  const yClamped = Math.min(Math.max(y_img, 0), canvas.height - 1);

  try {
    const pixel = ctx.getImageData(xClamped, yClamped, 1, 1).data;
    const [r, g, b, a] = pixel;
    const hex = rgbToHex(r, g, b);
    // send result to background or show UI (for now we log and show a tiny overlay)
    console.log("Picked color:", { r, g, b, a, hex });

    // show quick result in overlay
    showResultOverlay(hex, r, g, b);
  } catch (err) {
    console.error("getImageData failed:", err);
    updateOverlayHint("Error reading pixel");
  }

  // cleanup after a short delay so user sees result
  setTimeout(teardown, 00);
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

/* ---------- Expose startPicker in page context so scripting.executeScript can call it ----------
   If you prefer not to expose, you can keep using chrome.runtime message. */
window.startPicker = startPicker;
