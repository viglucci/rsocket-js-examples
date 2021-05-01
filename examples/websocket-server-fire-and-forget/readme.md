# websocket-server-fire-and-forget

In this directory you will find an example using [`rsocket-js`](https://github.com/rsocket/rsocket-js) to build a client and a server, which communicate using the [`RSocket`](https://rsocket.io/) protocol.

## Client Behavior

The client will connect to the server and invoke a `fireAndForget` request. The client will not expect a response from the server and will immediately exit after.

## Server Behavior

The server will start and wait for clients to connect. Once a client connects, the server will log `fireAndForget` messages and send no response.

## Running the example

Clone the respository.

```
git clone https://github.com/viglucci/rsocket-js-examples.git
```

Enter the example directory.

```
cd rsocket-js-examples && cd examples/websocket-server-fire-and-forget
```

Install npm dependencies.

```
npm install
```

Run the server.

```
npm run server
```

Open a new terminal windows in the same directory, and then run the client.

```
npm run client
```
