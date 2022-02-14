import React from 'react';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { API_ENDPOINT, CONNECTION_STATUS } from '../constants';

// api context definition
export const APIContext: any = React.createContext({
  api: null,
  connect: () => { },
  status: CONNECTION_STATUS[0],
  isReady: () => { },
});

// import context as a hook
export const useApi = () => React.useContext(APIContext);

// wrapper component to provide app with api
export class APIContextWrapper extends React.Component {

  state = {
    api: null,
    status: CONNECTION_STATUS[1],
  };

  // returns whether api is ready to be used
  isReady = () => {
    return this.state.status === CONNECTION_STATUS[2];
  }

  // connect to websocket and return api into context
  connect = async () => {

    // set conection status to 'connecting'
    this.setState({ status: CONNECTION_STATUS[1] });

    // attempting to connect to api
    const wsProvider = new WsProvider(API_ENDPOINT);

    // connected to api event
    // other provider event listeners
    wsProvider.on('disconnected', () => {
      this.setState({ status: CONNECTION_STATUS[0] });
    });
    wsProvider.on('connected', () => {
      this.setState({ status: CONNECTION_STATUS[2] });
    });
    // wsProvider.on('ready', () => {
    // });
    // wsProvider.on('error', () => {
    // });

    // wait for instance to connect, then assign instance to context state
    const apiInstance = await ApiPromise.create({ provider: wsProvider });
    this.setState({ api: apiInstance, status: CONNECTION_STATUS[2] });
  }

  render () {
    return (
      <APIContext.Provider value={{
        connect: this.connect,
        api: this.state.api,
        status: this.state.status,
        isReady: this.isReady,
      }}>
        {this.props.children}
      </APIContext.Provider>
    );
  }
}

export default APIContextWrapper;