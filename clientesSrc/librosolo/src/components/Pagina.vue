<template>
  <div class="pagina" :style="estilo">    
    <cuadro-texto
      v-for="cuadroTexto of estaPagina.cuadrosTexto"
      :key="cuadroTexto.id"
      :esteCuadroTexto="cuadroTexto"
    />
    <cuadro-imagen
      v-for="cuadroImagen of estaPagina.cuadrosImagen"
      :key="cuadroImagen.id"
      :esteCuadroImagen="cuadroImagen"
      :idPagina="estaPagina.id"
      :idLibro="idLibro"
    />
  </div>
</template>

<script>
import CuadroImagen from "./CuadroImagen.vue";
import CuadroTexto from "./CuadroTexto.vue";
export default {
  components: { CuadroTexto, CuadroImagen },
  name: "Pagina",
  props: {
    estaPagina: Object,
    numPagina: Number,

    idLibro:String,
  },
  data() {
    return {
     

      zElementos: 100,
    };
  },
  computed: {
    estilo() {
      return {
        
        backgroundColor: this.estaPagina.color,
      };
    },
  },
};
</script>

<style scoped>
.pagina {
  border: 2px solid black;
  position: relative;
  width: 100%;
  height: 100%;
}

.elementoPagina {
  position: absolute;
}

.numPagina {
  color: gray;
  user-select: none;
  position: absolute;
}
</style>