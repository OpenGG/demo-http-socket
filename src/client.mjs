import express from 'express'
import Connect from "./connect.mjs";
import Log from "./log.mjs";

const log = Log('client', 'blue')

let conn = null
let to = null
const send = async (id) => {
  if (!conn) {
    conn = Connect('http://localhost:8081', {
      onConnected() {
        log('onConnected')
      },
      onError(err) {
        log('onError', err)

      },
      onMessage(msg) {
        log('onMessage', {
          ...msg,
          data: msg.data.toString(),
        })
      },
      onClose() {
        log('onClose')

        close()
      },
    })

    to = setTimeout(close, 20 * 1000)
    to.unref()
  }

  const msg = `from-client: ${id}`
  log('send', msg)
  conn.send(msg)
};

const close = () => {
  if (conn) {
    conn.close()
  }

  if (to) {
    clearTimeout(to)
  }

  to = null

  conn = null;
}

const app = express()

app.post('/send', (req, res) => {
  const id = req.query.id
  send(id)
  res.end()
})

app.post('/close', (req, res) => {
  close()

  res.end()
})

app.get('/', (req, res) => {
  res.end(`
<!doctype html>
<p>
  <button id="btn">send</button>
  <input id="input" readonly />
</p>
<p>
  <button id="btnClose">close</button>
</p>
<script>
let i = 0
input.value = i
btn.onclick = () => {
  fetch('/send?id=' + i, {
    method: 'post'
  });
  i += 1
  input.value = i
}

btnClose.onclick = () => {
  fetch('/close', {
    method: 'post'
  });
}
</script>
  `)
})

app.listen(8080)
