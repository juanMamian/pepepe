<template>
  <div id="misLibros">
    <h4
      style="cursor: pointer"
      class="tituloZona"
      @click="desplegado = !desplegado"
    >
     <div class="trianguloBullet" :style="{transform: desplegado?'rotateZ(90deg)':'rotateZ(0deg)'}"></div>
      Mis libros
    </h4>
    <div id="controlesMisLibros" v-show="desplegado">
      <img
        src="@/assets/iconos/libro.png"
        class="bControlMisLibros"
        title="Crear nuevo libro"
        v-show="!creandoNuevoLibro"
        @click="crearNuevoLibro"
      />
      <img src="@/assets/iconos/loading.png" alt="Cargando" style="width:15px" v-show="creandoNuevoLibro">
    </div>
    <img
      src="@/assets/iconos/loading.png"
      alt="Cargando"
      class="simboloLoading"
      style="width: 20px; margin: 10px auto; display: block"
      v-show="desplegado && $apollo.queries.misLibros.loading"
    />

    <div id="listaMisLibros" v-show="desplegado">
      <div
        class="portadaLibro"
        v-for="portada of misLibros"
        :key="portada.id"
        @click="seleccionarLibro(portada.id)"
      >
        <div class="nombreLibro">
          {{ portada.titulo }}
        </div>
        <div class="controlesLibro" @click.stop="">
          <img
            src="@/assets/iconos/delete.png"
            alt="Eliminar"
            title="Eliminar este libro"
            class="controlLibro"
            v-show="usuarioSuperadministrador"
            @click.stop="eliminarLibro(portada.id)"
          />
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
            :style="{ backgroundColor: portada.publico ? 'green' : '' }"
            @click.stop="setLibroPublico(portada.id, !portada.publico)"
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
      idsEditores
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
    return {
      desplegado: true,
      creandoNuevoLibro:false,
    };
  },
  methods: {
    crearNuevoLibro() {
      if (!confirm("¿Crear un nuevo libro?")) return;
      this.creandoNuevoLibro=true;
      this.$apollo
        .mutate({
          mutation: gql`
            mutation {
              crearNuevoLibro {
                id
                titulo
                publico
                idsEditores
              }
            }
          `,
        })
        .then(({ data: { crearNuevoLibro } }) => {
          console.log(`Creado ${JSON.stringify(crearNuevoLibro)}`);
          this.creandoNuevoLibro=false;
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

          this.seleccionarLibro(crearNuevoLibro.id)
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

            this.$emit("toggleLibroPublico", {libro: this.misLibros.find(p=>p.id==idLibro), nuevoEstado})
          }
        })
        .catch((error) => {
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
</style>