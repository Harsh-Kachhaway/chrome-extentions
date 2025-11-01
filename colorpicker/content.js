let canvas, ctx, img;
let picking = false;
let imageLoaded = false;

// Listen for messages (optional future use)
chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === "START_PICKER") startPicker();
});

function startPicker() {
  if (picking) return;
  picking = true;
  document.body.style.cursor = "crosshair";

  chrome.runtime.sendMessage({ type: "CAPTURE_SCREEN" }, (res) => {
    if (!res?.success) {
      console.error("Failed to capture:", res?.error);
      picking = false;
      return;
    }
    setupCanvas(res.imageUri);
  });
}

function setupCanvas(imageUri) {
  img = new Image();
  img.onload = () => {
    canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);
    imageLoaded = true;

    window.addEventListener("click", handleClick);
  };
  img.src = imageUri;
}

function handleClick(e) {
  if (!imageLoaded) return;

  const dpr = window.devicePixelRatio;
  const x = Math.round((e.clientX + window.scrollX) * dpr);
  const y = Math.round((e.clientY + window.scrollY) * dpr);

  const pixel = ctx.getImageData(x, y, 1, 1).data;
  const [r, g, b] = pixel;
  const hex = rgbToHex(r, g, b);

  alert(`Picked color: ${hex}`);
  console.log("Color:", { r, g, b, hex });

  cleanup();
}

function rgbToHex(r, g, b) {
  return (
    "#" +
    [r, g, b]
      .map((x) => x.toString(16).padStart(2, "0"))
      .join("")
      .toUpperCase()
  );
}

function cleanup() {
  document.body.style.cursor = "default";
  window.removeEventListener("click", handleClick);
  picking = false;
}
