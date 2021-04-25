const { RSocketClient } = require('rsocket-core');
const RSocketWebsocketClient = require('rsocket-websocket-client').default;
const WebSocket = require('ws');

const requestInterval = 750;
const maxTimeElapsed = 1000;

function now() {
  return (new Date()).getTime();
}

async function connect(options) {
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
    const start = now();
    const interval = setInterval(() => {

      const payload = { data: "What is the current time?" };

      console.log(`requestResponse request`, payload);

      let cancel = null;
      rsocket
        .requestResponse(payload)
        .subscribe({
          onComplete: (response) => {
            console.log(`requestResponse response`, response);
          },
          onError: (error) => {
            console.error(error);
          },
          onSubscribe: (_cancel) => {
            cancel = _cancel;
          },
        });

      const elapsedTime = now() - start;
      if (elapsedTime >= maxTimeElapsed) {
        console.log(`Elapsed time: ${elapsedTime}... cancelling and exiting!`);
        clearInterval(interval);
        cancel && cancel();
        resolve();
      }
    }, requestInterval);
  });
}

Promise.resolve(run()).then(
  () => process.exit(0),
  error => {
    console.error(error.stack);
    process.exit(1);
  },
);
