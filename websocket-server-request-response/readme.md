# websocket-server-request-response

In this directory you will find an example using [`rsocket-js`](https://github.com/rsocket/rsocket-js) to build a client and a server, which communicate using the [`RSocket`](https://rsocket.io/) protocol.

## Client Behavior

The client will connect to the server, and on an interval, ask the server what the current time is. After a certain period of time has passed, the client will disconnect and the process will close.

## Server Behavior

The server will start and wait for clients to connect. Once a client connects, the server will respond to `request/response` messages with the current time serialized as a string.

## Running the example

Clone the respository.

```
git clone https://github.com/viglucci/rsocket-js-examples.git
```

Enter the example directory.

```
cd rsocket-js-examples && cd websocket-server-request-response
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
