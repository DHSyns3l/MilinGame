<<<<<<< HEAD
const socket = io.connect('https://your-heroku-app.herokuapp.com'); // ใช้ URL ของ Heroku หรือบริการที่คุณใช้

document.getElementById('create-game').addEventListener('click', createGame);
document.getElementById('join-game').addEventListener('click', joinGame);
document.getElementById('start-lobby-game').addEventListener('click', startLobbyGame);
document.getElementById('send-chat').addEventListener('click', sendChat);

const roles = ['มนุษย์หมาป่า', 'ผู้หยั่งรู้', 'ชาวบ้าน', 'หมอ', 'นักล่า', 'แม่มด', 'คิวปิด', 'ขโมย', 'อัศวิน', 'ผู้พิทักษ์', 'ตัวตลก'];
let players = [];
let votes = [];
let nightPhase = true;
let chatHistory = [];
let lobbyPlayers = [];

socket.on('gameCode', gameCode => {
    document.getElementById('game-code').innerText = `รหัสเกม: ${gameCode}`;
});

socket.on('updateLobby', updateLobbyPlayers);
socket.on('startGame', startLobbyGameFromServer);
socket.on('newChatMessage', addChatMessage);
socket.on('updatePlayers', updatePlayers);

function createGame() {
    const playerName = prompt("กรุณาใส่ชื่อของคุณ:");
    if (playerName) {
        socket.emit('createGame', playerName);
        document.getElementById('start-screen').style.display = 'none';
        document.getElementById('lobby-screen').style.display = 'block';
    }
}

function joinGame() {
    const playerName = prompt("กรุณาใส่ชื่อของคุณ:");
    const gameCode = prompt("กรุณาใส่รหัสเกม:");
    if (playerName && gameCode) {
        socket.emit('joinGame', { playerName, gameCode });
        document.getElementById('start-screen').style.display = 'none';
        document.getElementById('lobby-screen').style.display = 'block';
    }
}

function startLobbyGame() {
    socket.emit('startGame');
}

function startLobbyGameFromServer(playersData) {
    players = playersData;
    displayPlayers(players);
    nightPhase = true;
    showPhaseMessage();
    document.getElementById('lobby-screen').style.display = 'none';
    document.getElementById('game-screen').style.display = 'block';
}

function updateLobbyPlayers(playersData) {
    lobbyPlayers = playersData;
    const playerListDiv = document.getElementById('player-list');
    playerListDiv.innerHTML = '';
    lobbyPlayers.forEach(player => {
        const playerDiv = document.createElement('div');
        playerDiv.className = 'lobby-player-card';
        playerDiv.innerHTML = `
            <h3>${player.name}</h3>
            <p class="${player.online ? 'online-status' : 'offline-status'}">${player.online ? 'ออนไลน์' : 'ออฟไลน์'}</p>
        `;
        playerListDiv.appendChild(playerDiv);
    });

    if (lobbyPlayers.length >= 8 && lobbyPlayers.length <= 16) {
        document.getElementById('start-lobby-game').style.display = 'block';
    } else {
        document.getElementById('start-lobby-game').style.display = 'none';
    }
}

function displayPlayers(players) {
    const playersDiv = document.getElementById('players');
    playersDiv.innerHTML = '';

    players.forEach(player => {
        const playerDiv = document.createElement('div');
        playerDiv.className = 'player-card';
        playerDiv.innerHTML = `
            <h3>${player.name}</h3>
            <p>${player.role}</p>
            <p class="${player.alive ? 'alive-status' : 'dead-status'}">${player.alive ? 'ยังมีชีวิต' : 'ตายแล้ว'}</p>
        `;
        playersDiv.appendChild(playerDiv);
    });
}

function addChatMessage(chatMessage) {
    const chatBox = document.getElementById('chat-box');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'chat-message';
    messageDiv.innerText = `ผู้เล่น: ${chatMessage}`;
    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight; // เลื่อนแชทลงล่างสุด
}

function sendChat() {
    const chatInput = document.getElementById('chat-input');
    const message = chatInput.value;
    if (message) {
        socket.emit('sendChatMessage', message);
        chatInput.value = '';
    }
}

