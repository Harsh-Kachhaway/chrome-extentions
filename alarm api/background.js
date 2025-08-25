let text = 0
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "demoAlarm") {
    text += alarm.periodInMinutes
    console.log(text );
 document.body.style.backgroundColor = "lightblue";  }
});
