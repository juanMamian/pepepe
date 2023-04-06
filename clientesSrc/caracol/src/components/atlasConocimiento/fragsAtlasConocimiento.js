import gql from "graphql-tag"

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
    coordsManuales {
      x
      y
    }
    coords {
      x
      y
    }
    autoCoords {
      x
      y
    }
    centroMasa {
      x
      y
    }
    stuck
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
    fuerzaCentroMasa {
      fuerza
      direccion
    }
    fuerzaColision {
      fuerza
      direccion
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
