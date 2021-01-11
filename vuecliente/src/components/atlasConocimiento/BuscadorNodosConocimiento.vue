<template>
  <div id="buscadorNodosConocimiento">
    <input type="text" placeholder="Buscar" v-model="palabraBuscada" />
    <img id="imagenTentativa" src="" alt="" />
    <div class="opciones">
      <div class="opcion" :key="opcion.id" v-for="opcion of opciones">{{opcion.nombre}}</div>
    </div>
  </div>
</template>

<script>
var charProhibidosNombre = /[^ a-zA-ZÀ-ž0-9_():.,-]/g;

export default {
  name: "BuscadorNodosConocimiento",
  data(){
      return{
          opciones:null,
          palabraBuscada:""
      }
  },
  watch: {
    palabraBuscada: function (nueva, anterior) {
    nueva=nueva.trim();
    nueva=nueva.replace(charProhibidosNombre, "");
    nueva = nueva.replace(/\s\s+/g, " ");

    let palabras=nueva.split("\\s+");
    let palabrasValidas=[];
    let indexValidas=0;
    for(let i=0; i<palabras.length;i++){
        if(palabras[i].length>=3){
            palabrasValidas[indexValidas]=palabras[i];
            indexValidas++;
        }
    }

      }
    },
  },
};
</script>

<style scoped>
</style>