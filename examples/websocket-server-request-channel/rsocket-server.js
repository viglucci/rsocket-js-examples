const { RSocketServer, JsonSerializers } = require('rsocket-core');
const RSocketWebsocketServer = require('rsocket-websocket-server').default;
const { Flowable } = require('rsocket-flowable');
const { buildMessage, deSerializeMsg } = require('./lib/util');
const logger = require('./lib/logger');
const RandomNumberService = require('./lib/RandomNumberService');

const randomNumberService = new RandomNumberService();

const getRequestHandler = (requestingRsocket, setupPayload) => {

  logger.info('Client connected.', { setupPayload });

  requestingRsocket.connectionStatus().subscribe((status) => {
    logger.info('Client connection status update: ', status);
  });

  return {
    requestChannel: (clientFlowable) => {
      let clientDataSub;

      return new Flowable((subscriber) => {
        let randomNumbersSub;

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
              `Client requested up to ${maxSupportedStreamSize} payloads.`
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
                const payload = buildMessage({ value: number });

                logger.info(
                  'Sending (serialized):',
                  { payload }
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
            logger.info('Subscribed to client stream.');
            clientDataSub.request(0x7fffffff);
          },

          onError: (e) => {
            logger.error('ClientFlowable returned error:', e);
          },

          onNext: (payload) => {
            logger.info('Received (deserialized):',
              { payload: deSerializeMsg(payload) });
          },

          onComplete: () => {
            logger.info('End of client data stream.');
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

const server = new RSocketServer({
  transport,
  getRequestHandler
});

logger.info("Server starting", serverOptions);

server.start();
