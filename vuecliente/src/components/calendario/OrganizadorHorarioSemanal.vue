<template>
  <div
    class="organizadorHorarioSemanal"
    @click.left.exact="idBloqueMenuContextual = null"
  >
  <ventana-bloque-horario v-if="bloqueEnVentana" :esteBloque="bloqueEnVentana" @cerrarme="idBloqueEnVentana=null"/>

    <div id="seleccionAdministradoresEspacios">
      <div
        class="zonaCheckAdministradorEspacios"
        v-for="profe of usuariosProfe"
        :key="profe.id"
      >
        <div class="nombreProfe">{{ profe.nombre }}</div>
        <input
          type="checkbox"
          :value="profe.id"
          ref="checkProfe"
          id="checkProfe"
          v-model="idsUsuariosSeleccionados"
        />
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
      :bloquesHorario="bloquesHorario.filter((b) => b.diaSemana === index)"
      :idBloqueMenuContextual="idBloqueMenuContextual"
      :idBloqueSeleccionado="idBloqueSeleccionado"
      @bloqueSeleccionado="
        idBloqueSeleccionado = idBloqueSeleccionado === $event ? null : $event
      "
      @bloqueHorarioCreado="addBloqueHorarioCache"
      @menuContextualBloque="idBloqueMenuContextual = $event"
      @bloqueEliminado="eliminarBloqueHorarioCache"
      @expandirBloque="setIdBloqueVentana"
    />
  </div>
</template>

<script>
import DiaOrganizadorHorario, {
  fragmentoBloqueHorario,
} from "./DiaOrganizadorHorario.vue";
import { fragmentoEspacio } from "../frags";
import { gql } from "apollo-server-core";
import VentanaBloqueHorario from './VentanaBloqueHorario.vue';

const QUERY_ITERACIONES_SEMANALES_ESPACIOS = gql`
  query ($idsAdministradores: [ID]!) {
    iteracionesSemanalesEspaciosByAdministradores(
      idsAdministradores: $idsAdministradores
    ) {
      ...fragBloqueHorario
    }
  }
  ${fragmentoBloqueHorario}
`;

export default {
  components: { DiaOrganizadorHorario, VentanaBloqueHorario },
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
    usuariosProfe: {
      query: gql`
        query {
          usuariosProfe {
            id
            nombre
          }
        }
      `,
    },
    bloquesHorario: {
      query: QUERY_ITERACIONES_SEMANALES_ESPACIOS,
      variables() {
        return {
          idsAdministradores: this.idsUsuariosSeleccionados,
        };
      },
      skip() {
        return (
          !this.idsUsuariosSeleccionados ||
          this.idsUsuariosSeleccionados.length < 1
        );
      },
      update({ iteracionesSemanalesEspaciosByAdministradores }) {
        return iteracionesSemanalesEspaciosByAdministradores;
      },
    },
  },
  data() {
    return {
      usuariosProfe: [],
      espacios: [],
      diasSemana: [
        "Lunes",
        "Martes",
        "Miércoles",
        "Jueves",
        "Viernes",        
      ],
      factorZoom: 3,
      offset: 468,
      idEspacioCrear: null,
      idsUsuariosSeleccionados: [],
      bloquesHorario: [],

      idBloqueMenuContextual: null,
      idBloqueSeleccionado: null,

      idBloqueEnVentana:null,
    };
  },
  computed: {
    espaciosCreables() {
      return this.espacios;
    },
    bloqueEnVentana(){
      if(!this.idBloqueEnVentana){
        return null
      }

      return this.bloquesHorario.find(bloque=>bloque.id===this.idBloqueEnVentana);
    }
  },
  methods: {
    addBloqueHorarioCache(nuevoBloque) {
      console.log(`Adding to cache un bloque con id ${nuevoBloque.id}`);
      const store = this.$apollo.provider.defaultClient;
      const cache = store.readQuery({
        query: QUERY_ITERACIONES_SEMANALES_ESPACIOS,
        variables: {
          idsAdministradores: this.idsUsuariosSeleccionados,
        },
      });

      var nuevoCache = JSON.parse(JSON.stringify(cache));

      const indexB =
        nuevoCache.iteracionesSemanalesEspaciosByAdministradores.findIndex(
          (b) => b.id === nuevoBloque.id
        );

      if (indexB < 0) {
        nuevoCache.iteracionesSemanalesEspaciosByAdministradores.push(
          nuevoBloque
        );

        store.writeQuery({
          query: QUERY_ITERACIONES_SEMANALES_ESPACIOS,
          variables: {
            idsAdministradores: this.idsUsuariosSeleccionados,
          },
          data: nuevoCache,
        });
      } else {
        console.log("Iteración semanal ya estaba en caché");
      }
    },
    eliminarBloqueHorarioCache(idBloque) {
      console.log(`Removing from cache un bloque con id ${idBloque}`);
      const store = this.$apollo.provider.defaultClient;
      const cache = store.readQuery({
        query: QUERY_ITERACIONES_SEMANALES_ESPACIOS,
        variables: {
          idsAdministradores: this.idsUsuariosSeleccionados,
        },
      });

      var nuevoCache = JSON.parse(JSON.stringify(cache));

      const indexB =
        nuevoCache.iteracionesSemanalesEspaciosByAdministradores.findIndex(
          (b) => b.id === idBloque
        );

      if (indexB > -1) {
        nuevoCache.iteracionesSemanalesEspaciosByAdministradores.splice(
          indexB,
          1
        );

        store.writeQuery({
          query: QUERY_ITERACIONES_SEMANALES_ESPACIOS,
          variables: {
            idsAdministradores: this.idsUsuariosSeleccionados,
          },
          data: nuevoCache,
        });
      } else {
        console.log("Iteración semanal no estaba en caché");
      }
    },
    abrirVentanaBloque(idBloque){
      console.log("Abriendo la ventana del bloque con id "+idBloque);
    },
    setIdBloqueVentana(nuevoId){
      this.idBloqueEnVentana=nuevoId;
    },
    checkVentanaBloque(){
      if(this.idBloqueEnVentana){
        this.idBloqueEnVentana=null;
        return true
      }
      
      return false;
    }
  },
  mounted() {
    this.idsUsuariosSeleccionados = [this.usuario.id];
  },
};
</script>

<style scoped>
.organizadorHorarioSemanal {
  display: flex;
  flex-direction: column;
}

.zonaCheckAdministradorEspacios {
  display: flex;
  gap: 20px;
}

.ventanaBloqueHorario{
  z-index: 100;
}
</style>