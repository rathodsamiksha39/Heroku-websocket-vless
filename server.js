const http = require("http");
const express = require("express");
const WebSocket = require("ws");
const net = require("net");

const VPS_HOST = "206.189.133.133";   // Your VPS IP
const VPS_PORT = 443;

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.get("/", (req, res) => {
  res.send("India VLESS WS Bridge Active");
});

wss.on("connection", (ws) => {

  const socket = new net.Socket();

  socket.connect(VPS_PORT, VPS_HOST, () => {
    console.log("Connected to VPS 206.189.133.133");
  });

  ws.on("message", (msg) => {
    socket.write(msg);
  });

  socket.on("data", (data) => {
    ws.send(data);
  });

  ws.on("close", () => {
    socket.destroy();
  });

  socket.on("close", () => {
    ws.close();
  });

  socket.on("error", (err) => {
    console.log("Socket error:", err.message);
    ws.close();
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log("Heroku WS bridge running");
});
