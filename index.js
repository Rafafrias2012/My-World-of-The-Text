// server.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static(path.join(__dirname, 'public')));

const worldData = {};

io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('login', (nickname) => {
    socket.nickname = nickname;
    console.log(`${nickname} logged in`);
  });

  socket.on('addText', (data) => {
    const { x, y, text } = data;
    if (!worldData[y]) worldData[y] = {};
    worldData[y][x] = { text, author: socket.nickname };
    io.emit('textAdded', { x, y, text, author: socket.nickname });
  });

  socket.on('requestInitialData', () => {
    socket.emit('initialData', worldData);
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
