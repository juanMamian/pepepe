<template>
  <div
    class="todosMateriales"
    @click="
      idMaterialSeleccionado = null;
      idTrabajoVisible = null;
    "
  >
    <div id="listaMateriales">
      <div
        class="bloqueProyecto"
        v-for="proyecto of proyectos"
        :key="proyecto.id"
        v-show="proyecto.materiales && proyecto.materiales.length>0"
      >
        <div class="nombreProyecto">{{ proyecto.nombre }}</div>
        <div
          class="filaMaterial"
          v-for="material of proyecto.materiales"
          :key="material.id"
        >
          <material-trabajo
            :seleccionado="idMaterialSeleccionado == material.id"
            :usuarioResponsableTrabajo="false"
            :esteMaterial="material"
            @click.native.stop="idMaterialSeleccionado = material.id; idTrabajoVisible=null"
          />
          <div class="bloqueOpcionesMaterial">
            <img
              src="@/assets/iconos/iconoTrabajo.png"
              alt="abrir página"
              class="opcionMaterial"
              @click.left.stop="idTrabajoVisible = material.idTrabajoParent"
            />
          </div>
        </div>
      </div>

      <icono-trabajo
        id="trabajoVisible"
        :idTrabajo="idTrabajoVisible"
        v-show="idTrabajoVisible != null"
        @click.native.stop=""
      />
    </div>
  </div>
</template>



<script>
import gql from "graphql-tag";
import MaterialTrabajo from "./trabajos/Material.vue";
import IconoTrabajo from "./proyecto/IconoTrabajo.vue";

const QUERY_PROYECTOS = gql`
  query {
    proyectos {
      id
      nombre
      materiales {
        id
        nombre
        descripcion
        cantidadNecesaria
        cantidadDisponible
        idTrabajoParent
      }
    }
  }
`;

export default {
  components: { MaterialTrabajo, IconoTrabajo },
  name: "todosMateriales",
  apollo: {
    proyectos: {
      query: QUERY_PROYECTOS,
    },
  },
  data() {
    return {
      proyectos: [],
      idMaterialSeleccionado: null,
      idTrabajoVisible: null,
    };
  },
};
</script>

<style scoped>
#listaMateriales {
    position:relative;
  padding: 5px 10px;
}
.filaMaterial {
  display: grid;
  grid-template-columns: 1fr 100px;
}
.nombreProyecto {
  background-color: cadetblue;
  
}
.materialTrabajo {
  grid-column: 1/2;
}
.opcionMaterial{
    width: 20px;
    height: 20px;
    border-radius: 50%;
    padding: 2px;
    cursor: pointer;
}
.opcionMaterial:hover{
    background-color: cadetblue;
}

#trabajoVisible{
    position: absolute;
    top: 100px;
    width: 90%;
    left: 5%;
}
</style>