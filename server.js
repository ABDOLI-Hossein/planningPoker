const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

let votes = {};
let totalPlayers = 0;
let players = []; // Liste des joueurs
let backlog = [];
let currentFunctionalityIndex = 0;
let gameMode = 'strict';
let gameStarted = false;

io.on('connection', (socket) => {
  console.log('Un utilisateur s\'est connecté.');
  
  socket.emit('gameStatus', {
    gameStarted,
    backlog: gameStarted ? backlog : null,
    currentFunctionality: gameStarted ? backlog[currentFunctionalityIndex] : null
  });

  // Démarrage du jeu
  socket.on('setupGame', ({ player, mode, functionalities }) => {
    gameStarted = !gameStarted;
    players[socket.id] = player;
    totalPlayers++;
    console.log('Nombre total de joueurs :', totalPlayers); // Vérification de la valeur de totalPlayers
    io.emit('playerList', Object.values(players));
    
    backlog = functionalities;
    gameMode = mode;
    votes = {}; // Réinitialisation des votes
    currentFunctionalityIndex = 0;
    const currentFunctionality = backlog[currentFunctionalityIndex] || {};
    io.emit('gameStarted', { players, mode, currentFunctionality });
  });

  // Réception du vote d'un joueur
  socket.on('voteForFunctionality', ({ playerName, vote }) => {
    votes[playerName] = vote;
    console.log(`Le joueur ${playerName} a voté : ${vote}`);
    
    // Quand tous les joueurs ont voté
    if (Object.keys(votes).length === totalPlayers) {
      const result = calculateResult(votes, gameMode);
      console.log("Résultat calculé : ", result);
      
      // Envoi du résultat aux clients
      io.emit('result', result);

      // Vérification pour continuer le jeu ou le terminer
      if (result.valid) {
        console.log(currentFunctionalityIndex, 'currentFunctionalityIndex65');
        backlog[currentFunctionalityIndex].estimatedDifficulty = Number(result.difficulty);
        currentFunctionalityIndex++;

        if (currentFunctionalityIndex >= backlog.length) {
          fs.writeFileSync('backlog-result.json', JSON.stringify(backlog, null, 2));
          io.emit('gameFinished', backlog);
        } else {
          const nextFunctionality = backlog[currentFunctionalityIndex] || {};
          console.log(currentFunctionalityIndex, 'currentFunctionalityIndex');
          io.emit('nextFunctionality', nextFunctionality);
        }
      } else {
        votes = {}; // Réinitialisation des votes pour recommencer
        io.emit('revote', backlog[currentFunctionalityIndex]);
      }
    } else {
      const restPlayer = totalPlayers - Object.keys(votes).length;
      io.emit('waitforothers', restPlayer);
    }
  });

  socket.on('disconnect', () => {
    console.log('Un utilisateur s\'est déconnecté.');
    delete players[socket.id];
    if (players.length === 0) gameStarted = false;
    console.log(players, '93');
    totalPlayers = players.length;
  });
});

// Calcul du résultat en fonction du mode de jeu
function calculateResult(votes, mode) {
  const voteValues = Object.values(votes).map((v) => (v === 'cafe' || v === '?' ? -1 : parseInt(v, 10)));
  let result = { valid: false, difficulty: 0 };

  switch (mode) {
    case 'strict':
      result.valid = voteValues.every((v) => v === voteValues[0]);
      result.difficulty = voteValues[0];
      break;

    case 'moyenne':
      result.difficulty = Math.round(voteValues.reduce((sum, v) => sum + v, 0) / voteValues.length);
      result.valid = true;
      break;

    case 'médiane':
      const sorted = voteValues.slice().sort((a, b) => a - b);
      result.difficulty = sorted[Math.floor(sorted.length / 2)];
      result.valid = true;
      break;

    case 'majorité-absolue':
      const counts = voteValues.reduce((acc, v) => {
        acc[v] = (acc[v] || 0) + 1;
        return acc;
      }, {});
      const maxEntry = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
      result.difficulty = parseInt(maxEntry[0], 10);
      result.valid = maxEntry[1] > totalPlayers / 2;
      break;

    case 'majorité-relative':
      const maxRelative = voteValues.reduce((acc, v) => {
        acc[v] = (acc[v] || 0) + 1;
        return acc;
      }, {});
      result.difficulty = parseInt(Object.keys(maxRelative).sort((a, b) => maxRelative[b] - maxRelative[a])[0], 10);
      result.valid = true;
      break;

    default:
      break;
  }

  return result;
}

server.listen(3000, () => {
  console.log('Le serveur fonctionne sur http://localhost:3000');
});
