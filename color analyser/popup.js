document.addEventListener("DOMContentLoaded", async () => {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  chrome.scripting.executeScript(
    {
      target: { tabId: tab.id },
      function: analyzeColors,
    },
    (injectionResults) => {
      const colorsDiv = document.getElementById("colors");
      let results = injectionResults[0].result;

      // Group by color
      let grouped = {};
      results.forEach((item) => {
        if (!grouped[item.color]) grouped[item.color] = [];
        grouped[item.color].push(item.selector);
      });

      // Render
      for (let color in grouped) {
        let div = document.createElement("div");
        div.className = "color-box";
        div.innerHTML = `
        <div class="swatch" style="background:${color}"></div>
        <div>
          <b>${color}</b><br>
         <!-- ${grouped[color]
           .map((sel) => `<code>${sel}</code>`)
           .join(", ")} -->
        </div>
      `;
        colorsDiv.appendChild(div);
      }
    }
  );
});

function analyzeColors() {
  const properties = [
    "color",
    "backgroundColor",
    "borderTopColor",
    "borderRightColor",
    "borderBottomColor",
    "borderLeftColor",
    "outlineColor",
    "textDecorationColor",
    "columnRuleColor",
  ];

  const elements = document.querySelectorAll("*");
  let results = [];

  function addColor(color, selector) {
    if (!color || color === "transparent" || color === "none") return;
    let hex = toHex(color);
    if (hex) results.push({ color: hex, selector });
  }

  elements.forEach((el) => {
    let styles = window.getComputedStyle(el);

    // Check simple color props
    properties.forEach((prop) => {
      addColor(styles[prop], getSelector(el));
    });

    // Background images (gradients)
    if (styles.backgroundImage && styles.backgroundImage !== "none") {
      let matches = styles.backgroundImage.match(
        /(rgba?\([^)]+\)|#[0-9a-f]{3,6})/gi
      );
      if (matches)
        matches.forEach((c) => addColor(c, getSelector(el) + " (bg-gradient)"));
    }

    // Box shadows
    if (styles.boxShadow && styles.boxShadow !== "none") {
      let matches = styles.boxShadow.match(/(rgba?\([^)]+\)|#[0-9a-f]{3,6})/gi);
      if (matches)
        matches.forEach((c) => addColor(c, getSelector(el) + " (shadow)"));
    }

    // Pseudo-elements
    ["::before", "::after"].forEach((pseudo) => {
      let ps = window.getComputedStyle(el, pseudo);
      properties.forEach((prop) => {
        addColor(ps[prop], getSelector(el) + pseudo);
      });
      if (ps.backgroundImage && ps.backgroundImage !== "none") {
        let matches = ps.backgroundImage.match(
          /(rgba?\([^)]+\)|#[0-9a-f]{3,6})/gi
        );
        if (matches)
          matches.forEach((c) =>
            addColor(c, getSelector(el) + pseudo + " (bg-gradient)")
          );
      }
    });
  });

  return results;

  // Helpers
  function getSelector(el) {
    if (el.id) return `#${el.id}`;
    if (el.className) return "." + el.className.trim().split(/\s+/).join(".");
    return el.tagName.toLowerCase();
  }

  function toHex(color) {
    let ctx = document.createElement("canvas").getContext("2d");
    ctx.fillStyle = color;
    let computed = ctx.fillStyle; // normalizes to rgba or hex
    if (computed.startsWith("rgb")) {
      let nums = computed.match(/\d+/g).map(Number);
      if (nums.length >= 3) {
        return (
          "#" +
          nums
            .slice(0, 3)
            .map((n) => n.toString(16).padStart(2, "0"))
            .join("")
        );
      }
    }
    return computed; // already hex or named color
  }
}
