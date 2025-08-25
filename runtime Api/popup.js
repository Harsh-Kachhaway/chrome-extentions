
document.querySelector('#send').addEventListener('click' , () =>{
  const text = document.querySelector('#message').value
  chrome.runtime.sendMessage({
    action: text
  },Response =>{
    document.querySelector("#response").innerText = Response
  })


})