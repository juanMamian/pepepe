<template>
  <div id="listaMateriales" class="lista">
    <info-material
      v-for="material of todosMateriales"
      v-show="!idNodoSeleccionado || idNodoSeleccionado===material.idTrabajoParent || descendientesNodoSeleccionado.includes(material.idTrabajoParent)"
      :key="material.id"
      :esteMaterial="material"
      @centrarEnNodo="$emit('centrarEnNodo', $event)"
    />
  </div>
</template>

<script>
import gql from "graphql-tag";
import InfoMaterial from "./InfoMaterial.vue";

const QUERY_MATERIALES = gql`
  query {
    todosMateriales {
      id
      nombre
      descripcion
      cantidadNecesaria
      cantidadDisponible
      idTrabajoParent
    }
  }
`;

export default {
  components: { InfoMaterial },
  name: "ListaMateriales",
  apollo: {
    todosMateriales: {
      query: QUERY_MATERIALES,
    },
  },
  props: {
    idNodoSeleccionado: String,
    descendientesNodoSeleccionado:Array,
    cerrarVentana: Number,
  },
  data() {
    return {
      todosMateriales: [],
    };
  },
};
</script>

<style scoped>
#listaMateriales {
  max-height: 85%;
  padding: 10px 0px;
  border-radius: 10px;
  
  overflow-y:scroll ;
}
</style>