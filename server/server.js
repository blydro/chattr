const server = require('http').createServer();
const io = require('socket.io')(server);
const p2p = require('socket.io-p2p-server').Server;

io.use(p2p);
server.listen(3030);

console.log('ready on 3030');
