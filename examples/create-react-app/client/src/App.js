import React, { useEffect, useReducer} from 'react';
import { RSocketClient } from 'rsocket-core';
import RSocketWebsocketClient from 'rsocket-websocket-client';
import './App.css';

const initialReducerState = {
  rsocket: null,
  connectionStatus: 'CONNECTING',
  connectionError: null,
  messages: []
};

function reducer(state, action) {
  switch (action.type) {
    case 'CONNECTED': {
      return {
        ...state,
        rsocket: action.data.rsocket,
        connectionStatus: 'CONNECTED',
        connectionError: null
      };
      break;
    }
    case 'CONNECTION_ERROR': {
      return {
        ...state,
        connectionStatus: 'ERROR',
        connectionError: action.data.error
      };
      break;
    }
    case 'NEW_MESSAGE':
      return {
        ...state,
        messages: [
          action.data.message_json,
          ...state.messages
        ]
      }
    default:
      throw new Error(`Unknown action: ${action.type}`);
  }
}

function App() {

  const [state, dispatch] = useReducer(reducer, initialReducerState);

  const {
    rsocket,
    connectionStatus,
    messages
  } = state;

  useEffect(() => {
    const client = new RSocketClient({
      setup: {
        dataMimeType: 'text/plain',
        keepAlive: 1000000,
        lifetime: 100000,
        metadataMimeType: 'text/plain',
      },
      transport: new RSocketWebsocketClient({
        url: 'ws://localhost:9090'
      }),
    });

    client.connect().subscribe({
      onComplete: (_rsocket) => {
        dispatch({ type: 'CONNECTED', data: { rsocket: _rsocket} });
      },
      onError: (e) => {
        console.error(e);
        dispatch({ type: 'CONNECTION_ERROR', data: { error: e } });
      }
    });
  }, []);

  const onButtonClick = () => {
    if (connectionStatus !== 'CONNECTED') {
      return;
    }
    rsocket
      .requestStream({})
      .subscribe({
        onNext: (msg) => {
          const messageJson = JSON.stringify(msg);
          console.log(`message received`, messageJson);
          dispatch({ type: 'NEW_MESSAGE', data: { message_json: messageJson }});
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
  };

  return (
    <div className="App">
      <div className="ConnectionStatus">
        connection status: {connectionStatus}
      </div>
      <div className="ButtonContainer">
        <button onClick={onButtonClick}>Request Random Numbers</button>
      </div>
      <div className="MessageList">
        <ul>
          {state.messages.map((message, i) => {
            return (
              <li key={i}>{message}</li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

export default App;
