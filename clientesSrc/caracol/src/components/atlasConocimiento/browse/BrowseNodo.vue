<template>
  <div class="browseNodo">
    <diagrama-arbol
      v-if="idNodo"
      :idsRoot="[idNodo]"
      :idNodoSeleccionado="idNodoSeleccionado"
      @seleccionNodo="$emit('seleccionNodo', $event)"
    >
    </diagrama-arbol>
  </div>
</template>
<script>
import diagramaArbol from "../diagramaArbol.vue";
export default {
  name: "BrowseNodo",
  components: {
    diagramaArbol,
  },
  props: {
    idNodo: {
      type: String,
    },
    idNodoSeleccionado:{
      type: String,
    }
  },
  data() {
    return {};
  },
};
</script>
<style scoped>
.browseNodo {
  position: relative;
  z-index:1;
  display: flex;
  flex-direction: column;
  padding-top: 20px;
}
</style>
