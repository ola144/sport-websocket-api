import { WebSocket, WebSocketServer } from "ws";
import { wsArcjet } from "../../arcjet.js";

const sendJson = (socket, payload) => {
  if (socket.readyState !== WebSocket.OPEN) {
    return;
  }

  socket.send(JSON.stringify(payload));
};

const broadCast = (wss, payload) => {
  try {
    const data = JSON.stringify(payload);

    for (const client of wss.clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    }
  } catch (error) {
    console.log("Broadcast serialization failed:", error);
  }
};

export const attachWebSocketServer = (server) => {
  const wss = new WebSocketServer({
    server,
    path: "/ws",
    maxPayload: 1024 * 1024,
  });

  wss.on("connection", async (socket, req) => {
    if (wsArcjet) {
      try {
        const decision = await wsArcjet.protect(req);

        if (decision.isDenied) {
          const code = decision.reason.isRateLimit() ? 1013 : 1008;
          const reason = decision.reason.isRateLimit()
            ? "Rate limit exceeded"
            : "Access Denied";

          return socket.close(code, reason);
        }
      } catch (error) {
        console.log("WS connection error", error);
        return socket.close(1011, "Server security error");
      }
    }

    sendJson(socket, { type: "welcome" });

    socket.on("error", console.error);
  });

  function broadcastMatchCreated(match) {
    broadCast(wss, { type: "match_created", data: match });
  }

  return { broadcastMatchCreated };
};
