import React, { useEffect, useState } from 'react';

function App() {
  const [ws, setWs] = useState(null);
  const [step, setStep] = useState(1); // 1 = landing, 2 = form, 3 = vote
  const [mode, setMode] = useState(''); // 'create' or 'join'

  const [name, setName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [inputCode, setInputCode] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [votes, setVotes] = useState({});
  const [voters, setVoters] = useState({});
  const [hasVoted, setHasVoted] = useState(false);
  const [timer, setTimer] = useState(60);

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
        setStep(3);
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
    if (timer > 0 && step === 3) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer, step]);

  const handleCreate = () => {
    if (ws && name.trim() && options[0] && options[1]) {
      ws.send(JSON.stringify({
        type: 'create-room',
        name,
        options,
      }));
    } else {
      alert('Please enter your name and both options');
    }
  };

  const handleJoin = () => {
    if (ws && name.trim() && inputCode.trim()) {
      ws.send(JSON.stringify({ type: 'join-room', roomCode: inputCode.trim() }));
    } else {
      alert('Please enter your name and room code');
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
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 text-gray-800 flex flex-col items-center justify-center p-6 font-sans transition-all duration-300 ease-in-out">
      {step === 1 && (
        <div className="space-y-6 text-center animate-fade-in">
          <h1 className="text-5xl font-extrabold text-purple-700 drop-shadow-md">🎉 Real-Time Poll</h1>
          <p className="text-xl text-gray-700">Start or join a fun voting room</p>
          <div className="flex gap-6 justify-center mt-6">
            <button
              onClick={() => { setMode('create'); setStep(2); }}
              className="px-8 py-3 bg-blue-600 text-white text-lg rounded-full shadow-md hover:scale-105 hover:bg-blue-700 transition-transform"
            >
              Create Room
            </button>
            <button
              onClick={() => { setMode('join'); setStep(2); }}
              className="px-8 py-3 bg-green-500 text-white text-lg rounded-full shadow-md hover:scale-105 hover:bg-green-600 transition-transform"
            >
              Join Room
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="w-full max-w-md bg-white p-6 rounded-2xl shadow-xl space-y-6 animate-slide-up">
          <button onClick={() => setStep(1)} className="text-blue-600 text-sm">← Back</button>
          <input
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl text-lg"
          />

          {mode === 'create' ? (
            <>
              <input
                type="text"
                placeholder="Option 1"
                value={options[0]}
                onChange={(e) => setOptions([e.target.value, options[1]])}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-lg"
              />
              <input
                type="text"
                placeholder="Option 2"
                value={options[1]}
                onChange={(e) => setOptions([options[0], e.target.value])}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-lg"
              />
              <button
                onClick={handleCreate}
                className="w-full px-4 py-3 bg-blue-600 text-white text-lg rounded-xl hover:bg-blue-700"
              >
                Start Poll
              </button>
            </>
          ) : (
            <>
              <input
                type="text"
                placeholder="Enter room code"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-lg"
              />
              <button
                onClick={handleJoin}
                className="w-full px-4 py-3 bg-green-600 text-white text-lg rounded-xl hover:bg-green-700"
              >
                Join Poll
              </button>
            </>
          )}
        </div>
      )}

      {step === 3 && (
        <div className="w-full max-w-3xl bg-white p-8 rounded-2xl shadow-xl space-y-8 text-center animate-fade-in">
          <h2 className="text-lg text-gray-500">
            Room Code: <span className="font-semibold text-gray-800">{roomCode}</span>
          </h2>
          <h3 className="text-4xl font-bold text-purple-700">{options[0]} vs {options[1]}</h3>
          <p className="text-lg text-gray-600">⏱️ Time remaining: {timer}s</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {options.map(option => (
              <div key={option} className="p-6 border border-gray-200 rounded-2xl hover:shadow-lg transition">
                <button
                  onClick={() => vote(option)}
                  disabled={hasVoted || timer <= 0}
                  className="w-full px-4 py-3 bg-indigo-600 text-white text-xl rounded-xl disabled:opacity-50"
                >
                  Vote {option} ({votes[option] || 0})
                </button>
                <div className="mt-3 text-left text-sm">
                  <strong className="text-gray-700">Voters:</strong>
                  <ul className="list-disc ml-6 mt-1 text-gray-600">
                    {(voters[option] || []).map((v, i) => <li key={i}>{v}</li>)}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;