const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const rooms = {}; // { roomCode: { question, options, votes, voters, clients, timer } }

wss.on('connection', (ws) => {
  ws.on('message', (msg) => {
    const data = JSON.parse(msg);

    // Handle room creation
    if (data.type === 'create-room') {
      const roomCode = uuidv4().slice(0, 6);
      const options = data.options;
      const name = data.name;  // The name entered by the user

      // Check if the name already exists in any room
      const nameExists = Object.values(rooms).some(room =>
        room.voters[options[0]].includes(name) || room.voters[options[1]].includes(name)
      );

      if (nameExists) {
        ws.send(JSON.stringify({ type: 'error', message: 'Name already used in another room. Please choose a unique name.' }));
        return; // Stop further processing if name is taken
      }

      rooms[roomCode] = {
        question: `${options[0]} vs ${options[1]}`,
        options,
        votes: {},
        voters: {},
        clients: new Set(),
        timer: null,
      };

      // Initialize votes and voters for each option
      for (const opt of options) {
        rooms[roomCode].votes[opt] = 0;
        rooms[roomCode].voters[opt] = [];
      }

      rooms[roomCode].clients.add(ws);

      // Start 60-second countdown timer
      rooms[roomCode].timer = setTimeout(() => {
        rooms[roomCode].clients.forEach((client) => {
          client.send(JSON.stringify({
            type: 'voting-ended',
            message: 'Voting has ended.'
          }));
        });
        delete rooms[roomCode]; // Optional: remove room after timer ends
      }, 60000);

      ws.send(JSON.stringify({
        type: 'room-created',
        roomCode,
        question: rooms[roomCode].question,
        options,
        votes: rooms[roomCode].votes,
        voters: rooms[roomCode].voters,
      }));
    }

    // Handle joining an existing room
    else if (data.type === 'join-room') {
      const room = rooms[data.roomCode];
      if (room) {
        room.clients.add(ws);
        ws.send(JSON.stringify({
          type: 'room-joined',
          roomCode: data.roomCode,
          question: room.question,
          options: room.options,
          votes: room.votes,
          voters: room.voters,
        }));
      } else {
        ws.send(JSON.stringify({ type: 'error', message: 'Room not found' }));
      }
    }

    // Handle voting
    else if (data.type === 'vote') {
      const { roomCode, vote, name } = data;
      const room = rooms[roomCode];

      if (!name || !name.trim()) {
        ws.send(JSON.stringify({ type: 'error', message: 'Name is required to vote' }));
        return;
      }

      // Check if the name has already been used in any of the options
      const alreadyVoted = Object.values(room.voters).some(voterList => voterList.includes(name));
      if (alreadyVoted) {
        ws.send(JSON.stringify({ type: 'error', message: 'Name already used. Please choose a unique name.' }));
        return;
      }

      if (room && room.votes[vote] !== undefined) {
        room.votes[vote]++;
        room.voters[vote].push(name);

        room.clients.forEach((client) => {
          client.send(JSON.stringify({
            type: 'vote-updated',
            votes: room.votes,
            voters: room.voters
          }));
        });
      }
    }
  });

  ws.on('close', () => {
    // Remove client from any rooms
    for (const room of Object.values(rooms)) {
      room.clients.delete(ws);
    }
  });
});

server.listen(3001, () => {
  console.log('WebSocket server running on port 3001');
});

