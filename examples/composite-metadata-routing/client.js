const {
  RSocketClient,
  MESSAGE_RSOCKET_COMPOSITE_METADATA,
  MESSAGE_RSOCKET_ROUTING,
  BufferEncoders,
  encodeCompositeMetadata,
  encodeRoute
} = require('rsocket-core');
const RSocketTCPClient = require('rsocket-tcp-client').default;

function encodeMetadata({route}) {
  return encodeCompositeMetadata([
    [MESSAGE_RSOCKET_ROUTING, encodeRoute(route)],
  ]);
}

function createClient(options) {

  const transport = new RSocketTCPClient({
    host: options.host,
    port: options.port,
  }, BufferEncoders);

  return new RSocketClient({
    setup: {
      dataMimeType: 'application/octet-stream',
      keepAlive: 1000000,
      lifetime: 100000,
      metadataMimeType: MESSAGE_RSOCKET_COMPOSITE_METADATA.string,
    },
    transport
  });
}

async function connect(options) {
  const client = createClient(options);
  return await client.connect();
}

async function getCurrentTime(rsocket) {

  return new Promise(function (resolve, reject) {

    const encodedMetadata = encodeMetadata({
      route: "timeService.currentTime"
    });

    const payload = {
      data: null,
      metadata: encodedMetadata
    };

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

async function getProduct(rsocket, { lhs, rhs }) {

  return new Promise(function (resolve, reject) {

    const encodedMetadata = encodeMetadata({
      route: "multiplicationService.multiply"
    });

    const payload = {
      data: Buffer.from(JSON.stringify({ lhs, rhs })),
      metadata: encodedMetadata
    };

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

  const getTimePromise = getCurrentTime(rsocket)
      .then((response) => {
        const time = response.data.toString();
        console.log(`decoded getCurrentTime result: ${time}`);
      })
      .catch((error) => {
        console.error(`getCurrentTime error: `, error);
      });

  const getProductPromise = getProduct(rsocket, { lhs: 2, rhs: 3 })
      .then((response) => {
        const time = response.data.toString();
        console.log(`decoded getProduct result: ${time}`);
      })
      .catch((error) => {
        console.error(`getProduct error: `, error);
      });

  return Promise.all([
    getTimePromise,
    getProductPromise
  ]);
}

Promise.resolve(run()).then(
    () => process.exit(0),
    error => {
      console.error(error.stack);
      process.exit(1);
    },
);
