const http = require("http");
const WebSocket = require("ws");

const TARGET = "wss://india.satishcdn.com/";

const server = http.createServer();

const wss = new WebSocket.Server({ server });

wss.on("connection", (client) => {

  const target = new WebSocket(TARGET, {
    rejectUnauthorized: false
  });

  client.on("message", (msg) => {
    if (target.readyState === WebSocket.OPEN) {
      target.send(msg);
    }
  });

  target.on("message", (msg) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(msg);
    }
  });

  client.on("close", () => target.close());
  target.on("close", () => client.close());
});

server.listen(process.env.PORT || 3000);
