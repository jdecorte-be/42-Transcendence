import { ApolloClient, InMemoryCache, ApolloProvider, HttpLink, makeVar } from '@apollo/client';
import { WebSocketLink } from '@apollo/client/link/ws';
import { split } from '@apollo/client/link/core';
import { getMainDefinition } from '@apollo/client/utilities';

export const currentChatVar = makeVar({
  uuid: '',
  name: '',
  type: '',
  ownerID: '',
  userID: [],
  adminID: [],
  muteID: [],
  password: '',
});


export const currentLoginVar = makeVar('');
export const currentAvatarVar = makeVar('');
export const currentUsernameVar = makeVar('');


const httpLink = new HttpLink({
  uri: 'http://localhost:3001/graphql',
});

const wsLink = new WebSocketLink({
  uri: `ws://localhost:3001/graphql`,
  options: {
    reconnect: true,
  },
});

const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  wsLink,
  httpLink,
);

export const client = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache({
  }),
});