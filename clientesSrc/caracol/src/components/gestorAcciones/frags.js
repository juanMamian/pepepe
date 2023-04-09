import {gql} from "@apollo/client/core";
export const QUERY_ACCIONES = gql`
  query {
    acciones @client {
      mensaje
      tipo
      timestamp
    }
  }
`;