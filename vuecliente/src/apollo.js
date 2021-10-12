import { ApolloClient, HttpLink, InMemoryCache, split } from '@apollo/client/core'
import { createApolloProvider } from '@vue/apollo-option'

import {WebSocketLink} from "@apollo/client/link/ws"

import {getMainDefinition} from "@apollo/client/utilities"
import {setContext} from "@apollo/client/link/context"
import { onError } from '@apollo/client/link/error'

import possibleTypes from "../possibleTypes.json"
import { typeDefs, resolvers} from "./apolloStore/Schema"


const cache= new InMemoryCache({
  possibleTypes
});


let getToken = ()=> localStorage.getItem('token');


export const serverUrl=process.env.NODE_ENV === 'production'
? 'https://pe-pe-pe.herokuapp.com'
: 'http://192.168.1.6:3000'



export const wsServerUrl=process.env.NODE_ENV === 'production'
? 'wss://'+serverUrl.substr(7)+'/subscripciones'
: 'ws://'+serverUrl.substr(7)+'/subscripciones'


const httpLink = new HttpLink({
  uri: serverUrl+"/graphql"
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

const authLink=setContext((_, {headers})=>{    
    return {
        headers:{
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
});

const link=errorLink.concat(authLink).concat(httpLink);


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

export const apolloClient=new ApolloClient({
  link:finalLink,
  cache,
  typeDefs,
  resolvers,
  connectToDevTools:true,
});


export const apolloProvider=createApolloProvider({
  defaultClient:apolloClient
});


