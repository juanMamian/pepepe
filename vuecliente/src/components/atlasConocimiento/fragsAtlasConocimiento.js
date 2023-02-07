import gql from "graphql-tag"

export const fragmentoDatoNodoConocimiento = gql`
  fragment fragDatoNodoConocimiento on DatoNodoUsuario {
    id
    idNodo
    nombreNodo
    aprendido
    estudiado
    periodoRepaso
    iteracionesRepaso{
        id
        intervalo
    }
  }
`;