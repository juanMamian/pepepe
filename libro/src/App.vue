<template>
  <div id="app">
    <center><h2>Taller de creación de cuentos</h2></center>
    <mis-libros @libroSeleccionado="seleccionarLibro"/>

    <libro :idLibro="idLibroSeleccionado" v-if="idLibroSeleccionado!=null"/>
  </div>
</template>

<script>
import Libro from './components/Libro.vue'
import MisLibros from './components/MisLibros.vue'


export default {
  name: 'App',
  components: {
    Libro,
    MisLibros,    
  },
  data(){
    return {
      idLibroSeleccionado:null,
    }
  },
  methods:{
    seleccionarLibro(idLibro){
      this.idLibroSeleccionado=idLibro;
    }
  },
  mounted() {
    let uri = window.location.search.substring(1);
    let params = new URLSearchParams(uri);

    this.idLibro = params.get("id");
    const token=params.get("t");
    console.log(`Token: ${token}`);

    if(token && token.length>10){
      this.$store.commit("setToken", token);
      this.$store.commit("setUserInfo", token);

      localStorage.setItem("token", token);
    }
    else{
      this.$store.commit("deslogearse");
      localStorage.clear();
    }
    
  },

}
</script>

<style>
body{
  background-color: rgb(228 227 227);
}
.letrasRojas{
  color:red;
}
.deshabilitado{
  opacity: 0.5;
  pointer-events: none;
}
</style>
