const { RSocketServer } = require('rsocket-core');
const RSocketTCPServer = require('rsocket-tcp-server');
const { Single } = require('rsocket-flowable');

const TCPTransport = RSocketTCPServer.default;

const transportOpts = {
  host: '127.0.0.1',
  port: 9090,
};

const transport = new TCPTransport(transportOpts);

const statuses = {
  PENDING: "pending",
  CANCELLED: "cancelled"
};

function handleCurrentTimeRequestResponse(payload) {
  let status = statuses.PENDING;
  console.log(`requestResponse request`, payload);
  return new Single((subscriber) => {

    /**
     * In the event that the client cancels the request before
     * the server can respond, we will change our status to cancelled
     * and avoid calling `onComplete` on the `subscriber` instance in the
     * `setTimeout` callback.
     */
    function handleCancellation() {
      status = statuses.CANCELLED;
    }

    subscriber.onSubscribe(() => handleCancellation());

    /**
     * Leverage `setTimeout` to simulate a delay
     * in responding to the client.
     */
    setTimeout(() => {

      /**
       * If the client cancelled the request we can
       * return early and avoid doing any of the work below.
       */
      if (status === statuses.CANCELLED) {
        return;
      }

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
    }, 100);
  });
}

function handleUnsupportedMessageRequestResponse(payload) {
  return new Single((subscriber) => {
    subscriber.onError(new Error("Unsupported messageId: " + payload.metadata));
  });
}

const getRequestHandler = (requestingRSocket, setupPayload) => {

  console.log("Client connected...", setupPayload);

  function handleRequestResponse(payload) {
    const messageId = payload.metadata;
    switch (messageId) {
      case 'timeService.currentTime': {
        return handleCurrentTimeRequestResponse(payload);
      }
      default: {
        return handleUnsupportedMessageRequestResponse(payload);
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
