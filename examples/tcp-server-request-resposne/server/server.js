const {RSocketServer, BufferEncoders, CompositeMetadata, MESSAGE_RSOCKET_ROUTING, decodeRoutes} = require('rsocket-core');
const RSocketTCPServer = require('rsocket-tcp-server');
const MultiplicationService = require("./services/MultiplicationService");
const TimeService = require("./services/TimeService");
const {Single} = require('rsocket-flowable');

const TCPTransport = RSocketTCPServer.default;

const transportOpts = {
  host: '127.0.0.1',
  port: 9090,
};

const transport = new TCPTransport(transportOpts, BufferEncoders);

function handleUnsupportedMessageRequestResponse(route) {
  return new Single((subscriber) => {
    subscriber.onError(new Error("Unsupported route: " + route));
  });
}

function unpackCompositeMetadata(metadata) {
  const decodedMetadata = new CompositeMetadata(
      metadata,
  );

  let unpacked = {
    routes:  []
  };

  for (const metadataEntry of decodedMetadata) {
    if (metadataEntry.mimeType === MESSAGE_RSOCKET_ROUTING.string) {
      const routes = decodeRoutes(metadataEntry.content);
      // routes is a generator that can technically produce
      // more than a single value
      for (const route of routes) {
        unpacked.route = route;
      }
    }
  }

  return unpacked;
}

const getRequestHandler = (requestingRSocket, setupPayload) => {

  console.log("Client connected...", setupPayload);

  const timeService = new TimeService();
  const multiplicationService = new MultiplicationService();

  function handleRequestResponse(payload) {

    // TODO: shouldn't need to manually parse JSON object when using `application/json` mimetype
    const data = payload.data ? JSON.parse(payload.data) : null;
    const { route } = unpackCompositeMetadata(payload.metadata);

    switch (route) {
      case 'timeService.currentTime': {
        return timeService.currentTime(data);
      }
      case 'multiplicationService.multiply': {
        return multiplicationService.multiply(data);
      }
      default: {
        return handleUnsupportedMessageRequestResponse(route);
      }
    }
  }

  return {
    requestResponse: handleRequestResponse,
  };
};

const rSocketServer = new RSocketServer({
  transport,
  getRequestHandler,
});

rSocketServer.start();
