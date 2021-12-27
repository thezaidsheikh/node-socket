const express = require('express');
const socketio = require('socket.io');
const http = require('http');
const cors = require('cors');
const path = require('path');
const app = express();
app.use(express.static(path.join(__dirname, '../public')));
app.use(cors());
const server = http.createServer(app);
const io = socketio(server);

const users = {};

io.use((socket, next) => {
    const name = socket.handshake.auth.name;
    if (!name) {
        return next(new Error("invalid username"));
    }
    socket.name = name;
    next();
});

io.on('connection', (socket) => {
    console.log(`${socket.name} is connected successfully`);

    let all_users = [];
    for (let [id, socket] of io.of("/").sockets) {
        all_users.push({
            userID: id,
            name: socket.name,
        });
    }
    io.emit("users-list", all_users);

    socket.on('new-user-joined', (name) => {
        users[socket.id] = name;
        // socket.broadcast.emit('user-joined', `${name} joined the chat`);
    });

    socket.on('send', ({ message, to }) => {
        socket.to(to).emit('receive', { message: message, name: users[socket.id] });
    });

    socket.on('disconnect', () => {
        all_users = [];;
        for (let [id, socket] of io.of("/").sockets) {
            all_users.push({
                userID: id,
                name: socket.name,
            });
        }
        console.log("disconnecting user =====>")
        io.emit("users-list", all_users);
    });

});

server.listen(3000, () => {
    console.log('server started');
})