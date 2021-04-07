<template>
  <div id="app">
    <center><h2>Taller de creación de cuentos</h2></center>
    <todos-libros v-if="usuarioSuperadministrador" @libroSeleccionado="seleccionarLibro" />
    <mis-libros @libroSeleccionado="seleccionarLibro" />

    <libro :idLibro="idLibroSeleccionado" v-if="idLibroSeleccionado != null" ref="elLibro"/>
  </div>
</template>

<script>
import Libro from "./components/Libro.vue";
import MisLibros from "./components/MisLibros.vue";
import TodosLibros from "./components/TodosLibros.vue";

export default {
  name: "App",
  components: {
    Libro,
    MisLibros,
    TodosLibros,
  },
  data() {
    return {
      idLibroSeleccionado: null,
    };
  },
  methods: {
    seleccionarLibro(idLibro) {
      this.idLibroSeleccionado = idLibro;
      this.$nextTick(function(){
        this.$refs.elLibro.$el.scrollIntoView({behavior:'smooth'});
      })
    },
  },
  computed: {
    usuarioSuperadministrador() {

      if(this.usuario && this.usuario.id && this.usuario.permisos.includes("superadministrador")){
        return true;
      }
      return false;

      // if (!this.usuario || !this.usuario.permisos) {
      //   console.log(
      //     `Datos insuficientes para decidir si usuario es súperadministrador`
      //   );
      //   return false;
      // }
      // console.log(`Usuario tiene permisos: ${this.usuario.permisos}`);
      // return this.usuario.permisos.includes("superadministrador");
    },
  },
  mounted() {
    let uri = window.location.search.substring(1);
    let params = new URLSearchParams(uri);

    this.idLibro = params.get("id");
    const token = params.get("t");

    if (token && token.length > 10) {
      this.$store.commit("setToken", token);
      this.$store.commit("setUserInfo", token);

      localStorage.setItem("token", token);
    } else {
      this.$store.commit("deslogearse");
      localStorage.clear();
    }
  },
};
</script>

<style>
body {
  background-color: rgb(228 227 227);
}
.letrasRojas {
  color: red;
}
.deshabilitado {
  opacity: 0.5;
  pointer-events: none;
}
</style>
