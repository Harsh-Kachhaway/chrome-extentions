document.getElementById("startAlarm").addEventListener("click", () => {
  chrome.alarms.create("demoAlarm", {
    delayInMinutes: 0.1,   // 6 seconds
    periodInMinutes: 0.1   // repeat every 6 seconds
  });
  console.log("Alarm created!");
});

document.getElementById("stopAlarm").addEventListener("click", () => {
  chrome.alarms.clear("demoAlarm", () => {
    console.log("Alarm stopped");
  });
});

document.getElementById("checkAlarm").addEventListener("click", () => {
  chrome.alarms.getAll((alarms) => {
    console.log("Current alarms:", alarms);
  });
});

let text = 0
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "demoAlarm") {
    text += alarm.periodInMinutes
    console.log(text );
 document.body.style.backgroundColor = "lightblue";  }
});
