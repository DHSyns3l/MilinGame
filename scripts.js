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
            alive: true
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
        // เพิ่มความสามารถพิเศษของตัวละครอื่น ๆ ตามต้องการ
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
            players[playerToEliminate - 1].alive = false;
        }

        resultDiv.innerHTML = playerToEliminate ? 
            `ผู้เล่น ${playerToEliminate} ถูกฆ่า` : 'ไม่มีใครถูกฆ่า';
    }

    displayPlayers(players);

    nightPhase = !nightPhase; // เปลี่ยนจากกลางวันเป็นกลางคืน และกลางคืนเป็นกลางวัน
    document.getElementById('game-screen').style.display = 'none';
    document.getElementById('result-screen').style.display = 'block';
}

function restartGame() {
    document.getElementById('result-screen').style.display = 'none';
    document.getElementById('start-screen').style.display = 'block';
}
