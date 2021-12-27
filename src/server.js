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
// let count = 0;

io.on('connection', (socket) => {

    console.log('Connected to the socket server ========>');

    // socket.emit('initialCount', count);

    // socket.on('incrementCount', () => {
    //     count ++ ;
    //     io.emit('updatedCount',count);
    // });
    socket.on('newUser',(name) => {
        socket.emit('welcome',`Hi ${name}, Welcome you are connected.`);
    });
    
    socket.on('sendMessage',(message) => {
        socket.emit('messageSent',message);
    });

    socket.on('disconnect', () => {
        io.emit('disconnectUser','User disconnected')
    });

});

server.listen(3000, () => {
    console.log('server started');
})