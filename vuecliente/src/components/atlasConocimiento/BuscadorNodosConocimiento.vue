<template>
  <div id="buscadorNodosConocimiento">
    <img
      src="@/assets/iconos/search.png"
      alt="Lupa"
      title="Buscar nodos de conocimiento"
      id="imagenLupa"
      :class="{ opaco: !mostrandoInput }"
      @click.stop="mostrandoInput = true"
    />
    <transition name="unfold">
      <input
        type="text"
        placeholder="Buscar"
        v-model="textoBusqueda"
        id="inputBuscador"
        v-show="mostrandoInput"
        autocomplete="off"
        @click.stop=""
        @keypress.enter="buscarDatabase"
      />
    </transition>

    <loading texto="Buscando" v-show="esperandoResultados" />

    <div id="listaResultados" v-show="mostrandoLista">
      <div
        class="resultado"
        :key="resultado.id"
        v-for="resultado of resultados"
        @click.stop="
          $emit('nodoSeleccionado', resultado);
          mostrandoInput = false;
          mostrandoLista = false;
        "
      >
        {{ resultado.nombre }}
      </div>
    </div>
  </div>
</template>

<script>
import gql from "graphql-tag";
import Loading from '../utilidades/Loading.vue';
// import throttle from "lodash/throttle";
// import debounce from "lodash/debounce"


export default {
  components: { Loading },
  name: "BuscadorNodosConocimiento",
  data() {
    return {
      textoBusqueda: "",
      cantidadPalabrasValidas: 0,
      resultados: [],

      mostrandoInput: false,
      mostrandoLista:false,

      esperandoResultados:false,
    };
  },
  props: {
    cerrarBusqueda: Number,
  },
  methods: {
    cerrar() {
      this.mostrandoInput = false;
    },
    buscarDatabase() {
      console.log(`******Descargando resultados de búsqueda`);
      this.esperandoResultados=true;
      this.$apollo
        .query({
          query: gql`
            query($palabrasBuscadas: String!) {
              busquedaAmplia(palabrasBuscadas: $palabrasBuscadas) {
                id
                nombre
                resumen
                coordsManuales {
                  x
                  y
                }
                coords{
                  x
                  y
                }
              }
            }
          `,
          variables: {
            palabrasBuscadas: this.textoBusqueda,
          },
          fetchPolicy: "network-only",
        })
        .then(({ data: { busquedaAmplia } }) => {
          this.resultados = busquedaAmplia;
          this.esperandoResultados=false;
          this.mostrandoLista=true;
        })
        .catch((error) => {
          console.log(`Error: ${error}`);
          this.esperandoResultados=false;

        });
    },
  },
  watch: {
    textoBusqueda: function () {      
      this.mostrandoLista=false;      
    },
    cerrarBusqueda() {
      this.mostrandoInput = false;
      this.mostrandoLista=false;
    },
  },
};
</script>

<style scoped>
#inputBuscador {
  font-size: 20px;
  border-radius: 4px;
  width: 280px;
}

#imagenLupa {
  width: 30px;
  cursor: pointer;
  border-radius: 50%;
  padding: 3px;
  background-color: rgba(128, 128, 128, 0.144);
}

#imagenLupa:hover {
  background-color: rgb(128, 128, 128);
  opacity: 1;
}
.opaco {
  opacity: 0.5;
}
#listaResultados {
  margin: 2px auto;
  width: 280px;
}

.resultado {
  padding: 5px 15px;
  font-size: 18px;
  background-color: lightblue;
  cursor: pointer;
}
.resultado:hover {
  background-color: rgb(133, 179, 194);
}

.unfold-enter {
  width: 0px;
}
.unfold-enter-active {
  transition: width 1s;
}
.unfold-enter-to {
  width: 281px;
}
</style>