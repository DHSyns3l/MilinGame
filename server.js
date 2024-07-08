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
});
