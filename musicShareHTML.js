const { ipcRenderer } = require('electron')
const EventEmitter = require('events');

class MyEmitter extends EventEmitter {}

window.myEmitter = new MyEmitter();

myEmitter.on('NEW_USER' , function(data){
  var icons = [`
    <img class="svgKick" src="./outline-highlight_off-24px.svg" onclick="kick()">`,`
    <img class="svgOwner" src="./outline-verified_user-24px.svg">`]
  var icon = ``;
  if(data.owner) {
    icon = icons[1]
  } else {
    icon = icons[0]
  }
  var html = `<div class="connectedUser">
    <div class="childLeft">
      <img src="${data.icon}" height="55px"></img>
    </div>
    <div class="childRight">
      <div class="childinnerRight">${icon}
      </div>
      <pre class="user">${data.name}</pre>
      <pre class="email">${data.email}</pre>
    </div>
  </div>`
  document.getElementById('midDiv').innerHTML = document.getElementById('midDiv').innerHTML + html;
});

myEmitter.on('REMOVE_USER' , function(data){
  var emails = document.getElementsByClassName(email)
  var delete;
  emails.forEach(email => {
    if (email.innerText = data.email) {
      delete = email.parentElement.parentElement
    }
  })
  email.outerHTML = ""
});

var kick = () => {
  //alot of work here.
  alert("kick user")
}