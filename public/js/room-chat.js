const socket = io('http://localhost:3000/', { autoConnect: false });

const form = document.getElementById('send-container');
const messageInput = document.getElementById('messageInp');
const messageContainer = document.querySelector('.container');
const usersSidebar = document.querySelector('.sidebar');
const userslistSidebar = document.querySelector('.userlist');
const roomButton = document.querySelector('#buttonDiv');
let selectedUser = null;

// Taking name with the user.
const name = prompt("Enter the name to join");
const room = prompt("Enter the room to join");
let usernameAlreadySelected = true;

// Assigning the name to socket auth.
socket.auth = { name };

// Connecting the user to the user;
socket.connect();
socket.emit("room-connect", room);
socket.on("user-joined", (messageObj) => {
    if(!document.getElementById(messageObj.room_name)) {

        listing([{ userID: messageObj.room_name, name: messageObj.room_name }]);
    }
    appendMessage(`${messageObj.name}: ${messageObj.message}`, 'left');
    createNewRoomButton();
})
// Handling the connecton error.
socket.on("connect_error", (err) => {
    if (err.message === "invalid username") {
        usernameAlreadySelected = false;
        messageInput.disabled = true;
        document.getElementById('sendBtn').disabled = true;
        alert("You did not provided the name ,please enter the name.");
    }
});

// Emit an event when a new user join.
// socket.emit('new-user-joined', name);

// Listen an event when a user joined
// socket.on('user-joined', (message) => {
//     appendMessage(message, 'right');
// });

// Listen an event when a user receive a message
socket.on('receive', (messageObj) => {
    appendMessage(`${messageObj.name}: ${messageObj.message}`, 'left');
});

// Listen an event when a user joined
socket.on('users-list', (list) => {
    showUserList(list);
});

// Emit ab event to send a message to the other user
form.addEventListener('submit', (e) => {
    e.preventDefault();
    const message = messageInput.value;
    messageInput.value = '';
    appendMessage(`You: ${message}`, 'right');
    socket.emit('send', { message, to: selectedUser });
})

// Function to create a div and show the message to the chat box
const appendMessage = (message, position) => {
    const messageElement = document.createElement('div');
    messageElement.innerText = message;
    messageElement.classList.add('message');
    messageElement.classList.add(position);
    messageContainer.append(messageElement);
};

// Function to create a users list.
const listing = (users) => {
    // removeChild(usersSidebar);
    for (let index = 0; index < users.length; index++) {
        const user = users[index];
        messageInput.disabled = true;
        document.getElementById('sendBtn').disabled = true;
        if (socket.id != user.userID) {
            const userElement = document.createElement('p');
            userElement.setAttribute('id', user.userID);
            userElement.innerText = user.name;
            userElement.classList.add('list');
            usersSidebar.append(userElement);
            userElement.addEventListener('click', (e) => {
                removeChild(messageContainer);
                if (selectedUser) {
                    document.getElementById(selectedUser).style.backgroundColor = "burlywood";
                }
                selectedUser = e.target.id;
                document.getElementById(selectedUser).style.backgroundColor = "green";
                messageInput.disabled = false;
                document.getElementById('sendBtn').disabled = false;
                if(document.getElementById(selectedUser).style.backgroundColor == "green") {
                    socket.emit("users-list",selectedUser);
                }
            });
        }
        else {
            messageInput.disabled = true;
            document.getElementById('sendBtn').disabled = true;
        }
    }
};

const showUserList = (users) => {
    removeChild(userslistSidebar);
    for (let index = 0; index < users.length; index++) {
        const user = users[index];
        const userElement = document.createElement('p');
        userElement.innerText = user.name;
        userslistSidebar.append(userElement);
    }
}

const createNewRoomButton = () => {
    removeChild(roomButton)
    const buttonElement = document.createElement('button');
    buttonElement.innerText = "Join New Room";
    buttonElement.classList.add('btn');
    buttonElement.addEventListener('click', (e) => {
        const new_room = prompt("Enter room to join");
        if (new_room) {
            socket.emit("room-connect", new_room);
        }
    })
    roomButton.append(buttonElement);
}
// Remove all the child node.
const removeChild = (element) => {
    var child = element.lastElementChild;
    while (child) {
        element.removeChild(child);
        child = element.lastElementChild;
    }
};