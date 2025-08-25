document.getElementById("save").addEventListener("click", () => {
  const note = document.getElementById("note").value;
  chrome.storage.local.set({ myNote: note }, () => {
    document.getElementById("status").innerText = "Note saved!";
  });
});

document.getElementById("load").addEventListener("click", () => {
  chrome.storage.local.get(["myNote"], (result) => {
    if (result.myNote) {
      document.getElementById("note").value = result.myNote;
      document.getElementById("status").innerText = "Note loaded!";
    } else {
      document.getElementById("status").innerText = "No note found.";
    }
  });
});
