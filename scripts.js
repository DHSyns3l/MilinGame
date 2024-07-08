document.getElementById('start-game').addEventListener('click', startGame);
document.getElementById('end-game').addEventListener('click', endGame);
document.getElementById('restart-game').addEventListener('click', restartGame);
document.getElementById('send-chat').addEventListener('click', sendChat);

const roles = ['มนุษย์หมาป่า', 'ผู้หยั่งรู้', 'ชาวบ้าน', 'หมอ', 'นักล่า', 'แม่มด', 'คิวปิด', 'ขโมย', 'อัศวิน', 'ผู้พิทักษ์', 'ตัวตลก'];
let players = [];
let votes = [];
let nightPhase = true;
let chatHistory = []; // เก็บประวัติการแชท

function startGame() {
    const playerCount = prompt("กรุณาใส่จำนวนผู้เล่น (8-16):");
    if (playerCount < 8 || playerCount > 16) {
        alert("จำนวนผู้เล่นต้องอยู่ระหว่าง 8-16 คน");
        return;
    }

    players = assignRoles(playerCount);
    displayPlayers(players);
    nightPhase = true;
    showPhaseMessage();
    document.getElementById('start-screen').style.display = 'none';
    document.getElementById('game-screen').style.display = 'block';
    loadChatHistory(); // โหลดประวัติการแชทเมื่อเริ่มเกมใหม่
}

function assignRoles(playerCount) {
    const shuffledRoles = roles.sort(() => 0.5 - Math.random());
    const players = [];

    for (let i = 0; i < playerCount; i++) {
        players.push({
            id: i + 1,
            role: shuffledRoles[i % roles.length],
            alive: true,
            protected: false, // สำหรับ Guardian
            online: true // สถานะออนไลน์
        });
    }

    return players;
}

function displayPlayers(players) {
    const playersDiv = document.getElementById('players');
    playersDiv.innerHTML = '';

    players.forEach(player => {
        const playerDiv = document.createElement('div');
        playerDiv.className = 'player-card';
        playerDiv.innerHTML = `
            <h3>ผู้เล่น ${player.id}</h3>
            <p>สถานะ: ${player.alive ? 'ยังมีชีวิตอยู่' : 'ตายแล้ว'}</p>
            <p class="${player.online ? 'online-status' : 'offline-status'}">${player.online ? 'ออนไลน์' : 'ออฟไลน์'}</p>
            ${player.alive && !nightPhase ? `<button onclick="vote(${player.id})">โหวต</button>` : ''}
            ${player.alive && nightPhase ? `<button onclick="useAbility(${player.id})">ใช้ความสามารถพิเศษ</button>` : ''}
        `;
        playersDiv.appendChild(playerDiv);
    });
}

function vote(playerId) {
    votes.push(playerId);
    alert(`คุณโหวตผู้เล่น ${playerId} แล้ว`);
}

function useAbility(playerId) {
    const player = players.find(p => p.id === playerId);
    const playerRole = player.role;
    let targetId, target, healId, healPlayer, hunterKillId, hunterKillPlayer, witchKillId, witchKillPlayer, witchHealId, witchHealPlayer, lover1Id, lover2Id, lover1, lover2, protectId, protectPlayer;

    switch (playerRole) {
        case 'ผู้หยั่งรู้':
            targetId = prompt("เลือกผู้เล่นที่คุณต้องการตรวจสอบ (ใส่หมายเลขผู้เล่น):");
            target = players.find(p => p.id == targetId);
            if (target) {
                alert(`ผู้เล่น ${targetId} เป็น ${target.role}`);
            } else {
                alert("ไม่พบผู้เล่นดังกล่าว");
            }
            break;
        case 'หมอ':
            healId = prompt("เลือกผู้เล่นที่คุณต้องการรักษา (ใส่หมายเลขผู้เล่น):");
            healPlayer = players.find(p => p.id == healId);
            if (healPlayer) {
                healPlayer.alive = true;
                alert(`ผู้เล่น ${healId} ได้รับการรักษา`);
            } else {
                alert("ไม่พบผู้เล่นดังกล่าว");
            }
            break;
        case 'นักล่า':
            if (!player.alive) {
                hunterKillId = prompt("คุณถูกฆ่า เลือกผู้เล่นที่คุณต้องการฆ่า (ใส่หมายเลขผู้เล่น):");
                hunterKillPlayer = players.find(p => p.id == hunterKillId);
                if (hunterKillPlayer) {
                    hunterKillPlayer.alive = false;
                    alert(`ผู้เล่น ${hunterKillId} ถูกฆ่าโดย Hunter`);
                } else {
                    alert("ไม่พบผู้เล่นดังกล่าว");
                }
            }
            break;
        case 'แม่มด':
            if (confirm("คุณต้องการใช้ยาพิษหรือยารักษา? กด 'ตกลง' เพื่อใช้ยาพิษ หรือ 'ยกเลิก' เพื่อใช้ยารักษา")) {
                witchKillId = prompt("เลือกผู้เล่นที่คุณต้องการฆ่า (ใส่หมายเลขผู้เล่น):");
                witchKillPlayer = players.find(p => p.id == witchKillId);
                if (witchKillPlayer) {
                    witchKillPlayer.alive = false;
                    alert(`ผู้เล่น ${witchKillId} ถูกฆ่าโดย Witch`);
                } else {
                    alert("ไม่พบผู้เล่นดังกล่าว");
                }
            } else {
                witchHealId = prompt("เลือกผู้เล่นที่คุณต้องการรักษา (ใส่หมายเลขผู้เล่น):");
                witchHealPlayer = players.find(p => p.id == witchHealId);
                if (witchHealPlayer) {
                    witchHealPlayer.alive = true;
                    alert(`ผู้เล่น ${witchHealId} ได้รับการรักษา`);
                } else {
                    alert("ไม่พบผู้เล่นดังกล่าว");
                }
            }
            break;
        case 'คิวปิด':
            lover1Id = prompt("เลือกผู้เล่นที่คุณต้องการให้เป็นคนรักคนแรก (ใส่หมายเลขผู้เล่น):");
            lover2Id = prompt("เลือกผู้เล่นที่คุณต้องการให้เป็นคนรักคนที่สอง (ใส่หมายเลขผู้เล่น):");
            lover1 = players.find(p => p.id == lover1Id);
            lover2 = players.find(p => p.id == lover2Id);
            if (lover1 && lover2) {
                lover1.lover = lover2Id;
                lover2.lover = lover1Id;
                alert(`ผู้เล่น ${lover1Id} และผู้เล่น ${lover2Id} เป็นคนรักกัน`);
            } else {
                alert("ไม่พบผู้เล่นดังกล่าว");
            }
            break;
        case 'ผู้พิทักษ์':
            protectId = prompt("เลือกผู้เล่นที่คุณต้องการปกป้อง (ใส่หมายเลขผู้เล่น):");
            protectPlayer = players.find(p => p.id == protectId);
            if (protectPlayer) {
                protectPlayer.protected = true;
                alert(`ผู้เล่น ${protectId} ได้รับการปกป้อง`);
            } else {
                alert("ไม่พบผู้เล่นดังกล่าว");
            }
            break;
        default:
            alert(`ผู้เล่น ${playerId} ไม่มีความสามารถพิเศษ`);
    }
}

