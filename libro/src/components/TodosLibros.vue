<template>
  <div id="todosLibros">
    <h3>Todos los libros</h3>
    <div id="controlesTodosLibros">
      
    </div>

    <div id="listaMisLibros">
        <div class="portadaLibro" v-for="portada of todosLibros" :key="portada.id" @click="seleccionarLibro(portada.id)">
            {{portada.titulo}}
            <icono-persona-autonomo v-for="editor of portada.idsEditores" :key="editor" :idPersona="editor"/>
        </div>
    </div>
  </div>
</template>

<script>
import { gql } from "apollo-server-core";
import IconoPersonaAutonomo from './IconoPersonaAutonomo.vue';

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
  data() {
    return {
    };
  },
  methods: {    
    seleccionarLibro(idLibro){
        this.$emit("libroSeleccionado", idLibro);
    }
  },
  computed:{
      usuarioSuperadministrador(){
          if(!this.usuario || !this.usuario.permisos){
              console.log(`Datos insuficientes para decidir si usuario es súperadministrador`);
              return false
          }
          console.log(`Usuario tiene permisos: ${this.usuario.permisos}`);
          return this.usuario.permisos.includes("superadministrador");
      }
  }
  
};
</script>

<style scoped>
#todosLibros {
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

.portadaLibro{
    padding: 5px 10px;
    font-size: inherit;
    cursor:pointer;
    padding-bottom:80px;

}
.portadaLibro:hover{
    background-color: rgba(128, 0, 128, 0.233);
}
</style>