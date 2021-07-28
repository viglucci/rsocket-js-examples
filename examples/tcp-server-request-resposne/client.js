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
      dataMimeType: 'application/json',
      keepAlive: 1000000,
      lifetime: 100000,
      metadataMimeType: 'application/json',
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

async function getCurrentTime(rsocket) {
  return new Promise(function (resolve, reject) {
    const payload = {
      data: null,
      // TODO: shouldn't need to manually stringify JSON object when using `application/json` mimetype
      metadata: JSON.stringify({
        messageId: "timeService.currentTime"
      })
    };
    console.log(`request: `, payload);
    rsocket
        .requestResponse(payload)
        .subscribe({
          onComplete: (response) => {
            resolve(response);
          },
          onError: (error) => {
            reject(error);
          },
          onSubscribe: (_cancel) => {
            //...
          },
        });
  });
}

async function run() {
  const rsocket = await connect({
    host: '127.0.0.1',
    port: 9090,
  });
  return Promise.all([
    getCurrentTime(rsocket)
        .then((response) => {
          console.log(`response: `, response);
        })
        .catch((error) => {
          console.error(`error: `, error);
        })
  ]);
}

Promise.resolve(run()).then(
    () => process.exit(0),
    error => {
      console.error(error.stack);
      process.exit(1);
    },
);
