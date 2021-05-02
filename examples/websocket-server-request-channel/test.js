const { RSocketServer } = require('rsocket-core');
const RSocketWebsocketServer = require('rsocket-websocket-server').default;
const { Flowable } = require('rsocket-flowable');
const { fromEvent } = require('rxjs');
const LetterEmitter = require('./lib/LetterEmitter');
const { buildMessage } = require('./lib/util');
const logger = require('./lib/logger');

const EMIT_LETTER_INTERVAL = 10;
const letterEmitter = new LetterEmitter(EMIT_LETTER_INTERVAL);
const letterSource$ = fromEvent(letterEmitter, LetterEmitter.LETTER_EVENT);

let nextClientId = 0;

const getRequestHandler = () => {
    return {
        requestChannel: (clientFlowable) => {
            let subscription;

            return new Flowable((subscriber) => {
                let letterSourceSubscription = null;

                /**
                 * The stream of messages the client wants the server to send to it.
                 */
                subscriber.onSubscribe({
                    cancel: () => {
                        letterSourceSubscription.unsubscribe();
                        logger.info('Client cancelled subscription.');
                    },

                    request: (maxSupportedStreamSize) => {
                        logger.info(
                            `Client requesting up to ${maxSupportedStreamSize} payloads.`
                        );

                        const thisClientId = ++nextClientId;
                        let streamed = 0;

                        letterSourceSubscription = letterSource$.subscribe((letter) => {
                            setTimeout(() => {
                                streamed++;

                                const nextMessage = buildMessage(letter);
                                subscriber.onNext(nextMessage);

                                logger.info(
                                    `Server transmitted payload ${streamed} ` +
                                    `${JSON.stringify(nextMessage)}` +
                                    ` to client ${thisClientId}`
                                );

                                if (streamed === maxSupportedStreamSize) {
                                    logger.info('Max transmitted limit reached.');
                                    letterSourceSubscription.unsubscribe();
                                }
                            }, 0);
                        });
                    }
                });

                /**
                 * The stream of messages the server wants the client to send to it.
                 */
                clientFlowable.subscribe({
                    onSubscribe: (sub) => {
                        subscription = sub;
                        logger.info('Server subscribed to client channel.');
                        subscription.request(1);
                    },

                    onNext: (clientPayload) => {
                        logger.info('Server received payload from client.', clientPayload);
                        subscription.request(1);
                    },

                    onComplete: () => {
                        logger.info('Server received end of client stream');
                    }
                });
            });
        }
    };
};

const transport = new RSocketWebsocketServer({
    host: 'localhost',
    port: 7777
});

const server = new RSocketServer({ transport, getRequestHandler });

server.start();
