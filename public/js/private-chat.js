const socket = io('http://localhost:3000/', { autoConnect: false });

const form = document.getElementById('send-container');
const messageInput = document.getElementById('messageInp');
const messageContainer = document.querySelector('.container');
const usersSidebar = document.querySelector('.sidebar');

let selectedUser = null;

// Taking name with the user.
const name = prompt("Enter your name to join");
let usernameAlreadySelected = true;

// Assigning the name to socket auth.
socket.auth = { name };

// Connecting the user to the user;
socket.connect();

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
socket.emit('new-user-joined', name);

// Listen an event when a user joined
socket.on('user-joined', (message) => {
    appendMessage(message, 'right');
});

// Listen an event when a user receive a message
socket.on('receive', (messageObj) => {
    appendMessage(`${messageObj.name}: ${messageObj.message}`, 'left');
});

// Listen an event when a user joined
socket.on('users-list', (list) => {
    listing(list);
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
    removeChild(usersSidebar);
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
                debugger;
                if(selectedUser != e.target.id) {
                    removeChild(messageContainer);
                    selectedUser = e.target.id;
                    document.getElementById(selectedUser).style.backgroundColor = "green";
                    messageInput.disabled = false;
                    document.getElementById('sendBtn').disabled = false;
                }
            });
        }
        else {
            messageInput.disabled = true;
            document.getElementById('sendBtn').disabled = true;
        }
        // if (user.userID === socket.id) {
        //     document.getElementById(user.userID).style.backgroundColor = "red";
        //     messageInput.disabled = true;
        //     document.getElementById('sendBtn').disabled = true;
        // }
        // else {
        //     userElement.addEventListener('click', (e) => {
        //         removeChild(messageContainer);
        //         selectedUser = e.target.id;
        //         document.getElementById(selectedUser).style.backgroundColor = "green";
        //         messageInput.disabled = false;
        //         document.getElementById('sendBtn').disabled = false;
        //     });
        // }
    }
}

// Remove all the child node.
const removeChild = (element) => {
    var child = element.lastElementChild;
    while (child) {
        element.removeChild(child);
        child = element.lastElementChild;
    }
};