<template>
  <div class="nodoConocimiento" :style="imgFondo"></div>
</template>

<script>
export default {
  name: "NodoConocimiento",
  props: {
    info: {
      type: Object,
      required: true,
    },
  },
  computed:{
      imgFondo(){
          return {
              backgroundImage: "url('http://localhost:3000/api/atlas/iconos/"+this.info.id+"')" 
          }
      }
  }

};
</script>

<style>
.nodoConocimiento {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  border: 2px solid red;
  background-size: 100% 100%;
  cursor: pointer;
}
</style>