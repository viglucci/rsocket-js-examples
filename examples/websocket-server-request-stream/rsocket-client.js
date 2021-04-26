const { RSocketClient, JsonSerializers } = require('rsocket-core');
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
  const client = new RSocketClient({
    setup,
    transport,
    serializers: JsonSerializers
  });
  return await client.connect();
}

async function run() {
  return new Promise(async (resolve, reject) => {
    const rsocket = await connect();

    const source = rsocket.requestStream({});

    source.subscribe({
      onNext: (msg) => {
        console.log(`message received`, JSON.stringify(msg));
      },
      onComplete: (response) => {
        console.log(`requestStream completed`, response);
        resolve();
      },
      onError: (error) => {
        console.error(error);
      },
      onSubscribe: ({ cancel, request }) => {
        const numInts = 12;
        console.log(`requestStream requesting ${numInts} random ints`);
        request(numInts);
      },
    });
  });
}

Promise.resolve(run()).then(
  () => process.exit(0),
  error => {
    console.error(error.stack);
    process.exit(1);
  },
);
