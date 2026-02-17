const http = require("http");
const WebSocket = require("ws");

const BACKEND_DOMAIN = "india.satishcdn.com";
const BACKEND_URL = `wss://${BACKEND_DOMAIN}/`;

const server = http.createServer((req, res) => {
  res.writeHead(200);
  res.end("Heroku WS Forwarder Running");
});

const wss = new WebSocket.Server({ noServer: true });

server.on("upgrade", (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit("connection", ws, request);
  });
});

wss.on("connection", (clientSocket) => {

  const backendSocket = new WebSocket(BACKEND_URL, {
    rejectUnauthorized: false,
    headers: {
      Host: BACKEND_DOMAIN
    }
  });

  clientSocket.on("message", (msg) => {
    if (backendSocket.readyState === WebSocket.OPEN) {
      backendSocket.send(msg);
    }
  });

  backendSocket.on("message", (msg) => {
    if (clientSocket.readyState === WebSocket.OPEN) {
      clientSocket.send(msg);
    }
  });

  clientSocket.on("close", () => backendSocket.close());
  backendSocket.on("close", () => clientSocket.close());

  backendSocket.on("error", () => clientSocket.close());
  clientSocket.on("error", () => backendSocket.close());
});

server.listen(process.env.PORT || 3000);
