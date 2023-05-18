import { gql } from "@apollo/client/core"
export const fragmentoBloqueSubscripcion = gql`
fragment fragBloqueSubscripcion on BloqueSubscripcion{
    id
    dateInicio
    duracion
    valorPagado
}
`
export const QUERY_BLOQUES_SUBSCRIPCION = gql`
query($idUsuario: ID!){
    Usuario(idUsuario: $idUsuario){
        id
        bloquesSubscripcion{
            ...fragBloqueSubscripcion
        }
    }
}
${fragmentoBloqueSubscripcion}
`

