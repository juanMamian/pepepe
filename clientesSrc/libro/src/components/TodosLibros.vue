<template>
  <div id="todosLibros">
    <h4
      style="cursor: pointer"
      class="tituloZona"
      @click="desplegado = !desplegado"
    >
     <div class="trianguloBullet" :style="{transform: desplegado?'rotateZ(90deg)':'rotateZ(0deg)'}"></div>
      Todos los libros
    </h4>
    <div id="controlesTodosLibros"></div>

    <img
      src="@/assets/iconos/loading.png"
      alt="Cargando"
      class="simboloLoading"
      style="width: 20px; margin: 10px auto; display: block"
      v-show="desplegado && $apollo.queries.todosLibros.loading"
    />

    <div id="listaMisLibros" v-show="desplegado">
      <div
        class="bloqueAutor"
        v-for="(listaLibros, idAutor) of librosPorAutor"
        :key="idAutor"
      >
        <icono-persona-autonomo :idPersona="idAutor" v-if="idAutor!='sinAutor'"/>
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
            <div class="bulletPortada"></div>

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
              <a
                :href="URLLibrosolo + '?id=' + portada.id"
                target="_blank"                
              >
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

const QUERY_TODOS_LIBROS = gql`
  query {
    todosLibros {
      id
      titulo
      idsEditores
    }
  }
`;

export default {
  components: { IconoPersonaAutonomo },
  name: "TodosLibros",
  apollo: {
    todosLibros: {
      query: QUERY_TODOS_LIBROS,
      skip() {
        return !this.usuarioSuperadministrador;
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
        query: QUERY_TODOS_LIBROS,
      });
      var nuevoCache = JSON.parse(JSON.stringify(cache));

      const indexL = nuevoCache.todosLibros.findIndex((l) => l.id == idLibro);
      if (indexL > -1) {
        nuevoCache.todosLibros.splice(indexL, 1);
        store.writeQuery({
          query: QUERY_TODOS_LIBROS,
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
      var objetoFinal = {
        sinAutor:[]
      };
      if (!this.todosLibros) {
        return objetoFinal;
      }
      this.todosLibros.forEach((libro) => {  
        if(libro.idsEditores.length<1){
          objetoFinal.sinAutor.push(libro);
        }      
        else{
          let idAutor = libro.idsEditores[0];
          if (!objetoFinal[idAutor]) {
            objetoFinal[idAutor] = [libro];
          } else {
            objetoFinal[idAutor].push(libro);
          }
        }
        
      });
      return objetoFinal;
    },
  },
};
</script>

<style scoped>
</style>