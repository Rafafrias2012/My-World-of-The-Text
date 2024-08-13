// public/script.js
const socket = io();

const loginScreen = document.getElementById('login-screen');
const gameScreen = document.getElementById('game-screen');
const loginBtn = document.getElementById('login-btn');
const nicknameInput = document.getElementById('nickname');
const canvas = document.getElementById('text-canvas');
const ctx = canvas.getContext('2d');
const textInput = document.getElementById('text-input');

let nickname = '';
let offsetX = 0;
let offsetY = 0;
const cellSize = 20;

loginBtn.addEventListener('click', () => {
    nickname = nicknameInput.value.trim();
    if (nickname) {
        socket.emit('login', nickname);
        loginScreen.style.display = 'none';
        gameScreen.style.display = 'flex';
        initializeCanvas();
    }
});

function initializeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    socket.emit('requestInitialData');
}

socket.on('initialData', (data) => {
    for (const y in data) {
        for (const x in data[y]) {
            drawText(parseInt(x), parseInt(y), data[y][x].text, data[y][x].author);
        }
    }
});

function drawText(x, y, text, author) {
    const screenX = (x - offsetX) * cellSize;
    const screenY = (y - offsetY) * cellSize;
    ctx.fillStyle = 'black';
    ctx.font = '14px Arial';
    ctx.fillText(text, screenX, screenY + cellSize);
    ctx.fillStyle = 'gray';
    ctx.font = '10px Arial';
    ctx.fillText(author, screenX, screenY + cellSize + 12);
}

canvas.addEventListener('click', (e) => {
    const x = Math.floor((e.clientX + offsetX * cellSize) / cellSize);
    const y = Math.floor((e.clientY + offsetY * cellSize) / cellSize);
    textInput.focus();
    textInput.setAttribute('data-x', x);
    textInput.setAttribute('data-y', y);
});

textInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        const text = textInput.value.trim();
        const x = parseInt(textInput.getAttribute('data-x'));
        const y = parseInt(textInput.getAttribute('data-y'));
        if (text) {
            socket.emit('addText', { x, y, text });
            textInput.value = '';
        }
    }
});

socket.on('textAdded', (data) => {
    drawText(data.x, data.y, data.text, data.author);
});

let isDragging = false;
let lastX, lastY;

canvas.addEventListener('mousedown', (e) => {
    isDragging = true;
    lastX = e.clientX;
    lastY = e.clientY;
});

canvas.addEventListener('mousemove', (e) => {
    if (isDragging) {
        const dx = e.clientX - lastX;
        const dy = e.clientY - lastY;
        offsetX -= dx / cellSize;
        offsetY -= dy / cellSize;
        lastX = e.clientX;
        lastY = e.clientY;
        redrawCanvas();
    }
});

canvas.addEventListener('mouseup', () => {
    isDragging = false;
});

function redrawCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    socket.emit('requestInitialData');
}

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    redrawCanvas();
});
