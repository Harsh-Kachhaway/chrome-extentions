const toggle = document.getElementById('toggleFocus');
const input = document.getElementById('siteInput');
const list = document.getElementById('siteList');

const refreshList = async () => {
  const { blocklist } = await chrome.storage.sync.get("blocklist");
  list.innerHTML = "";
  blocklist.forEach(site => {
    const li = document.createElement("li");
    li.textContent = site;
    const remove = document.createElement("button");
    remove.textContent = "X";
    remove.onclick = async () => {
      const newList = blocklist.filter(s => s !== site);
      await chrome.storage.sync.set({ blocklist: newList });
    };
    li.appendChild(remove);
    list.appendChild(li);
  });
};

document.getElementById('addSite').onclick = async () => {
  const url = input.value.trim();
  if (!url) return;
  const { blocklist = [] } = await chrome.storage.sync.get("blocklist");
  if (!blocklist.includes(url)) {
    blocklist.push(url);
    await chrome.storage.sync.set({ blocklist });
  }
  input.value = "";
  refreshList();
};

toggle.onchange = async () => {
  await chrome.storage.sync.set({ focus: toggle.checked });
};

chrome.storage.sync.get(["focus"], (res) => {
  toggle.checked = res.focus;
});

chrome.storage.onChanged.addListener(refreshList);
refreshList();

