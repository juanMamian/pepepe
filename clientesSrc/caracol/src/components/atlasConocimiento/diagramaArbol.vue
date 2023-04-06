<template>
  <div class="diagramaArbol">
    <div id="elDiagrama" ref="elDiagrama">
      <nodo-conocimiento-vista-arbol
        v-for="idNodo of idsRoot"
        :key="idNodo"
        :idNodo="idNodo"
        :idNodoSeleccionado="idNodoSeleccionado"
        :cadenaUnfold="cadenaUnfold"
        :nivelArbol="0"
        :refreshLineaHorizontal="refreshLineaHorizontal"
        @updateCadenaUnfold="updateCadenaUnfold"
        @scrollMe="scrollNodoIntoView"
        @clickEnNodo="clickEnNodo"
      >
      </nodo-conocimiento-vista-arbol>
    </div>

    <teleport to="body">
      <controles-nodo
        v-show="visible"
        :yo="yo"
        :elNodo="nodoSeleccionadoNullificable"
      ></controles-nodo>
    </teleport>
  </div>
</template>
<script>
import { gql } from "@apollo/client/core";
import NodoConocimientoVistaArbol from "./NodoConocimientoVistaArbol.vue";
import ControlesNodo from "./controlesNodo.vue";
import { QUERY_NODO_CONOCIMIENTO_ESTANDAR } from "./fragsAtlasConocimiento";

export default {
  name: "DiagramaArbol",
  components: {
    NodoConocimientoVistaArbol,
    ControlesNodo,
  },
  props: {
    visible: {
      type: Boolean,
      default: true,
    },
    idsRoot: {
      type: Array,
      default: [],
    },
  },
  apollo: {
    yo: {
      query: gql`
        query {
          yo {
            atlas {
              datosNodos {
                id
                idNodo
                estudiado
                aprendido
                diasRepaso
                estadoAprendizaje
              }
            }
          }
        }
      `,
      fetchPolicy: "cache-first",
      skip() {
        return !this.usuarioLogeado;
      },
    },
    nodoSeleccionado: {
      query: QUERY_NODO_CONOCIMIENTO_ESTANDAR,
      variables() {
        return {
          idNodo: this.idNodoSeleccionado,
        };
      },
      update({ nodo }) {
        return nodo;
      },
      skip() {
        return !this.idNodoSeleccionado;
      },
      fetchPolicy: "cache-first",
    },
  },
  data() {
    return {
      yo: {
        atlas: {
          datosNodos: [],
        },
      },
      idNodoSeleccionado: null,
      cadenaUnfold: [],
      refreshLineaHorizontal: 0,
    };
  },
  computed: {
    nodoSeleccionadoNullificable() {
      return this.idNodoSeleccionado ? this.nodoSeleccionado : null;
    },
  },
  methods: {
    clickEnNodo(idNodo) {
      this.idNodoSeleccionado =
        this.idNodoSeleccionado === idNodo ? null : idNodo;
    },
    scrollNodoIntoView({ elem, xCentro }) {
      this.$nextTick(() => {
        let layoutElem = elem.$el.getBoundingClientRect();
        let nuevoXCentro = layoutElem.left + layoutElem.width / 2;

        let scroll = nuevoXCentro - xCentro;
        this.$refs.elDiagrama.scrollLeft += nuevoXCentro - xCentro;
      });
    },
    updateCadenaUnfold(nuevaCadena) {
      this.cadenaUnfold = nuevaCadena;
    },
  },
};
</script>
<style scoped>
.diagramaArbol {
}

#elDiagrama {
  display: flex;
  gap: 100px;
  overflow-x: scroll;
  padding: 20px 20px;
  align-items: flex-start;
}
.controlesNodo {
  z-index: 10;
}
</style>
