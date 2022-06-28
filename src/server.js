import { createServer } from "http";
import Log from "./log.js";
import Receive from "./receive.js";

const log = Log("server", "green");

//create a server object:
createServer((req, res) => {
  let i = 0;
  const r = Receive(req, res, {
    onMessage(msg) {
      log("onMessage", {
        ...msg,
        data: msg.data.toString()
      });

      setTimeout(() => {
        const msg = `from-server: ${i}`;
        i += 1;
        log("send", msg);
        r.send(msg);
      }, 500);
    },
    onClose() {
      log("onClose");
    }
  });
}).listen(8081); //the server object listens on port 8080
