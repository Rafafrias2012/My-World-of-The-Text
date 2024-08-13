// Replace your existing script.js with this updated version

const socket = io();

const loginScreen = document.getElementById('login-screen');
const gameScreen = document.getElementById('game-screen');
const loginBtn = document.getElementById('login-btn');
const nicknameInput = document.getElementById('nickname');
const worldIdInput = document.getElementById('world-id');
const canvas = document.getElementById('text-canvas');
const ctx = canvas.getContext('2d');
const textInput = document.getElementById('text-input');
const colorPicker = document.getElementById('color-picker');
const pasteBtn = document.getElementById('paste-btn');

let nickname = '';
let worldId = '';
let offsetX = 0;
let offsetY = 0;
const cellSize = 20;

loginBtn.addEventListener('click', () => {
    nickname = nicknameInput.value.trim();
    worldId = worldIdInput.value.trim();
    if (nickname && worldId) {
        socket.emit('login', { nickname, worldId });
        loginScreen.style.display = 'none';
        gameScreen.style.display = 'flex';
        initializeCanvas();
    }
});

function initializeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    socket.emit('requestInitialData', worldId);
}

socket.on('initialData', (data) => {
    for (const y in data) {
        for (const x in data[y]) {
            drawText(parseInt(x), parseInt(y), data[y][x].text, data[y][x].color);
        }
    }
});

function drawText(x, y, text, color) {
    const screenX = (x - offsetX) * cellSize;
    const screenY = (y - offsetY) * cellSize;
    ctx.fillStyle = color || 'black';
    ctx.font = '14px Arial';
    const lines = text.split('\n');
    lines.forEach((line, index) => {
        ctx.fillText(line, screenX, screenY + cellSize + (index * 20));
    });
}

canvas.addEventListener('click', (e) => {
    const x = Math.floor((e.clientX + offsetX * cellSize) / cellSize);
    const y = Math.floor((e.clientY + offsetY * cellSize) / cellSize);
    textInput.focus();
    textInput.setAttribute('data-x', x);
    textInput.setAttribute('data-y', y);
});

textInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        const text = textInput.value;
        const x = parseInt(textInput.getAttribute('data-x'));
        const y = parseInt(textInput.getAttribute('data-y'));
        const color = colorPicker.value;
        if (text) {
            socket.emit('addText', { x, y, text, color });
            textInput.value = '';
        }
    }
});

socket.on('textAdded', (data) => {
    drawText(data.x, data.y, data.text, data.color);
});

pasteBtn.addEventListener('click', async () => {
    try {
        const text = await navigator.clipboard.readText();
        textInput.value = text;
    } catch (err) {
        console.error('Failed to read clipboard contents: ', err);
    }
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
    socket.emit('requestInitialData', worldId);
}

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    redrawCanvas();
});
