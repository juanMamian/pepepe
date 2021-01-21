import {ApolloClient} from "apollo-client"
import {InMemoryCache} from "apollo-cache-inmemory";
import {createHttpLink} from "apollo-link-http"
import VueApollo from "vue-apollo";
import { typeDefs, resolvers} from "./apolloStore/Schema"
// import {split} from "apollo-link"
// import {WebSocketLink} from "apollo-link-ws"
// import {getMainDefinition} from "apollo-utilities"
 import {setContext} from "apollo-link-context"
import Vue from 'vue'

Vue.use(VueApollo);

const cache= new InMemoryCache();

//export const serverUrl="http://localhost:3000";
export const serverUrl="https://pe-pe-pe.herokuapp.com";

const httpLink = createHttpLink({
  uri: serverUrl+"/graphql"
});

// const wsLink = new WebSocketLink({
//   uri: 'ws://'+serverUrl.substr(7)+'/subscripciones',
//   options: {
//     reconnect: true,
//   },
// })

const authLink=setContext((_, {headers})=>{
    const token=localStorage.getItem("token") || "";
    return {
        headers:{
            ...headers,
            authorization: token
        }
    }
});

const link=authLink.concat(httpLink);


// const finalLink = split(
//   // split based on operation type
//   ({ query }) => {
//     const definition = getMainDefinition(query)
//     return definition.kind === 'OperationDefinition' &&
//       definition.operation === 'subscription'
//   },
//   wsLink,
//   link
// )

const apolloClient=new ApolloClient({
  link,
  cache,
  typeDefs,
  resolvers
});

export const apolloProvider=new VueApollo({
  defaultClient:apolloClient
})