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
const worlds = {};

io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('login', (data) => {
    const { nickname, worldId } = data;
    socket.nickname = nickname;
    socket.worldId = worldId;
    if (!worlds[worldId]) {
      worlds[worldId] = {};
    }
    console.log(`${nickname} logged in to world ${worldId}`);
  });

  socket.on('addText', (data) => {
    const { x, y, text, color } = data;
    const worldId = socket.worldId;
    if (!worlds[worldId]) worlds[worldId] = {};
    if (!worlds[worldId][y]) worlds[worldId][y] = {};
    worlds[worldId][y][x] = { text, author: socket.nickname, color };
    io.to(worldId).emit('textAdded', { x, y, text, color });
});

  socket.on('requestInitialData', (worldId) => {
    socket.join(worldId);
    socket.emit('initialData', worlds[worldId] || {});
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
