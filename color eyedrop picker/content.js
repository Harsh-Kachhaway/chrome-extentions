// === Floating Preview Box (color + RGB text) ===
let previewBox = document.createElement("div");
previewBox.style.position = "fixed";
previewBox.style.bottom = "10px";
previewBox.style.right = "10px";
previewBox.style.width = "60px";
previewBox.style.height = "60px";
previewBox.style.border = "2px solid #000";
previewBox.style.zIndex = "999999";
document.body.appendChild(previewBox);

let colorCode = document.createElement("div");
colorCode.style.position = "fixed";
colorCode.style.bottom = "80px";
colorCode.style.right = "10px";
colorCode.style.padding = "5px 10px";
colorCode.style.background = "#fff";
colorCode.style.border = "1px solid #000";
colorCode.style.fontFamily = "monospace";
colorCode.style.zIndex = "999999";
document.body.appendChild(colorCode);

// === Magnifier Canvas ===
let magnifier = document.createElement("canvas");
magnifier.width = 150;
magnifier.height = 150;
magnifier.style.position = "fixed";
magnifier.style.pointerEvents = "none";
magnifier.style.border = "2px solid #000";
// magnifier.style.borderRadius = "8px";
magnifier.style.zIndex = "999999";
document.body.appendChild(magnifier);
let mctx = magnifier.getContext("2d");

// === Hidden Screenshot Canvas ===
let screenshotCanvas = document.createElement("canvas");
let ctx = screenshotCanvas.getContext("2d");

// === Change cursor ===
document.body.style.cursor = "crosshair"; // you can replace with custom icon

// === Update Screenshot Periodically ===
function updateScreenshot() {
  chrome.runtime.sendMessage({ type: "CAPTURE_COLOR" }, (res) => {
    if (!res?.screenshot) return;
    let img = new Image();
    img.src = res.screenshot;
    img.onload = () => {
      screenshotCanvas.width = img.width;
      screenshotCanvas.height = img.height;
      ctx.drawImage(img, 0, 0);
    };
  });
}
let screenshotInterval = setInterval(updateScreenshot, 1000);
updateScreenshot();

// === Handle Mouse Move ===
document.addEventListener("mousemove", (e) => {
  if (screenshotCanvas.width === 0) return;

  try {
    // === Pick center pixel color ===
    let pixel = ctx.getImageData(e.clientX, e.clientY, 1, 1).data;
    let rgb = `rgb(${pixel[0]}, ${pixel[1]}, ${pixel[2]})`;

    previewBox.style.background = rgb;
    colorCode.textContent = rgb;

    // === Draw magnifier ===
    const zoomSize = 15; // region around cursor
    const scale = 10;    // magnification factor
    const halfZoom = Math.floor(zoomSize / 2);

    let imgData = ctx.getImageData(
      e.clientX - halfZoom,
      e.clientY - halfZoom,
      zoomSize,
      zoomSize
    );

    mctx.imageSmoothingEnabled = false;
    mctx.clearRect(0, 0, magnifier.width, magnifier.height);
    mctx.putImageData(imgData, 0, 0);

    // scale it up
    mctx.drawImage(
      screenshotCanvas,
      e.clientX - halfZoom,
      e.clientY - halfZoom,
      zoomSize,
      zoomSize,
      0,
      0,
      magnifier.width,
      magnifier.height
    );

    // highlight center pixel
    mctx.strokeStyle = "red";
    mctx.lineWidth = 2;
    mctx.strokeRect(
      magnifier.width / 2 - scale / 2,
      magnifier.height / 2 - scale / 2,
      scale,
      scale
    );

    // position magnifier near cursor
    magnifier.style.left = e.pageX + 20 + "px";
    magnifier.style.top = e.pageY + 20 + "px";
  } catch (err) {
    console.warn("Could not read pixel", err);
  }
});
