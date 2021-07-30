const {
  RSocketServer,
  BufferEncoders
} = require('rsocket-core');
const RSocketTCPServer = require('rsocket-tcp-server');
const TimeService = require("./services/TimeService");

const TCPTransport = RSocketTCPServer.default;

const transportOpts = {
  host: '127.0.0.1',
  port: 9090,
};

const transport = new TCPTransport(transportOpts, BufferEncoders);

const getRequestHandler = (requestingRSocket, setupPayload) => {

  console.log("Client connected...", setupPayload);

  const timeService = new TimeService();

  function handleRequestResponse(payload) {

    console.log(payload)

    return timeService.currentTime();
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
