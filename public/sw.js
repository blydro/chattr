self.importScripts('https://cdnjs.cloudflare.com/ajax/libs/socket.io/2.0.4/socket.io.slim.js');

const socket = io('localhost' + ':3030', {jsonp: false});

// Replace SW
setInterval(() => console.log(socket), 5000);
