const socket = io();

// socket.on("updatedCount",(count)=>{
//     document.getElementById('#inc').innerHTML = count;
// });

// socket.on("initialCount",(count)=> {
//     document.getElementById('#inc').innerHTML = count;
// });

// const incBtn = document.getElementById("#inc");
// incBtn.addEventListener('click',()=>{
//     socket.emit("incrementCount")
// })

const name = prompt("Enter your name to join");
console.log("welcome message :- ",name);

socket.emit('newUser',name);

socket.on('welcome',(message)=>{
    document.getElementById('welcome').innerHTML = message;
});

socket.on('messageSent',(message)=>{
    console.log("message sent :- ",message);
});

const form = document.querySelector('#message-form').addEventListener('submit',(e)=>{
    e.preventDefault();
    const message = e.target.elements.message.value;
    socket.emit('sendMessage',message);
});