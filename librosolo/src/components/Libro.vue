<template>
  <div id="libro">
      <div id="contenedorPaginas" v-if="libro.paginas">
          <pagina :estaPagina="pagina" v-for="pagina of libro.paginas" :key="pagina.id"/>
      </div>

  </div>
</template>

<script>
import Pagina from './Pagina.vue';
export const fragmentoCuadroTexto = gql`
  fragment fragCuadroTexto on CuadroTextoCuento {
    id
    texto
    posicionZeta
    posicion {
      x
      y
    }
    size {
      x
      y
    }
    audio {
      tipoReproduccion
    }
    formato {
      fontSize
      colorLetra
      tipoLetra
      alineacion
    }
  }
`;

export const fragmentoCuadroImagen = gql`
  fragment fragCuadroImagen on CuadroImagenCuento {
    id
    sinArchivo
    tipoActivacionSecundario
    posicionZeta
    posicion {
      x
      y
    }
    size {
      x
      y
    }
    audio {
      tipoReproduccion
    }
  }
`;

const fragmentoPagina = gql`
  fragment fragPagina on PaginaCuento {
    id
    numPag
    color
    cuadrosTexto {
      ...fragCuadroTexto
    }
    cuadrosImagen {
      ...fragCuadroImagen
    }
  }
  ${fragmentoCuadroTexto}
  ${fragmentoCuadroImagen}
`;

const QUERY_LIBRO = gql`
  query($idLibro: ID!) {
    libro(idLibro: $idLibro) {
      id
      idsEditores
      titulo
      paginas {
        ...fragPagina
      }
      idForo
    }
  }
  ${fragmentoPagina}
`;
export default {
  components: { Pagina },
  name: "Libro",
  apollo: {
    libro: {
      query: QUERY_LIBRO,
      variables() {
        return {
          idLibro: this.idLibro,
        };
      },
      skip() {
        return this.idLibro == null;
      },
      fetchPolicy: "cache-and-network",
    },
  },
  props:{
      idLibro:String,
  },
  data(){
      return{
          libro:{
              paginas:null,
          }
      }
  }
};
</script>

<style>
</style>