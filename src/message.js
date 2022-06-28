import { MessageType } from "./constants.js";

const isBuffer = (value) => Buffer.isBuffer(value);

const isArrayBuffer = (value) =>
  value &&
  value.buffer instanceof ArrayBuffer &&
  value.byteLength !== undefined;

export const wrap = (type, message) => {
  let buffer = null;
  const typeOfMessage = typeof message;
  if (typeOfMessage === "string") {
    buffer = Buffer.from(message);
  } else if (isBuffer(message) || isArrayBuffer(message)) {
    buffer = message;
  } else {
    throw new Error(`Invalid message type: ${typeOfMessage}`);
  }

  const head = Buffer.alloc(1 + 4);
  head[0] = type;
  head.writeInt32LE(buffer.byteLength, 1);

  const buff = Buffer.concat([head, buffer]);

  return buff;
};

const copy = (buff, start, end) =>
  Uint8Array.prototype.slice.call(buff, start, end);

export const unwrap = (buff) => {
  if (buff.byteLength < 1 + 4) {
    return null;
  }
  const type = buff[0];
  const size = buff.readInt32LE(1);
  const bytes = 1 + 4 + size;
  if (buff.byteLength >= bytes) {
    let data = copy(buff, 1 + 4, bytes);
    if (type === MessageType.text) {
      data = data.toString();
    }
    return [
      {
        type,
        size,
        data
      },
      copy(buff, bytes)
    ];
  }
  return null;
};
