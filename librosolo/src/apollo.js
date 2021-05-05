import { ApolloClient } from "apollo-client"
import { InMemoryCache } from "apollo-cache-inmemory";
import { createHttpLink } from "apollo-link-http"
import VueApollo from "vue-apollo";
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


export const apolloClient = new ApolloClient({
  link: link,
  cache,
  connectToDevTools: true,
});

export const apolloProvider = new VueApollo({
  defaultClient: apolloClient
})