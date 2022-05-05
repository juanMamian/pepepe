import gql from "graphql-tag"

export const fragmentoResponsables = gql`
fragment fragResponsables on Usuario {
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
fragment fragMinimoPersona on Usuario {
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
      enlaceAdjunto
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
      estado
      vinculos{
        idRef
        tipo
        tipoRef
      }
      diagramaProyecto{
        posicion{
          x
          y
        }        
      }
    }
  }
  
`;

const fragmentoQuote =gql`
  fragment fragQuote on Quote{
    mensaje    
    infoAutor{
      id
      nombres
      apellidos
      username
    }
    fecha
  }
`;

const fragmentoInterpolacion =gql`
  fragment fragInterpolacion on Interpolacion{
    tipo
    enlaceIframe
    mensaje    
  }
`;

export const fragmentoRespuesta = gql`
  fragment fragRespuesta on RespuestaConversacionForo{
    id
    fecha
    mensaje
    interpolaciones{
      ...fragInterpolacion
      quote{
        ...fragQuote
        interpolaciones{
          ...fragInterpolacion
          quote{
            ...fragQuote
            interpolaciones{
              ...fragInterpolacion
              quote{
                ...fragQuote
                interpolaciones{
                  ...fragInterpolacion
                  quote{
                    ...fragQuote
                    interpolaciones{
                      ...fragInterpolacion
                      quote{
                        ...fragQuote
                        interpolaciones{
                          ...fragInterpolacion
                          quote{
                            ...fragQuote
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
    enlaceAdjunto
    infoAutor{
      id
      nombres
      apellidos
      username
    }
    archivo{
      googleDriveDirectLink
    }
  }
  ${fragmentoQuote}, 
  ${fragmentoInterpolacion}
`;

export const fragmentoConversacion = gql`
  fragment fragConversacion on Conversacion{
    id
    titulo    
    estado
    acceso   
    cantidadRespuestas
    infoUltimaRespuesta{
      fecha      
    }
  }
`;