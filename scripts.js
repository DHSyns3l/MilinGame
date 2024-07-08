const socket = io.connect('http://localhost:3000'); // เชื่อมต่อกับเซิร์ฟเวอร์

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

socket.on('updateLobby', updateLobbyPlayers);
socket.on('startGame', startLobbyGameFromServer);
socket.on('newChatMessage', addChatMessage);

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
            <h3>ผู้เล่น ${player.name}</h3>
            <p>สถานะ: ${player.alive ? 'ยังมีชีวิตอยู่' : 'ตายแล้ว'}</p>
            <p class="${player.online ? 'online-status' : 'offline-status'}">${player.online ? 'ออนไลน์' : 'ออฟไลน์'}</p>
            ${player.alive && !nightPhase ? `<button onclick="vote(${player.id})">โหวต</button>` : ''}
            ${player.alive && nightPhase ? `<button onclick="useAbility(${player.id})">ใช้ความสามารถพิเศษ</button>` : ''}
        `;
        playersDiv.appendChild(playerDiv);
    });
}

function sendChat() {
    const chatInput = document.getElementById('chat-input');
    const chatMessage = chatInput.value.trim();
    if (chatMessage) {
        socket.emit('chatMessage', chatMessage);
        chatInput.value = '';
    }
}

function addChatMessage(chatMessage) {
    const chatBox = document.getElementById('chat-box');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'chat-message';
    messageDiv.innerText = `ผู้เล่น: ${chatMessage}`;
    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight; // เลื่อนแชทลงล่างสุด
}
