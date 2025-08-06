const toggle = document.getElementById('toggleFocus');
const input = document.getElementById('siteInput');
const list = document.getElementById('siteList');
const focusInput = document.getElementById('focusMinutes');
const startTimer = document.getElementById('startTimer');
const countdownDisplay = document.getElementById('countdownDisplay');

let timerInterval = null;

const refreshList = async () => {
  const { blocklist = [] } = await chrome.storage.sync.get("blocklist");
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

startTimer.onclick = async () => {
  const minutes = parseInt(focusInput.value);
  if (!minutes || minutes <= 0) return;

  const endTime = Date.now() + minutes * 60 * 1000;

  await chrome.storage.sync.set({ focus: true, timerEnd: endTime });
  toggle.checked = true;
  startCountdown(endTime);
};

const startCountdown = (endTime) => {
  clearInterval(timerInterval);

  const update = () => {
    const now = Date.now();
    const diff = endTime - now;
    if (diff <= 0) {
      clearInterval(timerInterval);
      countdownDisplay.textContent = "Focus session ended";
      chrome.storage.sync.set({ focus: false, blocklist: [] }); // Unblock all sites
      toggle.checked = false;
    } else {
      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      countdownDisplay.textContent = `Time left: ${minutes}m ${seconds}s`;
    }
  };

  update();
  timerInterval = setInterval(update, 1000);
};

// Resume countdown if already running
chrome.storage.sync.get(["timerEnd", "focus"], ({ timerEnd, focus }) => {
  if (focus && timerEnd && timerEnd > Date.now()) {
    startCountdown(timerEnd);
  }
});
