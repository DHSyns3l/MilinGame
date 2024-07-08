// scripts.js
document.getElementById('start-game').addEventListener('click', startGame);
document.getElementById('end-game').addEventListener('click', endGame);
document.getElementById('restart-game').addEventListener('click', restartGame);

const roles = ['WereMilinWolf', 'Seer', 'Villager', 'Doctor', 'Hunter', 'Witch', 'Cupid', 'Thief', 'Knight', 'Guardian', 'Fool'];
let players = [];
let votes = [];
let nightPhase = true;

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
}

function assignRoles(playerCount) {
    const shuffledRoles = roles.sort(() => 0.5 - Math.random());
    const players = [];

    for (let i = 0; i < playerCount; i++) {
        players.push({
            id: i + 1,
            role: shuffledRoles[i % roles.length],
            alive: true,
            protected: false // สำหรับ Guardian
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
            <p>บทบาท: ${player.role}</p>
            <p>สถานะ: ${player.alive ? 'ยังมีชีวิตอยู่' : 'ตายแล้ว'}</p>
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
    switch (player.role) {
        case 'Seer':
            const targetId = prompt("เลือกผู้เล่นที่คุณต้องการตรวจสอบ (ใส่หมายเลขผู้เล่น):");
            const target = players.find(p => p.id == targetId);
            if (target) {
                alert(`ผู้เล่น ${targetId} เป็น ${target.role}`);
            } else {
                alert("ไม่พบผู้เล่นดังกล่าว");
            }
            break;
        case 'Doctor':
            const healId = prompt("เลือกผู้เล่นที่คุณต้องการรักษา (ใส่หมายเลขผู้เล่น):");
            const healPlayer = players.find(p => p.id == healId);
            if (healPlayer) {
                healPlayer.alive = true;
                alert(`ผู้เล่น ${healId} ได้รับการรักษา`);
            } else {
                alert("ไม่พบผู้เล่นดังกล่าว");
            }
            break;
        case 'Hunter':
            if (!player.alive) {
                const hunterKillId = prompt("คุณถูกฆ่า เลือกผู้เล่นที่คุณต้องการฆ่า (ใส่หมายเลขผู้เล่น):");
                const hunterKillPlayer = players.find(p => p.id == hunterKillId);
                if (hunterKillPlayer) {
                    hunterKillPlayer.alive = false;
                    alert(`ผู้เล่น ${hunterKillId} ถูกฆ่าโดย Hunter`);
                } else {
                    alert("ไม่พบผู้เล่นดังกล่าว");
                }
            }
            break;
        case 'Witch':
            if (confirm("คุณต้องการใช้ยาพิษหรือยารักษา? กด 'ตกลง' เพื่อใช้ยาพิษ หรือ 'ยกเลิก' เพื่อใช้ยารักษา")) {
                const witchKillId = prompt("เลือกผู้เล่นที่คุณต้องการฆ่า (ใส่หมายเลขผู้เล่น):");
                const witchKillPlayer = players.find(p => p.id == witchKillId);
                if (witchKillPlayer) {
                    witchKillPlayer.alive = false;
                    alert(`ผู้เล่น ${witchKillId} ถูกฆ่าโดย Witch`);
                } else {
                    alert("ไม่พบผู้เล่นดังกล่าว");
                }
            } else {
                const witchHealId = prompt("เลือกผู้เล่นที่คุณต้องการรักษา (ใส่หมายเลขผู้เล่น):");
                const witchHealPlayer = players.find(p => p.id == witchHealId);
                if (witchHealPlayer) {
                    witchHealPlayer.alive = true;
                    alert(`ผู้เล่น ${witchHealId} ได้รับการรักษา`);
                } else {
                    alert("ไม่พบผู้เล่นดังกล่าว");
                }
            }
            break;
        case 'Cupid':
            const lover1Id = prompt("เลือกผู้เล่นที่คุณต้องการให้เป็นคนรักคนแรก (ใส่หมายเลขผู้เล่น):");
            const lover2Id = prompt("เลือกผู้เล่นที่คุณต้องการให้เป็นคนรักคนที่สอง (ใส่หมายเลขผู้เล่น):");
            const lover1 = players.find(p => p.id == lover1Id);
            const lover2 = players.find(p => p.id == lover2Id);
            if (lover1 && lover2) {
                lover1.lover = lover2Id;
                lover2.lover = lover1Id;
                alert(`ผู้เล่น ${lover1Id} และผู้เล่น ${lover2Id} เป็นคนรักกัน`);
            } else {
                alert("ไม่พบผู้เล่นดังกล่าว");
            }
            break;
        case 'Guardian':
            const protectId = prompt("เลือกผู้เล่นที่คุณต้องการปกป้อง (ใส่หมายเลขผู้เล่น):");
            const protectPlayer = players.find(p => p.id == protectId);
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
    const werewolves = players.filter(player => player.role === 'WereMilinWolf' && player.alive);
    const villagers = players.filter(player => player.role !== 'WereMilinWolf' && player.alive);

    if (werewolves.length === 0) {
        alert("ชาวบ้านชนะ!");
    } else if (werewolves.length >= villagers.length) {
        alert("WereMilinWolf ชนะ!");
    }
}

function restartGame() {
    document.getElementById('result-screen').style.display = 'none';
    document.getElementById('start-screen').style.display = 'block';
}

// ฟีเจอร์แชทในเกม
document.getElementById('send-chat').addEventListener('click', sendChat);

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
    }
}
