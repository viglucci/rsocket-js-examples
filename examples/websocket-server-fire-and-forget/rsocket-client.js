const { RSocketClient } = require('rsocket-core');
const RSocketWebsocketClient = require('rsocket-websocket-client').default;
const WebSocket = require('ws');

async function connect() {
  const transportOptions = {
    url: 'ws://127.0.0.1:9898',
    wsCreator: (url) => {
      return new WebSocket(url);
    }
  };
  const setup = {
    keepAlive: 1000000,
    lifetime: 100000,
    dataMimeType: 'text/plain',
    metadataMimeType: 'text/plain'
  };
  const transport = new RSocketWebsocketClient(transportOptions);
  const client = new RSocketClient({ setup, transport });
  return await client.connect();
}

async function run() {
  return new Promise(async (resolve, reject) => {
    const rsocket = await connect();
    const payload = { data: "ping" };
    rsocket.fireAndForget(payload);
    console.log('fireAndForget finished');
    resolve();
  });
}

Promise.resolve(run()).then(
  () => process.exit(0),
  error => {
    console.error(error.stack);
    process.exit(1);
  },
);
