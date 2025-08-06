// Content script runs in the page context
const observer = new MutationObserver((mutations, observer) => {
    const btn = document.querySelector(".btn.btn-primary.pre_login");
    const script = document.createElement('script');
    script.textContent = `
      (function waitForCheckMyPage() {
        if (typeof window.checkMyPage === "function") {
          try {
            window.checkMyPage().click();
            console.log("✅ checkMyPage().click() was called");
          } catch (e) {
            console.error("❌ Error calling checkMyPage().click():", e);
          }
        } else {
          console.log("🔄 checkMyPage not found yet, retrying...");
          setTimeout(waitForCheckMyPage, 1000);
        }
      })();
    `;
    (document.head || document.documentElement).appendChild(script);
    script.remove();
  if (btn) {
    observer.disconnect();

    btn.innerText = "hello";
    console.log("Button found and updated!");

    // Ask background script to inject 'injected.js' into this tab
    chrome.runtime.sendMessage({ action: "inject_script" });
  }
});

observer.observe(document.body, { childList: true, subtree: true });

// Inject a <script> into the actual page so we can access window.checkMyPage
