import { ApolloClient } from "apollo-client"
import { InMemoryCache } from "apollo-cache-inmemory";
import { createHttpLink } from "apollo-link-http"
import VueApollo from "vue-apollo";
import { typeDefs, resolvers } from "./apolloStore/Schema"
import { split } from "apollo-link"
import { WebSocketLink } from "apollo-link-ws"
import { getMainDefinition } from "apollo-utilities"
import { setContext } from "apollo-link-context"
import Vue from 'vue'
import { onError } from '@apollo/client/link/error'


Vue.use(VueApollo);

const cache = new InMemoryCache();


let getToken = () => localStorage.getItem('token');


export const serverUrl = process.env.NODE_ENV === 'production'
  ? 'https://pe-pe-pe.herokuapp.com'
  : 'http://localhost:3000'

export const wsServerUrl = process.env.NODE_ENV === 'production'
  ? 'wss://' + serverUrl.substr(7) + '/subscripciones'
  : 'ws://' + serverUrl.substr(7) + '/subscripciones'

//console.log(`Server url: ${serverUrl}`);


const httpLink = createHttpLink({
  uri: serverUrl + "/graphql"
});

//console.log(`Direccion subscripciones ${wsServerUrl}`);

const wsLink = new WebSocketLink({
  uri: wsServerUrl,
  options: {
    reconnect: true,
    connectionParams: {
      headers: {
        Authorization: `Bearer ${getToken()}`
      }
    }
  },
})

const authLink = setContext((_, { headers }) => {

  return {
    headers: {
      ...headers,
      authorization: getToken()
    }
  }
});

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

})

const link = errorLink.concat(authLink).concat(httpLink);


const finalLink = split(
  // split based on operation type
  ({ query }) => {
    const definition = getMainDefinition(query)
    return definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
  },
  wsLink,
  link
)

export const apolloClient = new ApolloClient({
  link: finalLink,
  cache,
  typeDefs,
  resolvers,
  connectToDevTools: true,
});

export const apolloProvider = new VueApollo({
  defaultClient: apolloClient
})