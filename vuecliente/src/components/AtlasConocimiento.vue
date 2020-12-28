<template>
  <div id="atlasConocimiento">
    <nodo-conocimiento :key="nodo._id" v-for="nodo of todosNodos" :info="nodo"/>
  </div>
</template>

<script>
import gql from "graphql-tag";
import NodoConocimiento from './atlasConocimiento/NodoConocimiento.vue';
export default {
  components: { NodoConocimiento },
  name: "AtlasConocimiento",
  apollo: {
    todosNodos: gql`
      query {
        todosNodos {
          nombre,
          id
        }
      }
    `,
    ping: gql`
    query{
      ping
    }
    `
  },
  data() {
    return {
      todosNodos: [],
      ping: ""
    };
  },
};
</script>

<style>
</style>