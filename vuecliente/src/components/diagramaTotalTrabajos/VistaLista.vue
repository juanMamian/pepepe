<template>
  <div
    id="vistaLista"
    @mouseup.stop=""
    @mousedown.stop=""
    @touchmove.stop=""
    @touchstart.stop=""
    @touchend.stop=""
  >
    <img
      src="@/assets/iconos/lista.png"
      width="35px"
      alt="Lista"
      id="botonAbrir"
      @click="abierta = !abierta"
    />
    <div id="zonaPlegable" v-show="abierta">
      <div id="zonaBuscar">
        <input type="text" v-model="busqueda" />
        <img
          src="@/assets/iconos/search.png"
          id="botonBuscar"
          alt="Buscar"
          width="20px"
        />
      </div>
      <div id="listaNodos">
        <nodo-vista-lista
          v-for="nodoPrimerNivel of nodosPrimerNivel"
          :key="nodoPrimerNivel.id"
          :esteNodo="nodoPrimerNivel"
          :busqueda="busqueda"
          @centrarEnNodo="$emit('centrarEnNodo', $event)"
        />
      </div>
    </div>
  </div>
</template>

<script>
import NodoVistaLista from "./NodoVistaLista.vue";
export default {
  components: { NodoVistaLista },
  name: "VistaLista",
  props: {
    todosNodos: Array,
    cerrar: Number,
  },
  data() {
    return {
      abierta: false,
      busqueda: null,
    };
  },
  methods: {
    guardarChildren(nodo) {
      nodo.children = this.todosNodos.filter(
        (n) => n.nodoParent && n.nodoParent.id === nodo.id
      );
    },
  },
  computed: {
    nodosPrimerNivel() {
      return this.nodosNested.filter(
        (n) => !n.nodoParent || !n.nodoParent.idNodo
      );
    },
    nodosNested() {
      return this.todosNodos.map((nodo) => {
        nodo.children = this.todosNodos.filter(
          (n) => n.nodoParent && n.nodoParent.idNodo === nodo.id
        );
        return nodo;
      });
    },
  },
  watch: {
    cerrar() {
      this.abierta = false;
    },
  },
};
</script>

<style scoped>
#vistaLista {
  position: absolute;
  top: 1%;
  left: 0%;
  height: 80%;
  height: 80%;
  z-index: 100;
  padding: 10px 0px;
}
#botonAbrir {
  cursor: pointer;
  opacity: 0.5;
}
#botonAbrir:hover {
  opacity: 1;
}
#zonaPlegable {
  background-color: rgba(95, 158, 160, 0.788);
  border: 2px solid rgb(22, 88, 90);
  position: relative;
  height: 100%;
  border-radius: 10px;
  padding: 10px;
}
#botonBuscar {
  cursor: pointer;
  border-radius: 50%;
}
#botonBuscar:hover {
  background-color: rgba(128, 128, 128, 0.356);
}
#listaNodos {
  height: 90%;
  padding: 15px 0px;
  overflow-y: scroll;
}
</style>