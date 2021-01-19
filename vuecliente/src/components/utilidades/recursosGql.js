import gql from "graphql-tag"

export const fragmentoResponsables = gql`
fragment fragResponsables on PublicUsuario {
  id
  username
  nombres
  apellidos
  email
  numeroTel
  lugarResidencia
}
`;

export const fragmentoActividad = gql`
fragment fragActividad on ActividadGrupoEstudiantil {
  id
  nombre
  hayGuia
  creador {
    ...fragResponsables
  }
  desarrollos {
    id
    estado
    estudiante {
      ...fragResponsables
    }
    participaciones {
      id
      fechaUpload
      archivo {
        extension
        nombre
        accesible
      }
      comentario
      autor {
        ...fragResponsables
      }
    }
  }
}
${fragmentoResponsables}
`;