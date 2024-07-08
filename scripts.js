// scripts.js
document.getElementById('start-game').addEventListener('click', startGame);
document.getElementById('end-game').addEventListener('click', endGame);
document.getElementById('restart-game').addEventListener('click', restartGame);

const roles = ['WereMilinWolf', 'Seer', 'Villager', 'Doctor', 'Hunter', 'Witch', 'Cupid', 'Thief', 'Knight'];

function startGame() {
    const playerCount = prompt("กรุณาใส่จำนวนผู้เล่น (8-16):");
    if (playerCount < 8 || playerCount > 16) {
        alert("จำนวนผู้เล่นต้องอยู่ระหว่าง 8-16 คน");
        return;
    }

    const players = assignRoles(playerCount);
    displayPlayers(players);

    document.getElementById('start-screen').style.display = 'none';
    document.getElementById('game-screen').style.display = 'block';
}

function assignRoles(playerCount) {
    const shuffledRoles = roles.sort(() => 0.5 - Math.random());
    const players = [];

    for (let i = 0; i < playerCount; i++) {
        players.push({
            id: i + 1,
            role: shuffledRoles[i % roles.length]
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
        playerDiv.innerHTML = `<h3>ผู้เล่น ${player.id}</h3><p>บทบาท: ${player.role}</p>`;
        playersDiv.appendChild(playerDiv);
    });
}

function endGame() {
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = 'เกมจบแล้ว!';
    document.getElementById('game-screen').style.display = 'none';
    document.getElementById('result-screen').style.display = 'block';
}

function restartGame() {
    document.getElementById('result-screen').style.display = 'none';
    document.getElementById('start-screen').style.display = 'block';
}
