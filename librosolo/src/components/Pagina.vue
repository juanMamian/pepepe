<template>
  <div class="pagina"></div>
</template>

<script>
export default {
  name: "Pagina",
  props: {
    estaPagina: Object,
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
</style>