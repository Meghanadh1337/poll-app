# 🗳️ Real-Time Poll App

### 🚀 Deployment Links
(deployed on render) 
if you want to access it,please click the backend link (wait for 10 seconds) and then click the frontend link
- **Backend**: https://poll-app-backend-zp2c.onrender.com/
- **Frontend**: https://poll-app-frontend.onrender.com/


---

Hey! 👋 This is a real-time voting app I built using React for the frontend and Node.js + WebSocket for the backend. It's simple, fast, and works live without refreshing. Perfect for polls like "Pizza vs Burger" or "Cats vs Dogs".

---

## 🔥 What it does
- Lets people create or join a poll room
- You enter your name (no password)
- Vote between 2 options (e.g., Apple vs Android)
- See live vote updates as people vote
- Countdown timer: Polls close after 60 seconds
- Everyone sees the same live results

---

## 🧠 Why I built it
I wanted to build something real-time, something cool — not just forms and buttons. This was a good way to learn WebSockets and full-stack logic. Also felt awesome seeing live updates!

---

## 🧱 Tech Stack
- Frontend: ReactJS + TailwindCSS
- Backend: NodeJS with WebSocket (no DB)
- Deployment: Render (both frontend + backend)

---

## 🎯 Flow of the app (UX)
1. You land on the homepage — choose “Create Room” or “Join Room”
2. If you Create: enter your name + two poll options
3. If you Join: enter your name + room code
4. Voting screen opens → vote between the two options
5. See vote counts + who voted for what
6. After 60s, poll ends automatically

---

## 🚀 How to run it locally

Step-by-step:

1. Clone this repo  
   git clone https://github.com/Meghanadh1337/poll-app.git  
   cd poll-app

2. Start backend (Node + WebSocket)  
   cd server  
   npm install  
   node index.js  
   (Runs at: ws://localhost:3001)

3. Start frontend (React)  
   cd ../client  
   npm install  
   npm start  
   (Runs at: http://localhost:3000)

⚠️ Make sure the WebSocket URL in App.js matches your backend (`ws://localhost:3001` for local)

---

## 🌐 Live Demo
- Frontend: https://poll-app-frontend.onrender.com
- Backend: https://poll-app-backend-zp2c.onrender.com (used only by frontend)

---

## 🧩 Features we plan to add next
- Show results after voting ends
- Add user avatars or emojis
- Allow polls with more than 2 options
- Save results with a database

---

## 😎 Who made this
Me! Meghanadh. Just an Indian dev trying to build cool stuff and learn full-stack dev the hard way 💪

Pull requests, feedback, or even just a star 🌟 are always welcome!

---

## 📬 Contact
- Email: meghanadh777@gmail.com
- GitHub: https://github.com/Meghanadh1337

---

## 📋 Next Steps

1. Fork and clone this repo  
   git clone https://github.com/Meghanadh1337/poll-app.git

2. Install dependencies  
   cd server && npm install  
   cd ../client && npm install

3. Run backend  
   cd server  
   node index.js

4. Run frontend  
   cd ../client  
   npm start

(Use `ws://localhost:3001` in App.js for local dev WebSocket)

---

## 🌍 Deployment
If you want to deploy this on Render:
- Backend: create Web Service, root = `server`, start = `node index.js`
- Frontend: create Static Site, root = `client`, build = `npm run build`, publish = `build`
