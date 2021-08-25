<template>
  <div class="infoMaterial">
    <div id="barraPrincipal">
      <div class="nombreMaterial">
        {{ esteMaterial.nombre }}
      </div>
      <div class="botonesDerecha">
        <img
          src="@/assets/iconos/responsableTrabajo.png"
          alt="Materiales"
          title="Responsables"
          class="botonResponsablesTrabajoParent botonDerecha"
          @click.stop="mostrandoResponsables = !mostrandoResponsables"
        />
        <img
          src="@/assets/iconos/iconoTrabajo.png"
          alt="Trabajo de orígen"
          class="botonNodo botonDerecha"
          v-if="esteMaterial.idTrabajoParent"
          @click.stop="$emit('centrarEnNodo', esteMaterial.idTrabajoParent)"
        />
      </div>
    </div>

    <div id="listaResponsables" v-show="mostrandoResponsables" @click.stop="idResponsableSeleccionado=null">
      <icono-persona-autonomo
        v-for="idResponsable of idsResponsablesNodoOrigen"
        :key="idResponsable"
        :idPersona="idResponsable"
        :seleccionado="idResponsableSeleccionado == idResponsable"
        :factorEscala="'0.7'"
        @click.native.stop="
          idResponsableSeleccionado = idResponsable;          
        "
      />
    </div>
  </div>
</template>

<script>
import gql from 'graphql-tag';
import IconoPersonaAutonomo from "../usuario/IconoPersonaAutonomo.vue";


const QUERY_RESPONSABLES_NODO_ORIGEN=gql`
    query($idTrabajo:ID!){
        trabajo(idTrabajo:$idTrabajo){
            id
            responsables
        }
    }
`

export default {
  components: { IconoPersonaAutonomo },
  name: "InfoMaterial",
  apollo: {
      idsResponsablesNodoOrigen:{
          query:QUERY_RESPONSABLES_NODO_ORIGEN,
          variables(){
              return {
                  idTrabajo:this.esteMaterial.idTrabajoParent
              }
          },
          update(data){
              return data.trabajo.responsables
          },
          skip(){
              return !this.mostrandoResponsables
          }
      }
  },
  props: {
    esteMaterial: Object,
  },
  data() {
    return {
      mostrandoResponsables: false,
      idResponsableSeleccionado:null,
      idsResponsablesNodoOrigen:[],
    };
  },
};
</script>

<style scoped>
.infoMaterial {
  background-color: rgb(231, 162, 112);
  padding: 5px 10px;
}
#barraPrincipal {
  display: flex;
}
.botonesDerecha {
  margin-left: auto;
}
.infoMaterial:hover {
  background-color: rgb(201, 122, 67);
}
.botonDerecha {
  cursor: pointer;
  width: 20px;
  border-radius: 50%;
}
.botonDerecha:hover {
  background-color: rgb(221, 160, 117);
}
#listaResponsables{
    display: flex;
    flex-wrap: wrap;
    padding-bottom: 50px;
}
.iconoPersonaAutonomo{
    position: relative;
}
</style>