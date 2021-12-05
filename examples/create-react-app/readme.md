# rsocket-js create-react-app example

In this directory you will find an example using [`rsocket-js`](https://github.com/rsocket/rsocket-js) to build a client and a server, which communicate using the [`RSocket`](https://rsocket.io/) protocol. The client is built using [Create React App](https://reactjs.org/docs/create-a-new-react-app.html).

## Client Behavior

The client will connect to the server, and when the user clicks the rendered button, request a number of random int values from the server. Each time the server responds with a value the client will print out the received data to the webpage.

## Server Behavior

The server will start and wait for clients to connect. Once a client connects, the server will respond to `request/stream` messages with a stream of random integers up the numbers of values requested by the client.

## Running the example

Clone the respository.

```bash
git clone https://github.com/viglucci/rsocket-js-examples.git
```

Enter the example directory.

```bash
cd rsocket-js-examples && cd examples/create-react-app
```

Run the server.

```bash
cd server && npm install && npm run start
```

Open a new terminal in the same directory, and then run the client. Once the client starts a web browser should open.

```bash
cd client && npm install && npm run start
```
