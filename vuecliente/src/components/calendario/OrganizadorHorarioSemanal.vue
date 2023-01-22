<template>
  <div
    class="organizadorHorarioSemanal"
    @click.left.exact="idBloqueMenuContextual = null"
  >
    <ventana-bloque-horario
      v-if="bloqueEnVentana"
      :esteBloque="bloqueEnVentana"
      @cerrarme="idBloqueEnVentana = null"
    />
    <div class="barraSeccion">
      Organizador de horario
      <div class="contenedorControles" style="margin-left: auto">
        <div class="boton">
          <img
            src="@/assets/iconos/cog.svg"
            @click.stop="mostrandoConfiguracion = !mostrandoConfiguracion"
            alt="configrurar"
            style=""
          />
        </div>
      </div>
    </div>

    <div id="zonaConfiguracion" v-show="mostrandoConfiguracion">
      <div
        id="configuracionAdministradoresEspacios"
        class="bloqueConfiguracion"
      >
        <div class="barraSeccion">Mostrando espacios de:</div>
        <div class="campoCheckAdministradorEspacios">
          <label for="checkAdministradorYo">Yo</label>
          <input
            type="checkbox"
            name="checkAdministradorYo"
            v-model="configuracionAdministradoresEspacios"
            value="yo"
            id=""
          />
        </div>
        <div class="campoCheckAdministradorEspacios">
          <label for="checkAdministradorYo">Profes</label>
          <input
            type="checkbox"
            v-model="configuracionAdministradoresEspacios"
            value="profesorxs"
            id=""
          />
        </div>
      </div>

      <div class="bloqueConfiguracion">
        <div class="campoConfiguracion">
          <label for="checkMostrarBloquesNiñosPequeños"
            >Mostrar bloques dirigidos a niñxs pequeñxs</label
          >
          <input
            type="checkbox"
            name="checkMostrarBloquesNiñosPequeños"
            ref="checkMostrarBloquesNiñosPequeños"
            id="checkMostrarBloquesNiñosPequeños"
            v-model="mostrarBloquesParaChiquis"
          />
        </div>
        <div class="campoConfiguracion">
          <label for="checkMostrarBloquesTodos"
            >Mostrar bloques dirigidos a todxs</label
          >
          <input
            type="checkbox"
            name="checkMostrarBloquesTodos"
            ref="checkMostrarBloquesTodos"
            id="checkMostrarBloquesTodos"
            v-model="mostrarBloquesParaTodos"
          />
        </div>
      </div>
    </div>

    <div
      class="zonaCheckAdministradorEspacios"
      v-for="profe of usuariosSeleccionables"
      :key="profe.id"
      v-show="false"
    >
      <div class="nombreProfe">{{ profe.nombres }}</div>
      <input
        type="checkbox"
        :value="profe.id"
        ref="checkProfe"
        id="checkProfe"
        v-model="idsUsuariosSeleccionados"
      />
    </div>

    <div id="seleccionEspacio">
      <div class="barraSeccion">Crear espacio:</div>
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
    <div id="contenedorDias">
      <dia-organizador-horario
        v-for="(dia, index) of diasSemana"
        :key="dia"
        :nombreDia="dia"
        :numeroDia="index"
        :factorZoom="factorZoom"
        :offset="offset"
        :idEspacioCrear="idEspacioCrear"
        :bloquesHorario="bloquesActivos.filter((b) => b.diaSemana === index)"
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
  </div>
</template>

<script>
import DiaOrganizadorHorario, {
  fragmentoBloqueHorario,
} from "./DiaOrganizadorHorario.vue";
import { fragmentoEspacio } from "../frags";
import { gql } from "apollo-server-core";
import VentanaBloqueHorario from "./VentanaBloqueHorario.vue";

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
  components: {
    DiaOrganizadorHorario,
    VentanaBloqueHorario,
  },
  props: { yo: Object },
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
        const primerEspacio = espaciosByUsuariosAdmin.find(
          (e) => e.idAdministrador === this.usuario.id
        );
        if (primerEspacio) {
          this.idEspacioCrear = primerEspacio.id;
        }

        return espaciosByUsuariosAdmin;
      },
      skip() {
        return !this.usuario?.id;
      },
    },
    usuariosProfe: {
      query: gql`
        query {
          usuariosProfe {
            id
            nombres
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
      diasSemana: ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"],
      factorZoom: 3,
      offset: 470,
      idEspacioCrear: null,

      configuracionAdministradoresEspacios: ["yo"],
      mostrandoConfiguracion: false,
      mostrarBloquesParaChiquis: true,
      mostrarBloquesParaTodos: true,

      bloquesHorario: [],

      idBloqueMenuContextual: null,
      idBloqueSeleccionado: null,

      idBloqueEnVentana: null,
    };
  },
  computed: {
    espaciosCreables() {
      return this.espacios;
    },
    bloqueEnVentana() {
      if (!this.idBloqueEnVentana) {
        return null;
      }

      return this.bloquesHorario.find(
        (bloque) => bloque.id === this.idBloqueEnVentana
      );
    },
    usuariosSeleccionables() {
      var listaFinal = [...this.usuariosProfe];

      if (
        !this.usuariosProfe.some((profe) => profe.id === this.usuario.id) &&
        this.yo
      ) {
        listaFinal.push({
          id: this.usuario.id,
          nombres: this.yo.nombres,
        });
      }

      return listaFinal;
    },
    idsUsuariosSeleccionados() {
      var listaFinal = [];
      if (this.configuracionAdministradoresEspacios.includes("yo")) {
        listaFinal.push(this.usuario.id);
      }

      if (this.configuracionAdministradoresEspacios.includes("profesorxs")) {
        listaFinal.push(...this.usuariosProfe.map((u) => u.id));
      }

      return listaFinal;
    },
    bloquesActivos(){
      var listaFinal=[...this.bloquesHorario];
      if(!this.mostrarBloquesParaChiquis){
        listaFinal=listaFinal.filter(bloque=>!bloque.paraChiquis);
      }
      if(!this.mostrarBloquesParaTodos){
        listaFinal=listaFinal.filter(bloque=>bloque.paraChiquis);
      }

      return listaFinal;
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
    abrirVentanaBloque(idBloque) {
      console.log("Abriendo la ventana del bloque con id " + idBloque);
    },
    setIdBloqueVentana(nuevoId) {
      this.idBloqueEnVentana = nuevoId;
    },
    checkVentanaBloque() {
      if (this.idBloqueEnVentana) {
        this.idBloqueEnVentana = null;
        return true;
      }

      return false;
    },
  },
};
</script>

<style scoped>
.organizadorHorarioSemanal {
  display: flex;
  flex-direction: column;
}

#zonaConfiguracion {
  display: flex;
  gap: 20px;
  padding: 10px 10px;
  background-color: rgb(197, 197, 197);
}

.ventanaBloqueHorario {
  z-index: 100000;
}

#seleccionEspacio {
  display: flex;
  gap: 10px;
  align-items: center;
}

#selectEspacioCrear {
  font-size: 17px;
  padding: 5px 10px;
  margin-left: 10px;
}

#contenedorDias {
  width: min(1900px, 100vw);
  overflow-x: scroll;
  display: flex;
  flex-direction: column;
  gap: 40px;
}
</style>