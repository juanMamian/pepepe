<template>
  <div class="personas">
    <div id="listaPersonas" @click="idPersonaMenuCx=null">
      <icono-persona
        v-for="persona of personas"
        :key="persona.id"
        :estaPersona="persona"
        @click.native.right.stop.prevent="idPersonaMenuCx=persona.id"
        :menuContextual="idPersonaMenuCx==persona.id"        
      >
      
      </icono-persona>
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
      idPersonaMenuCx:null
    };
  },
  methods:{
    copiarId(e) {
      let str=e.target.innerHTML.trim();
      const el = document.createElement("textarea");
      el.value = str;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    },
  }
};
</script>

<style scoped>
#listaPersonas{
    display: flex;
    padding: 20px 20px;
    padding-bottom: 50px;
    border: 2px solid purple;
}
.iconoPersona{
    margin-left: 10px;
    margin-right:10px;
    border:1px solid black;
}

</style>