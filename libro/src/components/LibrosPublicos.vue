<template>
  <div id="librosPublicos">
    <h3 style="cursor: pointer" @click="desplegado = !desplegado">
      Libros publicos
    </h3>
    <div id="controlesLibrosPublicos"></div>

    <div id="listaLibrosPublicos" v-show="desplegado">
      <div
        class="bloqueAutor"
        v-for="(listaLibros, idAutor) of librosPorAutor"
        :key="idAutor"
      >
        <icono-persona-autonomo :idPersona="idAutor" />
        <br />
        <br />
        <br />
        <div class="listaLibros">
          <div
            class="portadaLibro"
            v-for="portada of listaLibros"
            :key="portada.id"
            @click="seleccionarLibro(portada.id)"
            :class="{ seleccionado: idLibroSeleccionado == portada.id }"
          >
            <div class="nombreLibro">
              {{ portada.titulo }}
            </div>
            <div class="controlesLibro">
              <a :href="URLLibrosolo + '?id=' + portada.id" target="_blank">
                <img
                  src="@/assets/iconos/libroAbierto.png"
                  class="controlLibro"
                  alt="Libro"
                  title="Ver libro"                  
                />
              </a>
              <img
                src="@/assets/iconos/delete.png"
                alt="Eliminar"
                title="Eliminar este libro"
                class="controlLibro"
                v-show="usuarioSuperadministrador"
                @click.stop="eliminarLibro(portada.id)"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { gql } from "apollo-server-core";
import IconoPersonaAutonomo from "./IconoPersonaAutonomo.vue";

const QUERY_LIBROS_PUBLICOS = gql`
  query {
    librosPublicos {
      id
      titulo
      idsEditores
    }
  }
`;

export default {
  components: { IconoPersonaAutonomo },
  name: "LibrosPublicos",
  apollo: {
    librosPublicos: {
      query: QUERY_LIBROS_PUBLICOS,
      skip() {
        return !this.usuarioLogeado;
      },
    },
  },
  props: {
    idLibroSeleccionado: String,
    URLLibrosolo: String,
  },
  data() {
    return {
      desplegado: false,
    };
  },
  methods: {
    seleccionarLibro(idLibro) {
      this.$emit("libroSeleccionado", idLibro);
    },
    removerLibroCache(idLibro) {
      const store = this.$apollo.provider.defaultClient;
      const cache = store.readQuery({
        query: QUERY_LIBROS_PUBLICOS,
      });
      var nuevoCache = JSON.parse(JSON.stringify(cache));

      const indexL = nuevoCache.librosPublicos.findIndex((l) => l.id == idLibro);
      if (indexL > -1) {
        nuevoCache.librosPublicos.splice(indexL, 1);
        store.writeQuery({
          query: QUERY_LIBROS_PUBLICOS,
          data: nuevoCache,
        });
      } else {
        console.log(`Libro no estaba en caché`);
      }
    },
    eliminarLibro(idLibro) {
      if (!confirm("Eliminando un libro. ¿Continuar?")) return;

      this.$apollo
        .mutate({
          mutation: gql`
            mutation($idLibro: ID!) {
              eliminarLibro(idLibro: $idLibro)
            }
          `,
          variables: {
            idLibro,
          },
        })
        .then(({ data: { eliminarLibro } }) => {
          if (eliminarLibro) {
            this.$emit("elimineUnLibro", idLibro);
          }
        })
        .catch((error) => {
          console.log(`Error. E: ${error}`);
        });
    },
  },
  computed: {
    usuarioSuperadministrador() {
      if (!this.usuario || !this.usuario.permisos) {
        console.log(
          `Datos insuficientes para decidir si usuario es súperadministrador`
        );
        return false;
      }      
      return this.usuario.permisos.includes("superadministrador");
    },
    librosPorAutor() {
      var objetoFinal = {};
      if (!this.librosPublicos) {
        return objetoFinal;
      }
      this.librosPublicos.forEach((libro) => {
        let idAutor = libro.idsEditores[0];
        if (!objetoFinal[idAutor]) {
          objetoFinal[idAutor] = [libro];
        } else {
          objetoFinal[idAutor].push(libro);
        }
      });
      return objetoFinal;
    },
  },
};
</script>

<style scoped>
#librosPublicos {
  padding: 10px;
  border: 2px solid cadetblue;
  margin: 10px;
  border-radius: 15px;
  padding: 15px;
  font-size: 22px;
}

.bControlTodosLibros {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  cursor: pointer;
  margin: 5px 10px;
}
.bControlTodosLibros:hover {
  background-color: rgb(241, 153, 241);
}

.bloqueAutor {
  padding: 20px 0px;
  margin: 20px 0px;
  background-color: rgba(128, 128, 128, 0.404);
  border-radius: 20px;
}

.iconoPersonaAutonomo {
  margin: 5px 25px;
}

.portadaLibro {
  padding: 5px 10px;
  font-size: inherit;
  cursor: pointer;
  padding-bottom: 20px;
  display: grid;
  grid-template-columns: 200px 1fr 200px;
  grid-template-areas: "nombre ... controles";
}
.portadaLibro:hover {
  background-color: rgba(128, 0, 128, 0.233);
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
}

.portadaLibro:hover > .controlesLibro {
  visibility: visible;
}
.controlLibro {
  width: 29px;
  
  border-radius: 50%;
  cursor: pointer;
  margin: 0px 10px;
}
.controlLibro:hover {
  background-color: gray;
}
</style>