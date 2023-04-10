<template>
  <div class="actividadEspecifica">
    <icono-persona :estaPersona="laActividad.infoCreador" v-if="actividadLoaded" />
    <loading v-show="!actividadLoaded" texto="Cargando..." />
    <actividad
      :estaActividad="laActividad"
      ref="laActividad"
      :seleccionada="seleccionarActividad && actividadLoaded"
      :idActividad="laActividad.id"
      :idGrupo="laActividad.idGrupo"
      @participacionEliminada="eliminarParticipacionDeCache"
      v-if="actividadLoaded"
      @click.native.self="seleccionarActividad=!seleccionarActividad"
    />
  </div>
</template>

<script>
import gql from "graphql-tag";
import Actividad from "./Actividad.vue";
import Loading from "../utilidades/Loading.vue";
import IconoPersona from "../proyecto/IconoPersona.vue";

const QUERY_ACTIVIDAD_ESPECIFICA = gql`
  query($idActividad: ID!) {
    actividadEstudiantil(idActividad: $idActividad) {
      id
      nombre
      idGrupo
      infoCreador{
        id
        nombres
        apellidos
        username
      }
    }
  }
`;

export default {
  components: { Actividad, Loading, IconoPersona },
  name: "ActividadEspecifica",
  apollo: {
    laActividad: {
      query: QUERY_ACTIVIDAD_ESPECIFICA,
      variables() {
        return {          
          idActividad: this.$route.params.idActividad,
        };
      },
      fetchPolicy: "network-only",
      update: function ({ actividadEstudiantil }) {
        this.seleccionarActividad = true;
        this.actividadLoaded = true;
        return actividadEstudiantil;
      },
    },
  },
  data() {
    return {
      actividadLoaded: false,
      seleccionarActividad: false,
    };
  },
  methods: {
    eliminarParticipacionDeCache({
      idParticipacion,
      idDesarrollo,
      idActividad,
    }) {
      console.log(
        `Eliminando participacion ${idParticipacion} del desarrollo ${idDesarrollo} de la actividad ${idActividad} de cache`
      );
      if (idActividad != this.laActividad.id) {
        console.log(`No correspondía a esta actividad`);
        return;
      }
      let apolloProv = this.$apollo.provider.defaultClient;
      let data = apolloProv.readQuery({
        query: QUERY_ACTIVIDAD_ESPECIFICA,
        variables: {
          idActividad,
        },
      });
      console.log(`data: ${JSON.stringify(data.actividadEstudiantil).length}`);

      let elDesarrollo = data.actividadEstudiantil.desarrollos.find(
        (d) => d.id == idDesarrollo
      );
      if (!elDesarrollo) {
        console.log(`Desarrollo desconocido`);
        return;
      }
      let index = elDesarrollo.participaciones.findIndex(
        (p) => p.id == idParticipacion
      );

      if (index > -1) {
        elDesarrollo.participaciones.splice(index, 1);
        console.log(
          `data: ${JSON.stringify(data.actividadEstudiantil).length}`
        );
        if (elDesarrollo.participaciones.length < 1) {
          console.log(`Este desarrollo se quedó sin participaciones`);
          let laActividad = data.actividadEstudiantil;
          let indexA = laActividad.desarrollos.findIndex(
            (d) => d.id == idDesarrollo
          );
          laActividad.desarrollos.splice(indexA, 1);
        }
        apolloProv.writeQuery({
          query: QUERY_ACTIVIDAD_ESPECIFICA,
          variables: {
            idActividad,
          },
          data,
        });
      }
    },
  },  
  watch:{
    refresh(){
      this.$refs.laActividad.refresh();
    }
  },
  
  
};
</script>

<style scoped>
.iconoPersona {
  margin: 50px auto;
  margin-bottom: 100px;
}
.actividad {
  margin-top: 15px;
  margin-left: auto;
  margin-right: auto;
  max-width: 700px;
  border-radius: 10px;
  box-shadow: 2px 2px 2px 2px rgb(190, 190, 190);
}
.loading {
  margin-top: 40px;
}
</style>