// public/script.js
$(document).ready(() => {
    const socket = io();
    let nickname = '';
    let currentColor = '#000000';
    let showCoordinates = false;

    $('#login-button').click(() => {
        nickname = $('#nickname-input').val().trim();
        if (nickname) {
            socket.emit('login', nickname);
        }
    });

    socket.on('loginSuccess', (confirmedNickname) => {
        $('#login-screen').hide();
        $('#world-container').show();
        nickname = confirmedNickname;
        socket.emit('requestInitialState');
    });

    const $world = $('#world');
    const $coordinates = $('#coordinates');

    function updateCell(x, y, text, color, cellNickname) {
        const cellId = `cell-${x}-${y}`;
        let $cell = $(`#${cellId}`);
        
        if (!$cell.length) {
            $cell = $('<div>')
                .addClass('cell')
                .attr('id', cellId)
                .css({
                    left: x * 10 + 'px',
                    top: y * 16 + 'px'
                })
                .appendTo($world);
        }

        $cell.text(text).css('color', color);

        // Update or create nametag
        let $nametag = $(`#nametag-${cellId}`);
        if (!$nametag.length) {
            $nametag = $('<div>')
                .addClass('nametag')
                .attr('id', `nametag-${cellId}`)
                .appendTo($world);
        }
        $nametag.text(cellNickname).css({
            left: (x * 10) + 'px',
            top: (y * 16 - 20) + 'px'
        });
    }

    socket.on('initialState', (world) => {
        for (const y in world) {
            for (const x in world[y]) {
                const { text, color, nickname: cellNickname } = world[y][x];
                updateCell(parseInt(x), parseInt(y), text, color, cellNickname);
            }
        }
    });

    socket.on('textUpdate', (data) => {
        updateCell(data.x, data.y, data.text, data.color, data.nickname);
    });

    $world.on('click', (e) => {
        const x = Math.floor(e.pageX / 10);
        const y = Math.floor(e.pageY / 16);
        const text = prompt('Enter text:');
        if (text !== null) {
            socket.emit('setText', { x, y, text, color: currentColor });
        }
    });

    $('#color-picker').on('change', (e) => {
        currentColor = e.target.value;
    });

    $('#show-coordinates').on('change', (e) => {
        showCoordinates = e.target.checked;
    });

    $world.on('mousemove', (e) => {
        const x = Math.floor(e.pageX / 10);
        const y = Math.floor(e.pageY / 16);
        if (showCoordinates) {
            $coordinates.text(`X: ${x}, Y: ${y}`).show();
        } else {
            $coordinates.hide();
        }
    });
});
