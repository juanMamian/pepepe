import { HttpLink, InMemoryCache, split } from '@apollo/client/core'
import { createApolloProvider } from '@vue/apollo-option'

import { WebSocketLink } from "@apollo/client/link/ws"

import { getMainDefinition } from "@apollo/client/utilities"
import { setContext } from "@apollo/client/link/context"
import { onError } from '@apollo/client/link/error'
import { createApolloClient, restartWebsockets } from 'vue-cli-plugin-apollo/graphql-client'

import possibleTypes from "../possibleTypes.json"
import { typeDefs, resolvers } from "./apolloStore/Schema"
const cache = new InMemoryCache({
  possibleTypes
});

const AUTH_TOKEN="token";
const getToken = function () {
  return 'Bearer ' + localStorage.getItem(AUTH_TOKEN);
}

export const serverUrl = process.env.NODE_ENV === 'production'
  ? 'https://pe-pe-pe.herokuapp.com'
  : 'http://192.168.1.3:3000'


export const wsServerUrl = process.env.NODE_ENV === 'production'
  ? 'wss://' + serverUrl.substr(7) + '/subscripciones'
  : 'ws://' + serverUrl.substr(7) + '/subscripciones'

const httpAuthLink = setContext((_, { headers }) => {
  console.log(`Definiendo auth http`);
  return {
    headers: {
      ...headers,
      authorization: getToken()
    }
  }
});

const httpLink = new HttpLink({
  uri: serverUrl + "/graphql"
});

const ramaHttp = httpAuthLink.concat(httpLink)


export const wsLink = new WebSocketLink({
  uri: wsServerUrl,
  options: {
    reconnect: true,
    connectionParams: {
      headers: {
        Authorization: function(){          
          return 'Bearer '+localStorage.getItem(AUTH_TOKEN);
        }
      }
    }
  },
})

console.log(`Opciones de wsLink: ${JSON.stringify(wsLink.option)}`);


// const wsAuthLink = new ApolloLink((operation, forward) => {
//   // console.log(`Setting Auth ws:`);
//   // operation.setContext(({ headers = {} }) => ({
//   //   headers: {
//   //     ...headers,
//   //     authorization: getToken(),
//   //   }
//   // }));
//   console.log(`Headers: ${operation}`);
//   return forward(operation);
// })

// const ramaWs = wsAuthLink.concat(wsLink);

// const logHeadersLink=new ApolloLink((operation, forward)=>{
//   console.log(`Headers:`);
//   console.log(operation.getContext());
//   return forward(operation);
// })

// const authLink = new ApolloLink((operation, forward) => {
//   // add the authorization to the headers
//   console.log(`Setting auth`);
//   operation.setContext(({ headers = {} }) => ({
//     headers: {
//       ...headers,
//       authorization: getToken(),
//     }
//   }));

//   return forward(operation);
// })

const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (process.env.NODE_ENV !== 'production') {
    if (graphQLErrors)
      graphQLErrors.map(({ message, locations, path }) =>
        console.log(
          `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`,
        ),
      )

    if (networkError) console.log(`[Network error]: ${networkError}`)
  }
});

const splitLink = split(
  // split based on operation type  
  ({ query }) => {
    console.log(`Splitting`);
    // console.log(`Con: ${JSON.stringify(query)}`);
    const definition = getMainDefinition(query)
    if (definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription') {
      console.log(`Dirgiendo a ws`);
      return true
    }
    else {
      console.log(`Dirigiendo a http`);
      return false;
    }
  },
  wsLink,
  ramaHttp
)
const link = errorLink.concat(splitLink);

const defaultOptions = {
  // You can use `https` for secure connection (recommended in production)
  httpEndpoint:serverUrl+'/graphql',
  // You can use `wss` for secure connection (recommended in production)
  // Use `null` to disable subscriptions
  wsEndpoint: wsServerUrl,
  // LocalStorage token
  tokenName: AUTH_TOKEN,
  // Enable Automatic Query persisting with Apollo Engine
  persisting: false,
  // Use websockets for everything (no HTTP)
  // You need to pass a `wsEndpoint` for this to work
  websocketsOnly: false,
  // Is being rendered on the server?
  ssr: false,

  // Override default apollo link
  // note: don't override httpLink here, specify httpLink options in the
  // httpLinkOptions property of defaultOptions.
  link,
  defaultHttpLink:false,
  // Override default cache
   cache,

  // Override the way the Authorization header is set
  getAuth: () => {
    // get the authentication token from local storage if it exists
    // return the headers to the context so httpLink can read them
    const token = localStorage.getItem(AUTH_TOKEN)
    if (token) {
      return 'Bearer ' + token
    } else {
      return ''
    }
  },

  // Additional ApolloClient options
  // apollo: { ... }
  apollo:{
    connectToDevTools:true
  },

  // Client local data (see apollo-link-state)
  // clientState: { resolvers: { ... }, defaults: { ... } }
  clientState:{
    resolvers,
    typeDefs
  }
}

export const { apolloClient, wsClient } = createApolloClient({
  ...defaultOptions,  
})
apolloClient.wsClient = wsClient


// export const apolloClient = new ApolloClient({
//   link,
//   cache,
//   typeDefs,
//   resolvers,
//   connectToDevTools: true,
// });


export const apolloProvider = createApolloProvider({
  defaultClient: apolloClient
});


export async function onLogin (apolloClient, token) {
  if (typeof localStorage !== 'undefined' && token) {
    localStorage.setItem(AUTH_TOKEN, token)
  }
  if (apolloClient.wsClient) restartWebsockets(apolloClient.wsClient)
  try {
    await apolloClient.resetStore()
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log('%cError on cache reset (login)', 'color: orange;', e.message)
  }
}

// Manually call this when user log out
export async function onLogout (apolloClient) {
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem(AUTH_TOKEN)
  }
  if (apolloClient.wsClient) restartWebsockets(apolloClient.wsClient)

  try {
    console.log(`Reseteando cache`);
    await apolloClient.cache.reset();
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log('%cError on cache reset (logout)', 'color: orange;', e.message)
  }
}