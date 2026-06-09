const WebSocket = require('ws');

const ws = new WebSocket('ws://localhost:8081/chat/global');

ws.on('open', function open() {
  console.log('Connected');
  const joinMsg = { userId: 'tester', type: 'JOIN' };
  ws.send(JSON.stringify(joinMsg));
  console.log('Sent JOIN');
});

ws.on('message', function incoming(data) {
  console.log('Received:', data.toString());
  
  if (data.toString().includes('JOIN')) {
      setTimeout(() => {
          const chatMsg = { userId: 'tester', type: 'MESSAGE', message: 'Hello from node' };
          ws.send(JSON.stringify(chatMsg));
          console.log('Sent MESSAGE');
      }, 1000);
  } else {
      setTimeout(() => {
          ws.close();
      }, 1000);
  }
});

ws.on('close', function close(code, reason) {
    console.log('Disconnected', code, reason.toString());
});

ws.on('error', function error(err) {
    console.error('Error:', err);
});
