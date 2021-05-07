<template>
  <div id="app">
    <center><h2>Taller de creación de cuentos</h2></center>
    <todos-libros
      ref="todosLibros"
      v-if="usuarioSuperadministrador"
      :URLLibrosolo="URLLibrosolo"
      @elimineUnLibro="removerLibroCache"
      @libroSeleccionado="seleccionarLibro"
      :idLibroSeleccionado="idLibroSeleccionado"
    />
    <libros-publicos
      ref="librosPublicos"
      v-if="usuarioLogeado"
      :URLLibrosolo="URLLibrosolo"
      @elimineUnLibro="removerLibroCache"
      @libroSeleccionado="seleccionarLibro"
      :idLibroSeleccionado="idLibroSeleccionado"
    />
    <mis-libros
      :URLLibrosolo="URLLibrosolo"
      @libroSeleccionado="seleccionarLibro"
      ref="misLibros"
    />

    <libro
      :idLibro="idLibroSeleccionado"
      v-if="idLibroSeleccionado != null"
      ref="elLibro"
      :key="idLibroSeleccionado"
    />
  </div>
</template>

<script>
import { gql } from "apollo-server-core";
import Libro from "./components/Libro.vue";
import MisLibros from "./components/MisLibros.vue";
import TodosLibros from "./components/TodosLibros.vue";
import LibrosPublicos from "./components/LibrosPublicos.vue";

export const QUERY_YO = gql`
  query {
    yo {
      id
      nombres
      apellidos
      permisos
      foros {
        idForo
        conversaciones {
          idConversacion
          respuestasLeidas
        }
      }
    }
  }
`;

export default {
  name: "App",
  components: {
    Libro,
    MisLibros,
    TodosLibros,
    LibrosPublicos,
  },
  apollo: {
    yo: {
      query: QUERY_YO,
      fetchPolicy: "network-only",
      update({ yo }) {
        this.$store.commit("setInfoForosUsuario", yo.foros);
        return yo;
      },
      skip() {
        return !this.usuarioLogeado;
      },
    },
  },
  data() {
    return {
      idLibroSeleccionado: null,
    };
  },
  methods: {
    seleccionarLibro(idLibro) {
      this.idLibroSeleccionado = idLibro;
      this.$nextTick(function () {
        this.$refs.elLibro.$el.scrollIntoView({ behavior: "smooth" });
      });
    },
    removerLibroCache(idLibro) {
      this.$refs.misLibros.removerLibroCache(idLibro);
      this.$refs.librosPublicos.removerLibroCache(idLibro);
      this.$refs.todosLibros.removerLibroCache(idLibro);
    },
  },
  computed: {
    usuarioSuperadministrador() {
      if (
        this.usuario &&
        this.usuario.id &&
        this.usuario.permisos.includes("superadministrador")
      ) {
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
    URLLibrosolo() {
      return process.env.NODE_ENV === "production"
        ? "https://pe-pe-pe.herokuapp.com/libro"
        : "http://localhost:8082";
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
    //Seleccionar libro by URL

    const idLibroURL = params.get("l");
    if (idLibroURL) {
      this.idLibroSeleccionado = idLibroURL;
      this.$nextTick(function () {
        this.$refs.elLibro.$el.scrollIntoView({ behavior: "smooth" });
      });
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
