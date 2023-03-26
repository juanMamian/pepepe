<template>
  <div id="buscadorNodos" @mouseup.left.stop="">
    <img
      src="@/assets/iconos/search.png"
      alt="Lupa"
      title="Buscar..."
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

    <div id="contenedorListas">
      <div class="listaResultados" v-show="mostrandoLista && resultados.trabajos && resultados.trabajos.length>0">
        <img src="@/assets/iconos/iconoTrabajo.png" alt="Trabajos" width="15px" class="iconoLista">
        <div
          class="resultado"
          :key="resultadoTrabajo.id"
          v-for="resultadoTrabajo of resultados.trabajos"
          @click.stop="
            $emit('nodoSeleccionado', resultadoTrabajo);
            mostrandoInput = false;
            mostrandoLista = false;
          "
        >
          {{ resultadoTrabajo.nombre }}
        </div>
      </div>
      <div class="listaResultados" v-show="mostrandoLista && resultados.objetivos && resultados.objetivos.length>0">
        <img src="@/assets/iconos/iconoObjetivo.png" alt="Objetivos" width="15px" class="iconoLista">
        <div
          class="resultado"
          :key="resultadoObjetivo.id"
          v-for="resultadoObjetivo of resultados.objetivos"
          @click.stop="
            $emit('nodoSeleccionado', resultadoObjetivo);
            mostrandoInput = false;
            mostrandoLista = false;
          "
        >
          {{ resultadoObjetivo.nombre }}
        </div>
      </div>
    </div>

  </div>
</template>

<script>
import gql from "graphql-tag";
import Loading from "../utilidades/Loading.vue";
// import throttle from "lodash/throttle";
// import debounce from "lodash/debounce"

export default {
  components: { Loading },
  name: "buscadorNodos",
  data() {
    return {
      textoBusqueda: "",
      cantidadPalabrasValidas: 0,
      resultados: [],

      mostrandoInput: false,
      mostrandoLista: false,

      esperandoResultados: false,
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
      this.esperandoResultados = true;
      this.$apollo
        .query({
          query: gql`
            query ($palabrasBuscadas: String!) {
              busquedaAmpliaNodosSolidaridad(
                palabrasBuscadas: $palabrasBuscadas
              ) {
                trabajos {
                  id
                  nombre
                  descripcion
                  coords {
                    x
                    y
                  }                  
                }
                objetivos {
                  id
                  nombre
                  descripcion
                  coords {
                    x
                    y
                  }
                }
              }
            }
          `,
          variables: {
            palabrasBuscadas: this.textoBusqueda,
          },
          fetchPolicy: "network-only",
        })
        .then(({ data: { busquedaAmpliaNodosSolidaridad } }) => {
          this.resultados = busquedaAmpliaNodosSolidaridad;
          this.esperandoResultados = false;
          this.mostrandoLista = true;
        })
        .catch((error) => {
          console.log(`Error: ${error}`);
          this.esperandoResultados = false;
        });
    },
  },
  watch: {
    textoBusqueda: function () {
      this.mostrandoLista = false;
    },
    cerrarBusqueda() {
      this.mostrandoInput = false;
      this.mostrandoLista = false;
    },
  },
};
</script>

<style scoped>
#buscadorNodos {
  position: absolute;
  top: 1%;
  left: 1%;
  /* transform: translateX(-50%); */
  z-index: 100;
}
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
#contenedorListas{
  display: flex;
}
.listaResultados {  
  width: 280px;
}
.iconoLista{
  display: block;
  margin: 5px auto;
}
.resultado {
  padding: 5px 15px;
  font-size: 15px;  
  cursor: pointer;
  background-color: lightblue;

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