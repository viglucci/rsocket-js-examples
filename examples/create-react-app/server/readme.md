# websocket-server-request-response

In this directory you will find an example using [`rsocket-js`](https://github.com/rsocket/rsocket-js) to build a client and a server, which communicate using the [`RSocket`](https://rsocket.io/) protocol.

## Client Behavior

The client will connect to the server, and request a number of random int values from the server. Each time the server responds with a value the client will print out the message.

## Server Behavior

The server will start and wait for clients to connect. Once a client connects, the server will respond to `request/stream` messages with a stream of random integers up the numbers of values requested by the client.

## Running the example

Clone the respository.

```
git clone https://github.com/viglucci/rsocket-js-examples.git
```

Enter the example directory.

```
cd rsocket-js-examples && cd examples/websocket-server-request-stream
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
