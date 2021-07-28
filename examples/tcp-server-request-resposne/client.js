const {RSocketClient} = require('rsocket-core');
const RSocketTCPClient = require('rsocket-tcp-client').default;

const requestInterval = 750;
const maxTimeElapsed = 1000;

function now() {
  return (new Date()).getTime();
}

function createClient(options) {
  return new RSocketClient({
    setup: {
      dataMimeType: 'text/plain',
      keepAlive: 1000000,
      lifetime: 100000,
      metadataMimeType: 'text/plain',
    },
    transport: new RSocketTCPClient({
      host: options.host,
      port: options.port,
    }),
  });
}

async function connect(options) {
  const client = createClient(options);
  return await client.connect();
}

async function run() {
  return new Promise(async (resolve, reject) => {
    const rsocket = await connect({
      host: '127.0.0.1',
      port: 9090,
    });
    rsocket
        .requestResponse({
          data: null,
          metadata: "timeService.currentTime"
        })
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
  });
}

Promise.resolve(run()).then(
    () => process.exit(0),
    error => {
      console.error(error.stack);
      process.exit(1);
    },
);
