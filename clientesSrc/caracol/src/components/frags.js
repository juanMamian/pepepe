import gql from "graphql-tag";

export const fragmentoEspacio = gql`
  fragment fragEspacio on Espacio {
    id
    nombre
    descripcion
    idAdministrador
    paraChiquis
  }
`;