<template>
  <div id="misLibros">
    <h3>Mis libros</h3>
    <div id="controlesMisLibros">
      <img
        src="@/assets/iconos/libro.png"
        class="bControlMisLibros"
        title="Crear nuevo libro"
        @click="crearNuevoLibro"
      />
    </div>

    <div id="listaMisLibros">
      <div
        class="portadaLibro"
        v-for="portada of misLibros"
        :key="portada.id"
        @click="seleccionarLibro(portada.id)"
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
            src="@/assets/iconos/share.png"
            alt="Compartir"
            title="Compartir este libro en la sección de libros públicos"
            class="controlLibro"
            v-show="usuarioSuperadministrador"
            :style="{ backgroundColor: portada.publico ? 'green' : '' }"
            @click.stop="setLibroPublico(portada.id, !portada.publico)"
          />
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
</template>

<script>
import { gql } from "apollo-server-core";

const QUERY_MIS_LIBROS = gql`
  query {
    misLibros {
      id
      titulo
      publico
    }
  }
`;

export default {
  name: "MisLibros",
  apollo: {
    misLibros: {
      query: QUERY_MIS_LIBROS,
      skip() {
        return this.usuario.id == null;
      },
    },
  },
  props: {
    URLLibrosolo: String,
  },
  data() {
    return {};
  },
  methods: {
    crearNuevoLibro() {
      if (!confirm("¿Crear un nuevo libro?")) return;

      this.$apollo
        .mutate({
          mutation: gql`
            mutation {
              crearNuevoLibro {
                id
                titulo
                publico
              }
            }
          `,
        })
        .then(({ data: { crearNuevoLibro } }) => {
          console.log(`Creado ${JSON.stringify(crearNuevoLibro)}`);
          const store = this.$apollo.provider.defaultClient;
          const cache = store.readQuery({
            query: QUERY_MIS_LIBROS,
          });
          var nuevoCache = JSON.parse(JSON.stringify(cache));
          if (!nuevoCache.misLibros.some((l) => l.id == crearNuevoLibro.id)) {
            nuevoCache.misLibros.push(crearNuevoLibro);
            store.writeQuery({
              query: QUERY_MIS_LIBROS,
              data: nuevoCache,
            });
          } else {
            console.log(`El libro ya estaba incluido en el caché`);
          }
        });
    },
    removerLibroCache(idLibro) {
      const store = this.$apollo.provider.defaultClient;
      const cache = store.readQuery({
        query: QUERY_MIS_LIBROS,
      });
      var nuevoCache = JSON.parse(JSON.stringify(cache));

      const indexL = nuevoCache.misLibros.findIndex((l) => l.id == idLibro);
      if (indexL > -1) {
        nuevoCache.misLibros.splice(indexL, 1);
        store.writeQuery({
          query: QUERY_MIS_LIBROS,
          data: nuevoCache,
        });
      } else {
        console.log(`Libro no estaba en caché`);
      }
    },
    seleccionarLibro(idLibro) {
      this.$emit("libroSeleccionado", idLibro);
    },
    setLibroPublico(idLibro, nuevoEstado) {
      console.log(`Settin estado público de ${idLibro} en ${nuevoEstado}`);
      //De una vez se cambia en el caché
      const store = this.$apollo.provider.defaultClient;
      const cache = store.readQuery({
        query: QUERY_MIS_LIBROS,
      });
      var nuevoCache = JSON.parse(JSON.stringify(cache));
      var laPortada = nuevoCache.misLibros.find((p) => p.id == idLibro);
      if (!laPortada) {
        console.log(`Libro no estaba en caché`);
        return;
      }
      laPortada.publico = nuevoEstado;
      store.writeQuery({
        query: QUERY_MIS_LIBROS,
        data: nuevoCache,
      });
      this.$apollo
        .mutate({
          mutation: gql`
            mutation($idLibro: ID!, $nuevoEstado: Boolean!) {
              setLibroPublico(idLibro: $idLibro, nuevoEstado: $nuevoEstado)
            }
          `,
          variables: {
            idLibro,
            nuevoEstado,
          },
        })
        .then(({ data: { setLibroPublico } }) => {
          if (setLibroPublico) {
            const store = this.$apollo.provider.defaultClient;
            const cache = store.readQuery({
              query: QUERY_MIS_LIBROS,
            });
            var nuevoCache = JSON.parse(JSON.stringify(cache));
            var laPortada = nuevoCache.misLibros.find((p) => p.id == idLibro);
            if (!laPortada) {
              console.log(`Libro no estaba en caché`);
              return;
            }
            laPortada.publico = nuevoEstado;
            store.writeQuery({
              query: QUERY_MIS_LIBROS,
              data: nuevoCache,
            });
          }
        }).catch((error)=>{
          console.log(`Error. E: ${error}`);
          const store = this.$apollo.provider.defaultClient;
            const cache = store.readQuery({
              query: QUERY_MIS_LIBROS,
            });
            var nuevoCache = JSON.parse(JSON.stringify(cache));
            var laPortada = nuevoCache.misLibros.find((p) => p.id == idLibro);
            if (!laPortada) {
              console.log(`Libro no estaba en caché`);
              return;
            }
            laPortada.publico = !nuevoEstado;
            store.writeQuery({
              query: QUERY_MIS_LIBROS,
              data: nuevoCache,
            });
        });
    },
  },
};
</script>

<style scoped>
#misLibros {
  padding: 10px;
  border: 2px solid cadetblue;
  margin: 10px;
  border-radius: 15px;
  padding: 15px;
  font-size: 22px;
}

.bControlMisLibros {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  cursor: pointer;
  margin: 5px 10px;
}
.bControlMisLibros:hover {
  background-color: rgb(241, 153, 241);
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