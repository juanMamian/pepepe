import gql from "graphql-tag"

export const fragmentoEvento = gql`
  fragment fragEvento on EventoCalendario{
    id
    nombre
    descripcion
    horarioInicio
    horarioFinal
    responsables  
    participantes
    origen
    idOrigen    
  }
`;

export const fragmentoResponsables = gql`
fragment fragResponsables on Usuario {
  id
  username
  nombres
  apellidos
  email
  permisos
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
  titulo
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

export const fragmentoBienProyecto = gql`
  fragment fragBienProyecto on BienProyecto{
    id
      nombre
      descripcion
      unidad
      cantidad
      fechaCierre
      fechaReparticion
      instruccionesRecibir
      listaPeticiones{
        idBeneficiario
        cantidadSolicitada
        cantidadAsignada
      }
  }
`

export const fragmentoServicioProyecto = gql`
fragment fragServicioProyecto on ServicioProyecto{
  id
  nombre
  descripcion
  listaPeticiones{
    idBeneficiario
  }
}
`
export const fragmentoTrabajoProyecto = gql`
  fragment fragTrabajoProyecto on TrabajoDeProyecto{
    id
      nombre
      descripcion
      estadoDesarrollo
      vinculos{
        idRef
        tipo
        tipoRef
      }
      coords{
        x
        y
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