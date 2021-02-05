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

export const fragmentoMinimoPersona = gql`
fragment fragMinimoPersona on PublicUsuario {
  id
  nombres
  apellidos
  username
}
`;

export const fragmentoParticipacion = gql`
  fragment fragParticipacion on ParticipacionActividadGrupoEstudiantil{
    id
      fechaUpload
      archivo {
        extension
        nombre
        googleDriveDirectLink,        
      }
      comentario
      infoAutor{
        ...fragMinimoPersona
      }
  }
  ${fragmentoMinimoPersona}
`

export const fragmentoDesarrollo = gql`
fragment fragDesarrollo on DesarrolloActividadGrupoEstudiantil{
    id
    estado
    leidoPorProfe
    infoEstudiante{
      ...fragMinimoPersona
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
  infoCreador{
    ...fragMinimoPersona
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
    responsables
    posiblesResponsables
    idsTrabajos
    objetivos {
      id
      nombre
      descripcion
    }
  }
  
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
    acceso
    creador {
      ...fragResponsables
    }
    cantidadRespuestas
  }
  ${fragmentoResponsables}
`;