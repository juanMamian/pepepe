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

export const fragmentoParticipacion = gql`
  fragment fragParticipacion on ParticipacionActividadGrupoEstudiantil{
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
  ${fragmentoResponsables}
`

export const fragmentoDesarrollo = gql`
fragment fragDesarrollo on DesarrolloActividadGrupoEstudiantil{
  id
    estado
    leidoPorProfe
    estudiante {
      ...fragResponsables
    }
    participaciones {
      ...fragParticipacion
    }
}
${fragmentoParticipacion}
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
${fragmentoDesarrollo}
`;


export const fragmentoProyecto = gql`
  fragment fragProyecto on Proyecto{
    id
    nombre
    descripcion
    idForo
    responsables {
      ...fragResponsables
    }
    posiblesResponsables {
      ...fragResponsables
    }
    trabajos {
      id
      nombre
      descripcion
      responsables {
        ...fragResponsables
      }
    }
    objetivos {
      id
      nombre
      descripcion
    }
  }
  ${fragmentoResponsables}
  
`;

export const fragmentoRespuesta = gql`
  fragment fragRespuesta on Respuesta{
    id
    fecha
    mensaje
    autor {
      ...fragResponsables
    }
  }
  ${fragmentoResponsables}
`;

export const fragmentoConversacion = gql`
  fragment fragConversacion on Conversacion{
    id
    titulo    
    estado
    creador {
      ...fragResponsables
    }   
  }
  ${fragmentoResponsables}
`;