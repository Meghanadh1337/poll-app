import React, { useEffect, useState } from 'react';

function App() {
  const [ws, setWs] = useState(null);
  const [roomCode, setRoomCode] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [votes, setVotes] = useState({});
  const [voters, setVoters] = useState({});
  const [hasVoted, setHasVoted] = useState(false);
  const [input, setInput] = useState('');
  const [timer, setTimer] = useState(60);
  const [name, setName] = useState('');

  const question = `${options[0]} vs ${options[1]}`;

  useEffect(() => {
    const socket = new WebSocket('wss://poll-app-backend-zp2c.onrender.com');
    setWs(socket);

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === 'room-created' || data.type === 'room-joined') {
        setRoomCode(data.roomCode);
        const savedVote = localStorage.getItem(`voted_${data.roomCode}`);
        if (savedVote) setHasVoted(true);
        setOptions(data.options);
        setVotes(data.votes);
        setVoters(data.voters);
        setTimer(60);
        setHasVoted(false);
      } else if (data.type === 'vote-updated') {
        setVotes(data.votes);
        setVoters(data.voters);
      } else if (data.type === 'voting-ended') {
        setTimer(0);
      } else if (data.type === 'error') {
        alert(data.message);
      }
    };

    return () => socket.close();
  }, []);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const createRoom = () => {
    if (ws && name && options[0] && options[1]) {
      ws.send(JSON.stringify({
        type: 'create-room',
        name,
        options
      }));
    } else {
      alert('Please enter your name and both options!');
    }
  };

  const joinRoom = () => {
    if (ws && input) {
      ws.send(JSON.stringify({ type: 'join-room', roomCode: input }));
    }
  };

  const vote = (option) => {
    if (ws && !hasVoted && timer > 0) {
      ws.send(JSON.stringify({ type: 'vote', roomCode, vote: option, name }));
      setHasVoted(true);
      localStorage.setItem(`voted_${roomCode}`, option);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>{options[0] && options[1] ? question : 'Join or Create a Room'}</h2>

      {!roomCode && (
        <div>
          <input
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <br />
          <input
            type="text"
            placeholder="Option 1"
            value={options[0]}
            onChange={(e) => setOptions([e.target.value, options[1]])}
          />
          <br />
          <input
            type="text"
            placeholder="Option 2"
            value={options[1]}
            onChange={(e) => setOptions([options[0], e.target.value])}
          />
          <br />
          <button onClick={createRoom}>Create Room</button>
        </div>
      )}

      {roomCode && options[0] && options[1] && votes && voters ? (
        <>
          <h3>Room Code: {roomCode}</h3>
          <div>
            {options.map((option) => (
              <div key={option}>
                <button
                  onClick={() => vote(option)}
                  disabled={hasVoted || timer <= 0}
                >
                  {option} ({votes[option] || 0})
                </button>
                <div>
                  <strong>Voters:</strong>
                  <ul>
                    {Array.isArray(voters?.[option]) && voters[option].length > 0 ? (
                      voters[option].map((voter, index) => (
                        <li key={index}>{voter}</li>
                      ))
                    ) : (
                      <li>No votes yet</li>
                    )}
                  </ul>
                </div>
              </div>
            ))}
          </div>
          <div>
            {timer > 0 ? (
              <h3>Time remaining: {timer}s</h3>
            ) : (
              <h3>Voting has ended</h3>
            )}
          </div>
        </>
      ) : null}

      {!roomCode && (
        <>
          <input
            type="text"
            placeholder="Enter room code"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button onClick={joinRoom}>Join Room</button>
        </>
      )}
    </div>
  );
}

export default App;