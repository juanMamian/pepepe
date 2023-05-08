import { ApolloClient, createHttpLink, from, gql, split } from "@apollo/client/core";
import { createApolloProvider } from "@vue/apollo-option";
import { onError } from "@apollo/client/link/error";
import { setContext } from "@apollo/client/link/context";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { cache } from "./apolloCache";
import { createClient } from "graphql-ws";
import { getMainDefinition } from "@apollo/client/utilities";

import { serverUrl, wsServerUrl } from "./hostConfig";
import { QUERY_ACCIONES } from "./components/gestorAcciones/frags";



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
  if (process.env.NODE_ENV !== "production") {
    if (graphQLErrors)
      graphQLErrors.forEach(({ message, locations, path, extensions }) => {
        if (extensions?.code === 'BAD_USER_INPUT') {

          let cache = apolloClient.readQuery({
            query: QUERY_ACCIONES,
          });
          let nuevoCache = JSON.parse(JSON.stringify(cache || {}));
          if (!nuevoCache.acciones) {
            nuevoCache.acciones = [];
          }
          let nuevaAccion = {
            mensaje: message,
            tipo: "error",
            timestamp: Date.now(),
          }
          nuevoCache.acciones.push(nuevaAccion);
          apolloClient.writeQuery({
            query: QUERY_ACCIONES,
            data: nuevoCache,
          });
        }

        console.log(
          `[GraphQL error]: Message: ${message}, Location: ${JSON.stringify(locations)}, Path: ${path} `
        )
      });

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