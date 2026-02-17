const http = require("http");
const net = require("net");
const tls = require("tls");
const WebSocket = require("ws");

const BACKEND_HOST = "india.satishcdn.com";
const BACKEND_PORT = 443;

const server = http.createServer((req, res) => {
  res.writeHead(200);
  res.end("Heroku TCP Tunnel Running");
});

const wss = new WebSocket.Server({ noServer: true });

server.on("upgrade", (req, socket, head) => {
  wss.handleUpgrade(req, socket, head, (ws) => {
    wss.emit("connection", ws, req);
  });
});

wss.on("connection", (ws) => {

  // 🔥 Create raw TLS socket to backend
  const backend = tls.connect({
    host: BACKEND_HOST,
    port: BACKEND_PORT,
    servername: BACKEND_HOST, // force correct SNI
    rejectUnauthorized: false
  });

  // WS → Backend
  ws.on("message", (msg) => {
    backend.write(msg);
  });

  // Backend → WS
  backend.on("data", (data) => {
    ws.send(data);
  });

  ws.on("close", () => backend.end());
  backend.on("close", () => ws.close());

  ws.on("error", () => backend.destroy());
  backend.on("error", () => ws.close());
});

server.listen(process.env.PORT || 3000);
