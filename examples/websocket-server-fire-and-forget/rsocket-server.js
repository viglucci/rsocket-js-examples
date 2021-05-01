const { RSocketServer } = require('rsocket-core');
const RSocketWebSocketServer = require('rsocket-websocket-server');

const WebSocketTransport = RSocketWebSocketServer.default;
const host = '127.0.0.1';
const port = 9898;

const transportOpts = {
  host: host,
  port: port,
};

const transport = new WebSocketTransport(transportOpts);

const getRequestHandler = (requestingRSocket, setupPayload) => {

  function handleFireAndForget(payload) {
    console.log(`fireAndForget request`, payload);
  }

  return {
    fireAndForget: handleFireAndForget,
  };
};

const rSocketServer = new RSocketServer({
  transport,
  getRequestHandler,
});

console.log(`Server starting on port ${port}...`);

rSocketServer.start();
