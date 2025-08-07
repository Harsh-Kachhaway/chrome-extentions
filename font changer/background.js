chrome.storage.sync.get(["fontFamily", "fontSize"], (data) => {
  if (data.fontFamily) {
    document.body.style.fontFamily = data.fontFamily;
  }
  if (data.fontSize) {
    document.body.style.fontSize = data.fontSize + "px";
  }
});
