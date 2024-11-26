import { WebSocket, WebSocketServer } from "ws";

interface User {
  socket: WebSocket;
  room: string;
}

const wss = new WebSocketServer({ port: 3000 });
console.log("WebSocket server running on ws://localhost:3000");

let allSockets: User[] = [];

wss.on("connection", (socket) => {
  console.log("New client connected");

  socket.on("message", (message) => {
    try {
      const data = JSON.parse(message.toString());

      // Handle 'join' messages
      if (data.type === "join") {
        allSockets.push({ socket, room: data.payload.room });
        console.log(`User connected to room: ${data.payload.room}`);
      }

      // Handle 'chat' messages
      if (data.type === "chat") {
        const currentRoom = allSockets.find((x) => x.socket === socket)?.room;

        if (currentRoom) {
          // Broadcast the message to all users in the same room
          allSockets
            .filter((x) => x.room === currentRoom)
            .forEach((x) => x.socket.send(data.payload.message));
          console.log(`Message sent to room ${currentRoom}: ${data.payload.message}`);
        } else {
          socket.send("You are not in a room!");
        }
      }
    } catch (err) {
      console.error("Invalid message received", err);
    }
  });

  socket.on("close", () => {
    console.log("Client disconnected");
    allSockets = allSockets.filter((x) => x.socket !== socket);
  });

  socket.on("error", (err) => {
    console.error("WebSocket error", err);
  });
});
