<template>
    <div id="app">
        <center>
            <h2>Taller de creación de cuentos</h2>
        </center>
        <todos-libros ref="todosLibros" class="bloqueListaLibros" v-if="usuarioSuperadministrador"
            :URLLibrosolo="URLLibrosolo" @elimineUnLibro="removerLibroCache" @libroSeleccionado="seleccionarLibro"
            :idLibroSeleccionado="idLibroSeleccionado" />
        <libros-publicos ref="librosPublicos" v-if="usuarioLogeado" class="bloqueListaLibros" :URLLibrosolo="URLLibrosolo"
            @elimineUnLibro="removerLibroCache" @libroSeleccionado="seleccionarLibro"
            :idLibroSeleccionado="idLibroSeleccionado" />
        <mis-libros :URLLibrosolo="URLLibrosolo" class="bloqueListaLibros" @libroSeleccionado="seleccionarLibro"
            @toggleLibroPublico="$refs.librosPublicos.toggleLibro($event)" ref="misLibros" />

        <libro :idLibro="idLibroSeleccionado" v-if="idLibroSeleccionado != null" ref="elLibro" :key="idLibroSeleccionado" />
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

<style scoped>
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

<style>
.bloqueListaLibros {
    background-color: #ceccdc;
    border: 2px solid purple;
    border-radius: 6px;
}

.trianguloBullet {

    border: 10px solid transparent;
    border-left: 10px solid black;

    display: inline-block;
    margin-right: 20px;
    transform-origin: left center;
    transition: transform 0.2s;
}

.tituloZona {
    padding-left: 15px;
}

.boton {
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    flex-shrink: 0;
}

.boton img {
    height: 100%;
}

.boton svg {
    height: 100%;
}

.portadaLibro {
    padding: 5px 10px;
    font-size: inherit;
    cursor: pointer;
    padding-bottom: 20px;
    display: grid;
    grid-template-columns: 20px 200px 1fr 200px;
    grid-template-areas: "bullet nombre ... controles";
    background-color: rgb(128 128 128 / 11%)
}

.portadaLibro:hover {
    background-color: rgba(128, 0, 128, 0.233);
}

.bulletPortada {
    width: 10px;
    height: 10px;
    background-color: purple;
    border-radius: 50%;
    justify-self: center;
    align-self: center;
}

.nombreLibro {
    align-self: center;
}

.seleccionado {
    background-color: rgba(128, 0, 128, 0.233);
}

.nombreLibro {
    grid-area: nombre;
}

.controlesLibro {
    grid-area: controles;
    visibility: hidden;
    align-self: center;
}

.portadaLibro:hover>.controlesLibro {
    visibility: visible;
}

.controlLibro {
    width: 29px;
    float: right;
    border-radius: 50%;
    cursor: pointer;
    margin: 0px 10px;
}

.controlLibro:hover {
    background-color: gray;
}

.bloqueAutor {
    padding: 20px 0px;
    margin: 20px 0px;
    background-color: rgb(128 128 128 / 11%);

}

.iconoPersonaAutonomo {
    margin: 5px 25px;
}

.simboloLoading {
    animation: girar 1.5s;
    animation-iteration-count: infinite;
    animation-timing-function: linear;
    pointer-events: none;
    user-select: none;
}

@keyframes girar {
    0% {
        transform: rotateZ(0deg);
    }

    100% {
        transform: rotateZ(360deg);
    }
}
</style>
