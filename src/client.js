import express from "express";
import Connect from "./connect.js";
import Log from "./log.js";

const log = Log("client", "blue");

const events = [];

let conn = null;
let to = null;
const send = async (id) => {
  if (!conn) {
    events.push({ type: "ctrl", source: "client", data: "connect" });

    conn = Connect("http://localhost:8081", {
      onConnected() {
        log("onConnected");

        events.push({ type: "ctrl", source: "client", data: "onConnected" });
      },
      onError(err) {
        log("onError", err);

        events.push({ type: "ctrl", source: "client", data: "onError" });
      },
      onMessage(msg) {
        log("onMessage", {
          ...msg,
          data: msg.data.toString()
        });

        events.push({ type: "msg", source: "server", data: msg });
      },
      onClose() {
        log("onClose");

        close();

        events.push({ type: "ctrl", source: "client", data: "onClose" });
      }
    });

    to = setTimeout(close, 20 * 1000);
    to.unref();
  }

  const msg = `from-client: ${id}`;
  log("send", msg);

  conn.send(msg);
  events.push({ type: "msg", source: "client", data: msg });
};

const close = () => {
  if (conn) {
    conn.close();
    events.push({ type: "ctrl", source: "client", data: "close" });
  }

  if (to) {
    clearTimeout(to);
  }

  to = null;

  conn = null;
};

const app = express();

app.get("/events", (req, res) => {
  res.end(JSON.stringify(events));
});

app.post("/send", (req, res) => {
  const id = req.query.id;
  send(id);
  res.end();
});

app.post("/close", (req, res) => {
  close();

  res.end();
});

app.use(express.static("static"));

app.listen(8080);
