import { gql } from "@apollo/client/core"

export const fragmentoEventoPersonal=gql`
fragment fragEventoPersonal on EventoPersonal{
  id
  idPersona
  idsParticipantes
  idParent
  tipoParent
  nombre
  descripcion
  horarioInicio
  horarioFinal
  idEventoMarco
  lugar  

}
`

export const fragmentoEventoPublico=gql`
fragment fragEventoPublico on EventoPublico{
  id
  nombre
  descripcion
  idAdministrador
  limiteDeCupos
  horarioInicio
  horarioFinal
  participantes
  lugar
  idParent
  tipoParent
  eventosEnmarcados{
    ...fragEventoPersonal
    nombresPersona
  }
}
${fragmentoEventoPersonal}
`

