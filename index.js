// server.js
const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');

app.use(express.static(path.join(__dirname, 'public')));

const world = {};

io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('login', (nickname) => {
    socket.nickname = nickname;
    socket.emit('loginSuccess', nickname);
  });

  socket.on('setText', (data) => {
    const { x, y, text, color } = data;
    if (!world[y]) world[y] = {};
    world[y][x] = { text, color, nickname: socket.nickname };
    io.emit('textUpdate', { x, y, text, color, nickname: socket.nickname });
  });

  socket.on('requestInitialState', () => {
    socket.emit('initialState', world);
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
