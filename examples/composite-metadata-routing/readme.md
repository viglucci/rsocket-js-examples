# composite-metadata-routing

In this directory you will find an example using [`rsocket-js`](https://github.com/rsocket/rsocket-js) to build a client and a server, which communicate using the [`RSocket`](https://rsocket.io/) protocol.

The client and server will leverage Composite Metadata to describe how to route messages within their respective applications.

## Client Behavior

The client will connect to the server and invoke a `requestResponse` request asking the server for the current date time.

## Server Behavior

The server will start and wait for clients to connect. When a client connects, the server will respond to a known set of message ids.

## Running the example

Clone the repository.

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
