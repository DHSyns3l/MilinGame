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
});
