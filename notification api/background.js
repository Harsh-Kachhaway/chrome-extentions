chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === "notify") {
    chrome.notifications.create("helloNotif", {
      type: "basic",
      iconUrl: "icon128.png",   // must be a 48x48 or 128x128 png
      title: "Greetings!",
      message: "This is your first Chrome notification 🎉"
    });
  }
});

// When user clicks the notification
chrome.notifications.onClicked.addListener((notifId) => {
  if (notifId === "helloNotif") {
    chrome.tabs.create({ url: "https://google.com" });
  }
});

// Trigger notifications from popup or directly
chrome.runtime.onMessage.addListener((msg) => {
  if (msg.action === "basic") {
    console.log("working basic")
    chrome.notifications.create("basictif", {
      type: "basic",
      iconUrl: "icon128.png",
      title: "Basic Notification",
      message: "This is a simple notification 🎉"
    });
  }

  if (msg.action === "image") {
    chrome.notifications.create("imageNotif", {
      type: "image",
      iconUrl: "icon128.png",
      title: "Image Notification",
      message: "Here’s a cool picture 📷",
      imageUrl: "banner.png"
    });
  }

  if (msg.action === "list") {
    chrome.notifications.create("listNotif", {
      type: "list",
      iconUrl: "icon128.png",
      title: "Your To-Do List",
      message: "Things you need to do:",
      items: [
        { title: "✅ Task 1", message: "Finish Chrome extension" },
        { title: "✅ Task 2", message: "Commit code to GitHub" },
        { title: "✅ Task 3", message: "Go for a walk" }
      ]
    });
  }

  if (msg.action === "progress") {
    let progress = 0;
    let interval = setInterval(() => {
      if (progress > 100) {
        clearInterval(interval);
        return;
      }

      chrome.notifications.create("progressNotif", {
        type: "progress",
        iconUrl: "icon128.png",
        title: "Downloading...",
        message: "Please wait while we finish ⏳",
        progress: progress
      });

      progress += 10;
    }, 500);
  }
});

// Handle clicks on any notification
chrome.notifications.onClicked.addListener((notifId) => {
  console.log("Clicked:", notifId);
});
