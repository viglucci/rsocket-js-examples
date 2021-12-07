
import { createApp } from 'vue';
import { createStore } from 'vuex';
import { RSocketClient } from 'rsocket-core';
import RSocketWebsocketClient from 'rsocket-websocket-client';
import App from './App.vue';

const store = createStore({
    state: {
        connection: {
            rsocket: null,
            status: 'CONNECTING',
            error: null
        },
        messages: []
    },
    actions: {
        connect(context) {
            const client = new RSocketClient({
                setup: {
                    dataMimeType: "text/plain",
                    keepAlive: 3000,
                    lifetime: 30000,
                    metadataMimeType: "text/plain",
                },
                transport: new RSocketWebsocketClient({
                    url: "ws://localhost:9090",
                }),
            });

            client.connect().subscribe({
                onComplete: (rsocket) => {
                    context.dispatch("connected", rsocket);
                },
                onError: (e) => {
                    context.dispatch("connectionError", e);
                },
            });
        },
        connected(context, rsocket) {
            context.commit('status', 'CONNECTED');
            context.commit('rsocket', rsocket);
        },
        connectionError(context, error) {
            console.error(error);
            context.commit('status', 'ERROR');
            context.commit('connectionError', error);
        },
        loadInts(context) {
            const { rsocket, status } = context.state.connection;
            if (status !== 'CONNECTED') {
                return;
            }
            rsocket
                .requestStream({})
                .subscribe({
                    onNext: (msg) => {
                        const messageJson = JSON.stringify(msg);
                        console.log(`message received`, messageJson);
                        context.commit('message', messageJson);
                    },
                    onComplete: (response) => {
                        console.log(`requestStream completed`, response);
                    },
                    onError: (error) => {
                        console.error(error);
                    },
                    onSubscribe: ({ cancel, request }) => {
                        const numInts = 12;
                        console.log(`requestStream requesting ${numInts} random ints`);
                        request(numInts);
                    },
                });
        }
    },
    mutations: {
        status(state, newStatus) {
            state.connection.status = newStatus;
        },
        rsocket(state, rsocket) {
            state.connection.rsocket = rsocket;
        },
        connectionError(state, error) {
            state.connection.error = error;
        },
        message(state, message) {
            state.messages = [
                message,
                ...state.messages
            ];
        }
    }
});

const app = createApp(App)
    .use(store)
    .mount('#app');
