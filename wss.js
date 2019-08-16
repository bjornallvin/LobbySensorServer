const WebSocket = require("ws");

// openning a websocket server
const wss = new WebSocket.Server({ port: 3002 });

wss.on("connection", function(ws) {
    ws.on("message", function receiveMessage(message) {
        console.log(message);
        arduino.write(message);
    });
});

exports.sendToClients = data => {
    wss.clients.forEach(function(client) {
        client.send(data);
    });
};
