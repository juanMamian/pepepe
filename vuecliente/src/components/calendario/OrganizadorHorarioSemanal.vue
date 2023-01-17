<template>
  <div class="organizadorHorarioSemanal">
    
    <div id="seleccionAdministradoresEspacios">
      <div class="zonaCheckAdministradorEspacios" v-for="profe of usuariosProfe" :key="profe.id">
        <div class="nombreProfe">{{profe.nombre}}</div> <input type="checkbox" :value="profe.id" ref="checkProfe" id="checkProfe" v-model="idsUsuariosSeleccionados">
      </div>
    </div>
    
    <div id="seleccionEspacio">
      <select
        name="selectEspacioCrear"
        id="selectEspacioCrear"
        ref="selectEspacioCrear"
        v-model="idEspacioCrear"
      >
        <option disabled>Seleccionar espacio para crear</option>
        <option
          v-for="espacio of espaciosCreables"
          :key="espacio.id"
          :value="espacio.id"
        >
          {{ espacio.nombre }}
        </option>
      </select>
    </div>
    <dia-organizador-horario
      v-for="(dia, index) of diasSemana"
      :key="dia"
      :nombreDia="dia"
      :numeroDia="index"
      :factorZoom="factorZoom"
      :offset="offset"
      :idEspacioCrear="idEspacioCrear"
      :bloquesHorario="bloquesHorario.filter(b=>b.diaSemana===index)"
    />
  </div>
</template>

<script>
import DiaOrganizadorHorario, { fragmentoBloqueHorario } from "./DiaOrganizadorHorario.vue";
import { fragmentoEspacio } from '../frags';
import { gql } from 'apollo-server-core';

const QUERY_ITERACIONES_SEMANALES_ESPACIOS= gql`
  query($idsAdministradores: [ID]!){
    iteracionesSemanalesEspaciosByAdministradores(idsAdministradores: $idsAdministradores){
      ...fragBloqueHorario
    }
  }
  ${fragmentoBloqueHorario}
`;

export default {
  components: { DiaOrganizadorHorario },
  name: "OrganizadorHorarioSemanal",
  apollo: {
    espacios: {
      query: gql`
        query ($idsUsuarios: [ID]!) {
          espaciosByUsuariosAdmin(idsUsuarios: $idsUsuarios) {
            ...fragEspacio
          }
        }
        ${fragmentoEspacio}
      `,
      variables() {
        return {
          idsUsuarios: [this.usuario.id],
        };
      },
      update({ espaciosByUsuariosAdmin }) {
        return espaciosByUsuariosAdmin;
      },
    },
    usuariosProfe:{
      query: gql`
        query{
          usuariosProfe{
            id
            nombre
          }
        }
      `,

    },
    bloquesHorario:{
      query: QUERY_ITERACIONES_SEMANALES_ESPACIOS,
      variables(){
        return {
          idsAdministradores: this.idsUsuariosSeleccionados,
        }
      },
      skip(){
        return !this.idsUsuariosSeleccionados || this.idsUsuariosSeleccionados.length<1;
      },
      update({iteracionesSemanalesEspaciosByAdministradores}){
        return iteracionesSemanalesEspaciosByAdministradores
      }
    }
  },
  data() {
    return {
      usuariosProfe:[],
      espacios: [],
      diasSemana: [
        "Lunes",
        "Martes",
        "Miércoles",
        "Jueves",
        "Viernes",
        "Sábado",
        "Domingo",
      ],
      factorZoom: 3,
      offset: 420,
      idEspacioCrear: null,
      idsUsuariosSeleccionados: [],
      bloquesHorario:[],
    };
  },
  computed: {
    espaciosCreables() {
      return this.espacios;
    },
  },
  mounted(){
    this.idsUsuariosSeleccionados=[this.usuario.id]
  }
};
</script>

<style scoped>
.organizadorHorarioSemanal {
  display: flex;
  flex-direction: column;
}

.zonaCheckAdministradorEspacios{
  display: flex;
  gap: 20px;
}
</style>