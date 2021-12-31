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


    socket.on("room-connect", (room) => {
        socket.join(room);
        // const room_clients = io.sockets.adapter.rooms.get(room);

        // for (const clientId of room_clients) {

        //     //this is the socket of each client in the room.
        //     const clientSocket = io.sockets.sockets.get(clientId);

        //     all_users.push({
        //         userID: clientSocket.id,
        //         name: clientSocket.name,
        //     });
        // };
        if(!users[socket.id]) {
            users[socket.id] = socket.name;
        }
        // io.to(room).emit("users-list",all_users);
        io.to(room).emit("user-joined", { message: `${socket.name} joined this room.`, name: users[socket.id] ,room_name:room});
    })

    socket.on('users-list',(room)=> {
        const room_clients = io.sockets.adapter.rooms.get(room);
        all_users = [];
        for (const clientId of room_clients) {

            //this is the socket of each client in the room.
            const clientSocket = io.sockets.sockets.get(clientId);

            all_users.push({
                userID: clientSocket.id,
                name: clientSocket.name,
            });
        };
        io.to(room).emit("users-list",all_users);
    })
    socket.on('new-user-joined', (name) => {
        users[socket.id] = name;
        // socket.broadcast.emit('user-joined', `${name} joined the chat`);
    });

    socket.on('send', ({ message, to }) => {
        socket.to(to).emit('receive', { message: message, name: users[socket.id] });
    });

    socket.on("disconnecting", () => {
        console.log(socket.rooms); // the Set contains at least the socket ID
        for (const clientId of socket.rooms) {

                //this is the socket of each client in the room.
                const clientSocket = io.sockets.sockets.get(clientId);
    
                io.to(clientId).emit("user-joined", { message: `${socket.name} left this room.`, name: users[socket.id] });
            };
      });

    socket.on('disconnect', () => {
        delete users[socket.id];
        // io.to(room).emit("user-joined", { message: `${socket.name} left this room.`, name: users[socket.id] });
        // all_users = [];;
        // for (let [id, socket] of io.of("/").sockets) {
        //     all_users.push({
        //         userID: id,
        //         name: socket.name,
        //     });
        // }
        // console.log("disconnecting user =====>")
        // io.emit("users-list", all_users);
    });

});

server.listen(3000, () => {
    console.log('server started');
})