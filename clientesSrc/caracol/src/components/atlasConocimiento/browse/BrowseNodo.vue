<template>
  <div class="browseNodo">
    <diagrama-arbol v-if="idNodo" :idsRoot="[idNodo]"> </diagrama-arbol>

  </div>
</template>
<script>
import diagramaArbol from '../diagramaArbol.vue';
export default {
  name: "BrowseNodo",
  components:{
    diagramaArbol
  },
  props: {
    idNodo: {
      type: String,
    },
  },
  data(){
    return {

    }
  },

};
</script>
<style scoped>
.browseNodo{
    display: flex;
    flex-direction: column;
    padding-top: 80px;
}
</style>
