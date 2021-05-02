const { RSocketServer } = require('rsocket-core');
const RSocketWebsocketServer = require('rsocket-websocket-server').default;
const { Flowable } = require('rsocket-flowable');
const { buildMessage } = require('./lib/util');
const logger = require('./lib/logger');
const RandomNumberService = require('./lib/RandomNumberService');

const randomNumberService = new RandomNumberService();

let nextClientId = 0;

const getRequestHandler = (requestingRsocket) => {

  requestingRsocket.connectionStatus().subscribe((status) => {
    logger.info('Client connection status update: ', status);
  });

  return {
    requestChannel: (clientFlowable) => {
      let clientDataSub;

      return new Flowable((subscriber) => {
        let randomNumbersSub;

        const thisClientId = ++nextClientId;

        /**
         * The stream of messages the client wants the server to send to it.
         */
        subscriber.onSubscribe({
          cancel: () => {
            randomNumbersSub.cancel();
            logger.info('Client cancelled subscription.');
          },

          request: (maxSupportedStreamSize) => {

            logger.info(
              `Client requesting up to ${maxSupportedStreamSize} payloads.`,
              { clientId: thisClientId }
            );

            let streamed = 0;

            const randomNumbersStream =
              randomNumberService.getRandomNumberFlowable();

            randomNumbersStream.subscribe({
              onComplete: () => { },
              onError: (e) => {
                logger.error(e);
                randomNumbersSub.cancel();
              },
              onNext: (number) => {
                const payload = buildMessage(number);

                logger.info(
                  `Transmitting payload:`,
                  { payload, clientId: thisClientId }
                );

                subscriber.onNext(payload);

                if (streamed >= maxSupportedStreamSize) {
                  logger.info('Max transmitted limit reached.');
                  randomNumbersSub.cancel();
                }
              },
              onSubscribe: (sub) => {
                randomNumbersSub = sub;
                randomNumbersSub.request(maxSupportedStreamSize);
              }
            });
          }
        });

        /**
         * The stream of messages the server wants the client to send to it.
         */
        clientFlowable.subscribe({
          onSubscribe: (sub) => {
            clientDataSub = sub;
            logger.info('Subscribed to client channel: ', { clientId: thisClientId });
            clientDataSub.request(4);
          },

          onError: (e) => {
            logger.error("clientFlowable", e);
          },

          onNext: (clientPayload) => {
            logger.info('Received payload from client:', { payload: clientPayload, clientId: thisClientId });
          },

          onComplete: () => {
            logger.info('End of client data stream.', { clientId: thisClientId });
          }
        });
      });
    }
  };
};

const serverOptions = {
  host: 'localhost',
  port: 7777
};

const transport = new RSocketWebsocketServer(serverOptions);

const server = new RSocketServer({ transport, getRequestHandler });

logger.info("Server starting", serverOptions);

server.start();
