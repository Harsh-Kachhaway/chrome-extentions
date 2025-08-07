chrome.storage.sync.get(["fontFamily", "fontSize"], (data) => {
  const font = data.fontFamily || "Arial";
  const size = data.fontSize || "16";
  const lineHeight = Math.round(size * 1); // same multiplier as popup

  const style = document.createElement("style");
 style.innerText = `
  html, body, p, span, div, h1, h2, h3, h4, h5, h6,
  a, li, td, th, strong, em, b, i, button, label,
  section *, article *, main *, header *, footer * {
    font-family: '${font}' !important;
    font-size: ${size}px !important;
    line-height: ${lineHeight}px !important;
  }
`;


  document.head.appendChild(style);
});

