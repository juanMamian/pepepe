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
      >
      </nodo-conocimiento-vista-arbol>
    </div>
  </div>
</template>
<script>
import { gql } from "@apollo/client/core";
import NodoConocimientoVistaArbol from "./NodoConocimientoVistaArbol.vue";

export default {
  name: "DiagramaArbol",
  components: {
    NodoConocimientoVistaArbol,
  },
  props: {
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
  methods: {
    scrollNodoIntoView({ elem, xCentro }) {
      this.$nextTick(() => {
        let layoutElem = elem.$el.getBoundingClientRect();
        let nuevoXCentro = layoutElem.left + layoutElem.width / 2;
        console.log(`nuevoXCentro: ${nuevoXCentro}`);

        let scroll=nuevoXCentro - xCentro;
        console.log(`scroll: ${scroll}`);
        this.$refs.elDiagrama.scrollLeft += nuevoXCentro - xCentro;
      });
    },
    updateCadenaUnfold(nuevaCadena) {
      this.cadenaUnfold = nuevaCadena;
    },
  },
  watch: {
    cadenaUnfold() {
      console.log("incrementando el refresh de linea horizontal");
      this.refreshLineaHorizontal++;
    },
  },
};
</script>
<style scoped>
.diagramaArbol {
  border: 1px solid gray;
}

#elDiagrama {
  display: flex;
  gap: 100px;
  overflow: scroll;
  padding: 20px 20px;
  align-items: flex-start;
}
</style>
