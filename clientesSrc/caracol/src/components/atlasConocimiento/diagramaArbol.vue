<template>
  <div class="diagramaArbol" @click="clickFondo">
    <div id="elDiagrama" ref="elDiagrama">
      <nodo-conocimiento-vista-arbol
        v-for="idNodo of idsRoot"
        :key="idNodo"
        :idNodo="idNodo"
        :idNodoSeleccionado="idNodoSeleccionado"
        :nivelArbol="0"
        :refreshLineaHorizontal="refreshLineaHorizontal"
        @scrollMe="scrollNodoIntoView"
        @clickEnNodo="clickEnNodo"
      >
      </nodo-conocimiento-vista-arbol>
    </div>
    <visor-nodo-conocimiento :idNodo="idNodoVisor" v-if="idNodoVisor">

    </visor-nodo-conocimiento>

  </div>
</template>
<script>
import NodoConocimientoVistaArbol from "./NodoConocimientoVistaArbol.vue";
import ControlesNodo from "./controlesNodo.vue";
import VisorNodoConocimiento from "./visorNodo/VisorNodoConocimiento.vue"
import { QUERY_DATOS_USUARIO_NODOS, QUERY_NODO_CONOCIMIENTO_ESTANDAR } from "./fragsAtlasConocimiento";


export default {
  name: "DiagramaArbol",
  components: {
    NodoConocimientoVistaArbol,
    ControlesNodo,
    VisorNodoConocimiento
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
    },
    idNodoSeleccionado:{
      type: String,
    }
  },
  apollo: {
    yo:{
      query: QUERY_DATOS_USUARIO_NODOS,
      fetchPolicy: "cache-first",
      skip(){
        return !this.usuario?.id;
      }
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
      idNodoVisor: null,
      yo: {
        atlas: {
          datosNodos: [],
        },
      },
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
      return this.$apollo?.queries?.nodoSeleccionado?.skip ? null: this.nodoSeleccionado;
    },
  },
  methods: {
    clickFondo(){
      this.$emit('seleccionNodo', null);
    },
    clickEnNodo(idNodo) {
        this.$emit('seleccionNodo', {idNodo: idNodo});
    },
    scrollNodoIntoView({ elem, xCentro }) {
      this.$nextTick(() => {
        let layoutElem = elem.$el.getBoundingClientRect();
        let nuevoXCentro = layoutElem.left + layoutElem.width / 2;

        let scroll = nuevoXCentro - xCentro;
        this.$refs.elDiagrama.scrollLeft += nuevoXCentro - xCentro;
      });
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
