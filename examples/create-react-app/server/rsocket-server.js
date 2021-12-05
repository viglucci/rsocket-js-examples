const { RSocketServer, JsonSerializers } = require('rsocket-core');
const RSocketWebSocketServer = require('rsocket-websocket-server');
const { Flowable } = require('rsocket-flowable');

const WebSocketTransport = RSocketWebSocketServer.default;
const host = '127.0.0.1';
const port = 9090;

const transport = new WebSocketTransport({
  host: host,
  port: port,
});

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

function getRandomInts(numInts) {
  const ints = [];
  while (numInts--) {
    ints.push(getRandomInt(1000));
  }
  return ints;
}

const getRequestHandler = (requestingRSocket, setupPayload) => {

  function handleRequestStream(payload) {

    console.log(`handleRequestStream request`, JSON.stringify(payload));

    return new Flowable((subscriber) => {
      subscriber.onSubscribe({
        cancel: () => {
          /* no-op */
        },
        request: (n) => {
          const values = getRandomInts(n);
          console.log(`client requesting ${n} random ints`);
          while (n--) {
            const nextInt = values.shift();
            const payload = { data: nextInt };
            console.log("responding with", JSON.stringify(payload));
            subscriber.onNext(payload);
          }
          console.log("handleRequestStream response complete")
          subscriber.onComplete();
        },
      });
    });
  }

  return {
    requestStream: handleRequestStream,
  };
};

const rSocketServer = new RSocketServer({
  transport,
  getRequestHandler,
  serializers: JsonSerializers
});

console.log(`Server starting on port ${port}...`);

rSocketServer.start();


