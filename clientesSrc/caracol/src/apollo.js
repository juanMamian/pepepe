import { ApolloClient, createHttpLink, from, gql, split } from "@apollo/client/core";
import { createApolloProvider } from "@vue/apollo-option";
import { onError } from "@apollo/client/link/error";
import { setContext } from "@apollo/client/link/context";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { cache } from "./apolloCache";
import { createClient } from "graphql-ws";
import { getMainDefinition } from "@apollo/client/utilities";

import { serverUrl, wsServerUrl } from "./hostConfig";



const httpLink = createHttpLink({
  uri: serverUrl + "/graphql",
});

const httpAuthLink = setContext((_, { headers }) => {
  let elToken = leerToken();

  let authorization = "";

  if (elToken) {
    authorization = "Bearer " + elToken;
  }
  return {
    headers: {
      ...headers,
      authorization,
    },
  };
});

const wsLink = new GraphQLWsLink(createClient({
  url: wsServerUrl + "/graphql",
  connectionParams: () => {
    let token = leerToken();
    return {
      authentication: token,
      mensaje: "hola"
    }
  }
}));

const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  wsLink,
  from([httpAuthLink, httpLink]),
);

export const errorLink = onError(({ graphQLErrors, networkError }) => {
  console.log("NODE_ENV: " + process.env.NODE_ENV);
  if (process.env.NODE_ENV !== "production") {
    if (graphQLErrors)
      graphQLErrors.map(({ message, locations, path }) =>
        console.log(
          `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
        )
      );

    if (networkError) console.log(`[Network error]: ${networkError}`);
  }
});


export const apolloClient = new ApolloClient({
  link: from([errorLink, splitLink]),
  cache,
});

export const apolloProvider = createApolloProvider({
  defaultClient: apolloClient,
  defaultOptions: {
    $query: {
      fetchPolicy: "cache-and-network",
    }
  },
});


function leerToken() {
  let datosUsuario = apolloClient.readQuery({
    query: gql`
      query {
        auth_usuario @client {
          id
          token
        }
      }
    `,
  });

  if (datosUsuario?.auth_usuario?.token) {
    return datosUsuario?.auth_usuario?.token;
  }

  return "";
}