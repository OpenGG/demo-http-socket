import { MessageType } from "./constants.mjs"
import { wrap } from "./message.mjs"
import { unwrap } from "./message.mjs"

const Receive = (req, res, {
  onMessage,
  onClose,
}) => {
  let buffer = Buffer.alloc(0)
  const consume = () => {
    const res = unwrap(buffer)

    if (!res) {
      return
    }

    const [message, restBuffer] = res

    buffer = restBuffer

    onMessage(message)
    
    consume()
  }

  const onData = (chunk) => {
    buffer = Buffer.concat([buffer, chunk])
    
    consume()
  }

  const send = (message, type = MessageType.message) => {
    const buff = wrap(type, message)

    res.write(buff)
  }

  const close = () => {
    res.end()
  }

  req.on('data', onData)
  req.on('end', onClose)

  res.writeHead(200)

  res.flushHeaders()

  return {
    send,
    close,
  }
}

export default Receive