const { RSocketClient, APPLICATION_JSON, JsonSerializers, TEXT_PLAIN } = require('rsocket-core');
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

const transport = new RSocketWebsocketClient(transportOptions);

const setup = {
  keepAlive: 60000,
  lifetime: 180000,
  // dataMimeType: APPLICATION_JSON.string,
  // metadataMimeType: APPLICATION_JSON.string
};

const client = new RSocketClient({
  setup,
  transport,
  // serializers: JsonSerializers
});

client.connect().subscribe({
  onComplete: (socket) => {
    logger.info('Client connected to the RSocket server');

    utils.finallyOnClose(async () => {
      logger.info('Process closing... closing socket.');
      socket.close();
    });

    let subscription;

    const stream = randomNumberService
      .getRandomNumberFlowable()
      .map((number) => {
        const payload = utils.buildMessage({ value: number });
        logger.info('Client sending:', payload);
        return payload;
      });

    socket.requestChannel(stream).subscribe({
      onSubscribe: (sub) => {
        subscription = sub;
        logger.info(`Client is establishing a channel`);
        subscription.request(0x7fffffff);

        utils.onClose(async () => {
          logger.info('Process closing... cancelling subscription.');
          subscription.cancel();
        });
      },
      onNext: (msg) => {
        logger.info('Client recieved:', utils.deSerializeMsg(msg));
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
