import { request } from "http";
import { wrap } from "./message.mjs";
import { MessageType } from "./constants.mjs";
import { unwrap } from "./message.mjs";

const Connect = (url, {
  onConnected,
  onError,
  onMessage,
  onClose,
}) => {
  const req = request(url, {
    method: 'POST',
  })
  const send = (message, type = MessageType.message) => {
    const buff = wrap(type, message)

    req.write(buff)
  }

  const close = () => {
    req.end(wrap(MessageType.close, 'closing'))
  }

  let buffer = Buffer.alloc(0)

  let messages = []

  let notifyLock = false
  const notify = (message) => {
    messages.push(message)

    if (notifyLock) {
      return
    }

    notifyLock = true

    setTimeout(() => {
      notifyLock = false
      const clone = messages.slice()
      messages = []
      clone.forEach(message => {
        onMessage(message)
      })
    })
  }

  const consume = () => {
    const res = unwrap(buffer)

    if (!res) {
      return
    }

    const [message, restBuffer] = res

    buffer = restBuffer

    notify(message)
    
    consume()
  }
  const onData = (chunk) => {
    buffer = Buffer.concat([buffer, chunk])
    
    consume()
  }

  const onEnd = () => {
    consume()

    onClose()
  }

  req.on('response', (res) => {
    onConnected()

    const {statusCode} = res

    if (statusCode !== 200) {
      onError(new Error(`Status not 200: ${statusCode}`))
      onEnd()
      return
    }

    res.on('data', onData)
    res.on('end', onEnd)
    res.on('error', onError)
  })

  req.on('error', onError)

  return {
    send,
    close,
  }
};

export default Connect