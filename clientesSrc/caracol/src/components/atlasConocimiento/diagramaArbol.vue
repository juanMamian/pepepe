<template>
  <div class="diagramaArbol" @click="clickFondo">
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
        :idNodoSeleccionado="idNodoSeleccionado"
        :nodoTargetRelevante="nodoTargetRelevante"
      ></controles-nodo>
    </teleport>
  </div>
</template>
<script>
import { gql } from "@apollo/client/core";
import NodoConocimientoVistaArbol from "./NodoConocimientoVistaArbol.vue";
import ControlesNodo from "./controlesNodo.vue";
import { QUERY_DATOS_USUARIO_NODOS, QUERY_NODO_CONOCIMIENTO_ESTANDAR } from "./fragsAtlasConocimiento";

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
    idsRed:{
      type: Array,
      default:[],
    }
  },
  apollo: {
    yo:{
      query: QUERY_DATOS_USUARIO_NODOS,
      fetchPolicy: "cache-first"
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
    idNodoTarget(){
      return this.yo?.atlas?.idNodoTarget;
    },
    nodoTargetRelevante(){
      return this.idNodoTarget && this.idsRed.includes(this.idNodoTarget);
    },
    nodoSeleccionadoNullificable() {
      return this.idNodoSeleccionado ? this.nodoSeleccionado : null;
    },
  },
  methods: {
    clickFondo(){
      this.idNodoSeleccionado=null;
    },
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
  padding: 30px 20px;
  height: 100%;
  width: fit-content;
  max-width: 100%;
  margin: 10px auto;
  align-items: flex-start;
}
.controlesNodo {
  z-index: 10;
}
</style>
