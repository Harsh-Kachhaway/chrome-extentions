document.addEventListener("DOMContentLoaded", async () => {
  let tablist = document.querySelector(".tab-list");
  let quickacess = document.querySelector(".quick-access");
  let searchBar = document.querySelector(".searchBar");
  let tabs = await chrome.tabs.query({});
  let ison = true;
  let mute = [];
  let unmute = [];

  // mute storage
  chrome.storage.local.get(null, (items) => {
    mute = items.muteID;
    unmute = items.unmuteID;
    console.log(items);
  });

  //on off button
  let toogle = document.querySelector(".toogle");

  chrome.storage.local.get("ison", (data) => {
    if (data.ison !== undefined) {
      ison = data.ison;
      toogle.textContent = ison ? "ON" : "OFF";
      ison ? toogle.classList.remove("active") : toogle.classList.add("active");
    }
  });

  toogle.addEventListener("click", () => {
    ison = !ison;
    toogle.textContent = ison ? "ON" : "OFF";
    chrome.storage.local.set({ ison });
    ison ? toogle.classList.remove("active") : toogle.classList.add("active");
  });
  // console.log(!toogle);

  //setting
  document.querySelector(".setting").addEventListener("click", () => {
    chrome.tabs.create({ url: chrome.runtime.getURL("/setting/setting.html") });
  });

  //funtionality of tabs
  tabs.forEach((tab) => {
    let title = tab.title || "no title";
    let url = tab.url || "no url";
    let titleLow = tab.title.toLowerCase() || "no title";
    let urlLow = tab.url.toLowerCase() || "no url";
    let icon = tab.favIconUrl || "/svg/ban.svg";
    // console.log(tab);

    //quick access
    let acc = document.createElement("button");
    acc.innerHTML = `<img src="${icon}" alt=""> `;
    // chear mute working //mute to zero
    document.querySelector(".override").addEventListener("click", () => {
      chrome.tabs.update(tab.id, { muted: false });
      mute = [];
      unmute = [];
      chrome.storage.local.set({ muteID: mute });
      chrome.storage.local.set({ unmuteID: unmute });
      acc.classList.remove("active");
    });

    //check for mute
    tab.mutedInfo.muted
      ? acc.classList.add("active")
      : acc.classList.remove("active");
    // mute using right
    acc.addEventListener("click", () => {
      let isMuted = tab.mutedInfo.muted;
      chrome.tabs.update(tab.id, { muted: !isMuted });
      tab.mutedInfo.muted = !isMuted; // keep local state in sync
      if (isMuted) {
        acc.classList.remove("active");
        mute = mute.filter((id) => id !== tab.id); // remove it
        unmute.push(tab.id); // add this tab to unmute list
      } else {
        acc.classList.add("active");
        mute.push(tab.id); // add this tab to mute list
        unmute = unmute.filter((id) => id !== tab.id); // remove it
      }
      chrome.storage.local.set({ muteID: mute });
      chrome.storage.local.set({ unmuteID: unmute });
    });

    // remove using right click
    acc.addEventListener("contextmenu", async (e) => {
      e.stopPropagation(); // don’t trigger tab focus
      e.preventDefault();
      await chrome.tabs.remove(tab.id);
      cont.remove(); // remove from list
      acc.remove(); // remove from list
      tabCount();
    });

    quickacess.appendChild(acc);

    // search box
    searchBar.addEventListener("input", () => {
      titleLow.includes(searchBar.value.toLowerCase()) ||
      urlLow.includes(searchBar.value.toLowerCase())
        ? (cont.style.display = "")
        : (cont.style.display = "none");
      console.log(tab);
    });

    //tab list
    let cont = document.createElement("div");
    cont.className = "tab-item";
    cont.innerHTML = ` 
    <div class="tab-info">
    <span class="tab-title">${title.slice(0, 100)}</span>
    <span class="tab-url">${url.slice(0, 50) + "...."}</span>
    </div>
    <div class="tab-actions">
    <button class="muteBtn"><img class="mute" src="/svg/volume-up.svg" alt=""></button>
    <button class = "remove" >✖</button>
    </div>`;

    //focus on tab
    cont.addEventListener("click", () => {
      chrome.tabs.update(tab.id, { active: true });
      chrome.windows.update(tab.windowId, { focused: true });
    });

    // remove on click to cross
    cont.addEventListener("click", (e) => {
      if (e.target.classList.contains("remove")) {
        e.stopPropagation(); // don’t trigger tab focus
        e.preventDefault();

        chrome.tabs.remove(tab.id);
        acc.remove(); // remove from list
        cont.remove(); // remove from list
        tabCount();
      }
    });

    // speaker svg on click to no speaker
    cont.addEventListener("click", (e) => {
      console.log("clicked");
      mute.push(tab.id);
      chrome.storage.local.set({muteID: mute });
      if (e.target.classList.contains("mute")) {
        // chrome.tabs.remove(tab.id);
        let isMuted = tab.mutedInfo.muted;
        chrome.tabs.update(tab.id, { muted: !isMuted });
        tab.mutedInfo.muted = !isMuted; // keep local state in sync
        isMuted ? acc.classList.remove("active") : acc.classList.add("active");
      }
    });

    // remove on rightclick
    cont.addEventListener("contextmenu", async (e) => {
      e.stopPropagation(); // don’t trigger tab focus
      e.preventDefault();
      await chrome.tabs.remove(tab.id);
      acc.remove(); // remove from list
      cont.remove(); // remove from list
      tabCount();
      console.log("should");
    });
    tablist.appendChild(cont);
  });
  tabCount();
});
async function tabCount() {
  let numtab = await chrome.tabs.query({});
  let tabNum = document.querySelector(".num-tabs");
  tabNum.innerHTML = numtab.length;
}
