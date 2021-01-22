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

export const fragmentoDesarrollo = gql`
fragment fragDesarrollo on DesarrolloActividadGrupoEstudiantil{
  id
    estado
    leidoPorProfe
    estudiante {
      ...fragResponsables
    }
    participaciones {
      id
      fechaUpload
      archivo {
        extension
        nombre
        accesible,        
      }
      comentario
      autor {
        ...fragResponsables
      }
    }
}
${fragmentoResponsables}
`;

export const fragmentoActividad = gql`
fragment fragActividad on ActividadGrupoEstudiantil {
  id
  nombre
  fechaUpload
  hayGuia
  creador {
    ...fragResponsables
  }
  desarrollos {
    ...fragDesarrollo 
  }
}
${fragmentoResponsables}
${fragmentoDesarrollo}
`;
