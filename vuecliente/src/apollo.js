import {ApolloClient} from "apollo-client"
import {InMemoryCache} from "apollo-cache-inmemory";
import {createHttpLink} from "apollo-link-http"
import VueApollo from "vue-apollo";
import { typeDefs, resolvers} from "./apolloStore/Schema"
//import {ApolloLink} from "apollo-link"
import {setContext} from "apollo-link-context"
import Vue from 'vue'

Vue.use(VueApollo);

const cache= new InMemoryCache();

const httpLink = createHttpLink({
  uri: "http://localhost:3000/graphql"
});

const authLink=setContext((_, {headers})=>{
    const token=localStorage.getItem(process.env.TOKEN_KEY) || "";
    return {
        headers:{
            ...headers,
            authorization: token
        }
    }
});

const link=authLink.concat(httpLink);

const apolloClient=new ApolloClient({
  link,
  cache,
  typeDefs,
  resolvers
});

export const apolloProvider=new VueApollo({
  defaultClient:apolloClient
})