function endGame() {
    const resultDiv = document.getElementById('result');
    if (!nightPhase) {
        const voteCount = {};
        votes.forEach(vote => {
            voteCount[vote] = (voteCount[vote] || 0) + 1;
        });

        let maxVotes = 0;
        let playerToEliminate = null;
        for (const player in voteCount) {
            if (voteCount[player] > maxVotes) {
                maxVotes = voteCount[player];
                playerToEliminate = player;
            }
        }

        if (playerToEliminate !== null) {
            if (!players[playerToEliminate - 1].protected) {
                players[playerToEliminate - 1].alive = false;
            } else {
                alert(`ผู้เล่น ${playerToEliminate} ได้รับการปกป้องและไม่ถูกฆ่า`);
            }
        }

        resultDiv.innerHTML = playerToEliminate ? 
            `ผู้เล่น ${playerToEliminate} ถูกฆ่า` : 'ไม่มีใครถูกฆ่า';
    }

    displayPlayers(players);
    nightPhase = !nightPhase; // เปลี่ยนจากกลางวันเป็นกลางคืน และกลางคืนเป็นกลางวัน
    showPhaseMessage(); // แสดงข้อความการเปลี่ยนรอบ
    checkWinCondition(); // ตรวจสอบสถานะการชนะ
    document.getElementById('game-screen').style.display = 'none';
    document.getElementById('result-screen').style.display = 'block';
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
    } else if (werewolves.length >= villagers.length) {
        alert("มนุษย์หมาป่าชนะ!");
    }
}

function restartGame() {
    document.getElementById('result-screen').style.display = 'none';
    document.getElementById('start-screen').style.display = 'block';
}

// ฟีเจอร์แชทในเกม
function sendChat() {
    const chatInput = document.getElementById('chat-input');
    const chatMessage = chatInput.value.trim();
    if (chatMessage) {
        const chatBox = document.getElementById('chat-box');
        const messageDiv = document.createElement('div');
        messageDiv.className = 'chat-message';
        messageDiv.innerText = `ผู้เล่น: ${chatMessage}`;
        chatBox.appendChild(messageDiv);
        chatInput.value = '';
        chatBox.scrollTop = chatBox.scrollHeight; // เลื่อนแชทลงล่างสุด
        chatHistory.push(chatMessage); // เก็บประวัติการแชท
        notifyNewMessage(); // แจ้งเตือนข้อความใหม่
    }
}

function notifyNewMessage() {
    const notificationDiv = document.createElement('div');
    notificationDiv.className = 'chat-notification';
    notificationDiv.innerText = 'มีข้อความใหม่ในแชท';
    document.body.appendChild(notificationDiv);
    setTimeout(() => {
        document.body.removeChild(notificationDiv);
    }, 3000); // แสดงแจ้งเตือนเป็นเวลา 3 วินาที
}

function loadChatHistory() {
    const chatBox = document.getElementById('chat-box');
    chatBox.innerHTML = ''; // ล้างแชทเก่า
    chatHistory.forEach(message => {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'chat-message';
        messageDiv.innerText = `ผู้เล่น: ${message}`;
        chatBox.appendChild(messageDiv);
    });
    chatBox.scrollTop = chatBox.scrollHeight; // เลื่อนแชทลงล่างสุด
}
