<template>
  <div class="adminNodosConocimiento">
    <div id="listaNodos">
        <nodo-conocimiento-vista-lista-admin v-for="nodo of nodosOrdenados" :key="nodo.id" :esteNodo="nodo" />
    </div>
  </div>
</template>

<script>
import gql from "graphql-tag";
import NodoConocimientoVistaListaAdmin from './NodoConocimientoVistaListaAdmin.vue';
const QUERY_NODOS = gql`
  query{
    todosNodos {
      id
      nombre
      secciones {
        id
        nombre
        enlace
        modo
      }
      expertos
    }
  }
  
`;

export default {
  components: { NodoConocimientoVistaListaAdmin },
  name: "AdminNodosConocimiento",
  apollo: {
    todosNodos: {
      query: QUERY_NODOS,            
      fetchPolicy: "cache-and-network",              
    },
  },
  data() {
    return {
      idNodoSeleccionado: null,
      todosNodos: [],
    };
  },
  computed:{
    nodosOrdenados(){
      if(!this.usuarioLogeado)return this.todosNodos;      
      return [...this.todosNodos].sort((a, b)=>{
        var res=0;
        if(a.expertos.includes(this.usuario.id)){
          res--;
        }
        if(b.expertos.includes(this.usuario.id)){
          res++;
        }
        return res;
      })
    }
  }
};
</script>

<style scoped>

#listaNodos{
    padding: 10px 10px;
    border: 1px solid black
}
</style>