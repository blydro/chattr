const server = require('http').createServer();
const io = require('socket.io')(server);

const nodes = [];

server.listen(3030);
console.log('listening on 3030');

io.on('connection', socket => {
	console.log('%s user connected', socket.id);
	let index = null;

	socket.on('getNodes', () => {
		socket.emit('nodes', nodes);
	});

	socket.on('newNode', node => {
		index = nodes.push(node);
		console.log(nodes, index);
	});

	socket.on('signal', signal => {
		console.log('new signal: ', signal);
		socket.broadcast.emit('signal', signal);
	});

	socket.on('disconnect', () => {
		nodes.pop(index);
		console.log(nodes, index);
	});
});
