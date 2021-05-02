const { RSocketClient } = require('rsocket-core');
const RSocketWebsocketClient = require('rsocket-websocket-client').default;
const WebSocket = require('ws');
const logger = require('./lib/logger');
const utils = require('./lib/util');
const RandomNumberService = require('./lib/RandomNumberService');

const randomNumberService = new RandomNumberService();

const transportOptions = {
  url: 'ws://localhost:7777',
  wsCreator: (url) => {
    return new WebSocket(url);
  }
};

const setup = {
  keepAlive: 60000,
  lifetime: 180000,
  dataMimeType: 'text/plain',
  metadataMimeType: 'text/plain'
};

const transport = new RSocketWebsocketClient(transportOptions);
const client = new RSocketClient({ setup, transport });

client.connect().subscribe({
  onComplete: (socket) => {
    logger.info('Client connected to the RSocket server');

    utils.finallyOnClose(async ({ err, signal, manual }) => {
      logger.info('Process closing... closing socket.');
      socket.close();
    });

    let subscription;

    const stream = randomNumberService
      .getRandomNumberFlowable()
      .map((value) => {
        return { data: JSON.stringify(value) };
      });

    socket.requestChannel(stream).subscribe({
      onSubscribe: (sub) => {
        subscription = sub;
        logger.info(`Client is establishing a channel`);
        subscription.request(0x7fffffff);

        utils.onClose(async ({ err, signal, manual }) => {
          logger.info('Process closing... cancelling subscription.');
          subscription.cancel();
        });
      },
      onNext: (msg) => {
        logger.info('Client recieved:', msg);
      },
      onComplete: () => {
        logger.info('Client received end of server stream.');
      },
      onError: (e) => {
        logger.error('An error occurred', e);
      }
    });
  }
});
