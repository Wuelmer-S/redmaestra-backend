const WebSocket = require('ws');
const ws = new WebSocket('ws://localhost:3000/chat-ws?token=fake');
ws.on('open', () => console.log('connected'));
ws.on('close', (code, reason) => console.log('closed', code, reason.toString()));
ws.on('error', (err) => console.log('error', err));