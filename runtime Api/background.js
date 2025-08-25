chrome.runtime.onMessage.addListener((msg,sender,sendResponse) =>{
if (msg.action === "hello"){
  sendResponse("hello page ")}
})