(function waitForCheckMyPage(maxRetries = 60, interval = 1000) {
  let tries = 0;

  function attempt() {
    const fn = window.checkMyPage;
    if (typeof fn === "function") {
      try {
        fn().click();
        console.log("✅ checkMyPage().click() was called");
      } catch (e) {
        console.error("❌ Error calling checkMyPage().click():", e);
      }
    } else {
      tries++;
      if (tries < maxRetries) {
        console.log(`🔄 Waiting for checkMyPage()... (${tries})`);
        setTimeout(attempt, interval);
      } else {
        console.warn("❌ checkMyPage() not found after max retries");
      }
    }
  }

  attempt();
})();