function playAbilitySound() {
    const sound = document.getElementById('ability-sound');
    sound.play();
}

function playVoteSound() {
    const sound = document.getElementById('vote-sound');
    sound.play();
}

function playBackgroundSound() {
    const sound = document.getElementById('background-sound');
    sound.play();
}

function showPhaseMessage() {
    const message = nightPhase ? "กลางคืนแล้ว! ใช้ความสามารถพิเศษของคุณ" : "กลางวันแล้ว! ทุกคนโหวตเลือกคนที่จะถูกฆ่า";
    alert(message);
}

function checkWinCondition() {
    const werewolves = players.filter(player => player.role === 'มนุษย์หมาป่า' && player.alive);
    const villagers = players.filter(player => player.role !== 'มนุษย์หมาป่า' && player.alive);

    if (werewolves.length === 0) {
        alert("ชาวบ้านชนะ!");
        resetGame();
    } else if (werewolves.length >= villagers.length) {
        alert("มนุษย์หมาป่าชนะ!");
        resetGame();
    }
}

function resetGame() {
    players = [];
    votes = [];
    nightPhase = true;
    chatHistory = [];
    lobbyPlayers = [];
    document.getElementById('game-screen').style.display = 'none';
    document.getElementById('start-screen').style.display = 'block';
}

socket.on('updatePlayers', playersData => {
    players = playersData;
    displayPlayers(players);
    checkWinCondition();
=======
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const port = 3000;

let games = {};

app.use(express.static('public'));

io.on('connection', (socket) => {
    console.log('a user connected:', socket.id);

    socket.on('createGame', (playerName) => {
        const gameCode = generateGameCode();
        games[gameCode] = {
            players: [{ id: socket.id, name: playerName, online: true }],
            started: false
        };
        socket.join(gameCode);
        socket.emit('updateLobby', games[gameCode].players);
    });

    socket.on('joinGame', ({ playerName, gameCode }) => {
        if (games[gameCode] && !games[gameCode].started) {
            games[gameCode].players.push({ id: socket.id, name: playerName, online: true });
            socket.join(gameCode);
            io.in(gameCode).emit('updateLobby', games[gameCode].players);
        } else {
            socket.emit('error', 'เกมนี้ได้เริ่มไปแล้วหรือไม่มีรหัสเกมนี้');
        }
    });

    socket.on('startGame', () => {
        const gameCode = Object.keys(socket.rooms).find(room => room !== socket.id);
        if (games[gameCode]) {
            games[gameCode].started = true;
            const playersData = assignRoles(games[gameCode].players);
            io.in(gameCode).emit('startGame', playersData);
        }
    });

    socket.on('chatMessage', (chatMessage) => {
        const gameCode = Object.keys(socket.rooms).find(room => room !== socket.id);
        io.in(gameCode).emit('newChatMessage', chatMessage);
    });

    socket.on('disconnect', () => {
        console.log('user disconnected:', socket.id);
        for (let gameCode in games) {
            const playerIndex = games[gameCode].players.findIndex(player => player.id === socket.id);
            if (playerIndex !== -1) {
                games[gameCode].players[playerIndex].online = false;
                io.in(gameCode).emit('updateLobby', games[gameCode].players);
                break;
            }
        }
    });
});

function generateGameCode() {
    return Math.random().toString(36).substr(2, 5).toUpperCase();
}

function assignRoles(players) {
    const roles = ['มนุษย์หมาป่า', 'ผู้หยั่งรู้', 'ชาวบ้าน', 'หมอ', 'นักล่า', 'แม่มด', 'คิวปิด', 'ขโมย', 'อัศวิน', 'ผู้พิทักษ์', 'ตัวตลก'];
    const shuffledRoles = roles.sort(() => 0.5 - Math.random());
    return players.map((player, index) => ({
        ...player,
        role: shuffledRoles[index % roles.length],
        alive: true,
        protected: false
    }));
}

server.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
>>>>>>> f3cf5dba1f8fe3b92eb91b0c53f5e3344195bc6b
});
