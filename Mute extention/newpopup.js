document.addEventListener("DOMContentLoaded", async () => {
  const tablist = document.querySelector(".tab-list");
  const quickaccess = document.querySelector(".quick-access");
  const searchBar = document.querySelector(".searchBar");
  const toggle = document.querySelector(".toogle");
  const settingBtn = document.querySelector(".setting");
  const clearBtn = document.querySelector(".override");

  let ison = true;
  let mute = [];
  let unmute = [];

  // Load saved state
  chrome.storage.local.get(["ison", "muteID", "unmuteID"], (items = {}) => {
    ison = items.ison ?? true;
    mute = items.muteID || [];
    unmute = items.unmuteID || [];

    toggle.textContent = ison ? "ON" : "OFF";
    toggle.classList.toggle("active", !ison);
  });

  // Toggle ON/OFF
  toggle.addEventListener("click", () => {
    ison = !ison;
    toggle.textContent = ison ? "ON" : "OFF";
    toggle.classList.toggle("active", !ison);
    chrome.storage.local.set({ ison });
  });

  // Settings button
  settingBtn.addEventListener("click", () => {
    chrome.tabs.create({ url: chrome.runtime.getURL("/setting/setting.html") });
  });

  // Clear mute/unmute lists
  clearBtn.addEventListener("click", () => {
    mute = [];
    unmute = [];
    chrome.storage.local.set({ muteID: mute, unmuteID: unmute });
    // unmute all tabs
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach((tab) => chrome.tabs.update(tab.id, { muted: false }));
    });
    // reset quick access
    document.querySelectorAll(".quick-access button").forEach((btn) =>
      btn.classList.remove("active")
    );
  });

  // Create UI for each tab
  const tabs = await chrome.tabs.query({});
  tabs.forEach((tab) => {
    createTabUI(tab);
  });

  tabCount();

  //  Helpers

  function createTabUI(tab) {
    const title = tab.title || "no title";
    const url = tab.url || "no url";
    const icon = tab.favIconUrl || "/svg/ban.svg";

    // Quick access button
    const acc = document.createElement("button");
    acc.innerHTML = `<img src="${icon}" alt="">`;

    updateQuickAccessUI(acc, tab.mutedInfo.muted);

    acc.addEventListener("click", () => toggleMute(tab, acc));

    acc.addEventListener("contextmenu", async (e) => {
      e.preventDefault();
      await chrome.tabs.remove(tab.id);
      cont.remove();
      acc.remove();
      tabCount();
    });

    quickaccess.appendChild(acc);

    // Tab list entry
    const cont = document.createElement("div");
    cont.className = "tab-item";
    cont.innerHTML = `
      <div class="tab-info">
        <span class="tab-title">${title.slice(0, 100)}</span>
        <span class="tab-url">${url.slice(0, 50)}...</span>
      </div>
      <div class="tab-actions">
        <button class="muteBtn"><img class="mute" src="/svg/${tab.mutedInfo.muted ? "volume-mute" : "volume-up"}.svg" alt=""></button>
        <button class="remove">✖</button>
      </div>
    `;

    // Focus on tab
    cont.addEventListener("click", () => {
      chrome.tabs.update(tab.id, { active: true });
      chrome.windows.update(tab.windowId, { focused: true });
    });

    // Remove tab
    cont.querySelector(".remove").addEventListener("click", async (e) => {
      e.stopPropagation();
      await chrome.tabs.remove(tab.id);
      acc.remove();
      cont.remove();
      tabCount();
    });

    // Toggle mute via speaker icon
    cont.querySelector(".muteBtn").addEventListener("click", (e) => {
      e.stopPropagation();
      toggleMute(tab, acc, cont.querySelector(".mute"));
    });

    // Right-click remove
    cont.addEventListener("contextmenu", async (e) => {
      e.preventDefault();
      await chrome.tabs.remove(tab.id);
      acc.remove();
      cont.remove();
      tabCount();
    });

    // Search filter
    searchBar.addEventListener("input", () => {
      const val = searchBar.value.toLowerCase();
      cont.style.display =
        title.toLowerCase().includes(val) || url.toLowerCase().includes(val)
          ? ""
          : "none";
    });

    tablist.appendChild(cont);
  }

  function toggleMute(tab, acc, muteImgEl = null) {
    const isMuted = tab.mutedInfo.muted;
    const newMuted = !isMuted;

    chrome.tabs.update(tab.id, { muted: newMuted });
    tab.mutedInfo.muted = newMuted;

    if (newMuted) {
      acc.classList.add("active");
      mute.push(tab.id);
      unmute = unmute.filter((id) => id !== tab.id);
    } else {
      acc.classList.remove("active");
      mute = mute.filter((id) => id !== tab.id);
      unmute.push(tab.id);
    }

    chrome.storage.local.set({ muteID: mute, unmuteID: unmute });

    if (muteImgEl) {
      muteImgEl.src = `/svg/${newMuted ? "volume-mute" : "volume-up"}.svg`;
    }
  }

  function updateQuickAccessUI(acc, isMuted) {
    if (isMuted) {
      acc.classList.add("active");
    } else {
      acc.classList.remove("active");
    }
  }

  async function tabCount() {
    const numtab = await chrome.tabs.query({});
    document.querySelector(".num-tabs").textContent = numtab.length;
  }
});
