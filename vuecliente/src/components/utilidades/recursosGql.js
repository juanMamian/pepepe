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

export const fragmentoUsuarios = gql`
fragment fragResponsables on PublicUsuario {
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

export const fragmentoBienGrupo = gql`
  fragment fragBienGrupo on BienGrupo{
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

export const fragmentoServicioGrupo = gql`
fragment fragServicioGrupo on ServicioGrupo{
  id
  nombre
  descripcion
  listaPeticiones{
    idBeneficiario
  }
}
`
export const fragmentoTrabajoGrupo = gql`
  fragment fragTrabajoGrupo on TrabajoDeGrupo{
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

export const fragmentoObjetivoGrupo = gql`
  fragment fragObjetivoGrupo on ObjetivoDeGrupo{
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

export const fragmentoGrupo = gql`
  fragment fragGrupo on Grupo{
    id
    nombre
    descripcion
    idForo
    responsables
    participantes
    posiblesResponsables    
    objetivos {
      ...fragObjetivoGrupo
    }
    trabajos {
      ...fragTrabajoGrupo
    }
  }  
  ${fragmentoTrabajoGrupo}
  ${fragmentoObjetivoGrupo}
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