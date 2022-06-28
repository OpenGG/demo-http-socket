import { MessageType } from "./constants.js";
import { wrap } from "./message.js";
import { unwrap } from "./message.js";

const Receive = (req, res, { onMessage, onClose }) => {
  let buffer = Buffer.alloc(0);
  const consume = () => {
    const res = unwrap(buffer);

    if (!res) {
      return;
    }

    const [message, restBuffer] = res;

    buffer = restBuffer;

    onMessage(message);

    consume();
  };

  const onData = (chunk) => {
    buffer = Buffer.concat([buffer, chunk]);

    consume();
  };

  const send = (message) => {
    const buff = wrap(
      message && message.byteLength ? MessageType.raw : MessageType.text,
      message
    );

    res.write(buff);
  };

  const close = () => {
    res.end();
  };

  req.on("data", onData);
  req.on("end", onClose);

  res.writeHead(200);

  res.flushHeaders();

  return {
    send,
    close
  };
};

export default Receive;
