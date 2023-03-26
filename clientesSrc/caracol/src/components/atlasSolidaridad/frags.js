import gql from "graphql-tag"


export const fragmentoPersonaAtlas = gql`
  fragment fragPersonaAtlas on Usuario {
    id
    nombre
    username
    nombres    
    apellidos
    vinculos {
      id
      tipo
      idRef
    }
    coords {
      x
      y
    }
    responsables
    responsablesAmplio
    administradores
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

export const fragmentoRecursoExterno = gql`
 fragment fragRecursoExterno on RecursoExternoNodoSolidaridad{
  id
  nombre
  link
  tipo
 }
`;

export const fragmentoMovimientoDineroNodoSolidaridad=gql`
  fragment fragMovimientoDineroNodoSolidaridad on MovimientoDineroNodoSolidaridad{
    id
    fecha
    articulo,
    unidad,
    cantidad,
    movimientoUnitario,
    movimientoTotal,
    realizado
    informacion
  }
`;

export const fragmentoEventoNodoSolidaridad=gql`
  fragment fragEventoNodoSolidaridad on EventoNodoSolidaridad{
    id    
    fecha,
    nombre,
    tipo,
    descripcion,    
  }
`;


export const fragmentoNodoSolidaridad = gql`
  fragment fragNodoSolidaridad on NodoSolidaridad{
    id
    nombre
    descripcion
    tipoNodo
    responsables
    responsablesAmplio    
    posiblesResponsables
    responsablesSolicitados
    administradores
    keywords
    tipoParent
    nodoParent
    publicitado
    recursosExternos{
      ...fragRecursoExterno
    }
    movimientosDinero{
      ...fragMovimientoDineroNodoSolidaridad
    }
    eventos{
      ...fragEventoNodoSolidaridad
    }
    coords {
        x
        y
    }
    autoCoords{
      x
      y
    }
    estadoDesarrollo
    vinculos {
        id
        idRef
        tipo        
    }
    stuck
    angulo
    centroMasa {
        x
        y
    }
    fuerzaCentroMasa{
      fuerza
      direccion
    }
    fuerzaColision{
      fuerza
      direccion  
    }
    puntaje
    nivel
    turnoNivel
    peso
  }
  ${fragmentoMovimientoDineroNodoSolidaridad}
  ${fragmentoEventoNodoSolidaridad}
  ${fragmentoRecursoExterno}
`;