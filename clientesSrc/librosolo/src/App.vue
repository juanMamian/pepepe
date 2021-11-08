<template>
  <div id="app">
    <libro :idLibro="idLibroSeleccionado"/>

  </div>
</template>

<script>
import Libro from './components/Libro.vue';


export default {
  components: { Libro },
  name: 'App',
  data(){
    return {
      idLibroSeleccionado:null,
    }
  },
  mounted() {
    let uri = window.location.search.substring(1);
    let params = new URLSearchParams(uri);    
    
    //Seleccionar libro by URL

    const idLibroURL=params.get("id");
    if(idLibroURL){
      this.idLibroSeleccionado=idLibroURL;    
    }
  },  
}
</script>

<style>
#app {
}
</style>
