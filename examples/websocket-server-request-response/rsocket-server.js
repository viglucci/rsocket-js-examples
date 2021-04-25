const { RSocketServer } = require('rsocket-core');
const RSocketWebSocketServer = require('rsocket-websocket-server');
const { Single } = require('rsocket-flowable');

const WebSocketTransport = RSocketWebSocketServer.default;
const host = '127.0.0.1';
const port = 9898;

const transportOpts = {
  host: host,
  port: port,
};

const transport = new WebSocketTransport(transportOpts);

const getRequestHandler = (requestingRSocket, setupPayload) => {
  console.log(`setupPayload sent`);

  function handleFireAndForget() {
    console.log(`fireAndForget payload: ${payload.data.toString()}`);
  }

  function handleRequestResponse(payload) {
    console.log(payload);
    console.log(`requestResponse request`, payload);
    return new Single((subscriber) => {

      const timeout = setTimeout(() => {
        const msg = `${new Date()}`;
        console.log(`requestResponse response`, msg);
        try {
          subscriber.onComplete({
            data: msg,
            metadata: null, // or new Buffer(...)
          });
        } catch (e) {
          subscriber.onError(e);
        }
      }, 0);

      const onCancel = () => {
        console.log("Client cancelled request...")
        clearTimeout(timeout);
      };

      subscriber.onSubscribe(onCancel);
    });
  }

  return {
    fireAndForget: handleFireAndForget,
    requestResponse: handleRequestResponse,
  };
};

const rSocketServer = new RSocketServer({
  transport,
  getRequestHandler,
});

console.log(`Server starting on port ${port}...`);

rSocketServer.start();


