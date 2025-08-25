document.getElementById("save").addEventListener("click", () => {
  const note = document.getElementById("note").value;
  chrome.storage.sync.set({ myNote: note }, () => {
    document.getElementById("status").innerText = "Note saved (synced)!";
  });
});

document.getElementById("load").addEventListener("click", () => {
  chrome.storage.sync.get(["myNote"], (result) => {
    if (result.myNote) {
      document.getElementById("note").value = result.myNote;
      document.getElementById("status").innerText = "Note loaded from sync!";
    } else {
      document.getElementById("status").innerText = "No note found.";
    }
  });
});
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === "sync" && changes.myNote) {
    document.getElementById("note").value = changes.myNote.newValue;
    document.getElementById("status").innerText = "Note updated from another device!";
  }
});
