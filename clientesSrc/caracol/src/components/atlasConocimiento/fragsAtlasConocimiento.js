import gql from "graphql-tag"
export const fragmentoNodoConocimientoMinimoAtlas = gql`
fragment fragNodoConocimientoMinimoAtlas on NodoConocimiento{
    id
    nombre
    expertos
    tipoNodo
    autoCoords{
        x
        y
    }
    vinculos{
        id
        idRef
        rol
        tipo
    }
} `

export const fragmentoDatoNodoConocimiento = gql`
  fragment fragDatoNodoConocimiento on DatoNodoUsuario {
    id
    idNodo
    nombreNodo
    aprendido
    estudiado
    diasRepaso    
    estadoAprendizaje
  }
`;

export const fragmentoColecciones = gql`
  fragment fragColecciones on ColeccionNodosAtlasConocimiento {
    id
    nombre
    idsNodos
    nodos {
      id
      nombre
    }
  }
`;

export const fragmentoNodoConocimiento = gql`
  fragment fragNodoConocimiento on NodoConocimiento {
    id
    nombre
    descripcion
    expertos
    tipoNodo
    nivel   
    autoCoords {
      x
      y
    }
    angulo
    puntaje
    vinculos {
      id
      idRef
      rol
      tipo
      nodoContraparte{
        id
        nombre
        autoCoords{
          x
          y
        }
      }
    }
  }

`;

export const QUERY_NODOS = gql`
  query todosNodos {
    todosNodos {
      ...fragNodoConocimiento
    }
  }
  ${fragmentoNodoConocimiento}
`;

export const QUERY_NODO_CONOCIMIENTO_ATLAS = gql`
  query($idNodo:ID!){
    nodo(idNodo:$idNodo){
      id
      nombre
      vinculos{
        id
        idRef
        tipo
        rol
        nodoContraparte{
         id
         nombre
         autoCoords{
           x
           y
         }
        }
      }
      descripcion
      tipoNodo
      expertos
      autoCoords{
        x
        y
      }
      
    }
  }
`;
export const QUERY_NODO_CONOCIMIENTO_ESTANDAR = gql`
  query($idNodo:ID!){
    nodo(idNodo:$idNodo){
      id
      nombre
      vinculos{
        id
        idRef
        tipo
        rol
      }
      descripcion
      tipoNodo
      expertos
      
    }
  }
`;


export const QUERY_DATOS_USUARIO_NODOS = gql`
  query {
    yo {
      id
      atlas {
        id
        idNodoTarget
        datosNodos {
          ...fragDatoNodoConocimiento
        }
        configuracion {
          modo
        }
        colecciones {
          ...fragColecciones
        }
      }
    }
  }
  ${fragmentoDatoNodoConocimiento}
  ${fragmentoColecciones}
`;

