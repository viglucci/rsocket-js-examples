const { RSocketClient } = require('rsocket-core');
const RSocketWebsocketClient = require('rsocket-websocket-client').default;
const WebSocket = require('ws');

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

      rsocket
        .requestResponse({ data: "What is the current time?" })
        .subscribe({
          onComplete: (response) => {
            console.log(response);
          },
          onError: (error) => {
            console.error(error);
          },
          onSubscribe: (cancel) => {
            /* call cancel() to stop onComplete/onError */
          },
        });

      if ((now() - start) >= 5000) {
        clearInterval(interval);
        resolve();
      }
    }, 750);
  });
}

Promise.resolve(run()).then(
  () => process.exit(0),
  error => {
    console.error(error.stack);
    process.exit(1);
  },
);
