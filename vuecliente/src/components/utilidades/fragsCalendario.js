import gql from 'graphql-tag';

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
}
`