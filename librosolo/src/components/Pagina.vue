<template>
  <div class="pagina" :style="estilo">
    <div class="numPagina">
      {{numPagina}}
    </div>

    <cuadro-texto v-for="cuadroTexto of estaPagina.cuadrosTexto" :key="cuadroTexto.id" :esteCuadroTexto="cuadroTexto"/>

  </div>
</template>

<script>
import CuadroTexto from './CuadroTexto.vue';
export default {
  components: { CuadroTexto },
  name: "Pagina",
  props: {
    estaPagina: Object,
    numPagina:Number,
  },
  data() {
    return {
      ancho: 450,
      alto: 600,          
      
      zElementos: 100,
    };
  },
  computed:{
    estilo(){
      return {
        width: this.ancho+"px",
        height: this.alto+"px",
        backgroundColor: this.estaPagina.color,

      }
    }
  }
};
</script>

<style scoped>
.pagina {
  border: 2px solid black;
  position: relative;
}

.elementoPagina {
  position: absolute;
}

.numPagina{
  color: gray;
  user-select: none;
  position: absolute;
}
</style>