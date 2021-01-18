<template>
  <div class="actividadesDeProfe">
    <icono-persona :estaPersona="esteProfe"></icono-persona>
    <div id="listaActividades">
      <actividad
        v-for="actividad of actividades"
        :key="actividad.id"
        :estaActividad="actividad"
        @click.native="idActividadSeleccionada = actividad.id"
        :seleccionada="idActividadSeleccionada == actividad.id"
      />
    </div>
  </div>
</template>

<script>
import gql from "graphql-tag";
import IconoPersona from "../proyecto/IconoPersona";
import { fragmentoResponsables } from "../utilidades/recursosGql";
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
            id
            nombre
            hayGuia
            creador {
              id
            }
            desarrollos{
              id
              estudiante{
                ...fragResponsables
              }
              participaciones{
                id
                fechaUpload
                comentario
                archivo{
                  extension
                }
              }
            }
          }
        }
        ${fragmentoResponsables}
      `,
      variables() {
        console.log(`Enviando la query de actividades con idProfe: ${this.$route.params.idProfe}, idGrupo: ${this.$store.state.usuario.idGrupoEstudiantil}`);
        return { idProfe: this.$route.params.idProfe, idGrupo:this.$store.state.usuario.idGrupoEstudiantil };
      },
      update: ({ actividadesEstudiantilesDeProfeDeGrupo }) =>
        actividadesEstudiantilesDeProfeDeGrupo,
    },
  },
  data() {
    return {
      idActividadSeleccionada: null,
      actividades:[],
    };
  },
  computed:{
    actividadesParaMiGrupo:function(){
      console.log(``);
      return false;
    }
  }
};
</script>

<style>
.actividad{
  margin-left:auto;
  margin-right:auto;
  max-width: 500px;
}
.iconoPersona {
  margin-top: 30px;
  margin-left: auto;
  margin-right: auto;
  margin-bottom: 60px;
}
</style>