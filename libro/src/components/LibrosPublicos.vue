<template>
  <div id="librosPublicos">
    <h4
      style="cursor: pointer"
      class="tituloZona"
      @click="desplegado = !desplegado"
    >
      <div
        class="trianguloBullet"
        :style="{ transform: desplegado ? 'rotateZ(90deg)' : 'rotateZ(0deg)' }"
      ></div>
      Libros publicos
    </h4>
    <div id="controlesLibrosPublicos"></div>
    <img
      src="@/assets/iconos/loading.png"
      alt="Cargando"
      class="simboloLoading"
      style="width: 20px; margin: 10px auto; display: block"
      v-show="desplegado && $apollo.queries.librosPublicos.loading"
    />

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

      const indexL = nuevoCache.librosPublicos.findIndex(
        (l) => l.id == idLibro
      );
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
    toggleLibro({libro, nuevoEstado}){
      const publico=nuevoEstado;
      console.log(`Toggling libro en la lista de libros publicos. Estado: ${publico}`);
      const store=this.$apollo.provider.defaultClient;
      const cache=store.readQuery({
        query: QUERY_LIBROS_PUBLICOS
      });
      var nuevoCache=JSON.parse(JSON.stringify(cache));

      if(publico){          
        if(!nuevoCache.librosPublicos.some(p=>p.id==libro.id)){
          console.log(`Pushing libro a la lista de libros públicos`);
          nuevoCache.librosPublicos.push(libro);
          store.writeQuery({
            query:QUERY_LIBROS_PUBLICOS,
            data:nuevoCache
          });
        }
        else{
          console.log(`El libro ya estaba en la lista de libros públicos`);
        }
      }
      else{
        const indexP=nuevoCache.librosPublicos.findIndex(p=>p.id==libro.id)
        if(indexP>-1){
          nuevoCache.librosPublicos.splice(indexP, 1);
          store.writeQuery({
            query:QUERY_LIBROS_PUBLICOS,
            data:nuevoCache
          });
        }
      }
    }
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
</style>