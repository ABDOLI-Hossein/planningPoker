const socket = io();
let totalPlayers = 0; // Nombre total de joueurs
let functionalities = [];

// Charger le backlog
document.getElementById('load_backlog_btn').addEventListener('click', () => {
  functionalities = JSON.parse(document.getElementById('backlog-input').value);
  document.getElementById('result_backlog_submit').innerText = "Terminé !";
});

// Démarrer la partie
document.getElementById('start-game-btn').addEventListener('click', () => {
  const player = document.getElementById('player-name').value;
  const mode = document.getElementById('game-mode').value;
  if (functionalities.length === 0) {
    alert('Veuillez charger un backlog !');
  } else {
    socket.emit('setupGame', { player, mode, functionalities });
  }
});

// Mise à jour du statut de la partie
socket.on('gameStatus', (status) => {
  if (status.gameStarted) {
    // Masquer certains éléments une fois la partie démarrée
    document.getElementById('game-mode').style.display = 'none';
    document.getElementById('backlog-input').style.display = 'none';
    document.getElementById('load_backlog_btn').style.display = 'none';

    const functionality = status.currentFunctionality;
    functionalities = status.backlog;

    console.log(functionalities);
    updateFunctionalityDisplay(functionality);
  }
});

// Réception des informations sur le début de la partie
socket.on('gameStarted', ({ players, mode, currentFunctionality }) => {
  document.getElementById('setup-section').style.display = 'none';
  document.getElementById('game-section').style.display = 'block';
  document.getElementById('big_title').style.display = 'none'; 
  document.getElementById('container_playerlist').style.display = 'block';

  updateFunctionalityDisplay(currentFunctionality);
});

// Réception d'une demande de revote
socket.on('revote', (functionality) => {
  alert('Le vote a été rejeté ! Veuillez voter à nouveau.');
  updateFunctionalityDisplay(functionality);
});

// Passage à la fonctionnalité suivante
socket.on('nextFunctionality', (nextFunctionality) => {
  console.log("Fonctionnalité suivante reçue :", nextFunctionality);

  if (nextFunctionality && nextFunctionality.name) {
    document.getElementById('current-functionality').innerHTML = `
      ${nextFunctionality.name}
    `;
  } else {
    document.getElementById('current-functionality').innerHTML = `
      Plus aucune fonctionnalité restante !
    `;
  }
});

// Mise à jour de la liste des joueurs
socket.on('playerList', (players) => {
  document.getElementById('playerList').innerHTML = players
    .map(item => `<li>${item}</li>`) // Utilisation d'un HTML valide
    .join('');
});

// Mise à jour du nombre total de joueurs
socket.on('updateTotalPlayers', (updatedTotalPlayers) => {
  totalPlayers = updatedTotalPlayers;
  console.log('Nombre total de joueurs mis à jour :', totalPlayers);

  // Mise à jour de l'affichage du nombre de joueurs dans l'UI
  document.getElementById('total-players').textContent = `Nombre total de joueurs : ${totalPlayers}`;
});

// Lorsqu'un nouveau joueur rejoint
function joinGame(playerName) {
  socket.emit('joinGame', playerName);
}

// Attente des autres joueurs
socket.on('waitforothers', (restPlayer) => {
  document.getElementById('restPlayer').innerHTML = `${restPlayer} joueurs n'ont pas encore voté...`;
});

// Réception du résultat calculé
socket.on('result', (result) => {
  document.getElementById('restPlayer').innerHTML = '';

  console.log("Résultat reçu :", result); // Ajouté pour débogage

  if (result.valid) {
    alert(`Résultat : Succès ! Difficulté estimée : ${result.difficulty}`);
  } else {
    alert("Résultat : Échec ! Les votes ne correspondent pas.");
  }
});

// Réception du résultat de la fin de la partie
socket.on('gameFinished', (backlog) => {
  alert('Partie terminée ! Le fichier backlog-result.json a été sauvegardé.');
  console.log('Résultats du backlog :', backlog);
});

// Envoi du vote du joueur au serveur
document.querySelectorAll('.card').forEach((card) => {
  card.addEventListener('click', () => {
    const value = card.getAttribute('data-value');
    const playerName = document.getElementById('player-name').value;

    socket.emit('voteForFunctionality', { playerName, vote: value });
  });
});

// Mise à jour de l'affichage de la fonctionnalité
function updateFunctionalityDisplay(functionality) {
  if (functionality && functionality.name) {
    document.getElementById('current-functionality').textContent = functionality.name;
  } else {
    document.getElementById('current-functionality').textContent = 'Sans nom';
  }
}
