const express = require('express');
const socket = require('socket.io');
const app = express();
const port = 3000;

app.get('/', (_, res) => {
  res.sendFile(__dirname + '/index.html');
});

const server = app.listen(port, () => {
  console.log('listening on port ' + port);
});

// 소켓 서버를 웹서버에 붙인다
const io = socket(server);

const color = ['yellow', 'green', 'red', 'blue', 'white', 'black'];

// 소켓 서버에 접속
io.on('connection', (socket) => {
  console.log('소켓 서버 접속');

  // 소켓 서버 접속 시 사용자 이름 랜덤 생성
  const username = color[Math.floor(Math.random() * 6)];
  // 사용자가 room 에 들어왔음을 사용자 본인을 제외한 나머지 사람들에게 알려준다
  socket.broadcast.emit('join', { username });

  // 사용자에게 메세지를 받을 이벤트를 client message 라는 이벤트로 생성
  socket.on('client message', data => {
    // 연결된 모든 사용자에게 server message 이벤트로 메시지 전달
    io.emit('server message', { 
      username,
      message: data.message,
    });

    // 나를 제외한 다른 사람에게 메시지 전달
    // socket.broadcast.emit('server message', { message: data.message });
  });

  // 소켓 서버 연결 종료 disconnect는 예약어
  socket.on('disconnect', () => {
    // 사용자가 퇴장했음을 퇴장자를 제외한 모든 사람에게 알려준다
    socket.broadcast.emit('leave', { username});
  });
});