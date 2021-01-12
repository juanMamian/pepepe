<template>
  <div class="actividadesProfes">
    <div id="vistaProfe">
      <div id="barraGrupos">
        <div
          class="selectorGrupoEstudiantil"
          :key="grupo.id"
          v-for="grupo of gruposEstudiantiles"
        >
          {{ grupo.nombre }}
        </div>
      </div>
      <div id="contenidosGrupos">
          <contenido-grupo-profe v-for="grupo of gruposEstudiantiles" :key="grupo.id" :esteGrupo="grupo"/>
      </div>
    </div>
  </div>
</template>

<script>
import gql from "graphql-tag";
import ContenidoGrupoProfe from './actividadesProfes/ContenidoGrupoProfe.vue';
export default {
  name: "ActividadesProfe",
  components:{
    ContenidoGrupoProfe

  },
  apollo: {
    gruposEstudiantiles: {
      query: gql`
        query {
          gruposEstudiantiles {
            id
            nombre            
          }
        }
      `,
      update: function({gruposEstudiantiles}){
          console.log(`Respuesta. ${JSON.stringify(gruposEstudiantiles)}`);
          return gruposEstudiantiles;
      }
    },
  },
  data() {
    return {
      gruposEstudiantiles: [],
    };
  },
};
</script>

<style scoped>
#vistaProfe {
  width: 100%;
  height: 100%;
  display: grid;
  grid-template-columns: 150px 1fr;
}

#barraGrupos {
  grid-column: 1/2;
  background-color: burlywood;
}
.selectorGrupoEstudiantil {
  font-size: 18px;
  padding: 10px 10px;
  cursor: pointer;
}
.selectorGrupoEstudiantil:hover {
  background-color: cornsilk;
}

#contenidoGrupo {
  grid-column: 2/3;
}
</style>