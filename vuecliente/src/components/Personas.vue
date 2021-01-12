<template>
  <div class="personas">
    <div id="listaPersonas">
      <icono-persona
        v-for="persona of personas"
        :key="persona.id"
        :estaPersona="persona"
      />
    </div>
  </div>
</template>

<script>
import gql from "graphql-tag";
import { fragmentoResponsables } from "./utilidades/recursosGql";
import IconoPersona from "./proyecto/IconoPersona";

export default {
  name: "Personas",
  components: {
    IconoPersona,
  },
  apollo: {
    personas: {
      query: gql`
        query {
          todosUsuarios {
            ...fragResponsables
          }
        }
        ${fragmentoResponsables}
      `,
      update: function({todosUsuarios}){
          return todosUsuarios
      }
    },
  },
  data() {
    return {
      personas: [],
    };
  },
};
</script>

<style scoped>
#listaPersonas{
    display: flex;
    padding: 20px 20px;
}
.iconoPersona{
    margin-left: 10px;
    margin-right:10px;
    border:1px solid black;
}
</style>