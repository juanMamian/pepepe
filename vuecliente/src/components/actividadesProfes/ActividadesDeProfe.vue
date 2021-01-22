<template>
  <div class="actividadesDeProfe" :class="{deshabilitada:ventanaDeshabilitada}">
    <icono-persona :estaPersona="esteProfe"></icono-persona>
    <div id="listaActividades" @click.self="idActividadSeleccionada=null">
      <actividad
        v-for="actividad of actividadesOrdenadas"
        :key="actividad.id"
        :estaActividad="actividad"
        @click.native="idActividadSeleccionada != actividad.id ? idActividadSeleccionada=actividad.id : null"
        @clickTrianguloSeleccion="idActividadSeleccionada==actividad.id? idActividadSeleccionada=null: idActividadSeleccionada=actividad.id"
        :seleccionada="idActividadSeleccionada == actividad.id"
      />
    </div>
  </div>
</template>

<script>
import gql from "graphql-tag";
import IconoPersona from "../proyecto/IconoPersona";
import { fragmentoActividad, fragmentoResponsables } from "../utilidades/recursosGql";
import Actividad from "./Actividad.vue";
export default {
  name: "ActividadesDeProfe",
  components: {
    IconoPersona,
    Actividad,
  },
  apollo: {
    esteProfe: {
      query: gql`
        query($idProfe: ID!) {
          publicUsuario(idUsuario: $idProfe) {
            ...fragResponsables
          }
        }
        ${fragmentoResponsables}
      `,
      variables() {
        return { idProfe: this.$route.params.idProfe };
      },
      update: ({ publicUsuario }) => publicUsuario,
    },
    actividades: {
      query: gql`
        query($idProfe: ID!, $idGrupo:ID!) {
          actividadesEstudiantilesDeProfeDeGrupo(idProfe: $idProfe, idGrupo:$idGrupo) {
            ...fragActividad
          }
        }
        ${fragmentoResponsables}
        ${fragmentoActividad}
      `,
      variables() {
        console.log(`Enviando la query de actividades con idProfe: ${this.$route.params.idProfe}, idGrupo: ${this.$store.state.usuario.idGrupoEstudiantil}`);
        return { idProfe: this.$route.params.idProfe, idGrupo:this.$store.state.usuario.idGrupoEstudiantil };
      },
      update: function({ actividadesEstudiantilesDeProfeDeGrupo }){
        this.ventanaDeshabilitada=false;
        return actividadesEstudiantilesDeProfeDeGrupo
      },
      skip(){
        if(this.$store.state.usuario.idGrupoEstudiantil==null){
          return true;
        }
        return false;
      }
    },
  },
  data() {
    return {
      idActividadSeleccionada: null,
      actividades:[],
      ventanaDeshabilitada:true,
    };
  },
  computed:{
    actividadesParaMiGrupo:function(){
      console.log(``);
      return false;
    },
    actividadesOrdenadas: function () {
      let lasActividades = this.actividades;
      lasActividades.sort((a, b) => {
        return new Date(b.fechaUpload) - new Date(a.fechaUpload);
      });
      return lasActividades;
    }
  },
   beforeRouteUpdate(to, from, next){
    console.log(`Saliendo de ${from.name} hacia ${to.name} `);
    if(from.name=="ActividadesDeGrupo" || from.name=="ActividadesDeProfe"){
      this.ventanaDeshabilitada=true;
    }
    next();
  },    
};
</script>

<style scoped>
.actividad{
  margin: 10px auto;
  max-width: 500px;
  box-shadow: 2px 2px 2px 2px rgb(190, 190, 190); 
}
.deshabilitada{
  pointer-events: none;
  opacity: 0.5;
}
.iconoPersona {
  margin-top: 30px;
  margin-left: auto;
  margin-right: auto;
  margin-bottom: 60px;
}
</style>